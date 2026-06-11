# 🏢 Aura: AI Apartment Selling CRM & Voice Agent

Aura is a complete, AI-powered Customer Relationship Management (CRM) dashboard and automated calling system for real estate. It helps sales teams manage their property leads and automatically contacts leads using a friendly, human-like voice assistant to understand their requirements (budget, location, apartment size).

---

## 🌟 What the Entire Project Does

Aura has two core systems working together: a **CRM Management Dashboard** (Frontend) and an **AI Calling Server** (Backend).

Here is what you can do across the different screens of the application:

1.  **Dashboard (Main Stats)**: Displays key business metrics at a glance, such as *Total Leads*, *Calls Placed Today*, *Hot Leads*, and *Conversion Rates*. It also shows charts of weekly lead growth and a real-time feed of lead activity.
2.  **Leads Pipeline**: A centralized workspace to view all prospective buyers. You can:
    *   Add new leads with phone numbers and initial status.
    *   Edit lead details, assign statuses, or delete entries.
    *   Schedule follow-up dates.
    *   Filter leads dynamically by *Status*, *Budget*, and *Location*.
    *   All lead data is saved persistently in a PostgreSQL database via backend APIs.
3.  **Calls Page (AI Calling Assistant)**: The calling dashboard where you place outbound calls. Clicking a lead launches a call overlay that:
    *   Initiates a real phone call to the lead's mobile number.
    *   Plays live audio of the call in your web browser.
    *   Displays a live chat transcript between Aura (AI) and the Lead in real-time speech bubbles.
    *   Automatically runs an evaluation post-call, generating metrics like *Property Type*, *Budget*, *Location*, *Intent*, *Sentiment*, a *Call Summary*, and *Next Recommended Actions*.
4.  **Analytics Page**: Provides deep insights into sales performance. It tracks call success rates, identifies high-intent leads, and generates visual charts to help the team analyze customer interest.
5.  **Follow-Ups Tracker**: Displays scheduled callback tasks categorized automatically into *Overdue*, *Due Today*, and *Upcoming* sections to make sure no lead is forgotten.
6.  **Settings Page**: Allows you to customize the system:
    *   *AI Config*: Edit Aura's prompt instructions and voice tone.
    *   *Call Settings*: Modify call retries and schedules.
    *   *Data Management*: Upload bulk lead lists (Excel/CSV) or export lead databases.

---

## 🏗️ How the Project Works (Simple Flow)

The flow of information in Aura is divided into CRM actions and Phone Call actions.

### 1. General CRM Flow (Leads, Stats & Analytics)
*   **Adding/Updating Leads**: When you edit or add a lead on the UI, the frontend React app sends an API request to the FastAPI backend. FastAPI uses SQLAlchemy (an ORM tool) to write or update rows in a PostgreSQL database.
*   **Dashboard & Charts**: On page load, the frontend requests statistical summaries from the backend. The backend queries the database, groups data (e.g. by lead classification or created dates), and returns JSON data. Recharts on the frontend reads this data and draws graphs instantly.

### 2. Live Calling Flow (Aura Call Session)
*   **Step 1 - Connection Tunnel**: The Tunnel Manager (`manage_tunnel.py`) connects your local PC to the internet using `localhost.run`. This creates a temporary public address (e.g. `https://xxxx.lhr.life`) and saves it in `backend/.env`.
*   **Step 2 - Calling Out**: When you click "Start Call", the React app opens a WebSocket connection to the backend (`/ws-active`). The backend calls Twilio to place the outbound call.
*   **Step 3 - Media Streaming**: Once the customer answers, Twilio requests TwiML XML instructions from our backend. The backend instructs Twilio to stream the call's audio back to our server via a media WebSocket (`/twilio-media-stream`).
*   **Step 4 - AI Text-to-Speech (Aura Speaks)**: The backend generates Aura's responses. It converts the text into G.711 mu-law audio bytes (using Gemini or the Google Translate audio fallback). The backend sends this audio to Twilio (so the caller hears it) and mirrors it to your browser WebSocket (so you hear it).
*   **Step 5 - Speech-to-Text (Customer Speaks)**: When the customer speaks, Twilio streams their audio to our backend. The backend plays it in your browser and groups it into 3-second chunks. A local Whisper engine (`faster-whisper`) transcribes these chunks and pushes the text to the browser transcript bubbles.
*   **Step 6 - Evaluation**: After the call ends, Groq (Llama-3 LLM) reads the full transcript, extracts target metrics (budget, location, intent), saves them to the PostgreSQL database, and updates the dashboard.

---

## 📂 Backend File Modules Explained Simply

*   `main.py`: The main entry point of the backend. It sets up database tables, enables CORS (so the frontend can connect), and mounts the API router endpoints.
*   `routers/chat.py`: Handles all lead-related database API queries (fetching leads, adding new leads, updating, and deleting).
*   `routers/dashboard.py`: Contains routes that compute database statistics to power the CRM dashboard charts.
*   `routers/call.py`: Manages call initiations, WebSockets for live voice streaming, and status callbacks from Twilio.
*   `services/tts_service.py`: Generates Aura's voice. If Gemini TTS fails or hits rate limits (10 calls/day), it automatically falls back to a Google Translate audio engine to fetch, decode, and resample speech.
*   `services/transcription_service.py`: Loads the Whisper speech recognition model to translate the customer's raw voice into English text.
*   `services/llm_service.py`: Uses Groq to generate Aura's conversational sales responses during the live call.
*   `services/lead_analysis_service.py`: Uses Groq post-call to summarize the conversation and extract lead parameters.
*   `services/media_stream_service.py`: Holds active call websocket references, handles raw G.711 audio bytes, and resamples voice channels.
*   `database/db.py` & `models/schema.py`: Configures the database connection pool and declares PostgreSQL tables (`leads` and `call_history`).

---

## 💾 Database Schemas (Simple Table Structs)

Aura uses two main database tables in PostgreSQL:

### 1. `leads` (Customer Profiles)
*   `id`: Unique identifier (Primary Key).
*   `name`, `phone`: Contact name and number.
*   `status`: Lead status (New, Active, Hot, Warm, Cold).
*   `budget`, `location`, `property_type`: Property preferences extracted by the AI.
*   `sentiment`, `intent`: Buyer's mood and intent classification.
*   `summary`, `follow_up_notes`: Summaries generated from calls.

### 2. `call_history` (Call Records)
*   `id`: Unique identifier.
*   `name`, `phone`: Customer details.
*   `duration`: Duration of the call in seconds.
*   `transcript`: Full text transcript of the call conversation.
*   `recording_url`: Link to the stored MP3 recording.
*   `created_at`: Call timestamp.

---

## 🚀 How to Run the Application

You can start the frontend and backend together using a script, or run them manually in separate terminal consoles.

### Prerequisites
1.  **Python 3.13+** installed.
2.  **Node.js (v18+)** installed.
3.  **PostgreSQL** installed and running on port 5432. Create a database named `selling_apartment_agent` inside PostgreSQL.

---

### Step 1: Install Package Dependencies

#### Backend:
Open a terminal in the project root folder:
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

#### Frontend:
Open a new terminal in the project root folder:
```bash
cd frontend
npm install
```

---

### Step 2: Configure Environment Keys
Create a file named `.env` in the `backend/` directory and configure your keys:
```ini
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/selling_apartment_agent
GROQ_API_KEY=gsk_your_groq_api_key_here
GEMINI_API_KEY=AIzaSy_your_google_gemini_api_key_here
TWILIO_ACCOUNT_SID=AC_your_twilio_account_id_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here
```

---

### Step 3: Run the Application

#### Option A: One-Click Startup (Recommended)
Run the orchestrator script in the workspace root:
```bash
python run_all.py
```
This script will start the Tunnel Manager, Backend Server, and Frontend react server automatically in separate windows.

#### Option B: Manual Startup (Run in separate terminal tabs)

*   **Terminal 1: Start the Tunnel Manager** (Generates a public URL and updates `.env`):
    ```bash
    backend\venv\Scripts\python.exe manage_tunnel.py
    ```

*   **Terminal 2: Start the FastAPI Backend**:
    ```bash
    cd backend
    venv\Scripts\activate
    python -m uvicorn main:app --reload
    ```

*   **Terminal 3: Start the React Frontend**:
    ```bash
    cd frontend
    npm start
    ```

Open your browser to `http://localhost:3000` to interact with the full dashboard!
