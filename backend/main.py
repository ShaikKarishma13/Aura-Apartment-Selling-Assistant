from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database.db import engine
from models.schema import Base

import models.schema

from routers import chat
from routers import dashboard
from routers import call



import logging
import os


Base.metadata.create_all(bind=engine)


# Setup basic logging
logging.basicConfig(level=logging.INFO)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Selling Apartment Agent API")

RECORDINGS_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "recordings")
)
ASSETS_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "assets")
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(chat.router)
app.include_router(dashboard.router)
app.include_router(call.router)
app.mount(
    "/recordings",
    StaticFiles(directory=RECORDINGS_DIR),
    name="recordings"
)
app.mount(
    "/assets",
    StaticFiles(directory=ASSETS_DIR),
    name="assets"
)


@app.get("/")
def health_check():
    return {"status": "ok", "message": "Backend is running"}

@app.get("/debug/routes")
def list_routes():
    routes = []
    for route in app.routes:
        route_info = {"path": getattr(route, "path", str(route)), "name": getattr(route, "name", "unknown")}
        if hasattr(route, "methods"):
            route_info["methods"] = list(route.methods)
        routes.append(route_info)
    return {"routes": routes, "total": len(routes)}

