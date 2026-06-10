/* ================================================================
   1. IMPORTS
   - Firebase Datenbankzugriff
================================================================ */
import { db } from "./firebase.js";

import {
    doc,
    getDoc,
    setDoc,
    getDocs,
    collection,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";


/* ================================================================
   2. TRAININGSTAGE LADEN
   - Holt alle gespeicherten Trainingstage eines Users
================================================================ */
export async function fetchTrainingDays(userId) {

    const loadedTrainingDays = {};

    const querySnapshot = await getDocs(
        collection(db, "users", userId, "trainings")
    );

    querySnapshot.forEach((docItem) => {
        loadedTrainingDays[docItem.id] = true;
    });

    return loadedTrainingDays;
}


/* ================================================================
   3. ÜBUNGEN FÜR EIN DATUM LADEN
================================================================ */
export async function fetchExercises(userId, dateId) {

    const ref = doc(db, "users", userId, "trainings", dateId);
    const snap = await getDoc(ref);

    if (snap.exists()) {
        return snap.data().exercises || [];
    }

    return [];
}


/* ================================================================
   4. ÜBUNGEN SPEICHERN / LÖSCHEN
================================================================ */
export async function saveExercisesToDB(userId, dateId, data) {

    const ref = doc(db, "users", userId, "trainings", dateId);

    if (data.length > 0) {
        await setDoc(ref, { exercises: data });
    } else {
        await deleteDoc(ref);
    }
}
/* ================================================================
    5. Übungen merken
    - Speichert die zuletzt bearbeiteten Übungen für schnellen Zugriff
================================================================ */
export async function fetchUsedExercises(userId) {
    const usedExercises = new Set();

    const trainingSnapshot = await getDocs(
        collection(db, "users", userId, "trainings")
    );

    trainingSnapshot.forEach(docItem => {
        const data = docItem.data();
        const exercises = data.exercises || [];

        exercises.forEach(item => {
            if (item.exercise) {
                usedExercises.add(item.exercise);
            }
        });
    });

    const templateSnapshot = await getDocs(
        collection(db, "users", userId, "templates")
    );

    templateSnapshot.forEach(docItem => {
        const data = docItem.data();
        const exercises = data.exercises || [];

        exercises.forEach(exercise => {
            if (typeof exercise === "string") {
                usedExercises.add(exercise);
            }

            if (exercise.exercise) {
                usedExercises.add(exercise.exercise);
            }
        });
    });

    return Array.from(usedExercises).sort();
}