/* ================================================================
   1. MODULE IMPORTS
   - Startet alle Kernbereiche der App
================================================================ */
import "./templates.js";
import { initAuth, initAuthUI } from "./firebase.js";
import { initCalendar } from "./calendar.js";
import { initUI } from "./ui.js";
import { initLiveSession } from "./LiveSession.js";
import { initExerciseSuggestions } from "./templates.js";


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

   const showLoginBtn = document.getElementById("show-login-btn");
   const loginModal = document.getElementById("login-modal");

   if (showLoginBtn && loginModal) {
      showLoginBtn.addEventListener("click", () => {
         loginModal.style.display = "flex";
      });

      loginModal.addEventListener("click", (e) => {
         if (e.target === loginModal) {
               loginModal.style.display = "none";
         }
      });
   }

    window.addEventListener("auth-state-ready", () => {
        initCalendar();

           if (typeof window.loadTemplateListForPlansView === "function") {
        window.loadTemplateListForPlansView();
           }
         initExerciseSuggestions();
    });
});