"use strict";

/* =========================================================
   StudyTrack
   Dashboard functionality
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const assessmentList = document.getElementById("assessmentList");
    const emptyState = document.getElementById("emptyState");

    const upcomingCount = document.getElementById("upcomingCount");
    const dueSoonCount = document.getElementById("dueSoonCount");
    const completedCount = document.getElementById("completedCount");

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


    function getToday() {
        const today = new Date();

        today.setHours(0, 0, 0, 0);

        return today;
    }


    function getDaysUntilDue(dateString) {
        const today = getToday();
        const dueDate = parseDate(dateString);

        const difference =
            dueDate.getTime() - today.getTime();

        return Math.ceil(
            difference / (1000 * 60 * 60 * 24)
        );
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
       Due-date wording
       ----------------------------------------------------- */

    function getDueText(assessment) {
        if (assessment.status === "Completed") {
            return `Completed · Due ${formatDate(
                assessment.dueDate
            )}`;
        }

        const days = getDaysUntilDue(
            assessment.dueDate
        );

        if (days < 0) {
            const overdueDays = Math.abs(days);

            return overdueDays === 1
                ? "Overdue by 1 day"
                : `Overdue by ${overdueDays} days`;
        }

        if (days === 0) {
            return "Due today";
        }

        if (days === 1) {
            return "Due tomorrow";
        }

        return `Due in ${days} days`;
    }


    function isDueSoon(assessment) {
        if (assessment.status === "Completed") {
            return false;
        }

        const days = getDaysUntilDue(
            assessment.dueDate
        );

        return days >= 0 && days <= 7;
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
       Dashboard counters
       ----------------------------------------------------- */

    function updateSummary(assessments) {
        const upcoming = assessments.filter(
            (assessment) =>
                assessment.status !== "Completed"
        );

        const dueSoon = assessments.filter(
            (assessment) =>
                isDueSoon(assessment)
        );

        const completed = assessments.filter(
            (assessment) =>
                assessment.status === "Completed"
        );

        upcomingCount.textContent = upcoming.length;
        dueSoonCount.textContent = dueSoon.length;
        completedCount.textContent = completed.length;
    }


    /* -----------------------------------------------------
       Module filter
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
       Build assessment card
       ----------------------------------------------------- */

    function createAssessmentCard(assessment) {
        const article =
            document.createElement("article");

        article.className = "assessment-card";

        const statusClass =
            getStatusClass(assessment.status);

        const dueSoonClass =
            isDueSoon(assessment)
                ? " due-soon"
                : "";

        const actionButton =
            getPrimaryAction(assessment);

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

                <p class="assessment-due${dueSoonClass}">
                    <span aria-hidden="true">▣</span>

                    ${escapeHtml(
                        getDueText(assessment)
                    )}
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

                ${actionButton}

            </div>
        `;

        return article;
    }


    /* -----------------------------------------------------
       Primary status action
       ----------------------------------------------------- */

    function getPrimaryAction(assessment) {
        if (assessment.status === "Not Started") {
            return `
                <button
                    type="button"
                    class="button button-secondary
                           status-action"
                    data-id="${escapeHtml(
                        assessment.id
                    )}"
                    data-status="In Progress"
                >
                    Start Task
                </button>
            `;
        }

        if (assessment.status === "In Progress") {
            return `
                <button
                    type="button"
                    class="button button-secondary
                           status-action"
                    data-id="${escapeHtml(
                        assessment.id
                    )}"
                    data-status="Completed"
                >
                    Mark Completed
                </button>
            `;
        }

        return `
            <span
                class="status-badge completed"
                aria-label="Assessment completed"
            >
                ✓ Completed
            </span>
        `;
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
                const matchesSearch =
                    assessment.title
                        .toLowerCase()
                        .includes(searchValue) ||
                    assessment.module
                        .toLowerCase()
                        .includes(searchValue) ||
                    assessment.type
                        .toLowerCase()
                        .includes(searchValue);

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
       Render dashboard
       ----------------------------------------------------- */

    function renderDashboard() {
        const allAssessments =
            StudyTrackStorage.getAssessments();

        updateSummary(allAssessments);

        const filtered =
            sortAssessments(
                getFilteredAssessments()
            );

        assessmentList.innerHTML = "";

        filtered.forEach((assessment) => {
            assessmentList.appendChild(
                createAssessmentCard(assessment)
            );
        });

        const totalAssessments =
            allAssessments.length;

        resultCount.textContent =
            `Showing ${filtered.length} of ` +
            `${totalAssessments} assessments`;

        const hasResults =
            filtered.length > 0;

        assessmentList.hidden = !hasResults;
        emptyState.hidden = hasResults;

        attachStatusEvents();
    }


    /* -----------------------------------------------------
       Status button events
       ----------------------------------------------------- */

    function attachStatusEvents() {
        const buttons =
            document.querySelectorAll(
                ".status-action"
            );

        buttons.forEach((button) => {
            button.addEventListener(
                "click",
                handleStatusChange
            );
        });
    }


    function handleStatusChange(event) {
        const button =
            event.currentTarget;

        const assessmentId =
            button.dataset.id;

        const newStatus =
            button.dataset.status;

        const assessment =
            StudyTrackStorage.getAssessmentById(
                assessmentId
            );

        if (!assessment) {
            return;
        }

        assessment.status = newStatus;

        StudyTrackStorage.updateAssessment(
            assessment
        );

        showSystemMessage(
            newStatus === "Completed"
                ? "Assessment marked as completed."
                : "Assessment moved to In Progress."
        );

        renderDashboard();
    }


    /* -----------------------------------------------------
       Accessible system feedback
       ----------------------------------------------------- */

    function showSystemMessage(message) {
        const systemMessage =
            document.getElementById(
                "systemMessage"
            );

        systemMessage.textContent = message;
        systemMessage.hidden = false;

        window.setTimeout(() => {
            systemMessage.hidden = true;
        }, 5000);
    }


    /* -----------------------------------------------------
       Basic HTML escaping
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
       Search and filter events
       ----------------------------------------------------- */

    assessmentSearch.addEventListener(
        "input",
        renderDashboard
    );

    moduleFilter.addEventListener(
        "change",
        renderDashboard
    );

    statusFilter.addEventListener(
        "change",
        renderDashboard
    );


    /* -----------------------------------------------------
       Initialise Dashboard
       ----------------------------------------------------- */

    const assessments =
        StudyTrackStorage.getAssessments();

    populateModuleFilter(assessments);

    renderDashboard();
});