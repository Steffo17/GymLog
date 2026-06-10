/* ================================================================
   1. IMPORTS
   - User State + Service Layer
================================================================ */
import { currentUser } from "./firebase.js";
import { fetchExercises, saveExercisesToDB, fetchUsedExercises } from "./trainingService.js";
import { normalizeExerciseName } from "./exerciseUtils.js";

/* ================================================================
   2. GLOBAL STATE
================================================================ */
export let selectedDateId = null;
export let trainingDays = {};


/* ================================================================
   3. AUSGEWÄHLTES DATUM SETZEN
================================================================ */
export function setSelectedDate(year, month, day) {
    selectedDateId = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/* ================================================================
   4. ÜBUNGEN LADEN
   - Holt Daten über den Service
================================================================ */
export async function loadExercises() {
    if (!currentUser || !selectedDateId) return [];

    const data = await fetchExercises(currentUser.uid, selectedDateId);

    return data.map(item => ({
        workout: item.workout ?? "",
        exercise: item.exercise ?? item.name ?? "",
        weight: item.weight ?? "",
        set: item.set ?? item.sets ?? "",
        reps: item.reps ?? "",
        durationMS: item.durationMs ?? 0,
        durationText: item.durationText ?? ""
    }));
}


/* ================================================================
   5. ÜBUNGEN SPEICHERN
   - Speichert Daten über den Service
================================================================ */
export async function saveExercises(data) {
    if (!currentUser || !selectedDateId) return;

    await saveExercisesToDB(currentUser.uid, selectedDateId, data);

    if (data.length > 0) {
        trainingDays[selectedDateId] = true;
    } else {
        delete trainingDays[selectedDateId];
    }
}


/* ================================================================
   6. TRAINING FÜR AUSGEWÄHLTEN TAG LÖSCHEN
================================================================ */
export async function deleteExercisesForSelectedDate() {
    if (!currentUser || !selectedDateId) return;

    await saveExercisesToDB(currentUser.uid, selectedDateId, []);

    delete trainingDays[selectedDateId];
}
/* ================================================================
  7. LETZTE ÜBUNGSDATEN FINDEN
================================================================ */
export async function getLastExerciseData(exerciseName) {

    if (!currentUser) return null;

    const allDates = Object.keys(trainingDays);

    // Neueste zuerst
    allDates.sort().reverse();

    for (const dateId of allDates) {

        const exercises = await fetchExercises(currentUser.uid, dateId);

        const searchKey = normalizeExerciseName(exerciseName);
        const matching = exercises.filter(item =>
            normalizeExerciseName(item.exercise) === searchKey
        );

        if (matching.length > 0) {

            // letzten Satz nehmen
            return matching[matching.length - 1];
        }
    }

    return null;
}
/* ================================================================
   8. Übungen vorschlagen
   - Basierend auf bisherigen Einträgen
================================================================ */
export async function loadUsedExercises() {
    if (!currentUser) return [];
    return await fetchUsedExercises(currentUser.uid);
}