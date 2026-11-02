"use strict";

/* =========================================================
   StudyTrack
   Edit Assessment
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const form =
        document.getElementById("assessmentForm");

    const formContainer =
        document.getElementById("editFormContainer");

    const notFound =
        document.getElementById("assessmentNotFound");

    const errorSummary =
        document.getElementById("errorSummary");

    const errorList =
        document.getElementById("errorList");

    const backLink =
        document.getElementById("backToAssessment");

    const cancelLink =
        document.getElementById("cancelEdit");


    const fields = {
        module:
            document.getElementById("module"),

        title:
            document.getElementById(
                "assessmentTitle"
            ),

        type:
            document.getElementById(
                "assessmentType"
            ),

        dueDate:
            document.getElementById("dueDate"),

        expectedMark:
            document.getElementById(
                "expectedMark"
            ),

        status:
            document.getElementById("status"),

        notes:
            document.getElementById("notes")
    };


    const errorElements = {
        module:
            document.getElementById(
                "moduleError"
            ),

        title:
            document.getElementById(
                "titleError"
            ),

        type:
            document.getElementById(
                "typeError"
            ),

        dueDate:
            document.getElementById(
                "dueDateError"
            ),

        expectedMark:
            document.getElementById(
                "markError"
            ),

        status:
            document.getElementById(
                "statusError"
            )
    };


    /* -----------------------------------------------------
       Read ID from URL
       ----------------------------------------------------- */

    const parameters =
        new URLSearchParams(
            window.location.search
        );

    const assessmentId =
        parameters.get("id");

    let currentAssessment = null;


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

        fields.module.value =
            currentAssessment.module;

        fields.title.value =
            currentAssessment.title;

        fields.type.value =
            currentAssessment.type;

        fields.dueDate.value =
            currentAssessment.dueDate;

        fields.expectedMark.value =
            currentAssessment.expectedMark ??
            "";

        fields.status.value =
            currentAssessment.status;

        fields.notes.value =
            currentAssessment.notes || "";

        const viewUrl =
            `view-assessment.html?id=${encodeURIComponent(
                currentAssessment.id
            )}`;

        backLink.href = viewUrl;
        cancelLink.href = viewUrl;

        notFound.hidden = true;
        formContainer.hidden = false;
    }


    function showNotFound() {
        formContainer.hidden = true;
        errorSummary.hidden = true;
        notFound.hidden = false;
    }


    /* -----------------------------------------------------
       Validation
       ----------------------------------------------------- */

    function clearErrors() {
        errorSummary.hidden = true;
        errorList.innerHTML = "";

        Object.values(
            errorElements
        ).forEach((element) => {
            element.textContent = "";
            element.hidden = true;
        });

        Object.values(fields).forEach(
            (field) => {
                field.classList.remove(
                    "input-error"
                );

                field.removeAttribute(
                    "aria-invalid"
                );
            }
        );
    }


    function addFieldError(
        fieldName,
        message,
        errors
    ) {
        const field =
            fields[fieldName];

        const errorElement =
            errorElements[fieldName];

        field.classList.add(
            "input-error"
        );

        field.setAttribute(
            "aria-invalid",
            "true"
        );

        errorElement.textContent =
            message;

        errorElement.hidden = false;

        errors.push({
            field,
            message
        });
    }


    function validateForm() {
        clearErrors();

        const errors = [];

        if (!fields.module.value) {
            addFieldError(
                "module",
                "Please select a module.",
                errors
            );
        }

        if (!fields.title.value.trim()) {
            addFieldError(
                "title",
                "Please enter an assessment title.",
                errors
            );
        }

        if (!fields.type.value) {
            addFieldError(
                "type",
                "Please select an assessment type.",
                errors
            );
        }

        if (!fields.dueDate.value) {
            addFieldError(
                "dueDate",
                "Please select a due date.",
                errors
            );
        }

        if (
            fields.expectedMark.value !== ""
        ) {
            const mark =
                Number(
                    fields.expectedMark.value
                );

            if (
                Number.isNaN(mark) ||
                mark < 0 ||
                mark > 100
            ) {
                addFieldError(
                    "expectedMark",
                    "Expected mark must be between 0 and 100.",
                    errors
                );
            }
        }

        if (!fields.status.value) {
            addFieldError(
                "status",
                "Please select an assessment status.",
                errors
            );
        }

        return errors;
    }


    function showErrorSummary(errors) {
        errorList.innerHTML = "";

        errors.forEach((error) => {
            const item =
                document.createElement("li");

            const link =
                document.createElement("a");

            link.href =
                `#${error.field.id}`;

            link.textContent =
                error.message;

            link.addEventListener(
                "click",
                (event) => {
                    event.preventDefault();
                    error.field.focus();
                }
            );

            item.appendChild(link);
            errorList.appendChild(item);
        });

        errorSummary.hidden = false;
        errorSummary.focus();
    }


    /* -----------------------------------------------------
       Save changes
       ----------------------------------------------------- */

    form.addEventListener(
        "submit",
        (event) => {
            event.preventDefault();

            const errors =
                validateForm();

            if (errors.length > 0) {
                showErrorSummary(errors);
                return;
            }

            const updatedAssessment = {
                ...currentAssessment,

                module:
                    fields.module.value,

                title:
                    fields.title.value.trim(),

                type:
                    fields.type.value,

                dueDate:
                    fields.dueDate.value,

                expectedMark:
                    fields.expectedMark.value === ""
                        ? null
                        : Number(
                            fields.expectedMark.value
                        ),

                status:
                    fields.status.value,

                notes:
                    fields.notes.value.trim()
            };

            const updated =
                StudyTrackStorage.updateAssessment(
                    updatedAssessment
                );

            if (!updated) {
                showNotFound();
                return;
            }

            sessionStorage.setItem(
                "studytrack_message",
                "Assessment updated successfully."
            );

            window.location.href =
                `view-assessment.html?id=${encodeURIComponent(
                    updatedAssessment.id
                )}`;
        }
    );


    /* -----------------------------------------------------
       Remove field error after correction
       ----------------------------------------------------- */

    function clearFieldError(fieldName) {
        const field =
            fields[fieldName];

        const errorElement =
            errorElements[fieldName];

        if (!errorElement) {
            return;
        }

        field.classList.remove(
            "input-error"
        );

        field.removeAttribute(
            "aria-invalid"
        );

        errorElement.textContent = "";
        errorElement.hidden = true;
    }


    fields.module.addEventListener(
        "change",
        () => clearFieldError("module")
    );

    fields.title.addEventListener(
        "input",
        () => clearFieldError("title")
    );

    fields.type.addEventListener(
        "change",
        () => clearFieldError("type")
    );

    fields.dueDate.addEventListener(
        "change",
        () => clearFieldError("dueDate")
    );

    fields.expectedMark.addEventListener(
        "input",
        () =>
            clearFieldError(
                "expectedMark"
            )
    );

    fields.status.addEventListener(
        "change",
        () => clearFieldError("status")
    );


    loadAssessment();
});