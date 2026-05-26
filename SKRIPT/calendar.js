/* ================================================================
   1. IMPORTS
   - Kalender State + Firebase User + Service Layer
================================================================ */
import { trainingDays, setSelectedDate } from "./training.js";
import { currentUser } from "./firebase.js";
import { fetchTrainingDays } from "./trainingService.js";


/* ================================================================
   2. GLOBAL STATE
================================================================ */
let currentDate = new Date();
const today = new Date();


/* ================================================================
   3. KALENDER INITIALISIEREN
   - Lädt Trainingstage und rendert Kalender
================================================================ */
export async function initCalendar() {
    console.log("Kalender wird initialisiert...");

    /* ================= TRAININGSTAGE LADEN ================= */
    if (currentUser) {
        try {
            const loadedTrainingDays = await fetchTrainingDays(currentUser.uid);

            Object.keys(trainingDays).forEach(key => delete trainingDays[key]);
            Object.assign(trainingDays, loadedTrainingDays);

            console.log("Trainingsdaten geladen:", trainingDays);
        } catch (e) {
            console.error("Fehler beim Laden der Trainingstage:", e);
        }
    }

    /* ================= NAVIGATION BUTTONS ================= */
    const prevBtn = document.getElementById("prevMonth");
    const nextBtn = document.getElementById("nextMonth");

    if (prevBtn && nextBtn) {
        prevBtn.onclick = () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        };

        nextBtn.onclick = () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        };
    }

    renderCalendar();
}


/* ================================================================
   4. DATUMS-ID ERSTELLEN
   - Format: YYYY-MM-DD
================================================================ */
function getDateId(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}


/* ================================================================
   5. KALENDER RENDERN
================================================================ */
export function renderCalendar() {
    const tbody = document.querySelector("#calendar-table tbody");
    const monthYearDisplay = document.getElementById("month-year");
    
    if (!tbody || !monthYearDisplay) return;

    tbody.innerHTML = "";

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = [
        "Januar", "Februar", "März", "April", "Mai", "Juni",
        "Juli", "August", "September", "Oktober", "November", "Dezember"
    ];

    monthYearDisplay.textContent = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1);
    let startWeekday = firstDay.getDay();

    if (startWeekday === 0) startWeekday = 7;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let row = document.createElement("tr");

    for (let i = 1; i < startWeekday; i++) {
        row.appendChild(document.createElement("td"));
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const td = document.createElement("td");
        td.textContent = day;

        const id = getDateId(year, month, day);

        td.addEventListener("click", () => {
            console.log("Tag angeklickt:", id);
            openTrainingProcess(year, month, day);
        });

        if (
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
        ) {
            td.classList.add("today");
        }

        if (trainingDays[id]) {
            td.classList.add("trained");
        }

        row.appendChild(td);

        if ((startWeekday - 1 + day) % 7 === 0) {
            tbody.appendChild(row);
            row = document.createElement("tr");
        }
    }

    if (row.children.length > 0) {
        tbody.appendChild(row);
    }
}


/* ================================================================
   6. MODAL FÜR TAG ÖFFNEN
================================================================ */
function openTrainingProcess(year, month, day) {
    setSelectedDate(year, month, day);
    
    const modal = document.getElementById("selection-modal");
    const dateDisplay = document.getElementById("modal-date-display");

    if (modal) {
        if (dateDisplay) {
            dateDisplay.textContent = `Tag: ${day}.${month + 1}.${year}`;
        }

        modal.style.display = "flex";
        
        const dateId = getDateId(year, month, day);
        const viewDataBtn = document.getElementById("btn-view-data");

        if (viewDataBtn) {
            viewDataBtn.style.display = trainingDays[dateId] ? "block" : "none";
        }
    } else {
        console.error("Modal 'selection-modal' wurde im HTML nicht gefunden!");
    }
}