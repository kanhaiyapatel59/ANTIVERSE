import os
from datetime import datetime
from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
from models.schemas import RouteInput, RouteOutput
from tools.route_tool import calculate_tactical_route
from prompts.route_prompts import ROUTE_SYSTEM_PROMPT, build_route_prompt
from database.db import get_db_connection, log_activity

async def run_route_agent(input_data: RouteInput, incident_id: str = None) -> RouteOutput:
    """
    Independent Route Agent execution function.
    1. Evaluates available rescue forces.
    2. Calculates safe navigation corridor, alternate failover route, usable transport modes, and waypoint hazards.
    3. Synthesizes tactical dispatch briefing via Groq LPU / Gemini.
    4. Persists record to SQLite database and logs telemetry.
    """
    loc = input_data.incident_location.strip()
    teams = input_data.available_teams or ["NDRF Team Alpha", "Fire Battalion 4", "District Rescue Squad 2"]

    # Step 1: Tactical Routing Engine
    route_data = await calculate_tactical_route(loc, teams)

    team_name = route_data.get("best_rescue_team", "NDRF Team Alpha")
    route_corridor = route_data.get("best_route", "")
    alt_route = route_data.get("alternate_route", "")
    modes = route_data.get("transport_modes", ["Amphibious Boat", "Off-Road Truck"])
    waypoints = route_data.get("waypoints", [])
    eta = route_data.get("eta", "15 mins")

    dispatch_text = ""

    import asyncio

    # Step 2: Groq LLM (5s timeout)
    groq_key = os.getenv("GROQ_API_KEY", "")
    if groq_key and groq_key not in ["your_groq_api_key_here", "mock_groq_key"]:
        try:
            llm = ChatGroq(
                groq_api_key=groq_key,
                model_name="llama-3.3-70b-versatile",
                temperature=0.2
            )
            prompt = build_route_prompt(loc, route_data)
            response = await asyncio.wait_for(llm.ainvoke([("system", ROUTE_SYSTEM_PROMPT), ("user", prompt)]), timeout=5.0)
            dispatch_text = response.content.strip()
        except Exception as e:
            print(f"⚠️ Groq LLM invocation timed out or failed ({e}), trying Gemini fallback...")

    # Step 3: Gemini Fallback (5s timeout)
    if not dispatch_text:
        gemini_key = os.getenv("GEMINI_API_KEY", "")
        if gemini_key and gemini_key not in ["your_gemini_api_key_here", "mock_gemini_key"]:
            try:
                llm = ChatGoogleGenerativeAI(
                    google_api_key=gemini_key,
                    model="gemini-1.5-flash",
                    temperature=0.2
                )
                prompt = build_route_prompt(loc, route_data)
                response = await asyncio.wait_for(llm.ainvoke([("system", ROUTE_SYSTEM_PROMPT), ("user", prompt)]), timeout=5.0)
                dispatch_text = response.content.strip()
            except Exception as e:
                print(f"⚠️ Gemini LLM invocation timed out or failed ({e}), using deterministic route...")

    # Step 4: Rule Fallback
    if not dispatch_text:
        dispatch_text = f"Dispatched {team_name} to {loc}. Primary Corridor: {route_corridor}. Alternate Corridor: {alt_route}. Estimated Arrival: {eta}."

    output = RouteOutput(
        best_rescue_team=team_name,
        best_route=route_corridor,
        alternate_route=alt_route,
        transport_modes=modes,
        waypoints=waypoints,
        eta=eta,
        timestamp=datetime.utcnow().isoformat()
    )

    # Step 5: Database Persistence
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO rescue_plans (incident_id, best_team, best_route, eta, timestamp)
        VALUES (?, ?, ?, ?, ?)
        """, (incident_id, output.best_rescue_team, output.best_route, output.eta, output.timestamp))
        conn.commit()
        conn.close()

        log_activity(
            agent_name="RouteAgent",
            action="TACTICAL_DISPATCH_ASSIGNED",
            status="SUCCESS",
            details=f"Team: {output.best_rescue_team} | ETA: {output.eta} | Modes: {', '.join(modes[:2])}",
            incident_id=incident_id
        )
    except Exception as db_err:
        print(f"⚠️ Failed to persist route output to DB: {db_err}")

    return output
