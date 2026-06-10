/* ================================================================
   1. IMPORTS
   - Trainingsdaten laden / löschen
================================================================ */
import {
    loadExercises,
    selectedDateId,
    deleteExercisesForSelectedDate
} from "./training.js";
import { normalizeExerciseName, formatExerciseName } from "./exerciseUtils.js";


/* ================================================================
   2. HISTORY UI INITIALISIERUNG
   - Button "Daten ansehen" im Modal
================================================================ */
export function initHistoryUI() {
    const viewDataBtn = document.getElementById("btn-view-data");

    viewDataBtn?.addEventListener("click", async () => {
        await window.showHistoryDetails();
    });
}


/* ================================================================
   3. HISTORY DETAILS ANZEIGEN
   - Bleibt im Kalender und zeigt gespeicherte Daten unten an
================================================================ */
window.showHistoryDetails = async function() {
    const historyArea = document.getElementById("history-detail-area");
    const historyContent = document.getElementById("history-content");
    const historyDateDisplay = document.getElementById("history-date");

    if (!historyArea || !historyContent || !historyDateDisplay) return;

    const data = await loadExercises();
    console.log("Geladene Trainingsdaten:", data);

    historyDateDisplay.textContent = selectedDateId || "--";

    if (!Array.isArray(data) || data.length === 0) {
        historyContent.innerHTML = "<p>Keine Daten für diesen Tag gefunden.</p>";
        historyArea.style.display = "block";
        historyArea.scrollIntoView({ behavior: "smooth" });

        if (typeof window.closeModal === "function") {
            window.closeModal();
        }
        return;
    }

   const grouped = {};

// Daten nach Übung gruppieren
data.forEach(item => {
    const displayName = formatExerciseName(item.exercise || "Unbekannt");
    const key = normalizeExerciseName(displayName);
    if (!grouped[key]) {
        grouped[key] = {
            name: displayName,
            sets: []
        };
    }
    grouped[key].sets.push(item);
});

let html = "";
const durationText = data[0]?.durationText || "";
if (durationText) {
    html += `<p><strong>Trainingsdauer:</strong> ${durationText}</p>`;
}

// Cards bauen
Object.values(grouped).forEach(group => {
    html += `
        <div class="history-card">
            <h3>${group.name}</h3>
    `;

    group.sets.forEach(set => {
        html += `
            <div class="history-row">
                <span>Satz ${set.set}</span>
                <span>${set.weight} kg</span>
                <span>${set.reps} Wdh</span>
            </div>
        `;
    });

    html += `</div>`;
});

// Delete Button bleibt
html += `
    <div style="margin-top: 20px; text-align: center;">
        <button
            onclick="deleteTrainingDay()"
            class="btn-gym-ghost"
            style="border-color:#e74c3c; color:#e74c3c;"
        >
            Training dieses Tages löschen
        </button>
    </div>
`;

    historyContent.innerHTML = html;

    historyArea.style.display = "block";
    historyArea.scrollIntoView({ behavior: "smooth" });

    if (typeof window.closeModal === "function") {
        window.closeModal();
    }
};


/* ================================================================
   4. TRAINING EINES TAGES LÖSCHEN
================================================================ */
window.deleteTrainingDay = async function() {
    if (!selectedDateId) {
        alert("Kein Datum ausgewählt.");
        return;
    }

    const confirmed = confirm(`Willst du das Training vom ${selectedDateId} wirklich löschen?`);
    if (!confirmed) return;

    try {
        await deleteExercisesForSelectedDate();
        alert("Trainingsdaten gelöscht.");
        location.reload();
    } catch (error) {
        console.error("Fehler beim Löschen der Trainingsdaten:", error);
        alert("Trainingsdaten konnten nicht gelöscht werden.");
    }
};