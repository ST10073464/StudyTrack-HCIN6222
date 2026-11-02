"use strict";

/* =========================================================
   StudyTrack
   View Assessment
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const loading =
        document.getElementById("assessmentLoading");

    const notFound =
        document.getElementById("assessmentNotFound");

    const details =
        document.getElementById("assessmentDetails");

    const moduleElement =
        document.getElementById("detailModule");

    const titleElement =
        document.getElementById("detailTitle");

    const statusBadge =
        document.getElementById("detailStatus");

    const typeElement =
        document.getElementById("detailType");

    const dueDateElement =
        document.getElementById("detailDueDate");

    const expectedMarkElement =
        document.getElementById(
            "detailExpectedMark"
        );

    const statusTextElement =
        document.getElementById(
            "detailStatusText"
        );

    const notesElement =
        document.getElementById("detailNotes");

    const editLink =
        document.getElementById(
            "editAssessmentLink"
        );

    const shareButton =
        document.getElementById(
            "shareAssessment"
        );

    const shareFeedback =
        document.getElementById(
            "shareFeedback"
        );


    /* -----------------------------------------------------
       Read assessment ID from URL
       ----------------------------------------------------- */

    const parameters =
        new URLSearchParams(
            window.location.search
        );

    const assessmentId =
        parameters.get("id");


    /* -----------------------------------------------------
       Helpers
       ----------------------------------------------------- */

    function parseDate(dateString) {
        return new Date(`${dateString}T00:00:00`);
    }


    function formatDate(dateString) {
        return new Intl.DateTimeFormat(
            "en-ZA",
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        ).format(parseDate(dateString));
    }


    function getStatusClass(status) {
        return status
            .toLowerCase()
            .replace(/\s+/g, "-");
    }


    /* -----------------------------------------------------
       Load assessment
       ----------------------------------------------------- */

    function loadAssessment() {
        if (!assessmentId) {
            showNotFound();
            return;
        }

        const assessment =
            StudyTrackStorage.getAssessmentById(
                assessmentId
            );

        if (!assessment) {
            showNotFound();
            return;
        }

        moduleElement.textContent =
            assessment.module;

        titleElement.textContent =
            assessment.title;

        statusBadge.textContent =
            assessment.status;

        statusBadge.className =
            `status-badge ${getStatusClass(
                assessment.status
            )}`;

        typeElement.textContent =
            assessment.type;

        dueDateElement.textContent =
            formatDate(assessment.dueDate);

        expectedMarkElement.textContent =
            assessment.expectedMark === null ||
            assessment.expectedMark === undefined
                ? "Not specified"
                : `${assessment.expectedMark}%`;

        statusTextElement.textContent =
            assessment.status;

        notesElement.textContent =
            assessment.notes ||
            "No notes have been added.";

        editLink.href =
            `edit-assessment.html?id=${encodeURIComponent(
                assessment.id
            )}`;

        loading.hidden = true;
        notFound.hidden = true;
        details.hidden = false;
    }


    function showNotFound() {
        loading.hidden = true;
        details.hidden = true;
        notFound.hidden = false;
    }

    /* -----------------------------------------------------
   Share Assessment
   ----------------------------------------------------- */

function buildShareText() {
    if (!assessmentId) {
        return "";
    }

    const assessment =
        StudyTrackStorage.getAssessmentById(
            assessmentId
        );

    if (!assessment) {
        return "";
    }

    return [
        "StudyTrack Assessment",
        "",
        `${assessment.module} - ${assessment.title}`,
        `Due: ${formatDate(assessment.dueDate)}`,
        `Status: ${assessment.status}`
    ].join("\n");
}


function showShareFeedback(message) {
    shareFeedback.textContent = message;
    shareFeedback.hidden = false;

    window.setTimeout(() => {
        shareFeedback.hidden = true;
    }, 10000);
}


async function shareAssessment() {
    const shareText =
        buildShareText();

    if (!shareText) {
        showShareFeedback(
            "Assessment details could not be shared."
        );

        return;
    }

    /*
     * Use the device's native share interface
     * when available.
     */
    if (navigator.share) {
        try {
            await navigator.share({
                title: "StudyTrack Assessment",
                text: shareText
            });

            showShareFeedback(
                "Assessment shared successfully."
            );

            return;
        } catch (error) {
            if (error.name === "AbortError") {
                return;
            }
        }
    }


    /*
     * Desktop fallback:
     * copy assessment details to clipboard.
     */
    try {
        await navigator.clipboard.writeText(
            shareText
        );

        showShareFeedback(
            "Assessment details copied to clipboard."
        );
    } catch {
        showShareFeedback(
            "Sharing is not available in this browser."
        );
    }
}


shareButton.addEventListener(
    "click",
    shareAssessment
);


    loadAssessment();
});