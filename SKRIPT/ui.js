/* ================================================================
   1. UI MODULE
   - Bündelt alle UI-Teilbereiche der App
================================================================ */
import { initNavigation } from "./navigation.js";
import { initModalUI } from "./modal.js";
import { initHistoryUI } from "./history.js";


/* ================================================================
   2. UI INITIALISIERUNG
   - Startet alle UI-bezogenen Module
================================================================ */
export function initUI() {
    initNavigation();
    initModalUI();
    initHistoryUI();
}