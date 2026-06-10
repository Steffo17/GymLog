/* ================================================================
   1. FIREBASE IMPORTS
   - Firebase Core + Auth + Firestore
================================================================ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";


/* ================================================================
   2. INTERNE MODULE
   - Funktionen aus eigener App
================================================================ */
/*import { initCalendar } from "./calendar.js";*/


/* ================================================================
   3. FIREBASE KONFIGURATION
   - Verbindungsdaten zum Projekt
================================================================ */
const firebaseConfig = {
    apiKey: "AIzaSyDXjkzs3dZxGJLm49rPeW_FQeqeRs_kBdQ",
    authDomain: "trainingskalender-651c5.firebaseapp.com",
    projectId: "trainingskalender-651c5",
    storageBucket: "trainingskalender-651c5.appspot.com",
    messagingSenderId: "696403132869",
    appId: "1:696403132869:web:6b2211643f75829fd88bac",
    measurementId: "G-ET40BREQHH"
};


/* ================================================================
   4. FIREBASE INITIALISIERUNG
   - Startet App + Services
================================================================ */
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);


/* ================================================================
   5. GLOBALER USER STATE
   - Speichert aktuell eingeloggten Nutzer
================================================================ */
export let currentUser = null;


/* ================================================================
   6. AUTH STATE LISTENER
   - Reagiert auf Login / Logout automatisch
================================================================ */
export function initAuth() {
    onAuthStateChanged(auth, (user) => {
        currentUser = user;

        if (user) {
            document.getElementById("login-modal").style.display = "none";
            document.getElementById("main-Layout").style.display = "flex";
            document.getElementById("user-email-display").textContent =
                "angemeldet als: " + user.email;

            if (typeof window.loadTemplateListForPlansView === "function") {
                window.loadTemplateListForPlansView();
            }
            if (typeof window.showView === "function") {
                window.showView("home-view");
            }

            } else {
                document.getElementById("login-modal").style.display = "none";
                document.getElementById("main-Layout").style.display = "flex";

                const calendarBody = document.querySelector("#calendar-table tbody");
                if (calendarBody) {
                    calendarBody.innerHTML = "";
                }

                const historyDetailArea = document.getElementById("history-detail-area");
                if (historyDetailArea) {
                    historyDetailArea.style.display = "none";
                }

                const historyContent = document.getElementById("history-content");
                if (historyContent) {
                    historyContent.innerHTML = "";
                }

                const userDisplay = document.getElementById("user-email-display");
                if (userDisplay) {
                    userDisplay.textContent = "Gastmodus";
                }

                if (typeof window.showView === "function") {
                    window.showView("home-view");
                }
            }

        window.dispatchEvent(new CustomEvent("auth-state-ready"));
    });
}


/* ================================================================
   7. AUTH UI HANDLER
   - Verbindet Buttons mit Firebase Aktionen
================================================================ */
export function initAuthUI() {

    /* ================= LOGIN ================= */
    document.getElementById("login-btn")?.addEventListener("click", () => {

        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;

        signInWithEmailAndPassword(auth, email, password)
            .catch(e => alert(e.message));
    });


    /* ================= REGISTRIERUNG ================= */
    document.getElementById("register-btn")?.addEventListener("click", () => {
        const email = document.getElementById("register-email").value.trim();
        const password = document.getElementById("register-password").value;
        const passwordRepeat = document.getElementById("register-password-repeat").value;

        if (!email || !password || !passwordRepeat) {
            alert("Bitte alle Felder ausfüllen.");
            return;
        }

        if (password !== passwordRepeat) {
            alert("Die Passwörter stimmen nicht überein.");
            return;
        }

        createUserWithEmailAndPassword(auth, email, password)
            .then(() => {
                alert("Registrierung erfolgreich!");
            })
            .catch(e => alert(e.message));
    });
    /* ================= LOGIN MIT ENTER-TASTE ================= */
    document.getElementById("login-password")?.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            document.getElementById("login-btn").click();
        }
    });
    /* ================= REGISTRIERUNG MIT ENTER-TASTE ================= */
    document.getElementById("register-password-repeat")?.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            document.getElementById("register-btn").click();
        }
    });
    /* ================= REGISTRIERUNG ANZEIGEN ================= */
    window.showRegisterForm = function () {
        document.getElementById("login-form").classList.add("hidden");
        document.getElementById("register-form").classList.remove("hidden");
    };

    window.showLoginForm = function () {
        document.getElementById("register-form").classList.add("hidden");
        document.getElementById("login-form").classList.remove("hidden");
    };
    /* ================= PASSWORT ZURÜCKSETZEN ================= */
    document.getElementById("forgot-password-btn")?.addEventListener("click", async () => {
        console.log("Passwort zurücksetzen Button geklickt");
        const email = document.getElementById("login-email").value;

        if (!email) {
            alert("Bitte gib zuerst deine E-Mail-Adresse ein.");
            return;
        }
        const confirmed = confirm(
            `Soll wirklich eine Passwort-Reset E-Mail an ${email} gesendet werden?`
        );

        if (!confirmed) return;
        try {
            await sendPasswordResetEmail(auth, email);
            alert("E-Mail zum Zurücksetzen des Passworts wurde gesendet.");
        } catch (e) {
            alert(e.message);
        }
    });

    /* ================= LOGOUT ================= */
    document.getElementById("logout-btn-sidebar")?.addEventListener("click", () => {

        signOut(auth);
    });


    /* ================= GOOGLE LOGIN ================= */
    const provider = new GoogleAuthProvider();

    document.getElementById("google-btn")?.addEventListener("click", async () => {

        await signInWithPopup(auth, provider);
    });
    /* ================= GASTMODUS ================= */
    document.getElementById("guest-mode-btn")?.addEventListener("click", () => {
    document.getElementById("login-container").style.display = "none";
    document.getElementById("main-Layout").style.display = "flex";

    const userDisplay = document.getElementById("user-email-display");
    if (userDisplay) {
        userDisplay.textContent = "Gastmodus";
    }

    if (typeof window.showView === "function") {
        window.showView("home-view");
    }
});
}
