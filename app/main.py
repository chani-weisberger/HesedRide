import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import engine
from app.db import models
from app.api import auth
from app.api import rides

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="HesedRide API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    )
app.include_router(auth.router)
app.include_router(rides.router)

@app.get("/")
def start_server():
    return {"message": "The server of HesedRide is on air!"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)