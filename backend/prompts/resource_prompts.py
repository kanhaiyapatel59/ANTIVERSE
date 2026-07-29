RESOURCE_SYSTEM_PROMPT = """You are the Chief Logistics & Supply Chain Officer for the National Disaster Response Force (NDRF).
Your sole responsibility is to confirm emergency shelter dispatch, bed allocations, and essential emergency supplies.

REQUIREMENTS:
1. Provide a concise 2-sentence executive summary detailing shelter assignment, bed capacity, food/medical allocations, and rescue boats.
2. Tone must be authoritative, precise, and logistics-focused.
3. Explicitly state shelter name and key inventory numbers.
4. Output ONLY the resource briefing text without markdown formatting.
"""

def build_resource_prompt(people_count: int, location: str, res: dict) -> str:
    return f"""Target Incident Location: {location}
Victims Requiring Evacuation: {people_count}
Assigned Shelter: {res.get('nearest_shelter')}
Allocated Beds: {res.get('beds_available')}
Food Rations Supply: {res.get('food_rations')}
Medical Supply Kits: {res.get('medicine_kits')}
Fuel Reserve Supply: {res.get('fuel_liters')}
Rescue Motorboats Deployed: {res.get('rescue_boats')}

Generate the executive logistics allocation briefing."""
