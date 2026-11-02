"use strict";

/* =========================================================
   StudyTrack
   Local Storage and Demo Data
   ========================================================= */

const StudyTrackStorage = (() => {
    const STORAGE_KEY = "studytrack_assessments";

    const defaultAssessments = [
        {
            id: "assessment-001",
            module: "HCIN6222",
            title: "Interaction Design Prototype",
            type: "Portfolio of Evidence",
            dueDate: "2026-11-09",
            expectedMark: 75,
            status: "In Progress",
            notes: "Complete the final StudyTrack prototype and POE updates."
        },
        {
            id: "assessment-002",
            module: "PROG6212",
            title: "Application Development POE",
            type: "Portfolio of Evidence",
            dueDate: "2026-11-16",
            expectedMark: 75,
            status: "Not Started",
            notes: "Complete the final application development submission."
        },
        {
            id: "assessment-003",
            module: "DATA6222",
            title: "Database Practical Assessment",
            type: "Practical Assessment",
            dueDate: "2026-11-20",
            expectedMark: 70,
            status: "Not Started",
            notes: "Review SQL queries and database implementation."
        },
        {
            id: "assessment-004",
            module: "IPMA6212",
            title: "IT Project Management Assignment",
            type: "Assignment",
            dueDate: "2026-10-30",
            expectedMark: 70,
            status: "Completed",
            notes: "Final assignment submitted."
        },
        {
            id: "assessment-005",
            module: "HCIN6222",
            title: "Part 2 Interaction Design",
            type: "Portfolio of Evidence",
            dueDate: "2026-10-19",
            expectedMark: 75,
            status: "Completed",
            notes: "Prototype and research report submitted."
        }
    ];


    /* -----------------------------------------------------
       Initialise storage
       ----------------------------------------------------- */

    function initialise() {
        const existingData = localStorage.getItem(STORAGE_KEY);

        if (!existingData) {
            saveAssessments(defaultAssessments);
        }
    }


    /* -----------------------------------------------------
       Get all assessments
       ----------------------------------------------------- */

    function getAssessments() {
        const storedData = localStorage.getItem(STORAGE_KEY);

        if (!storedData) {
            return [];
        }

        try {
            return JSON.parse(storedData);
        } catch (error) {
            console.error(
                "StudyTrack could not read assessment data.",
                error
            );

            return [];
        }
    }


    /* -----------------------------------------------------
       Save all assessments
       ----------------------------------------------------- */

    function saveAssessments(assessments) {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(assessments)
        );
    }


    /* -----------------------------------------------------
       Get one assessment
       ----------------------------------------------------- */

    function getAssessmentById(id) {
        const assessments = getAssessments();

        return assessments.find(
            (assessment) => assessment.id === id
        ) || null;
    }


    /* -----------------------------------------------------
       Add assessment
       ----------------------------------------------------- */

    function addAssessment(assessment) {
        const assessments = getAssessments();

        assessments.push(assessment);

        saveAssessments(assessments);

        return assessment;
    }


    /* -----------------------------------------------------
       Update assessment
       ----------------------------------------------------- */

    function updateAssessment(updatedAssessment) {
        const assessments = getAssessments();

        const index = assessments.findIndex(
            (assessment) =>
                assessment.id === updatedAssessment.id
        );

        if (index === -1) {
            return false;
        }

        assessments[index] = updatedAssessment;

        saveAssessments(assessments);

        return true;
    }


    /* -----------------------------------------------------
       Delete assessment
       ----------------------------------------------------- */

    function deleteAssessment(id) {
        const assessments = getAssessments();

        const filteredAssessments = assessments.filter(
            (assessment) => assessment.id !== id
        );

        if (filteredAssessments.length === assessments.length) {
            return false;
        }

        saveAssessments(filteredAssessments);

        return true;
    }


    /* -----------------------------------------------------
       Generate unique assessment ID
       ----------------------------------------------------- */

    function generateId() {
        return `assessment-${Date.now()}`;
    }


    /* -----------------------------------------------------
       Reset prototype demo data
       ----------------------------------------------------- */

    function resetDemoData() {
        saveAssessments(defaultAssessments);

        return getAssessments();
    }


    /* -----------------------------------------------------
       Public API
       ----------------------------------------------------- */

    return {
        initialise,
        getAssessments,
        getAssessmentById,
        addAssessment,
        updateAssessment,
        deleteAssessment,
        generateId,
        resetDemoData
    };
})();

StudyTrackStorage.initialise();