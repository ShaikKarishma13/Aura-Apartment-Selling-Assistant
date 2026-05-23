# 🏢 Apartment Sales AI Agent

## 📌 Brief Description
Apartment Sales AI Agent is an AI-assisted CRM and lead management dashboard designed for apartment sales automation.

The system is planned to:
- Automatically contact customers
- Simulate human-like AI conversations
- Collect customer requirements
- Analyze customer interest
- Classify leads into Hot / Warm / Cold
- Track conversations and follow-ups
- Display analytics in a smart dashboard

Basically:

👉 A smart AI salesperson that automatically interacts with customers and helps sales teams manage leads efficiently.

---


# 🛠️ Technologies Used

## Frontend
- React.js
- JavaScript (ES6)
- CSS3
- Recharts Library
- React Router DOM

## Backend (Planned / Started)
- FastAPI (Python)
- PostgreSQL
- REST APIs

## AI Layer (Planned)
- Groq API
- LLM-based Response Generation
- NLP for Lead Classification

---

# 📂 Complete Project Folder Structure

```bash
selling-apartment-agent/
│
├── frontend/
│   │
│   ├── public/
│   │
│   ├── src/
│   │   │
│   │   ├── assets/
│   │   │   └── agent.png
│   │   │
│   │   ├── components/
│   │   │   ├── ChartSection.js
│   │   │   ├── LeadForm.js
│   │   │   ├── LeadList.js
│   │   │   └── PieChartSection.js
│   │   │
│   │   ├── layout/
│   │   │   ├── Sidebar.js
│   │   │   └── Topbar.js
│   │   │
│   │   ├── pages/
│   │   │   ├── Analytics.js
│   │   │   ├── Auth.js
│   │   │   ├── Calls.js
│   │   │   ├── Dashboard.js
│   │   │   ├── FollowUps.js
│   │   │   ├── Leads.js
│   │   │   └── Settings.js
│   │   │
│   │   ├── App.js
│   │   ├── index.js
│   │   └── styles.css
│   │
│   ├── package.json
│   ├── package-lock.json
│   └── README.md
│
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

---

# 🧩 Current Frontend Dashboard Structure

```bash
Dashboard
│
├── Sidebar Navigation
│   ├── Dashboard
│   ├── Leads
│   ├── Calls
│   ├── Analytics
│   ├── Follow-ups
│   └── Settings
│
├── Topbar
│   ├── Search Bar (UI)
│   ├── Notifications Icon
│   └── Profile Icon
│
├── Dashboard Overview
│   ├── Total Leads
│   ├── Calls Today
│   ├── Hot Leads
│   └── Conversion Rate
│
├── Charts Section
│   ├── Leads This Week
│   └── Lead Distribution
│
└── Activity Feed
```

---

# 🔐 AUTH PAGE

## Features
- Email validation
- Optional name validation
- Local storage support
- Redirect to dashboard
- Loading state animation
- Premium glassmorphism UI

## Purpose
Acts as the entry point into the CRM dashboard.

---

# 📋 LEADS PAGE

## Features
- Add Lead
- Edit Lead
- Delete Lead
- Follow-up scheduling
- Lead filtering system
- Lead distribution chart
- Local storage persistence

## Filters
- Status
- Budget
- Location
- Search input (UI ready)

## UI Features
- Glass input fields
- Deep glass lead cards
- Gradient buttons
- Hover effects
- Responsive layout

## Purpose
Centralized lead tracking and management system.

---

# 📞 CALLS PAGE

## Features
- Active calls list
- Dynamic call timer
- Live call simulation
- Sentiment status
- Call details section
- Call interaction UI

## UI Features
- Dual panel glass layout
- Interactive cards
- Dynamic timers
- Smooth hover transitions

## Purpose
Simulates AI-driven customer calling workflow.

---

# 📅 FOLLOW-UPS PAGE

## Features
- Automatic follow-up categorization
- Overdue section
- Today section
- Upcoming section

## Purpose
Helps sales teams prioritize customer engagement.

---

# 📊 ANALYTICS PAGE

## Features
- Call success metrics
- Lead statistics
- High-intent lead percentage
- Pie chart visualization
- Insights panel

## Purpose
Provides analytical insights from customer interactions.

---

# ⚙️ SETTINGS PAGE

## Sections

### 🤖 AI Configuration
- Prompt input
- Tone selection
- AI behavior configuration

### 📞 Call Settings
- Call start time
- Retry attempts

### 📂 Data Management
- File upload
- Export leads option

## UI Features
- Glass cards
- Glass inputs
- Gradient layout

---

# 💎 UI/UX HIGHLIGHTS

## Premium Glassmorphism Theme
- Gradient backgrounds
- Blur glass effects
- Glow effects
- Smooth transitions
- Hover animations

## Responsive Design
- Structured dashboard layout
- Reusable components
- Modern SaaS-style interface

## Frontend Optimizations
- Component-based architecture
- Dynamic rendering
- State management using React Hooks

---

# 💾 Data Persistence

Currently frontend data is stored using:

```bash
LocalStorage
```

This ensures:
- Leads remain after refresh
- User data persists
- Dashboard state remains stable

---

# ⚛️ React Features Used

- useState
- useEffect
- React Router DOM
- Component-based architecture
- Dynamic UI rendering
- Props management
- Conditional rendering

---

# 📦 Installed Packages & Dependencies

## Core Packages

```bash
npm install react-router-dom
npm install recharts
```

## Default React Packages
- react
- react-dom
- react-scripts

---

# ▶️ How to Run the Frontend

## Step 1 — Clone Repository

```bash
git clone https://github.com/ShaikKarishma13/selling-apartment-agent.git
```

---

## Step 2 — Open Project

```bash
cd selling-apartment-agent
cd frontend
```

---

## Step 3 — Install Dependencies

```bash
npm install
```

---

## Step 4 — Run Frontend

```bash
npm start
```

---

## Step 5 — Open Browser

```bash
http://localhost:3000
```

---

# 🌿 Git Branch Information

## Current Working Branch

```bash
frontend
```

## Pull Latest Updates

```bash
git checkout frontend
git pull origin frontend
```

---

# 👥 Team Collaboration Workflow

## Push Changes

```bash
git add .
git commit -m "updated frontend"
git push origin frontend
```

## Important
⚠️ Team members should push work to the `frontend` branch, not directly to `main`.

---

# ❗ Current Limitations

- No backend API integration yet
- No real AI processing
- No real authentication
- Notifications are static
- Search functionality pending
- Profile system incomplete
- No database integration yet

---

# 🚀 Planned Future Enhancements

## Backend Integration
- FastAPI APIs
- PostgreSQL database
- Authentication system

## AI Features
- Groq AI integration
- NLP-based lead classification
- Conversation intelligence

## Advanced Features
- Real-time notifications
- Global search
- CRM integration
- Voice calling APIs
- Twilio/WebRTC support

---

# 💯 Project Strengths

- Premium UI design
- Real-world business use case
- Scalable architecture
- Clean reusable component structure
- Persistent frontend data handling
- Modular frontend design
- Backend-ready architecture

---

# 🎯 Project Goal

To build a scalable AI-powered apartment sales assistant capable of automating customer interactions, managing leads intelligently, and assisting sales teams using conversational AI.

---

# 👨‍💻 Developed As

Academic team project focused on:
- Frontend architecture
- Dashboard design
- CRM workflow simulation
- AI-assisted application planning
- Full-stack scalable system design
























































# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)



