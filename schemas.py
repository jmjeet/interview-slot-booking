from pydantic import BaseModel


class SlotCreate(BaseModel):
    date: str
    time: str


class BookingCreate(BaseModel):
    candidate_name: str
    candidate_email: str
    slot_id: int