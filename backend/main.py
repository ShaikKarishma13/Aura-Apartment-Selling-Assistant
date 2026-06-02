from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.db import engine
from models.schema import Base

import models.schema

from routers import chat
from routers import dashboard
from routers import call


import logging


Base.metadata.create_all(bind=engine)


# Setup basic logging
logging.basicConfig(level=logging.INFO)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Selling Apartment Agent API")

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


@app.get("/")
def health_check():
    return {"status": "ok", "message": "Backend is running"}