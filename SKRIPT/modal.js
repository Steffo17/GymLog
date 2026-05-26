/* ================================================================
   1. IMPORTS
   - Hauptansicht wechseln + ausgewähltes Datum nutzen
================================================================ */
import { showView } from "./navigation.js";
import { selectedDateId } from "./training.js";


/* ================================================================
   2. MODAL UI INITIALISIERUNG
   - Steuert die Buttons im Tages-Modal
================================================================ */
export function initModalUI() {
    const startTrainingBtn = document.getElementById("btn-start-training");

    startTrainingBtn?.addEventListener("click", () => {
        window.closeModal();

        showView("live-view");

        if (typeof window.showGymView === "function") {
            window.showGymView("view-main");
        }
    });
}

/* ================================================================
   3. MODAL SCHLIESSEN
================================================================ */
window.closeModal = function() {
    const modal = document.getElementById("selection-modal");

    if (modal) {
        modal.style.display = "none";
    }
};