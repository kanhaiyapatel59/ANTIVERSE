from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# ==========================================
# AGENT 1: DETECTION AGENT SCHEMAS
# ==========================================
class DetectionInput(BaseModel):
    image_url: str = Field(..., description="URL or base64 data string of the drone/CCTV image")
    location: Optional[str] = Field("Unknown Sector", description="Target location description")

class DetectionOutput(BaseModel):
    people_detected: int = Field(..., description="Estimated number of human victims detected")
    animals_detected: int = Field(default=0, description="Estimated number of animals/livestock detected")
    vehicles_and_structures: List[str] = Field(default_factory=list, description="Detected objects (cars, boats, roofs)")
    flood_percentage: float = Field(..., description="Percentage of area flooded (0-100%)")
    severity: str = Field(..., description="CRITICAL | HIGH | MEDIUM | LOW")
    building_damage: str = Field(..., description="Structural damage assessment: SEVERE | MODERATE | MINIMAL | NONE")
    location_summary: str = Field(..., description="Visual scene summary")
    confidence: float = Field(..., description="Detection confidence score (0.0 - 1.0)")
    visual_breakdown: Dict[str, Any] = Field(default_factory=dict, description="Detailed scene object counts & metrics")
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

# ==========================================
# AGENT 2: WEATHER AGENT SCHEMAS
# ==========================================
class WeatherInput(BaseModel):
    city: str = Field(..., description="City or District name")

class WeatherOutput(BaseModel):
    city: str
    temperature: float = Field(..., description="Temperature in Celsius")
    rainfall: str = Field(..., description="Rainfall intensity, e.g. 85mm/hr Heavy Downpour")
    flood_risk: str = Field(..., description="HIGH | EXTREME | MODERATE | LOW")
    weather_forecast: str = Field(..., description="Next 24-48h forecast analysis")
    humidity: float = Field(default=82.0, description="Humidity percentage (0-100%)")
    wind_speed_kmh: float = Field(default=35.0, description="Wind speed in km/h")
    pressure_hpa: float = Field(default=1004.0, description="Barometric pressure in hPa")
    storm_surge_index: str = Field(default="HIGH", description="Storm surge threat index")
    landslide_risk: str = Field(default="MODERATE", description="Terrain landslide vulnerability")
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

# ==========================================
# AGENT 3: PREDICTION AGENT SCHEMAS
# ==========================================
class PredictionInput(BaseModel):
    detection: DetectionOutput
    weather: WeatherOutput

class PredictionOutput(BaseModel):
    water_rise_estimate: str = Field(..., description="Estimated water rise, e.g. +1.5 meters in 3 hours")
    road_accessibility: str = Field(..., description="BLOCKED | SEVERELY_RESTRICTED | PASSABLE")
    urgency: str = Field(..., description="IMMEDIATE_EVACUATION | URGENT_MONITORING | STABLE")
    recommended_action: str = Field(..., description="Strategic directive for commanders")
    surge_velocity_ms: float = Field(default=1.8, description="Estimated water flow speed in meters/sec")
    time_to_peak_hours: float = Field(default=3.5, description="Time until maximum flood height")
    landslide_score: int = Field(default=68, description="Landslide risk index out of 100")
    secondary_hazards: List[str] = Field(default_factory=list, description="Submerged power lines, dam spill risk")
    risk_scenarios: Dict[str, Any] = Field(default_factory=dict, description="Best-case, expected, worst-case forecasts")
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

# ==========================================
# AGENT 4: ROUTE AGENT SCHEMAS
# ==========================================
class RouteInput(BaseModel):
    incident_location: str = Field(..., description="Target disaster coordinates/location")
    available_teams: List[str] = Field(
        default=["NDRF Team Alpha", "Fire Battalion 4", "District Rescue Squad 2"],
        description="Available rescue unit IDs"
    )

class RouteOutput(BaseModel):
    best_rescue_team: str = Field(..., description="Assigned optimal unit")
    best_route: str = Field(..., description="Tactical transit route with waypoint safety details")
    eta: str = Field(..., description="Estimated time of arrival, e.g. 18 mins")
    alternate_route: str = Field(default="Secondary Ridge Corridor (Backup Evacuation Link)", description="Failover route")
    transport_modes: List[str] = Field(default_factory=lambda: ["Amphibious Boat", "Off-Road Rescue Truck"], description="Usable transit modes")
    waypoints: List[Dict[str, Any]] = Field(default_factory=list, description="Sequential navigation nodes with risk state")
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

# ==========================================
# AGENT 5: RESOURCE AGENT SCHEMAS
# ==========================================
class ResourceInput(BaseModel):
    people_count: int = Field(..., description="Number of affected individuals")
    location: str = Field(..., description="Target location")
    animals_count: Optional[int] = Field(default=0, description="Number of affected animals/livestock")

class ResourceOutput(BaseModel):
    nearest_shelter: str = Field(..., description="Primary shelter facility assigned")
    beds_available: int = Field(..., description="Available capacity")
    food_rations: str = Field(..., description="Allocated food supply status")
    medicine_kits: str = Field(..., description="Assigned medical supply packs")
    fuel_liters: str = Field(..., description="Fuel allocation for generators/vehicles")
    rescue_boats: int = Field(..., description="Deployed rescue motorboats")
    drinking_water_liters: int = Field(default=500, description="Clean drinking water supply")
    livestock_feed_kg: int = Field(default=0, description="Emergency feed for stranded livestock")
    shelter_occupancy_pct: float = Field(default=45.0, description="Live shelter occupancy %")
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

# ==========================================
# AGENT 6: COMMUNICATION AGENT SCHEMAS
# ==========================================
class CommunicationInput(BaseModel):
    location: str
    weather: Optional[WeatherOutput] = None
    detection: Optional[DetectionOutput] = None
    prediction: Optional[PredictionOutput] = None
    route: Optional[RouteOutput] = None
    resource: Optional[ResourceOutput] = None

class CommunicationOutput(BaseModel):
    incident_report: str = Field(..., description="Comprehensive Situational Assessment Report")
    sms_alert: str = Field(..., description="Concise SMS notice for field teams")
    email_alert: str = Field(..., description="Formal email update for District Collector / NDRF HQ")
    emergency_broadcast: str = Field(..., description="Public alert broadcast message")
    authority_report: str = Field(..., description="High-level executive briefing for control room")
    hindi_alert: str = Field(default="", description="Hindi translation of public broadcast alert")
    pa_audio_script: str = Field(default="", description="Loudspeaker announcement script for ground teams")
    cap_json_payload: Dict[str, Any] = Field(default_factory=dict, description="Common Alerting Protocol (CAP) v1.2 standard output")
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

# ==========================================
# SHARED INCIDENT STATE (COMMANDER AGENT)
# ==========================================
class IncidentState(BaseModel):
    incident_id: str
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    location: str
    image_url: Optional[str] = None
    people_count: int = 0
    animals_count: int = 0
    priority_level: str = "P1_CRITICAL" # P1_CRITICAL | P2_HIGH | P3_MEDIUM | P4_LOW
    status: str = "INITIALIZED" # INITIALIZED -> ANALYZING -> DISPATCHED -> COMPLETED
    weather: Optional[WeatherOutput] = None
    detection: Optional[DetectionOutput] = None
    prediction: Optional[PredictionOutput] = None
    route: Optional[RouteOutput] = None
    resources: Optional[ResourceOutput] = None
    communication: Optional[CommunicationOutput] = None
    logs: List[str] = Field(default_factory=list)

