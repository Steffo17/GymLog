/* ================================================================
   1. MODULE IMPORTS
   - Startet alle Kernbereiche der App
================================================================ */
import "./templates.js";
import { initAuth, initAuthUI } from "./firebase.js";
import { initCalendar } from "./calendar.js";
import { initUI } from "./ui.js";
import { initLiveSession } from "./LiveSession.js";


/* ================================================================
   2. APP INITIALISIERUNG
   - Wird nach dem Laden des DOM ausgeführt
================================================================ */
document.addEventListener("DOMContentLoaded", () => {
    initAuth();
    initAuthUI();
    initUI();
    initLiveSession();
    initCalendar();

    window.addEventListener("auth-state-ready", () => {
        initCalendar();

           if (typeof window.loadTemplateListForPlansView === "function") {
        window.loadTemplateListForPlansView();
           }
    });
});