import uvicorn
from fastapi import FastAPI

from app.db.database import engine
from app.db import models
from app.api import auth

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="HesedRide API", version="1.0.0")
app.include_router(auth.router)

@app.get("/")
def start_server():
    return {"message": "The server of HesedRide is on air!"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)