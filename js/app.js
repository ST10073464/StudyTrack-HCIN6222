"use strict";

/* =========================================================
   StudyTrack
   Shared application behaviour
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const menuToggle =
        document.getElementById("menuToggle");

    const sidebar =
        document.querySelector(".sidebar");

    if (!menuToggle || !sidebar) {
        return;
    }

    menuToggle.addEventListener("click", () => {
        const isOpen =
            sidebar.classList.toggle("open");

        menuToggle.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

        menuToggle.setAttribute(
            "aria-label",
            isOpen
                ? "Close navigation menu"
                : "Open navigation menu"
        );

        menuToggle.textContent =
            isOpen
                ? "✕ Close"
                : "☰ Menu";
    });


    /* Close mobile navigation with Escape */

    document.addEventListener(
        "keydown",
        (event) => {
            if (
                event.key === "Escape" &&
                sidebar.classList.contains("open")
            ) {
                sidebar.classList.remove("open");

                menuToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );

                menuToggle.setAttribute(
                    "aria-label",
                    "Open navigation menu"
                );

                menuToggle.textContent =
                    "☰ Menu";

                menuToggle.focus();
            }
        }
    );
});