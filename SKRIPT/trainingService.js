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