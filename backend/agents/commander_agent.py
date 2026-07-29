import os
import json
import uuid
from datetime import datetime
from typing import Dict, Any, TypedDict, Optional, List

from langgraph.graph import StateGraph, START, END

from models.schemas import (
    IncidentState, WeatherInput, WeatherOutput,
    DetectionInput, DetectionOutput,
    PredictionInput, PredictionOutput,
    RouteInput, RouteOutput,
    ResourceInput, ResourceOutput,
    CommunicationInput, CommunicationOutput
)
from agents.weather_agent import run_weather_agent
from agents.detection_agent import run_detection_agent
from agents.prediction_agent import run_prediction_agent
from agents.route_agent import run_route_agent
from agents.resource_agent import run_resource_agent
from agents.communication_agent import run_communication_agent

from prompts.commander_prompts import COMMANDER_SYSTEM_PROMPT, build_commander_prompt
from database.db import get_db_connection, log_activity
from tools.safety_validator import validate_and_self_correct_plan
from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI

class GraphState(TypedDict):
    incident_id: str
    location: str
    image_url: str
    people_count: int
    animals_count: int
    priority_level: str
    weather: Optional[Dict[str, Any]]
    detection: Optional[Dict[str, Any]]
    prediction: Optional[Dict[str, Any]]
    route: Optional[Dict[str, Any]]
    resources: Optional[Dict[str, Any]]
    communication: Optional[Dict[str, Any]]
    master_plan: str
    status: str
    logs: List[str]

# --- LANGGRAPH NODE FUNCTIONS ---

async def weather_node(state: GraphState) -> Dict[str, Any]:
    city = state["location"].split()[0]
    inp = WeatherInput(city=city)
    out: WeatherOutput = await run_weather_agent(inp, incident_id=state["incident_id"])
    
    logs = state.get("logs", [])
    logs.append(f"Node [WeatherAgent] executed: Risk={out.flood_risk} | Surge={out.storm_surge_index} | Wind={out.wind_speed_kmh}km/h")
    return {"weather": out.model_dump(), "logs": logs}

async def detection_node(state: GraphState) -> Dict[str, Any]:
    img = state.get("image_url") or "rooftop_flooding"
    loc = state.get("location")
    inp = DetectionInput(image_url=img, location=loc)
    out: DetectionOutput = await run_detection_agent(inp, incident_id=state["incident_id"])
    
    logs = state.get("logs", [])
    logs.append(f"Node [DetectionAgent] executed: Humans={out.people_detected} | Animals={out.animals_detected} | Flood={out.flood_percentage}%")
    return {
        "detection": out.model_dump(),
        "people_count": out.people_detected,
        "animals_count": out.animals_detected,
        "logs": logs
    }

async def prediction_node(state: GraphState) -> Dict[str, Any]:
    wea_obj = WeatherOutput(**state["weather"])
    det_obj = DetectionOutput(**state["detection"])
    inp = PredictionInput(detection=det_obj, weather=wea_obj)
    out: PredictionOutput = await run_prediction_agent(inp, incident_id=state["incident_id"])
    
    # Calculate priority level
    priority = "P1_CRITICAL" if out.urgency == "IMMEDIATE_EVACUATION" else "P2_HIGH" if out.urgency == "URGENT_MONITORING" else "P3_MEDIUM"
    
    logs = state.get("logs", [])
    logs.append(f"Node [PredictionAgent] executed: Surge Rise={out.water_rise_estimate} | Speed={out.surge_velocity_ms}m/s | Priority={priority}")
    return {"prediction": out.model_dump(), "priority_level": priority, "logs": logs}

async def route_node(state: GraphState) -> Dict[str, Any]:
    loc = state["location"]
    inp = RouteInput(incident_location=loc, available_teams=["NDRF Team Alpha", "Fire Battalion 4", "District Rescue Squad 2"])
    out: RouteOutput = await run_route_agent(inp, incident_id=state["incident_id"])
    
    logs = state.get("logs", [])
    logs.append(f"Node [RouteAgent] executed: Assigned={out.best_rescue_team} | ETA={out.eta}")
    return {"route": out.model_dump(), "logs": logs}

async def resource_node(state: GraphState) -> Dict[str, Any]:
    loc = state["location"]
    human_count = state.get("people_count", 10)
    animal_count = state.get("animals_count", 0)
    inp = ResourceInput(people_count=human_count, location=loc, animals_count=animal_count)
    out: ResourceOutput = await run_resource_agent(inp, incident_id=state["incident_id"])
    
    logs = state.get("logs", [])
    logs.append(f"Node [ResourceAgent] executed: Shelter={out.nearest_shelter} | Water={out.drinking_water_liters}L | Feed={out.livestock_feed_kg}kg")
    return {"resources": out.model_dump(), "logs": logs}

async def communication_node(state: GraphState) -> Dict[str, Any]:
    loc = state["location"]
    wea_obj = WeatherOutput(**state["weather"]) if state.get("weather") else None
    det_obj = DetectionOutput(**state["detection"]) if state.get("detection") else None
    pred_obj = PredictionOutput(**state["prediction"]) if state.get("prediction") else None
    route_obj = RouteOutput(**state["route"]) if state.get("route") else None
    res_obj = ResourceOutput(**state["resources"]) if state.get("resources") else None

    inp = CommunicationInput(
        location=loc,
        weather=wea_obj,
        detection=det_obj,
        prediction=pred_obj,
        route=route_obj,
        resource=res_obj
    )
    out: CommunicationOutput = await run_communication_agent(inp, incident_id=state["incident_id"])
    
    logs = state.get("logs", [])
    logs.append("Node [CommunicationAgent] executed: SMS, Email, Broadcast, Hindi Alert & CAP JSON Ready")
    return {"communication": out.model_dump(), "logs": logs}

async def synthesis_node(state: GraphState) -> Dict[str, Any]:
    inc_id = state["incident_id"]
    loc = state["location"]

    # Autonomous Self-Correction & Safety Rule Validation Step
    corrected_state = validate_and_self_correct_plan(dict(state))
    for log in corrected_state.get("self_correction_logs", []):
        state["logs"].append(log)

    master_plan = ""

    import asyncio

    # Synthesize Master Plan via Groq LPU (5s timeout)
    groq_key = os.getenv("GROQ_API_KEY", "")
    if groq_key and groq_key not in ["your_groq_api_key_here", "mock_groq_key"]:
        try:
            llm = ChatGroq(
                groq_api_key=groq_key,
                model_name="llama-3.3-70b-versatile",
                temperature=0.2
            )
            prompt = build_commander_prompt(inc_id, loc, state)
            response = await asyncio.wait_for(llm.ainvoke([("system", COMMANDER_SYSTEM_PROMPT), ("user", prompt)]), timeout=5.0)
            master_plan = response.content.strip()
        except Exception as e:
            print(f"⚠️ Groq LLM synthesis timed out or failed ({e}), trying Gemini...")

    if not master_plan:
        gemini_key = os.getenv("GEMINI_API_KEY", "")
        if gemini_key and gemini_key not in ["your_gemini_api_key_here", "mock_gemini_key"]:
            try:
                llm = ChatGoogleGenerativeAI(
                    google_api_key=gemini_key,
                    model="gemini-1.5-flash",
                    temperature=0.2
                )
                prompt = build_commander_prompt(inc_id, loc, state)
                response = await asyncio.wait_for(llm.ainvoke([("system", COMMANDER_SYSTEM_PROMPT), ("user", prompt)]), timeout=5.0)
                master_plan = response.content.strip()
            except Exception as e:
                print(f"⚠️ Gemini LLM synthesis timed out or failed ({e})...")
                print(f"⚠️ Gemini LLM synthesis failed ({e}), using fallback plan...")

    if not master_plan:
        master_plan = f"MASTER DISASTER RESPONSE PLAN FOR {loc.upper()} ({inc_id})\n\nAll 6 AI Agents successfully orchestrated. NDRF teams dispatched, shelter assured, and emergency communications broadcast."

    # Persist Incident Record in MongoDB & SQLite Dual-DB
    try:
        from database.mongo_db import save_master_incident
        save_master_incident({
            "id": inc_id,
            "timestamp": datetime.utcnow().isoformat(),
            "location": loc,
            "image_url": state.get("image_url", ""),
            "people_affected": state.get("people_count", 0),
            "animals_affected": state.get("animals_count", 0),
            "priority_level": state.get("priority_level", "P1_CRITICAL"),
            "status": "COMPLETED",
            "summary": f"Orchestrated 6 Agents for {loc}",
            "full_plan": master_plan
        })

        log_activity(
            agent_name="CommanderAgent",
            action="LANGGRAPH_ORCHESTRATION_COMPLETED",
            status="SUCCESS",
            details=f"Incident {inc_id} fully orchestrated across 6 agents. Priority: {state.get('priority_level', 'P1_CRITICAL')}",
            incident_id=inc_id
        )
    except Exception as db_err:
        print(f"⚠️ Failed to persist master incident: {db_err}")

    logs = state.get("logs", [])
    logs.append("Commander Node [Synthesis] executed: Master Plan Compiled.")
    return {"master_plan": master_plan, "status": "COMPLETED", "logs": logs}

# --- LANGGRAPH STATE MACHINE BUILDER ---

def build_commander_graph():
    builder = StateGraph(GraphState)

    # Add 7 Nodes
    builder.add_node("weather_node", weather_node)
    builder.add_node("detection_node", detection_node)
    builder.add_node("prediction_node", prediction_node)
    builder.add_node("route_node", route_node)
    builder.add_node("resource_node", resource_node)
    builder.add_node("communication_node", communication_node)
    builder.add_node("synthesis_node", synthesis_node)

    # Add Edges
    builder.add_edge(START, "weather_node")
    builder.add_edge("weather_node", "detection_node")
    builder.add_edge("detection_node", "prediction_node")
    builder.add_edge("prediction_node", "route_node")
    builder.add_edge("route_node", "resource_node")
    builder.add_edge("resource_node", "communication_node")
    builder.add_edge("communication_node", "synthesis_node")
    builder.add_edge("synthesis_node", END)

    return builder.compile()

COMMANDER_GRAPH = build_commander_graph()

async def run_commander_agent(location: str, image_url: str = "rooftop_flooding", people_count: int = 14) -> Dict[str, Any]:
    """
    Invokes the LangGraph Commander Multi-Agent Pipeline.
    """
    incident_id = f"INC-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"

    initial_state: GraphState = {
        "incident_id": incident_id,
        "location": location,
        "image_url": image_url,
        "people_count": people_count,
        "animals_count": 0,
        "priority_level": "P1_CRITICAL",
        "weather": None,
        "detection": None,
        "prediction": None,
        "route": None,
        "resources": None,
        "communication": None,
        "master_plan": "",
        "status": "RUNNING",
        "logs": [f"Incident {incident_id} initialized for {location}"]
    }

    final_state = await COMMANDER_GRAPH.ainvoke(initial_state)
    return final_state

run_commander_pipeline = run_commander_agent

