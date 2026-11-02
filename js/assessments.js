"use strict";

/* =========================================================
   StudyTrack
   Assessments Management Page
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const assessmentList =
        document.getElementById("assessmentList");

    const emptyState =
        document.getElementById("emptyState");

    const assessmentSearch =
        document.getElementById("assessmentSearch");

    const moduleFilter =
        document.getElementById("moduleFilter");

    const statusFilter =
        document.getElementById("statusFilter");

    const resultCount =
        document.getElementById("assessmentResultCount");


    /* -----------------------------------------------------
       Date helpers
       ----------------------------------------------------- */

    function parseDate(dateString) {
        return new Date(`${dateString}T00:00:00`);
    }


    function formatDate(dateString) {
        const date = parseDate(dateString);

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
       Status CSS class
       ----------------------------------------------------- */

    function getStatusClass(status) {
        return status
            .toLowerCase()
            .replace(/\s+/g, "-");
    }


    /* -----------------------------------------------------
       HTML escaping
       ----------------------------------------------------- */

    function escapeHtml(value) {
        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }


    /* -----------------------------------------------------
       Populate module filter
       ----------------------------------------------------- */

    function populateModuleFilter(assessments) {
        const modules = [
            ...new Set(
                assessments.map(
                    (assessment) =>
                        assessment.module
                )
            )
        ].sort();

        modules.forEach((module) => {
            const option =
                document.createElement("option");

            option.value = module;
            option.textContent = module;

            moduleFilter.appendChild(option);
        });
    }


    /* -----------------------------------------------------
       Create assessment card
       ----------------------------------------------------- */

    function createAssessmentCard(assessment) {
        const article =
            document.createElement("article");

        article.className = "assessment-card";

        const statusClass =
            getStatusClass(assessment.status);

        const expectedMark =
            assessment.expectedMark === null ||
            assessment.expectedMark === undefined
                ? "Not specified"
                : `${assessment.expectedMark}%`;

        article.innerHTML = `
            <div class="assessment-meta">

                <div class="assessment-topline">

                    <span class="module-code">
                        ${escapeHtml(assessment.module)}
                    </span>

                    <span
                        class="status-badge ${statusClass}"
                    >
                        ${escapeHtml(assessment.status)}
                    </span>

                </div>

                <h3 class="assessment-title">
                    ${escapeHtml(assessment.title)}
                </h3>

                <p class="assessment-due">
                    Due ${escapeHtml(
                        formatDate(assessment.dueDate)
                    )}
                </p>

                <p class="assessment-secondary">
                    ${escapeHtml(assessment.type)}
                    · Expected mark:
                    ${escapeHtml(expectedMark)}
                </p>

            </div>

            <div class="assessment-actions">

                <a
                    class="button button-text"
                    href="view-assessment.html?id=${encodeURIComponent(
                        assessment.id
                    )}"
                >
                    View
                </a>

                <a
                    class="button button-text"
                    href="edit-assessment.html?id=${encodeURIComponent(
                        assessment.id
                    )}"
                >
                    Edit
                </a>

                <button
                    type="button"
                    class="button button-danger delete-action"
                    data-id="${escapeHtml(assessment.id)}"
                >
                    Delete
                </button>

            </div>
        `;

        return article;
    }


    /* -----------------------------------------------------
       Filtering
       ----------------------------------------------------- */

    function getFilteredAssessments() {
        const assessments =
            StudyTrackStorage.getAssessments();

        const searchValue =
            assessmentSearch.value
                .trim()
                .toLowerCase();

        const selectedModule =
            moduleFilter.value;

        const selectedStatus =
            statusFilter.value;

        return assessments.filter(
            (assessment) => {
                const searchableText = `
                    ${assessment.module}
                    ${assessment.title}
                    ${assessment.type}
                    ${assessment.status}
                `.toLowerCase();

                const matchesSearch =
                    searchableText.includes(
                        searchValue
                    );

                const matchesModule =
                    selectedModule === "all" ||
                    assessment.module ===
                        selectedModule;

                const matchesStatus =
                    selectedStatus === "all" ||
                    assessment.status ===
                        selectedStatus;

                return (
                    matchesSearch &&
                    matchesModule &&
                    matchesStatus
                );
            }
        );
    }


    /* -----------------------------------------------------
       Sort assessments
       ----------------------------------------------------- */

    function sortAssessments(assessments) {
        return [...assessments].sort(
            (first, second) => {
                if (
                    first.status === "Completed" &&
                    second.status !== "Completed"
                ) {
                    return 1;
                }

                if (
                    first.status !== "Completed" &&
                    second.status === "Completed"
                ) {
                    return -1;
                }

                return (
                    parseDate(first.dueDate) -
                    parseDate(second.dueDate)
                );
            }
        );
    }


    /* -----------------------------------------------------
       Render assessments
       ----------------------------------------------------- */

    function renderAssessments() {
        const allAssessments =
            StudyTrackStorage.getAssessments();

        const filteredAssessments =
            sortAssessments(
                getFilteredAssessments()
            );

        assessmentList.innerHTML = "";

        filteredAssessments.forEach(
            (assessment) => {
                assessmentList.appendChild(
                    createAssessmentCard(
                        assessment
                    )
                );
            }
        );

        resultCount.textContent =
            `Showing ${filteredAssessments.length} ` +
            `of ${allAssessments.length} assessments`;

        const hasResults =
            filteredAssessments.length > 0;

        assessmentList.hidden =
            !hasResults;

        emptyState.hidden =
            hasResults;

        attachDeleteEvents();
    }


    /* -----------------------------------------------------
       Delete navigation
       ----------------------------------------------------- */

    function attachDeleteEvents() {
        const deleteButtons =
            document.querySelectorAll(
                ".delete-action"
            );

        deleteButtons.forEach((button) => {
            button.addEventListener(
                "click",
                () => {
                    const assessmentId =
                        button.dataset.id;

                    window.location.href =
                        `delete-assessment.html?id=${encodeURIComponent(
                            assessmentId
                        )}`;
                }
            );
        });
    }


    /* -----------------------------------------------------
       Search and filter events
       ----------------------------------------------------- */

    assessmentSearch.addEventListener(
        "input",
        renderAssessments
    );

    moduleFilter.addEventListener(
        "change",
        renderAssessments
    );

    statusFilter.addEventListener(
        "change",
        renderAssessments
    );


    /* -----------------------------------------------------
       Initialise page
       ----------------------------------------------------- */

    const assessments =
        StudyTrackStorage.getAssessments();

    populateModuleFilter(assessments);

    renderAssessments();

    /* -----------------------------------------------------
   Display message from previous page
   ----------------------------------------------------- */

const storedMessage =
    sessionStorage.getItem(
        "studytrack_message"
    );

if (storedMessage) {
    const systemMessage =
        document.getElementById(
            "systemMessage"
        );

    systemMessage.textContent =
        storedMessage;

    systemMessage.hidden = false;

    sessionStorage.removeItem(
        "studytrack_message"
    );

    window.setTimeout(() => {
        systemMessage.hidden = true;
    }, 15000);
}
});