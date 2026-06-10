from app.db import models


def make_ride_request(db_session, status="proposed"):
    ride_request = models.RideRequest(
        origin="Tel Aviv, Israel",
        destination="Haifa, Israel",
        ride_date="2026-06-15",
        ride_time="10:00",
        passenger_count=1,
        patient_name="Test Patient",
        patient_phone="0501111111",
        status=status,
    )
    db_session.add(ride_request)
    db_session.commit()
    db_session.refresh(ride_request)
    return ride_request


def make_volunteer_ride(db_session, status="proposed", matched_request_id=None):
    volunteer_ride = models.VolunteerRide(
        source_location="Tel Aviv, Israel",
        destination_location="Haifa, Israel",
        available_seats=2,
        grace_minutes=30,
        status=status,
        matched_request_id=matched_request_id,
    )
    db_session.add(volunteer_ride)
    db_session.commit()
    db_session.refresh(volunteer_ride)
    return volunteer_ride


def test_cancel_with_match_resets_request_to_pending(client, db_session):
    ride_request = make_ride_request(db_session, status="proposed")
    volunteer_ride = make_volunteer_ride(
        db_session, status="proposed", matched_request_id=ride_request.id
    )

    response = client.patch(f"/api/rides/volunteer/cancel/{volunteer_ride.id}")

    assert response.status_code == 200
    assert response.json()["status"] == "success"

    db_session.refresh(volunteer_ride)
    db_session.refresh(ride_request)
    assert volunteer_ride.status == "cancelled"
    assert ride_request.status == "pending"


def test_cancel_without_match(client, db_session):
    volunteer_ride = make_volunteer_ride(db_session, status="pending", matched_request_id=None)

    response = client.patch(f"/api/rides/volunteer/cancel/{volunteer_ride.id}")

    assert response.status_code == 200
    assert response.json()["status"] == "success"

    db_session.refresh(volunteer_ride)
    assert volunteer_ride.status == "cancelled"


def test_cancel_nonexistent_volunteer_ride_returns_404(client):
    response = client.patch("/api/rides/volunteer/cancel/999999")

    assert response.status_code == 404


def test_cancel_already_cancelled_is_idempotent(client, db_session):
    volunteer_ride = make_volunteer_ride(db_session, status="cancelled", matched_request_id=None)

    response = client.patch(f"/api/rides/volunteer/cancel/{volunteer_ride.id}")

    assert response.status_code == 200

    db_session.refresh(volunteer_ride)
    assert volunteer_ride.status == "cancelled"


def test_cancel_with_dangling_matched_request_id(client, db_session):
    volunteer_ride = make_volunteer_ride(db_session, status="proposed", matched_request_id=999999)

    response = client.patch(f"/api/rides/volunteer/cancel/{volunteer_ride.id}")

    assert response.status_code == 200

    db_session.refresh(volunteer_ride)
    assert volunteer_ride.status == "cancelled"
