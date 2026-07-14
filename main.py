from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, Base, SessionLocal
from models import Slot, Booking
from schemas import SlotCreate, BookingCreate

Base.metadata.create_all(bind=engine)

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@app.get("/")
def home():
    return {
        "message": "Interview Slot Booking System"
    }


@app.post(
    "/slots",
    status_code=status.HTTP_201_CREATED
)
def create_slot(
    slot_data: SlotCreate,
    db: Session = Depends(get_db)
):
    existing_slot = db.query(Slot).filter(
        Slot.date == slot_data.date,
        Slot.time == slot_data.time
    ).first()

    if existing_slot:
        raise HTTPException(
            status_code=409,
            detail="This interview slot already exists"
        )

    new_slot = Slot(
        date=slot_data.date,
        time=slot_data.time
    )

    db.add(new_slot)
    db.commit()
    db.refresh(new_slot)

    return {
        "message": "Slot created successfully",
        "slot": new_slot
    }


@app.get("/slots")
def get_slots(
    db: Session = Depends(get_db)
):
    return db.query(Slot).all()


@app.get("/slots/available")
def get_available_slots(
    db: Session = Depends(get_db)
):
    return db.query(Slot).filter(
        Slot.is_booked == False
    ).all()


@app.get("/bookings/check")
def check_candidate_booking(
    email: str,
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(
        Booking.candidate_email == email
    ).first()

    if booking is None:
        return {
            "has_booking": False
        }

    slot = db.query(Slot).filter(
        Slot.id == booking.slot_id
    ).first()

    return {
        "has_booking": True,
        "message": "You already have an interview slot booked",
        "booking": {
            "booking_id": booking.id,
            "candidate_name": booking.candidate_name,
            "candidate_email": booking.candidate_email,
            "slot_id": booking.slot_id,
            "date": slot.date if slot else None,
            "time": slot.time if slot else None
        }
    }


@app.post(
    "/book",
    status_code=status.HTTP_201_CREATED
)
def book_slot(
    booking_data: BookingCreate,
    db: Session = Depends(get_db)
):
    email = booking_data.candidate_email.strip().lower()

    existing_booking = db.query(Booking).filter(
        Booking.candidate_email == email
    ).first()

    if existing_booking:
        raise HTTPException(
            status_code=409,
            detail="You already have an interview slot booked"
        )

    slot = db.query(Slot).filter(
        Slot.id == booking_data.slot_id
    ).first()

    if slot is None:
        raise HTTPException(
            status_code=404,
            detail="Slot not found"
        )

    if slot.is_booked:
        raise HTTPException(
            status_code=409,
            detail="This slot has already been booked"
        )

    booking = Booking(
        candidate_name=booking_data.candidate_name.strip(),
        candidate_email=email,
        slot_id=booking_data.slot_id
    )

    slot.is_booked = True

    db.add(booking)
    db.commit()
    db.refresh(booking)

    return {
        "message": "Slot booked successfully",
        "booking": booking
    }
@app.get("/bookings")
def get_bookings(db: Session = Depends(get_db)):
    bookings = db.query(Booking).all()

    result = []

    for booking in bookings:
        slot = db.query(Slot).filter(
            Slot.id == booking.slot_id
        ).first()

        result.append({
            "booking_id": booking.id,
            "candidate_name": booking.candidate_name,
            "candidate_email": booking.candidate_email,
            "slot_id": booking.slot_id,
            "date": slot.date if slot else None,
            "time": slot.time if slot else None,
            "booked_at": booking.booked_at.strftime("%d-%m-%Y %I:%M:%S %p")
            if booking.booked_at else None
        })

    return result
