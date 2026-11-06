
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.connection import Base, engine
from database import models

from routes.customers import router as customer_router
from routes.predictions import router as prediction_router
from routes.settings import router as settings_router
from routes.retention import router as retention_router


app = FastAPI(
    title="Predictra API",
    description="AI-Powered Customer Intelligence & Retention Platform",
    version="1.0.0"
)

# Allow React frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://predictra-phi.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
Base.metadata.create_all(bind=engine)

# Register API routers
app.include_router(customer_router)
app.include_router(prediction_router)
app.include_router(settings_router)
app.include_router(retention_router)


@app.get("/")
def home():
    return {
        "message": "Welcome to Predictra Backend!",
        "status": "Running successfully"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "application": "Predictra"
    }


@app.get("/about")
def about():
    return {
        "project": "Predictra",
        "developer": "Hardik",
        "technology": "FastAPI + MySQL + Machine Learning",
        "purpose": "Customer Churn Prediction"
    }
