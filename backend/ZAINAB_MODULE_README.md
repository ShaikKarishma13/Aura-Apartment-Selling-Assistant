# AI Engine (Zainab's Module) Documentation

## Overview
This document outlines the "Brain" of the Real Estate AI Agent system. This module handles API communication with the Groq LLaMA3 model, enforces conversational logic, applies system prompts, and handles the predictive lead scoring sequence. 

**Module Owner:** Zainab (AI Engineer)

---

## 📂 Files & Core Components Created

### 1. `backend/services/llm_service.py` (The AI Response Generator)
- **What it does:** This asynchronously communicates with the Groq API (`AsyncGroq`) to generate the sales agent's responses.
- **How it works:** It uses a strictly engineered System Prompt to ensure the AI acts as a professional real estate agent named "Alex". It forces the AI to qualify users (ask about budget/timeline), gracefully handle price objections, and push for site visits. 

### 2. `backend/services/lead_scoring.py` (The Lead Classification Engine)
- **What it does:** Reads an entire conversation transcript and categorizes the lead as `Hot`, `Warm`, or `Cold`.
- **How it works:** Instead of outputting free-text, this script utilizes LLaMA3 with a strict `temperature=0.1` and `response_format={"type": "json_object"}`. It analyzes the user's intent and returns a predictable programmatic JSON object containing the lead status and a 1-sentence reasoning for the decision.

### 3. `backend/models/pydantic_schemas.py`
- **What it does:** Enforces rigid input/output schemas for the REST endpoints. It ensures the backend doesn't crash if the frontend or Twilio sends malformed history arrays.

### 4. `backend/routers/chat.py` (The Endpoint)
- **What it does:** Exposes the AI Engine to the rest of the application via the `/api/chat/process-input` HTTP POST route.
- **How it works:** 
  1. Accepts the user's text and chat history.
  2. Runs it through `llm_service.py` to get the AI string response.
  3. Appends the AI response to the history and runs it through `lead_scoring.py` to calculate intent.
  4. Returns the response text, sentiment, and `Hot/Warm/Cold` intent back to the client.

---

## 🛠️ How to Test the AI Logic Independently
Before integrating Twilio Voice or the React Frontend into this logic, Backend/Frontend engineers can test that the "Brain" works perfectly by running the mock-conversation script in the terminal:

```bash
cd backend
.\venv\Scripts\activate
python test_zainabs_logic.py
```
*Note: Make sure your `GROQ_API_KEY` is present in the `backend/.env` file before running the script!*
