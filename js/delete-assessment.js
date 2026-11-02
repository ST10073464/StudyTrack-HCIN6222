"use strict";

/* =========================================================
   StudyTrack
   Delete Assessment
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const confirmation =
        document.getElementById(
            "deleteConfirmation"
        );

    const notFound =
        document.getElementById(
            "assessmentNotFound"
        );

    const titleElement =
        document.getElementById(
            "assessmentTitle"
        );

    const moduleElement =
        document.getElementById(
            "assessmentModule"
        );

    const dueDateElement =
        document.getElementById(
            "assessmentDueDate"
        );

    const statusElement =
        document.getElementById(
            "assessmentStatus"
        );

    const cancelLink =
        document.getElementById(
            "cancelDelete"
        );

    const confirmButton =
        document.getElementById(
            "confirmDelete"
        );


    /* -----------------------------------------------------
       Read assessment ID
       ----------------------------------------------------- */

    const parameters =
        new URLSearchParams(
            window.location.search
        );

    const assessmentId =
        parameters.get("id");

    let currentAssessment = null;


    /* -----------------------------------------------------
       Date helper
       ----------------------------------------------------- */

    function formatDate(dateString) {
        const date =
            new Date(
                `${dateString}T00:00:00`
            );

        return new Intl.DateTimeFormat(
            "en-ZA",
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        ).format(date);
    }


    /* -----------------------------------------------------
       Assessment not found
       ----------------------------------------------------- */

    function showNotFound() {
        confirmation.hidden = true;
        notFound.hidden = false;
    }


    /* -----------------------------------------------------
       Load assessment
       ----------------------------------------------------- */

    function loadAssessment() {
        if (!assessmentId) {
            showNotFound();
            return;
        }

        currentAssessment =
            StudyTrackStorage.getAssessmentById(
                assessmentId
            );

        if (!currentAssessment) {
            showNotFound();
            return;
        }

        titleElement.textContent =
            currentAssessment.title;

        moduleElement.textContent =
            currentAssessment.module;

        dueDateElement.textContent =
            formatDate(
                currentAssessment.dueDate
            );

        statusElement.textContent =
            currentAssessment.status;

        cancelLink.href =
            `view-assessment.html?id=${encodeURIComponent(
                currentAssessment.id
            )}`;

        notFound.hidden = true;
        confirmation.hidden = false;

        confirmButton.focus();
    }


    /* -----------------------------------------------------
       Confirm deletion
       ----------------------------------------------------- */

    confirmButton.addEventListener(
        "click",
        () => {
            if (!currentAssessment) {
                return;
            }

            const deleted =
                StudyTrackStorage.deleteAssessment(
                    currentAssessment.id
                );

            if (!deleted) {
                showNotFound();
                return;
            }

            sessionStorage.setItem(
                "studytrack_message",
                "Assessment deleted successfully."
            );

            window.location.href =
                "assessments.html";
        }
    );


    loadAssessment();
});