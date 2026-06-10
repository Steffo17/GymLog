/* ================================================================
   1. NAVIGATION INITIALISIERUNG
   - Sidebar, Mobile Menu und View-Wechsel
================================================================ */
export function initNavigation() {
    document.querySelectorAll(".bottom-nav-item").forEach(item => {
        item.addEventListener("click", () => {
            const viewId = item.getAttribute("data-view");
            showView(viewId);

            document.querySelectorAll(".bottom-nav-item").forEach(nav => {
                nav.classList.remove("active");
            });

            item.classList.add("active");
        });
    });
}


/* ================================================================
   2. VIEW MANAGEMENT
   - Wechselt zwischen den Hauptansichten
================================================================ */
export function showView(viewId) {
    document.querySelectorAll(".view").forEach(v => {
        v.style.display = "none";
    });

    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.style.display = "block";
    }

    if (viewId === "plans-view" && typeof window.loadTemplateListForPlansView === "function") {
        window.loadTemplateListForPlansView();
    }
}

/* ================================================================
   3. GLOBALE VERFÜGBARKEIT
   - Für bestehende Aufrufe im Projekt
================================================================ */
window.showView = showView;

window.openPlansView = function() {
    showView("plans-view");

    document.querySelectorAll(".bottom-nav-item").forEach(nav => {
        nav.classList.remove("active");
    });

    const plansNav = document.querySelector('.bottom-nav-item[data-view="plans-view"]');
    if (plansNav) {
        plansNav.classList.add("active");
    }
};