export function normalizeExerciseName(name) {
    return String(name || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/ä/g, "ae")
        .replace(/ö/g, "oe")
        .replace(/ü/g, "ue")
        .replace(/ß/g, "ss")
        .replace(/[^a-z0-9]/g, "");
}
export function formatExerciseName(name) {
    return String(name || "")
        .trim()
        .replace(/\s+/g, " ")
        .replace(/[-_]+/g, " ")
        .split(" ")
        .filter(Boolean)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
}