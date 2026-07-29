import random

async def compute_hydro_predictions(detection_data: dict, weather_data: dict) -> dict:
    """
    Hydro-dynamic mathematical heuristic solver combining weather rainfall intensity,
    wind/pressure, and aerial flood inundation percentage to compute water rise rate,
    surge velocity, landslide risk index, secondary hazards, and multi-scenario projections.
    """
    flood_pct = float(detection_data.get("flood_percentage", 50.0))
    people_detected = int(detection_data.get("people_detected", 10))
    flood_risk = str(weather_data.get("flood_risk", "HIGH")).upper()
    rainfall_str = str(weather_data.get("rainfall", "50mm/hr")).lower()
    wind_speed = float(weather_data.get("wind_speed_kmh", 35.0))
    pressure = float(weather_data.get("pressure_hpa", 1004.0))

    rain_mm = 50.0
    try:
        parts = rainfall_str.split("mm")
        if len(parts) > 1:
            rain_mm = float(parts[0].strip().split()[-1])
    except Exception:
        rain_mm = 65.0

    # Compute hydro-dynamic surge velocity & time-to-peak
    surge_velocity = round(1.2 + (rain_mm * 0.015) + (wind_speed * 0.01), 2)
    time_to_peak = round(max(1.5, 6.0 - (rain_mm * 0.025)), 1)
    landslide_score = int(min(98, max(20, (rain_mm * 0.4) + (flood_pct * 0.3))))

    if flood_pct > 75 or rain_mm > 120 or flood_risk == "EXTREME":
        water_rise = f"+{(rain_mm * 0.015 + flood_pct * 0.015):.1f} meters in 3 hours"
        road_acc = "BLOCKED"
        urgency = "IMMEDIATE_EVACUATION"
        directive = "Execute immediate amphibious airborne evacuation. Primary transit arteries submerged under 1.5m+ water. Deploy NDRF motorboats to high-ground assembly points."
        sec_hazards = ["Submerged High-Voltage Grid Transformers", "Debris Scour near Bridge Pillars", "Spillway Water Breach"]
    elif flood_pct > 45 or rain_mm > 60 or flood_risk == "HIGH":
        water_rise = f"+{(rain_mm * 0.012 + flood_pct * 0.01):.1f} meters in 6 hours"
        road_acc = "SEVERELY_RESTRICTED"
        urgency = "URGENT_MONITORING"
        directive = "Prepare secondary evacuation corridors. Light vehicles restricted. Heavy rescue trucks permitted via elevated bypass route."
        sec_hazards = ["Saturated Hillside Mudslide Vulnerability", "Urban Drainage Backflow"]
    else:
        water_rise = "+0.4 meters in 12 hours"
        road_acc = "PASSABLE"
        urgency = "STABLE"
        directive = "Maintain active monitoring. Road network operational with minor surface waterlogging."
        sec_hazards = ["Minor Localized Potholes / Water Accumulation"]

    # 3-Scenario Risk Forecasting
    base_level = round(flood_pct * 0.03, 2)
    best_case_peak = round(base_level * 1.15, 2)
    expected_peak = round(base_level * 1.45, 2)
    worst_case_peak = round(base_level * 1.95, 2)

    chart_data = []
    for h in range(7):
        surge_mult = 1.0 + (h * 0.28) if urgency == "IMMEDIATE_EVACUATION" else 1.0 + (h * 0.15)
        chart_data.append({
            "hour": f"T+{h}h",
            "water_level_m": round(base_level * surge_mult, 2),
            "critical_threshold_m": 2.5
        })

    return {
        "water_rise_estimate": water_rise,
        "road_accessibility": road_acc,
        "urgency": urgency,
        "recommended_action": directive,
        "surge_velocity_ms": surge_velocity,
        "time_to_peak_hours": time_to_peak,
        "landslide_score": landslide_score,
        "secondary_hazards": sec_hazards,
        "risk_scenarios": {
            "best_case_peak_m": best_case_peak,
            "expected_peak_m": expected_peak,
            "worst_case_peak_m": worst_case_peak
        },
        "surge_projection_chart": chart_data
    }
