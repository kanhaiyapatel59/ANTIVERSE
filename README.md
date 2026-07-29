# 🛡️ AI Disaster Command Center
> **AI-Powered Multi-Agent Emergency Response & Incident Orchestration Platform**

![Python](https://img.shields.io/badge/Python-3.12-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-emerald)
![LangGraph](https://img.shields.io/badge/LangGraph-StateGraph-purple)
![Groq](https://img.shields.io/badge/Groq_LPU-llama--3.3--70b-cyan)
![React](https://img.shields.io/badge/React-18-blue)
![Vite](https://img.shields.io/badge/Vite-5-purple)
![TailwindCSS](https://img.shields.io/badge/Tailwind-HUD_Dark_Theme-slate)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🎯 Our Unique Selling Point (USP)

We are **NOT** building another victim-facing chatbot. In severe natural disasters (cyclones, landslides, flash floods), trapped victims may lack:
- ❌ Mobile Internet & Cellular Network Coverage
- ❌ Electrical Power & Battery Life
- ❌ Smartphones or Functional Signal

Instead, **AI Disaster Command Center** is software engineered specifically for:
- 🏛️ **National Disaster Response Force (NDRF)**
- 🏢 **District Collectors & Disaster Management Authorities**
- 🚓 **State Police & Emergency Control Rooms**
- 🚒 **Fire & Marine Rescue Departments**
- 🩺 **Relief NGOs & Medical Logistics Units**

The system aggregates multi-modal inputs from **Drone Imagery, CCTV Feeds, Weather Telemetry APIs, Hydro Gauges, Rescue Team Locations, and Emergency Shelter Databases**.

---

## 🏗️ Multi-Agent Architecture

The platform uses a **2-Day Modular Multi-Agent Design**:

```
                              [DISTRICT CONTROL ROOM INPUT]
                               (Location, Drone Image, People)
                                              │
                                              ▼
                        ┌───────────────────────────────────────────┐
                        │   LANGGRAPH COMMANDER ORCHESTRATOR        │
                        └─────────────────────┬─────────────────────┘
                                              │
         ┌────────────────────────────────────┼────────────────────────────────────┐
         │                                    │                                    │
         ▼                                    ▼                                    ▼
┌──────────────────┐                ┌──────────────────┐                ┌──────────────────┐
│ 01 WEATHER AGENT │                │ 02 DETECT AGENT  │                │ 03 PREDICT AGENT │
│ Rain & Flood Risk│                │ CV Aerial Recon  │                │ Hydro Surge Model│
└────────┬─────────┘                └────────┬─────────┘                └────────┬─────────┘
         │                                    │                                    │
         └────────────────────────────────────┼────────────────────────────────────┘
                                              │
         ┌────────────────────────────────────┼────────────────────────────────────┐
         │                                    │                                    │
         ▼                                    ▼                                    ▼
┌──────────────────┐                ┌──────────────────┐                ┌──────────────────┐
│  04 ROUTE AGENT  │                │05 RESOURCE AGENT │                │ 06 COMM AGENT    │
│ Rescue Dispatch  │                │ Shelter & Inventory│              │ SMS/Email/Broad  │
└──────────────────┘                └──────────────────┘                └──────────────────┘
```

Each agent has **one single responsibility**, uses **strict Pydantic typed contracts**, never directly calls another agent, and exposes an independent **FastAPI endpoint**.

---

## 🤖 The Six Specialized AI Agents

### 1. 🌤️ Weather Agent (`Agent 01`)
- **Input**: `City` (str)
- **Output**: `Temperature`, `Rainfall`, `Flood Risk` (`EXTREME`|`HIGH`|`MODERATE`|`LOW`), `Weather Forecast`
- **Endpoint**: `POST /api/v1/agent/weather`

### 2. 👁️ Detection Agent (`Agent 02`)
- **Input**: `Drone Image URL / Asset`, `Location`
- **Output**: `People Detected`, `Flood Area %`, `Severity`, `Building Damage`, `Location Summary`, `Confidence %`
- **Endpoint**: `POST /api/v1/agent/detection`

### 3. 📈 Prediction Agent (`Agent 03`)
- **Input**: `Detection Output` + `Weather Output`
- **Output**: `Water Rise Estimate`, `Road Accessibility` (`BLOCKED`|`RESTRICTED`|`PASSABLE`), `Evacuation Urgency`, `Recommended Action Directive`
- **Endpoint**: `POST /api/v1/agent/prediction`

### 4. 🧭 Route Agent (`Agent 04`)
- **Input**: `Incident Location`, `Available Rescue Teams`
- **Output**: `Best Rescue Team`, `Best Tactical Route` (Step-by-Step Waypoints), `ETA`
- **Endpoint**: `POST /api/v1/agent/route`

### 5. 📦 Resource Agent (`Agent 05`)
- **Input**: `People Count`, `Location`
- **Output**: `Nearest Shelter`, `Beds Available`, `Food Rations`, `Medicine Kits`, `Fuel Liters`, `Rescue Boats Deployed`
- **Endpoint**: `POST /api/v1/agent/resource`

### 6. 📻 Communication Agent (`Agent 06`)
- **Input**: `Outputs of all previous agents`
- **Output**: `Field Team SMS Alert`, `Formal NDRF Email`, `Public Warning Broadcast`, `Authority Briefing`, `Master Incident Report`
- **Endpoint**: `POST /api/v1/agent/communication`

---

## 👑 Day 2 Commander Agent (LangGraph)

The **Commander Agent** uses `LangGraph.StateGraph` to manage sequential multi-agent state transitions across a shared `IncidentState` object:

`weather_node` ➔ `detection_node` ➔ `prediction_node` ➔ `route_node` ➔ `resource_node` ➔ `communication_node` ➔ `synthesis_node`

- **Endpoint**: `POST /api/v1/commander/orchestrate`

---

## 🛠️ Tech Stack

### Backend
- **Language**: Python 3.12
- **Framework**: FastAPI + Uvicorn
- **Orchestration**: LangGraph (StateGraph Engine)
- **LLM Infrastructure**: Groq LPU API (`llama-3.3-70b-versatile`) with Gemini API fallback & rule resilience
- **Data Validation**: Pydantic v2
- **Databases**: SQLite (initial baseline) & MongoDB (dual-DB zero-downtime layer)

### Frontend
- **Framework**: React 18 + Vite
- **Design Aesthetic**: NASA Mission Control / Palantir Gotham HUD Theme ( Slate `#060911`, Cyan/Purple Glassmorphism)
- **Styling**: Tailwind CSS + Framer Motion
- **GIS Mapping**: Leaflet + React-Leaflet (CartoDB Dark Tiles)
- **Analytics**: Recharts
- **Icons**: Lucide Icons

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.12+
- Node.js 18+

### 1. Backend Setup
```bash
cd backend

# Create Virtual Environment
python3 -m venv venv
source venv/bin/activate

# Install Dependencies
pip install -r requirements.txt

# Create .env File
cp .env.example .env

# Run FastAPI Backend Server
python3 main.py
```
Backend API will be live at: `http://localhost:8000` (Health Check: `http://localhost:8000/health`)

### 2. Frontend Setup
Open a new terminal window:
```bash
cd frontend

# Install Packages
npm install

# Start Vite Development Server
npm run dev
```
Frontend Dashboard will be live at: `http://localhost:5173`

---

## 🧪 Master Test Suite (For Hackathon Judges)

Judges can independently test any feature or run the master integration suite:

```bash
cd backend
source venv/bin/activate

# Run Master Integration Test (All 6 Agents + Commander + DB)
python3 test_final_system.py

# Run Individual Agent Tests
python3 test_weather_agent.py
python3 test_detection_agent.py
python3 test_prediction_agent.py
python3 test_route_agent.py
python3 test_resource_agent.py
python3 test_communication_agent.py
python3 test_commander_agent.py
python3 test_mongo_db.py
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
