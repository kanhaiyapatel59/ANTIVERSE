import os
from datetime import datetime
from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
from models.schemas import WeatherInput, WeatherOutput
from tools.weather_tool import fetch_weather_raw
from prompts.weather_prompts import WEATHER_SYSTEM_PROMPT, build_weather_prompt
from database.db import get_db_connection, log_activity

async def run_weather_agent(input_data: WeatherInput, incident_id: str = None) -> WeatherOutput:
    """
    Independent Weather Agent execution function.
    1. Fetches weather telemetry (live OpenWeather/Open-Meteo or simulation).
    2. Runs LLM forecast synthesis via Groq/Gemini/Fallback.
    3. Saves record to SQLite database.
    4. Logs activity telemetry.
    """
    city = input_data.city.strip()
    raw = await fetch_weather_raw(city)
    
    temp = raw.get("temperature", 28.0)
    rain_desc = raw.get("rainfall_desc", "85mm/hr Heavy Rain")
    flood_risk = raw.get("flood_risk", "HIGH")
    humidity = raw.get("humidity", 85.0)
    wind_speed = raw.get("wind_speed_kmh", 35.0)
    pressure = raw.get("pressure_hpa", 1004.0)
    surge = raw.get("storm_surge_index", "HIGH")
    landslide = raw.get("landslide_risk", "MODERATE")
    hint = raw.get("forecast_hint", "")

    forecast_text = ""

    # 1. Try Groq API
    groq_key = os.getenv("GROQ_API_KEY", "")
    if groq_key and groq_key not in ["your_groq_api_key_here", "mock_groq_key"]:
        try:
            llm = ChatGroq(
                groq_api_key=groq_key,
                model_name="llama-3.3-70b-versatile",
                temperature=0.2
            )
            prompt = build_weather_prompt(city, temp, rain_desc, flood_risk, hint)
            response = await llm.ainvoke([("system", WEATHER_SYSTEM_PROMPT), ("user", prompt)])
            forecast_text = response.content.strip()
        except Exception as e:
            print(f"⚠️ Groq LLM invocation failed ({e}), trying Gemini fallback...")

    # 2. Try Gemini API fallback
    if not forecast_text:
        gemini_key = os.getenv("GEMINI_API_KEY", "")
        if gemini_key and gemini_key not in ["your_gemini_api_key_here", "mock_gemini_key"]:
            try:
                llm = ChatGoogleGenerativeAI(
                    google_api_key=gemini_key,
                    model="gemini-1.5-flash",
                    temperature=0.2
                )
                prompt = build_weather_prompt(city, temp, rain_desc, flood_risk, hint)
                response = await llm.ainvoke([("system", WEATHER_SYSTEM_PROMPT), ("user", prompt)])
                forecast_text = response.content.strip()
            except Exception as e:
                print(f"⚠️ Gemini LLM invocation failed ({e}), using deterministic synthesis...")

    # 3. Deterministic Fallback if LLM unavailable
    if not forecast_text:
        forecast_text = f"Torrential weather active over {city} at {temp}°C (Humidity {humidity}%, Wind {wind_speed}km/h, Pressure {pressure}hPa). Telemetry indicates {rain_desc}. Flood hazard ({flood_risk}), Storm Surge ({surge}), Landslide Threat ({landslide}). {hint}"

    output = WeatherOutput(
        city=city.title(),
        temperature=temp,
        rainfall=rain_desc,
        flood_risk=flood_risk,
        weather_forecast=forecast_text,
        humidity=humidity,
        wind_speed_kmh=wind_speed,
        pressure_hpa=pressure,
        storm_surge_index=surge,
        landslide_risk=landslide,
        timestamp=datetime.utcnow().isoformat()
    )

    # Database Persistence
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO weather (incident_id, city, temperature, rainfall, flood_risk, forecast, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (incident_id, output.city, output.temperature, output.rainfall, output.flood_risk, output.weather_forecast, output.timestamp))
        conn.commit()
        conn.close()

        log_activity(
            agent_name="WeatherAgent",
            action="WEATHER_ANALYSIS_COMPLETED",
            status="SUCCESS",
            details=f"City: {output.city} | Risk: {output.flood_risk} | Surge: {output.storm_surge_index} | Rain: {output.rainfall}",
            incident_id=incident_id
        )
    except Exception as db_err:
        print(f"⚠️ Failed to persist weather output to DB: {db_err}")

    return output
