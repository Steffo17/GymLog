/* ================================================================
   1. GLOBAL STATE
   - Zustand der aktuellen Live-Session
================================================================ */
import { loadAllTemplates } from "./templates.js";
import { saveExercises, getLastExerciseData } from "./training.js";
import { formatExerciseName } from "./exerciseUtils.js";
let currentExercises = [];
let workoutTitle = "";
let sessionStartTime = null;
let sessionTimerInterval = null;

function startSessionTimer() {
    if (sessionTimerInterval) return;

    sessionStartTime = Date.now();

    const display = document.getElementById("live-timer-display");
    const button = document.getElementById("live-timer-start-btn");

    if (button) button.disabled = true;

    const updateTimer = () => {
        if (display) {
            display.innerText = formatDuration(Date.now() - sessionStartTime);
        }
    };

    updateTimer();

    sessionTimerInterval = setInterval(updateTimer, 1000);
}

function formatDuration(ms) {
    const totalSeconds = Math.floor(ms / 1000);

    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");

    return `${hours}:${minutes}:${seconds}`;
}


/* ================================================================
   2. DUMMY TEMPLATES
   - Platzhalter-Vorlagen für gespeicherte Trainingspläne
================================================================ */
const dummyTemplates = [
    { name: "Brust & Trizeps", exercises: ["Bankdrücken", "Schrägbank", "Butterfly", "Dips"] },
    { name: "Rücken & Bizeps", exercises: ["Klimmzüge", "Rudern", "Latzug", "Hammer Curls"] },
    { name: "Beine", exercises: ["Kniebeugen", "Beinpresse", "Wadenheben"] }
];


/* ================================================================
   3. VIEW MANAGEMENT
   - Steuert die Unteransichten im Live-Tab
================================================================ */
function showGymView(id) {

    const views = [
        "view-main",
        "view-templates",
        "view-training"
    ];

    views.forEach(v => {
        const el = document.getElementById(v);
        if (el) el.classList.add("hidden");
    });

    document.getElementById(id).classList.remove("hidden");
}


/* ================================================================
   4. TEMPLATES LADEN
   - Zeigt alle verfügbaren Workout-Vorlagen an
================================================================ */
async function loadSavedTemplates() {
    const container = document.getElementById("template-list-container");
    if (!container) return;

    container.innerHTML = "Lade Vorlagen...";

    const templates = await loadAllTemplates();

    container.innerHTML = "";

    if (templates.length === 0) {
        container.innerHTML = "<p>Keine gespeicherten Vorlagen gefunden.</p>";
        showGymView("view-templates");
        return;
    }

    templates.forEach(plan => {
        const div = document.createElement("div");
        div.className = "template-item";

        div.innerHTML = `
            <span>${plan.name}</span>
            <small>${plan.exercises.length} Übungen</small>
        `;

        div.onclick = () => {
            workoutTitle = plan.name;
            currentExercises = [...plan.exercises];
            startTraining();
        };

        container.appendChild(div);
    });

    showGymView("view-templates");
}


/* ================================================================
   5. WORKOUT SETUP
   - Liest den Namen ein und öffnet die Planungsansicht
================================================================ */
function goToPlanning() {

    workoutTitle = document.getElementById("workout-name").value;

    if (!workoutTitle) return alert("Name fehlt!");

    document.getElementById("display-workout-name").innerText = workoutTitle;

    showGymView("view-planning");
}


/* ================================================================
   6. ÜBUNG HINZUFÜGEN
   - Fügt eine Übung zur aktuellen Planung hinzu
================================================================ */
function addExerciseToPlan() {

    const input = document.getElementById("exercise-input");

    if (!input.value) return;

    currentExercises.push(input.value);

    renderPlanningList();

    input.value = "";

    document.getElementById("start-btn").style.display = "block";
}


/* ================================================================
   7. PLANUNGSLISTE RENDERN
================================================================ */
function renderPlanningList() {

    const list = document.getElementById("planned-exercises");
    if (!list) return;

    list.innerHTML = currentExercises.map((ex, i) => `
        <li style="background:#161625; padding:10px; margin-bottom:5px; border-radius:5px; display:flex; justify-content:space-between;">
            ${ex}
            <span style="color:#e74c3c; cursor:pointer" onclick="removeEx(${i})">✕</span>
        </li>
    `).join("");
}


/* ================================================================
   8. ÜBUNG ENTFERNEN
================================================================ */
function removeEx(i) {

    currentExercises.splice(i, 1);

    renderPlanningList();

    if (currentExercises.length === 0) {
        document.getElementById("start-btn").style.display = "none";
    }
}


/* ================================================================
   9. TRAINING STARTEN
   - Baut die Live-Trainingsansicht dynamisch auf
================================================================ */
async function createExerciseBlock(exerciseName, exIndex) {
    const block = document.createElement("div");
    block.className = "exercise-block";

    const setsHTML = await renderSetsHTML(3, exerciseName);

    block.innerHTML = `
        <h3>${exerciseName}</h3>

        <div style="text-align:right">
            Sätze:
            <button class="set-adjust-btn" onclick="adjustSets(${exIndex}, -1)">-</button>

            <strong id="count-${exIndex}">3</strong>

            <button class="set-adjust-btn" onclick="adjustSets(${exIndex}, 1)">+</button>
        </div>

        <div
            id="sets-container-${exIndex}"
            data-exercise="${exerciseName}"
        >
            ${setsHTML}
        </div>
    `;

    return block;
}

async function startTraining() {
    

    const container = document.getElementById("training-container");
    if (!container) return;

    document.getElementById("training-title").innerText = workoutTitle;

    container.innerHTML = `
        <div class="live-timer-box">
            <button id="live-timer-start-btn" onclick="startSessionTimer()">
                Training starten
            </button>
            <p>Vergangene Zeit: <strong id="live-timer-display">00:00:00</strong></p>
        </div>`;


    for (const [exIndex, ex] of currentExercises.entries()) {

    const block = await createExerciseBlock(ex, exIndex);
    container.appendChild(block);

    showGymView("view-training");}
}


/* ================================================================
   10. SATZ-HTML ERZEUGEN
================================================================ */
async function renderSetsHTML(count, exerciseName, existingData = []) {

    let html = "";

    const lastData = await getLastExerciseData(exerciseName);

    for (let i = 1; i <= count; i++) {

        const existing = existingData[i - 1] || {};

        const weight =
            existing.weight ??
            lastData?.weight ??
            "";

        const reps =
            existing.reps ??
            lastData?.reps ??
            "";

        const isDone =
            existing.done ? "is-done" : "";

        html += `
            <div class="set-row" data-set="${i}">

                <span class="set-label">
                    S${i}
                </span>

                <input
                    type="number"
                    class="weight-input"
                    placeholder="KG"
                    value="${weight}"
                >

                <input
                    type="number"
                    class="reps-input"
                    placeholder="WDH"
                    value="${reps}"
                >

                <button
                    class="done-btn ${isDone}"
                    onclick="this.classList.toggle('is-done')"
                >
                    ✓
                </button>

            </div>
        `;
    }

    return html;
}


/* ================================================================
   11. SATZANZAHL ANPASSEN
================================================================ */
async function adjustSets(idx, delta) {

    const counter = document.getElementById(`count-${idx}`);
    const container = document.getElementById(`sets-container-${idx}`);

    if (!counter || !container) return;

    const currentRows = container.querySelectorAll(".set-row");

    const existingData = Array.from(currentRows).map(row => {

        const weightInput = row.querySelector(".weight-input");
        const repsInput = row.querySelector(".reps-input");
        const doneButton = row.querySelector(".done-btn");

        return {
            set: Number(row.dataset.set) || 0,
            weight: weightInput ? Number(weightInput.value) || 0 : 0,
            reps: repsInput ? Number(repsInput.value) || 0 : 0,
            done: doneButton
                ? doneButton.classList.contains("is-done")
                : false
        };
    });

    let newCount = Math.max(
        1,
        parseInt(counter.innerText) + delta
    );

    counter.innerText = newCount;

    const exerciseName = container.dataset.exercise;

    container.innerHTML = await renderSetsHTML(
        newCount,
        exerciseName,
        existingData
    );
}

/* ================================================================
   12. Live-Übung hinzufügen
   - Setzt die Live-Session zurück
================================================================ */
async function addExerciseLive() {

    const input = document.getElementById("live-exercise-input");
    const container = document.getElementById("training-container");

    if (!input || !container) return;

    const exerciseName = input.value.trim();

    if (!exerciseName) {
        alert("Übungsname darf nicht leer sein!");
        return;
    }

    const exIndex = document.querySelectorAll(".exercise-block").length;

    const block = await createExerciseBlock(exerciseName, exIndex);
    container.appendChild(block);

    currentExercises.push(exerciseName);

    input.value = "";
}
/* ================================================================
   13. SESSION BEENDEN
   - Setzt die Live-Session zurück
================================================================ */
async function finishSession() {
    const allExerciseContainers = document.querySelectorAll("[id^='sets-container-']");
    const sessionData = [];
    const durationMs = sessionStartTime ? Date.now() - sessionStartTime : 0;
    const durationText = formatDuration(durationMs);

    allExerciseContainers.forEach(container => {
        const exerciseName = container.dataset.exercise;
        const setRows = container.querySelectorAll(".set-row");

        setRows.forEach(row => {
            const weightInput = row.querySelector(".weight-input");
            const repsInput = row.querySelector(".reps-input");
            const doneButton = row.querySelector(".done-btn");

            // Nur abhaken = speichern
            if (!doneButton || !doneButton.classList.contains("is-done")) {
                return;
            }

            sessionData.push({
                workout: workoutTitle,
                exercise: formatExerciseName(exerciseName),
                weight: weightInput ? Number(weightInput.value) || 0 : 0,
                set: Number(row.dataset.set) || 0,
                reps: repsInput ? Number(repsInput.value) || 0 : 0,
                durationMs,
                durationText
            });
        });
    });

    if (sessionData.length === 0) {
        alert("Keine abgehakten Sätze zum Speichern vorhanden.");
        return;
    }

    try {
        await saveExercises(sessionData);
        alert("Training erfolgreich gespeichert!");

        currentExercises = [];
        workoutTitle = "";
        clearInterval(sessionTimerInterval);
        sessionTimerInterval = null;
        sessionStartTime = null;
        showGymView("view-main");

        location.reload();
    } catch (error) {
        console.error("Fehler beim Speichern der Session:", error);
        alert("Fehler beim Speichern.");
    }
}
function confirmCancelSession() {
    const modal = document.getElementById("cancel-modal");
    if (modal) modal.style.display = "flex";
}

function closeCancelModal() {
    const modal = document.getElementById("cancel-modal");
    if (modal) modal.style.display = "none";
}

function cancelSession() {
    // Session zurücksetzen
    currentExercises = [];
    workoutTitle = "";
    clearInterval(sessionTimerInterval);
    sessionTimerInterval = null;
    sessionStartTime = null;

    // UI zurücksetzen
    showGymView("view-main");

    // Modal schließen
    closeCancelModal();
}
/* ================================================================
   14. INITIALISIERUNG
   - Macht Funktionen für HTML onclick global verfügbar
================================================================ */
export function initLiveSession() {
    window.showGymView = showGymView;
    window.loadSavedTemplates = loadSavedTemplates;
    window.goToPlanning = goToPlanning;
    window.addExerciseToPlan = addExerciseToPlan;
    window.removeEx = removeEx;
    window.startTraining = startTraining;
    window.adjustSets = adjustSets;
    window.finishSession = finishSession;
    window.openLiveSessionWithTemplate = openLiveSessionWithTemplate;
    window.addExerciseLive = addExerciseLive;
    window.confirmCancelSession = confirmCancelSession;
    window.closeCancelModal = closeCancelModal;
    window.cancelSession = cancelSession;
    window.startSessionTimer = startSessionTimer;
}


/* ================================================================
   15. LEGACY SUBVIEW HANDLING
   - Vorhandene alte Struktur beibehalten
================================================================ */
window.showGymSubView = function(id) {
    const subViews = [
        "gym-view-main",
        "gym-view-templates",
        "gym-view-setup",
        "gym-view-planning",
        "gym-view-training"
    ];

    subViews.forEach(v => {
        const el = document.getElementById(v);
        if (el) el.classList.add("hidden");
    });

    document.getElementById(id).classList.remove("hidden");
};
function openLiveSessionWithTemplate(name, exercises) {
    workoutTitle = name;
    currentExercises = [...exercises];

    if (typeof window.showView === "function") {
        window.showView("live-view");
    }

    startTraining();
}