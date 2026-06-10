import { db, currentUser } from "./firebase.js";
import { loadUsedExercises } from "./training.js";
import { normalizeExerciseName, formatExerciseName } from "./exerciseUtils.js";
import {
    doc,
    deleteDoc,
    setDoc,
    getDoc,
    getDocs,
    collection
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

let currentTemplateExercises = [];
let currentWorkoutName = "";

/* ================================================================
   1. WORKOUT BESTÄTIGEN
================================================================ */
window.confirmWorkoutName = function() {
    const input = document.getElementById("plan-name-input");

    if (!input || !input.value.trim()) {
        alert("Bitte gib einen Workout-Namen ein.");
        return;
    }

    currentWorkoutName = input.value.trim();

    // UI wechseln
    document.getElementById("plan-setup").classList.add("hidden");
    document.getElementById("template-editor").classList.remove("hidden");

    document.getElementById("current-workout-title").innerText =
        "Du bist jetzt im Workout: " + currentWorkoutName;
};


/* ================================================================
   2. ÜBUNG HINZUFÜGEN
================================================================ */
window.addExerciseToTemplateList = function() {
    const input = document.getElementById("new-template-exercise");
    if (!input || !input.value.trim()) return;

    const newExercise = formatExerciseName(input.value);
    const newExerciseNormalized = normalizeExerciseName(newExercise);

    const exists = currentTemplateExercises.some(ex =>
        normalizeExerciseName(ex) === newExerciseNormalized
    );

    if (exists) {
        alert("Diese Übung ist in diesem Workout bereits vorhanden.");
        input.value = "";
        return;
    }

    currentTemplateExercises.push(newExercise);
    input.value = "";

    renderTemplateList();
};

/* ================================================================
   3. LISTE RENDERN
================================================================ */
function renderTemplateList() {
    const list = document.getElementById("template-list");
    if (!list) return;

    list.innerHTML = "";

    currentTemplateExercises.forEach((ex, i) => {
        const li = document.createElement("li");

        li.innerHTML = `
            ${ex}
            <span style="color:red; cursor:pointer;" onclick="removeExercise(${i})">✕</span>
        `;

        list.appendChild(li);
    });
}


/* ================================================================
   4. ÜBUNG ENTFERNEN
================================================================ */
window.removeExercise = function(index) {
    currentTemplateExercises.splice(index, 1);
    renderTemplateList();
};


/* ================================================================
   5. TEMPLATE SPEICHERN
================================================================ */
window.saveTemplateToFirebase = async function() {
    if (!currentWorkoutName) {
        alert("Kein Workout ausgewählt.");
        return;
    }

    if (currentTemplateExercises.length === 0) {
        alert("Bitte mindestens eine Übung hinzufügen.");
        return;
    }

    if (!currentUser) {
        alert("Bitte einloggen.");
        return;
    }

    const ref = doc(db, "users", currentUser.uid, "templates", currentWorkoutName);

    await setDoc(ref, {
        name: currentWorkoutName,
        exercises: currentTemplateExercises
    });
    if (typeof window.loadTemplateListForPlansView === "function") {
    await window.loadTemplateListForPlansView();
}
    

    alert("Workout gespeichert!");
};


/* ================================================================
   6. RESET (NEUES WORKOUT)
================================================================ */
window.resetWorkoutBuilder = function() {
    currentWorkoutName = "";
    currentTemplateExercises = [];

    document.getElementById("plan-name-input").value = "";
    document.getElementById("template-list").innerHTML = "";

    document.getElementById("template-editor").classList.add("hidden");
    document.getElementById("plan-setup").classList.remove("hidden");
};


/* ================================================================
   7. ALLE VORLAGEN LADEN
   - Für die Auswahl beim Training starten
================================================================ */
export async function loadAllTemplates() {
    if (!currentUser) return [];

    const querySnapshot = await getDocs(
        collection(db, "users", currentUser.uid, "templates")
    );

    const templates = [];

    querySnapshot.forEach((docSnap) => {
        templates.push(docSnap.data());
    });

    return templates;
}


/* ================================================================
   8. LIVE SESSION AUS VORLAGE STARTEN
================================================================ */
window.startLiveSessionFromPlan = async function(planName) {
    if (!currentUser) return;

    const ref = doc(db, "users", currentUser.uid, "templates", planName);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
        alert("Vorlage nicht gefunden.");
        return;
    }

    const data = snap.data();

    if (typeof window.openLiveSessionWithTemplate === "function") {
        window.openLiveSessionWithTemplate(data.name, data.exercises || []);
    }
};
/* ================================================================
   9. Workout editieren
================================================================ */
window.editTemplate = async function(templateName) {
    if (!currentUser) return;

    const ref = doc(db, "users", currentUser.uid, "templates", templateName);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
        alert("Template nicht gefunden");
        return;
    }

    const data = snap.data();

    currentWorkoutName = data.name;
    currentTemplateExercises = data.exercises || [];

    // UI wechseln
    document.getElementById("plan-setup").classList.add("hidden");
    document.getElementById("template-editor").classList.remove("hidden");

    document.getElementById("current-workout-title").innerText =
        "Workout bearbeiten: " + currentWorkoutName;

    renderTemplateList();
};




/* ================================================================
   10. Workout löschen
================================================================ */
window.deleteTemplateFromFirebase = async function(templateName) {
    if (!currentUser) {
        alert("Bitte zuerst einloggen.");
        return;
    }

    const confirmed = confirm(`Willst du das Workout "${templateName}" wirklich löschen?`);
    if (!confirmed) return;

    try {
        const ref = doc(db, "users", currentUser.uid, "templates", templateName);
        await deleteDoc(ref);

        alert("Workout gelöscht!");

        // Optional: Liste neu laden
        if (typeof window.loadTemplateListForPlansView === "function") {
            await window.loadTemplateListForPlansView();
        }
    } catch (error) {
        console.error("Fehler beim Löschen des Workouts:", error);
        alert("Workout konnte nicht gelöscht werden.");
    }
};
window.loadTemplateListForPlansView = async function() {
    const container = document.getElementById("saved-template-list");
    if (!container) return;

    if (!currentUser) {
        container.innerHTML = "<p>Bitte zuerst einloggen.</p>";
        return;
    }

    container.innerHTML = "Lade Workouts...";

    try {
        const querySnapshot = await getDocs(
            collection(db, "users", currentUser.uid, "templates")
        );

        const templates = [];
        querySnapshot.forEach(docSnap => {
            templates.push(docSnap.data());
        });

        if (templates.length === 0) {
            container.innerHTML = "<p>Noch keine Workouts gespeichert.</p>";
            return;
        }

        container.innerHTML = "";

        templates.forEach(template => {
            const div = document.createElement("div");
            div.className = "template-item";
            div.style.display = "flex";
            div.style.justifyContent = "space-between";
            div.style.alignItems = "center";

            div.innerHTML = `
    <div>
        <strong>${template.name}</strong><br>
        <small>${template.exercises.length} Übungen</small>
    </div>

    <div style="display:flex; gap:10px;">
        <button onclick="editTemplate('${template.name}')" 
                class="btn-gym-ghost"
                style="width:auto;">
            Bearbeiten
        </button>

        <button onclick="deleteTemplateFromFirebase('${template.name}')" 
                class="btn-gym-ghost"
                style="width:auto; border-color:#e74c3c; color:#e74c3c;">
            Löschen
        </button>
    </div>
`;

            container.appendChild(div);
        });
    } catch (error) {
        console.error("Fehler beim Laden der Workout-Liste:", error);
        container.innerHTML = "<p>Fehler beim Laden der Workouts.</p>";
    }
};

/* ================================================================
   11. ÜBUNGSVORSCHLÄGE
================================================================ */
let usedExerciseSuggestions = [];

    export async function initExerciseSuggestions() {

        const loadedExercises = await loadUsedExercises();
    const uniqueMap = new Map();

    loadedExercises.forEach(ex => {
        const key = normalizeExerciseName(ex);
        if (!uniqueMap.has(key)) {
            uniqueMap.set(key, formatExerciseName(ex));
        }
    });

    usedExerciseSuggestions = Array.from(uniqueMap.values()).sort();

    console.log("Geladene Vorschläge:", usedExerciseSuggestions);

    const input = document.getElementById("new-template-exercise");
    const suggestionBox = document.getElementById("exercise-suggestions");

    if (!input || !suggestionBox) return;

    input.addEventListener("input", () => {

        const value = input.value.toLowerCase().trim();

        suggestionBox.innerHTML = "";

        if (!value) return;

        const matches = usedExerciseSuggestions.filter(exercise =>
            exercise.toLowerCase().includes(value)
        );

        matches.slice(0, 6).forEach(exercise => {

    const div = document.createElement("div");

    div.className = "exercise-suggestion";

    div.style.display = "flex";
    div.style.justifyContent = "space-between";
    div.style.alignItems = "center";

    div.innerHTML = `
        <span>${exercise}</span>

        <button
            type="button"
            style="
                background:none;
                border:none;
                color:#e74c3c;
                cursor:pointer;
                font-size:16px;
            "
        >
            ✕
        </button>
    `;

    // Vorschlag auswählen
    div.querySelector("span").onclick = () => {
        input.value = exercise;
        suggestionBox.innerHTML = "";
    };

    // Vorschlag ausblenden
    div.querySelector("button").onclick = async (e) => {
        e.stopPropagation();

        await hideExerciseSuggestion(
            normalizeExerciseName(exercise)
        );

        div.remove();
    };

    suggestionBox.appendChild(div);
});
    });
    window.hideExerciseSuggestion = async function(exerciseKey) {
    if (!currentUser) return;

    await setDoc(
        doc(db, "users", currentUser.uid, "hiddenExercises", exerciseKey),
        { hidden: true }
    );

    usedExerciseSuggestions = usedExerciseSuggestions.filter(ex =>
        normalizeExerciseName(ex) !== exerciseKey
    );

    document.getElementById("exercise-suggestions").innerHTML = "";
};
}

