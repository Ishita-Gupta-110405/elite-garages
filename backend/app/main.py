from fastapi import FastAPI
from app.database import engine, Base
import app.models  # Ensure tables are registered
from app.routers import auth

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Car Dealership Inventory System")

app.include_router(auth.router)