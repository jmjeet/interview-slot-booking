const API_URL = "http://127.0.0.1:8000";

const bookingForm = document.getElementById("bookingForm");
const emailInput = document.getElementById("email");
const slotSelect = document.getElementById("slotSelect");
const bookButton = document.getElementById("bookButton");
const message = document.getElementById("message");

let emailCheckTimer;


function showMessage(text, type) {
    message.textContent = text;
    message.className = type;
}


function clearMessage() {
    message.textContent = "";
    message.className = "";
}


async function loadSlots() {
    slotSelect.disabled = true;
    bookButton.disabled = true;

    slotSelect.innerHTML =
        '<option value="">Loading available slots...</option>';

    try {
        const response = await fetch(`${API_URL}/slots/available`);

        if (!response.ok) {
            throw new Error("Unable to load slots");
        }

        const slots = await response.json();

        slotSelect.innerHTML =
            '<option value="">Choose an available slot</option>';

        if (slots.length === 0) {
            slotSelect.innerHTML =
                '<option value="">No slots currently available</option>';

            showMessage(
                "All interview slots are currently booked.",
                "error"
            );

            return;
        }

        slots.forEach((slot) => {
            const option = document.createElement("option");

            option.value = slot.id;
            option.textContent = `${slot.date} · ${slot.time}`;

            slotSelect.appendChild(option);
        });

        slotSelect.disabled = false;
        bookButton.disabled = false;

    } catch (error) {
        slotSelect.innerHTML =
            '<option value="">Unable to load slots</option>';

        showMessage(
            "Cannot connect to the booking server.",
            "error"
        );
    }
}


async function checkExistingBooking() {
    const email = emailInput.value.trim().toLowerCase();

    if (!email) {
        clearMessage();
        slotSelect.disabled = false;
        bookButton.disabled = false;
        return;
    }

    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!validEmail.test(email)) {
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/bookings/check?email=${encodeURIComponent(email)}`
        );

        const result = await response.json();

        if (result.has_booking) {
            showMessage(
                `You already booked ${result.booking.date} at ${result.booking.time}.`,
                "error"
            );

            slotSelect.disabled = true;
            bookButton.disabled = true;
        } else {
            clearMessage();

            if (slotSelect.options.length > 1) {
                slotSelect.disabled = false;
                bookButton.disabled = false;
            }
        }

    } catch (error) {
        showMessage(
            "Unable to check your existing booking.",
            "error"
        );
    }
}


emailInput.addEventListener("input", function () {
    clearTimeout(emailCheckTimer);

    emailCheckTimer = setTimeout(
        checkExistingBooking,
        500
    );
});


bookingForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document
        .getElementById("name")
        .value
        .trim();

    const email = emailInput.value.trim().toLowerCase();
    const slotId = slotSelect.value;

    clearMessage();

    if (!name || !email || !slotId) {
        showMessage(
            "Please complete every field.",
            "error"
        );
        return;
    }

    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!validEmail.test(email)) {
        showMessage(
            "Please enter a valid email address.",
            "error"
        );
        return;
    }

    const selectedSlotText =
        slotSelect.options[slotSelect.selectedIndex].text;

    bookButton.disabled = true;

    bookButton
        .querySelector("span:first-child")
        .textContent = "Confirming...";

    try {
        const response = await fetch(`${API_URL}/book`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                candidate_name: name,
                candidate_email: email,
                slot_id: Number(slotId)
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.detail ||
                "Unable to complete booking."
            );
        }

        const [date, time] = selectedSlotText.split(" · ");

        sessionStorage.setItem(
            "confirmedBooking",
            JSON.stringify({
                name: name,
                email: email,
                date: date,
                time: time
            })
        );

        window.location.href = "success.html";

    } catch (error) {
        showMessage(
            error.message,
            "error"
        );

        bookButton.disabled = false;

        bookButton
            .querySelector("span:first-child")
            .textContent = "Confirm booking";
    }
});


loadSlots();