# Interview Slot Booking System

A simple Interview Slot Booking System built using **FastAPI**, **SQLite**, **HTML**, **CSS**, and **JavaScript**.

## Features

- Create interview slots
- View available interview slots
- Book an interview slot
- Prevent duplicate slot bookings
- Prevent the same candidate from booking multiple slots
- Store candidate and booking details
- Professional frontend connected to backend
- Booking confirmation page
- Booking timestamp

---

## Tech Stack

- Python 3
- FastAPI
- SQLAlchemy
- SQLite
- HTML
- CSS
- JavaScript

---

## Project Structure

```
interview-slot-booking/
│
├── frontend/
│   ├── index.html
│   ├── success.html
│   ├── style.css
│   ├── script.js
│   └── background.jpg
│
├── database.py
├── models.py
├── schemas.py
├── main.py
├── interview_booking.db
├── README.md
└── .gitignore
```

---

## Installation

Clone the repository

```bash
git clone <repository-url>
```

Go to the project folder

```bash
cd interview-slot-booking
```

Create a virtual environment

```bash
python -m venv .venv
```

Activate the virtual environment

Windows

```bash
.venv\Scripts\activate
```

Install dependencies

```bash
pip install fastapi uvicorn sqlalchemy
```

Run the project

```bash
uvicorn main:app --reload
```

Open Swagger

```
http://127.0.0.1:8000/docs
```

---

## API Endpoints

### Create Slot

```
POST /slots
```

### Get All Slots

```
GET /slots
```

### Get Available Slots

```
GET /slots/available
```

### Book Interview Slot

```
POST /book
```

### Check Existing Booking

```
GET /bookings/check
```

### Get All Bookings

```
GET /bookings
```

---

## Database

### Slots Table

| Field | Type |
|------|------|
| id | Integer |
| date | String |
| time | String |
| is_booked | Boolean |

---

### Bookings Table

| Field | Type |
|------|------|
| id | Integer |
| candidate_name | String |
| candidate_email | String |
| slot_id | Integer |
| booked_at | DateTime |

---

## Workflow

1. Admin creates interview slots.
2. Candidate views available slots.
3. Candidate selects a slot.
4. Booking is stored in the database.
5. Selected slot becomes unavailable.
6. Confirmation page is displayed.

---

## Author

Jeet Mehta