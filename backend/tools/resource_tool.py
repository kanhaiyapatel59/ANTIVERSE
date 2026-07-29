import random

SHELTER_DATABASE = [
    {
        "name": "St. Xavier Emergency Relief Camp - Sector 4",
        "city_match": ["mumbai", "sector 4", "konkan"],
        "total_capacity": 450,
        "available_beds": 180,
        "location": "High-Ground Sector 4 Plateau"
    },
    {
        "name": "District Stadium Relief Operations Center",
        "city_match": ["wayanad", "mountain", "kerala"],
        "total_capacity": 600,
        "available_beds": 240,
        "location": "District Sports Complex"
    },
    {
        "name": "Guwahati Central High School Flood Shelter",
        "city_match": ["guwahati", "brahmaputra", "assam"],
        "total_capacity": 350,
        "available_beds": 120,
        "location": "North Zoo Road Elevated Campus"
    },
    {
        "name": "National Disaster Relief Shelter Hub",
        "city_match": [],
        "total_capacity": 500,
        "available_beds": 210,
        "location": "Central District Complex"
    }
]

async def allocate_emergency_resources(people_count: int, location: str, animals_count: int = 0) -> dict:
    """
    Logistics mathematical optimization engine calculating exact food, clean drinking water,
    medical trauma kits, generator fuel, rescue boats, AND livestock feed for affected casualties.
    """
    loc_lower = location.lower().strip()

    matched_shelter = None
    for shelter in SHELTER_DATABASE:
        for match in shelter["city_match"]:
            if match in loc_lower:
                matched_shelter = shelter
                break
        if matched_shelter:
            break

    if not matched_shelter:
        matched_shelter = SHELTER_DATABASE[-1]

    human_count = max(0, people_count)
    animal_count = max(0, animals_count)

    count_for_beds = max(1, human_count)
    beds_assigned = min(count_for_beds * 2, matched_shelter["available_beds"])
    food_packs = count_for_beds * 5
    drinking_water = count_for_beds * 12  # 12 Liters clean water per person (3 days)
    medical_kits = max(5, int(count_for_beds * 1.5))
    fuel_liters = max(200, count_for_beds * 35)
    rescue_boats = max(2, int(count_for_beds / 6) + 1) if count_for_beds > 5 else 2

    livestock_feed = animal_count * 25 # 25kg feed per animal
    occupancy_pct = round(((matched_shelter["total_capacity"] - matched_shelter["available_beds"] + beds_assigned) / matched_shelter["total_capacity"]) * 100.0, 1)

    return {
        "nearest_shelter": matched_shelter["name"],
        "beds_available": beds_assigned,
        "food_rations": f"{food_packs} MRE Emergency Rations Allocated",
        "medicine_kits": f"{medical_kits} Trauma & IV First-Aid Kits Deployed",
        "fuel_liters": f"{fuel_liters} Liters Diesel Fuel (Generator & Boat Supply)",
        "rescue_boats": rescue_boats,
        "drinking_water_liters": drinking_water,
        "livestock_feed_kg": livestock_feed,
        "shelter_occupancy_pct": min(98.5, occupancy_pct)
    }
