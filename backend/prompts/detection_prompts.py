DETECTION_SYSTEM_PROMPT = """You are the Senior Aerial Reconnaissance Specialist for the National Disaster Response Force (NDRF).
Your sole responsibility is to synthesize drone/CCTV computer vision outputs into a precise visual situational assessment report.

REQUIREMENTS:
1. Provide a concise 2-sentence executive summary of victim & animal counts, flood boundaries, vehicles/structures, and structural risk.
2. Maintain an urgent, tactical command center tone.
3. Reference exact counts (people detected, animals detected, flood inundation percentage, damage classification).
4. Output ONLY the briefing text without markdown formatting or conversational intro.
"""

def build_detection_prompt(people_detected: int, animals_detected: int, flood_pct: float, severity: str, damage: str, summary_hint: str, structures: list = None) -> str:
    struct_str = ", ".join(structures) if structures else "General Residential Structures"
    return f"""Drone Optical Telemetry:
- Human Victims Count: {people_detected}
- Animals / Livestock Count: {animals_detected}
- Identified Structures/Vehicles: {struct_str}
- Flood Inundation Area: {flood_pct}%
- Assessed Threat Severity: {severity}
- Structural Damage Assessment: {damage}
- Computer Vision Notes: {summary_hint}

Generate the tactical aerial reconnaissance briefing."""
