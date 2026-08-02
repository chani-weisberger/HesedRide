import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.api import rides
from app.db import models
from app.db.database import Base, get_db


@pytest.fixture()
def db_session():
    """Provide an isolated in-memory database session for each test."""
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)

    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture()
def client(db_session):
    """Provide a FastAPI test client with database dependency override."""
    app = FastAPI()
    app.include_router(rides.router)

    def override_get_db():
        """Yield the test session to dependency-injected routes."""
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    return TestClient(app)
