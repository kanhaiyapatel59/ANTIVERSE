import os
import uuid
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from dotenv import load_dotenv

from database.db import init_db, get_recent_activities, get_all_incidents, log_activity

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    log_activity(
        agent_name="System",
        action="SERVER_STARTUP",
        status="SUCCESS",
        details="AI Disaster Command Center Backend Initialized"
    )
    yield

app = FastAPI(
    title="AI Disaster Command Center API",
    description="Multi-Agent Emergency Response & Incident Orchestration System",
    version="1.0.0",
    lifespan=lifespan
)

# Mount uploads static folder for drone/CCTV uploaded images
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Enable CORS for local dev frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/v1/upload")
async def upload_drone_media(file: UploadFile = File(...)):
    try:
        ext = file.filename.split(".")[-1].lower() if "." in file.filename else "jpg"
        
        # Categorize media type
        if ext in ["pdf"]:
            media_type = "pdf"
            prefix = "report"
        elif ext in ["mp4", "avi", "mov", "mkv", "webm"]:
            media_type = "video"
            prefix = "video"
        else:
            media_type = "image"
            prefix = "drone"

        filename = f"{prefix}_{uuid.uuid4().hex[:8]}.{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        with open(filepath, "wb") as f:
            content = await file.read()
            f.write(content)
        url = f"http://localhost:8000/uploads/{filename}"
        return {"status": "success", "url": url, "filename": filename, "media_type": media_type, "original_name": file.filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload error: {str(e)}")

@app.get("/health")
def health_check():
    return {
        "status": "online",
        "system": "AI Disaster Command Center",
        "version": "1.0.0",
        "database": "SQLite Initialized",
        "agents_ready": [
            "WeatherAgent",
            "DetectionAgent",
            "PredictionAgent",
            "RouteAgent",
            "ResourceAgent",
            "CommunicationAgent",
            "CommanderAgent"
        ]
    }

@app.get("/api/v1/incidents")
def fetch_incidents():
    try:
        return {"status": "success", "incidents": get_all_incidents()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/activities")
def fetch_activities(limit: int = 25):
    try:
        return {"status": "success", "activities": get_recent_activities(limit=limit)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ======================================================
# INDEPENDENT AGENT ENDPOINTS
# ======================================================
from models.schemas import (
    WeatherInput, WeatherOutput, 
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

@app.post("/api/v1/agent/weather", response_model=WeatherOutput)
async def analyze_weather(payload: WeatherInput):
    try:
        return await run_weather_agent(payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"WeatherAgent error: {str(e)}")

@app.post("/api/v1/agent/detection", response_model=DetectionOutput)
async def analyze_detection(payload: DetectionInput):
    try:
        return await run_detection_agent(payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DetectionAgent error: {str(e)}")

@app.post("/api/v1/agent/prediction", response_model=PredictionOutput)
async def analyze_prediction(payload: PredictionInput):
    try:
        return await run_prediction_agent(payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PredictionAgent error: {str(e)}")

@app.post("/api/v1/agent/route", response_model=RouteOutput)
async def analyze_route(payload: RouteInput):
    try:
        return await run_route_agent(payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RouteAgent error: {str(e)}")

@app.post("/api/v1/agent/resource", response_model=ResourceOutput)
async def analyze_resource(payload: ResourceInput):
    try:
        return await run_resource_agent(payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ResourceAgent error: {str(e)}")

@app.post("/api/v1/agent/communication", response_model=CommunicationOutput)
async def analyze_communication(payload: CommunicationInput):
    try:
        return await run_communication_agent(payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"CommunicationAgent error: {str(e)}")

# ======================================================
# COMMANDER AGENT ORCHESTRATION ENDPOINT (LANGGRAPH)
# ======================================================
from pydantic import BaseModel
from agents.commander_agent import run_commander_agent

class CommanderRequest(BaseModel):
    location: str = "Mumbai Sector 4 Coastal Zone"
    image_url: str = "rooftop_flooding"
    people_count: int = 14

@app.post("/api/v1/commander/orchestrate")
async def orchestrate_disaster_response(payload: CommanderRequest):
    try:
        final_state = await run_commander_agent(
            location=payload.location,
            image_url=payload.image_url,
            people_count=payload.people_count
        )
        return {
            "status": "success",
            "incident_id": final_state["incident_id"],
            "location": final_state["location"],
            "master_plan": final_state["master_plan"],
            "incident_state": final_state
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"CommanderAgent error: {str(e)}")

# ======================================================
# FLOATING AI COPILOT / ASSISTANT CHAT ENDPOINT
# ======================================================
ASSISTANT_SYSTEM_PROMPT = """You are the AI Command Center Assistant & Hackathon Copilot.
You speak in a warm, expert, clear, human tone. You have full knowledge of the AI Disaster Command Center:

1. THE 6 SPECIALIZED AI AGENTS & VISION ENGINE:
   - Agent 01 (Weather Agent): Real meteorological telemetry (OpenWeather & Open-Meteo), humidity %, wind speed (km/h), barometric pressure (hPa), Storm Surge Index, and Landslide Vulnerability scoring.
   - Agent 02 (Detection Agent): Gemini Multimodal Vision AI engine scanning uploaded drone/CCTV photos for exact human victim counts (0, 5, etc.), stranded animals/livestock counts, vehicles/structures, flood coverage %, and structural damage.
   - Agent 03 (Prediction Agent): Hydro-dynamic surge velocity (m/s), time-to-peak inundation (TTI), secondary hazards (power grid failures, dam spill risk), and 3-scenario risk forecasting (Best, Expected, Worst-case).
   - Agent 04 (Route Agent): Tactical navigator evaluating multi-modal transit (Amphibious Boat, Off-Road Truck, Helicopter, Foot Patrol), primary vs. failover routes, and waypoint hazard checks.
   - Agent 05 (Resource Agent): Multi-category logistics solver allocating shelter beds, MRE food rations, clean drinking water, trauma medical kits, generator fuel, AND emergency livestock feed.
   - Agent 06 (Communication Agent): Multi-channel dispatcher generating SMS alerts, formal NDRF email briefs, public broadcast warnings, Hindi regional alerts, ground PA system audio scripts, and CAP v1.2 XML/JSON standard payloads.

2. COMMANDER AGENT (LANGGRAPH STATE MACHINE):
   - Orchestrates all 6 agents sequentially using a state graph engine.
   - Assigns Incident Priority Ratings (P1 Critical to P4 Routine) and compiles an authoritative Master Disaster Response Directive.

3. COMMAND DASHBOARD & DEMO TIPS:
   - Features interactive GIS satellite tiles, city search fly-to zoom, multi-modal photo drop, live SQLite activity feed, and Recharts analytics.

Answer user questions naturally, explaining concepts clearly, offering demo tips for hackathon judges, and keeping responses concise yet insightful."""

class ChatRequest(BaseModel):
    message: str

@app.post("/api/v1/assistant/chat")
async def assistant_chat(payload: ChatRequest):
    user_msg = payload.message.strip()
    if not user_msg:
        raise HTTPException(status_code=400, detail="Empty message")

    reply_text = ""
    groq_key = os.getenv("GROQ_API_KEY", "")
    if groq_key and groq_key != "mock_groq_key":
        try:
            from langchain_groq import ChatGroq
            llm = ChatGroq(
                groq_api_key=groq_key,
                model_name="llama-3.3-70b-versatile",
                temperature=0.4
            )
            response = await llm.ainvoke([("system", ASSISTANT_SYSTEM_PROMPT), ("user", user_msg)])
            reply_text = response.content.strip()
        except Exception as e:
            print(f"⚠️ Assistant Groq call failed ({e}), trying Gemini...")

    if not reply_text:
        gemini_key = os.getenv("GEMINI_API_KEY", "")
        if gemini_key and gemini_key != "mock_gemini_key":
            try:
                from langchain_google_genai import ChatGoogleGenerativeAI
                llm = ChatGoogleGenerativeAI(
                    google_api_key=gemini_key,
                    model="gemini-1.5-flash",
                    temperature=0.4
                )
                response = await llm.ainvoke([("system", ASSISTANT_SYSTEM_PROMPT), ("user", user_msg)])
                reply_text = response.content.strip()
            except Exception as e:
                print(f"⚠️ Assistant Gemini call failed ({e})...")

    if not reply_text:
        lower = user_msg.lower()
        if "weather" in lower:
            reply_text = "Agent 01 (Weather Agent) acts as the meteorologist. It fetches rain rates (e.g., 142mm/hr) and computes the flood threat level (EXTREME, HIGH, MODERATE, or LOW)."
        elif "detection" in lower or "image" in lower or "photo" in lower:
            reply_text = "Agent 02 (Detection Agent) uses computer vision to scan uploaded drone photos. It counts stranded victims, calculates flood coverage %, and assesses building damage."
        elif "commander" in lower or "langgraph" in lower:
            reply_text = "The Day 2 Commander Agent uses LangGraph StateGraph engine to run all 6 specialized agents in order (Weather ➔ Detection ➔ Prediction ➔ Route ➔ Resource ➔ Communication) and compile a Master Response Plan."
        elif "judge" in lower or "demo" in lower:
            reply_text = "To impress judges: Start by explaining our USP (software for NDRF/District Collectors during network outages). Show Agent 1 & 2 on their pages, then launch the Day 2 Commander to show the 6 glowing agent cards lighting up in sequence!"
        else:
            reply_text = "I am your AI Command Center Copilot! Ask me how any of our 6 AI agents work, how the Day 2 Commander orchestrates response plans, or how to pitch this system to hackathon judges."

    return {"status": "success", "reply": reply_text}

class WhatsAppSendRequest(BaseModel):
    group_name: str = "NDRF"
    message: str

@app.post("/api/v1/whatsapp/auto-send")
async def auto_send_whatsapp_group(payload: WhatsAppSendRequest):
    from tools.whatsapp_bot import send_whatsapp_group_message
    res = await send_whatsapp_group_message(payload.group_name, payload.message)
    return res

# --- WEBSOCKET REAL-TIME TELEMETRY STREAM & AUTONOMOUS AGENT ENDPOINTS ---
from fastapi import WebSocket, WebSocketDisconnect
from agents.autonomous_monitor import autonomous_monitor_instance

active_websockets: List[WebSocket] = []

@app.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_websockets.append(websocket)
    try:
        await websocket.send_json({
            "event": "CONNECTED",
            "message": "Connected to AI Disaster Command Center Real-Time Telemetry Stream",
            "status": "ONLINE"
        })
        while True:
            data = await websocket.receive_text()
            # Echo heartbeat
            await websocket.send_json({"event": "HEARTBEAT", "received": data})
    except WebSocketDisconnect:
        active_websockets.remove(websocket)
    except Exception as e:
        if websocket in active_websockets:
            active_websockets.remove(websocket)

async def broadcast_ws_event(event_data: dict):
    for ws in active_websockets:
        try:
            await ws.send_json(event_data)
        except Exception:
            pass

@app.post("/api/v1/autonomous/start")
async def start_autonomous_monitoring():
    if not autonomous_monitor_instance.is_running:
        import asyncio
        asyncio.create_task(autonomous_monitor_instance.start_autonomous_loop(callback=broadcast_ws_event))
    return {"status": "success", "message": "Autonomous Background Disaster Monitoring Loop Started"}

@app.post("/api/v1/autonomous/stop")
async def stop_autonomous_monitoring():
    autonomous_monitor_instance.stop()
    return {"status": "success", "message": "Autonomous Monitoring Stopped"}

@app.get("/api/v1/autonomous/status")
async def get_autonomous_status():
    return {
        "is_running": autonomous_monitor_instance.is_running,
        "logs": autonomous_monitor_instance.sensor_logs[-10:]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
