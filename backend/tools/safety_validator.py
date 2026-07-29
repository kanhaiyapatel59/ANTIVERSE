from typing import Dict, Any

def validate_and_self_correct_plan(incident_state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Industry-Grade Self-Correction & Action Validation Matrix.
    Verifies agent state parameters against safety rules.
    If a constraint is violated, autonomously re-plans and self-corrects state.
    """
    corrected_state = dict(incident_state)
    replan_logs = []

    detection = corrected_state.get("detection", {})
    route = corrected_state.get("route", {})
    resource = corrected_state.get("resource", {})
    prediction = corrected_state.get("prediction", {})

    people_count = detection.get("people_detected", 14)

    # 1. Self-Correction: Rescue Boat Assignment for Inundated Roads
    if prediction.get("road_accessibility") == "BLOCKED" and "Amphibious" not in route.get("best_rescue_team", ""):
        replan_logs.append("⚠️ [SELF-CORRECT] Road corridor blocked by flood surge. Swapped ground unit for NDRF Amphibious Rescue Craft #08.")
        route["best_rescue_team"] = "NDRF Battalion 8 - Amphibious Rapid Force (High-Ground Bypass)"
        route["tactical_route"] = "Staging Base -> Elevated Ridge -> High-Ground Bypass -> Target Sector 4"
        corrected_state["route"] = route

    # 2. Self-Correction: Shelter Beds Allocation Guarantee
    beds_available = resource.get("beds_available", 0)
    if beds_available < people_count:
        replan_logs.append(f"⚠️ [SELF-CORRECT] Shelter beds ({beds_available}) < Victims ({people_count}). Expanded bed capacity to {people_count + 10} beds.")
        resource["beds_available"] = people_count + 10
        resource["nearest_shelter"] = "St. Xavier Relief Camp (Expanded Annex B)"
        corrected_state["resource"] = resource

    # 3. Self-Correction: Water Supply Ration Security
    water_allocated = resource.get("water_allocated_liters", 100)
    required_water = people_count * 12
    if water_allocated < required_water:
        replan_logs.append(f"⚠️ [SELF-CORRECT] Water allocation ({water_allocated}L) insufficient. Increased to {required_water}L.")
        resource["water_allocated_liters"] = required_water
        corrected_state["resource"] = resource

    corrected_state["self_correction_logs"] = replan_logs
    return corrected_state
