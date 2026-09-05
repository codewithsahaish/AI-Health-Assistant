// =====================================================
// 📋 HEALTH RECORDS - MULTI USER DATABASE VERSION
// =====================================================


// =====================================================
// 🔐 LOGIN PROTECTION
// =====================================================

function checkLoginSession() {

    const savedUser =
        localStorage.getItem("healthAppUser");


    if (!savedUser) {

        window.location.href =
            "login.html";

        return null;

    }


    try {

        const user =
            JSON.parse(savedUser);


        if (!user || !user.id) {

            localStorage.removeItem(
                "healthAppUser"
            );

            window.location.href =
                "login.html";

            return null;

        }


        return user;


    } catch (error) {

        console.error(
            "Session error:",
            error
        );


        localStorage.removeItem(
            "healthAppUser"
        );


        window.location.href =
            "login.html";


        return null;

    }

}


// =====================================================
// 👤 CURRENT USER
// =====================================================

const currentUser =
    checkLoginSession();


if (!currentUser) {

    throw new Error(
        "No logged-in user."
    );

}


// =====================================================
// 👤 USER ID
// =====================================================

const USER_ID =
    currentUser.id;


// =====================================================
// 🌐 API
// =====================================================

const API_BASE =
    "http://localhost:5000";


// =====================================================
// 📋 ELEMENTS
// =====================================================

const recordForm =
    document.getElementById(
        "recordForm"
    );


const recordsList =
    document.getElementById(
        "recordsList"
    );


const recordCount =
    document.getElementById(
        "recordCount"
    );


const recordType =
    document.getElementById(
        "recordType"
    );


const recordTitle =
    document.getElementById(
        "recordTitle"
    );


const recordDate =
    document.getElementById(
        "recordDate"
    );


const doctorHospital =
    document.getElementById(
        "doctorHospital"
    );


const recordNotes =
    document.getElementById(
        "recordNotes"
    );


const backBtn =
    document.getElementById(
        "backBtn"
    );


// =====================================================
// 📦 HEALTH RECORDS
// =====================================================

let healthRecords = [];


// =====================================================
// 📥 LOAD RECORDS FROM DATABASE
// =====================================================

async function loadRecords() {

    if (!recordsList) {
        return;
    }


    try {

        recordsList.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    ⏳
                </div>

                <h3>
                    Loading records...
                </h3>

                <p>
                    Please wait.
                </p>

            </div>

        `;


        const response =
            await fetch(
                `${API_BASE}/api/records/${USER_ID}`
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Unable to load records."
            );

        }


        healthRecords =
            data.records || [];


        renderRecords();


        console.log(
            "✅ Records loaded for user:",
            USER_ID
        );


    } catch (error) {

        console.error(
            "Records loading error:",
            error
        );


        recordsList.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    ⚠️
                </div>

                <h3>
                    Unable to load records
                </h3>

                <p>
                    Please make sure the server is running.
                </p>

            </div>

        `;

    }

}


// =====================================================
// ➕ ADD HEALTH RECORD
// =====================================================

if (recordForm) {

    recordForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // =========================================
            // GET VALUES
            // =========================================

            const type =
                recordType
                    ? recordType.value.trim()
                    : "";


            const title =
                recordTitle
                    ? recordTitle.value.trim()
                    : "";


            const date =
                recordDate
                    ? recordDate.value
                    : "";


            const doctor =
                doctorHospital
                    ? doctorHospital.value.trim()
                    : "";


            const notes =
                recordNotes
                    ? recordNotes.value.trim()
                    : "";


            // =========================================
            // VALIDATION
            // =========================================

            if (!type) {

                alert(
                    "Please select a record type."
                );

                if (recordType) {
                    recordType.focus();
                }

                return;

            }


            if (!title) {

                alert(
                    "Please enter a record title."
                );

                if (recordTitle) {
                    recordTitle.focus();
                }

                return;

            }


            if (!date) {

                alert(
                    "Please select a date."
                );

                if (recordDate) {
                    recordDate.focus();
                }

                return;

            }


            // =========================================
            // FIND SUBMIT BUTTON
            // =========================================

            const submitButton =
                recordForm.querySelector(
                    'button[type="submit"]'
                );


            if (submitButton) {

                submitButton.disabled =
                    true;

                submitButton.textContent =
                    "Saving...";

            }


            try {

                // =====================================
                // SEND TO DATABASE
                // =====================================

                const response =
                    await fetch(
                        `${API_BASE}/api/records/${USER_ID}`,
                        {

                            method:
                                "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    type:
                                        type,

                                    title:
                                        title,

                                    date:
                                        date,

                                    doctor:
                                        doctor,

                                    notes:
                                        notes

                                })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.error ||
                        "Unable to save record."
                    );

                }


                // =====================================
                // ADD TO CURRENT LIST
                // =====================================

                if (data.record) {

                    healthRecords.unshift(
                        data.record
                    );

                }


                // =====================================
                // RESET FORM
                // =====================================

                recordForm.reset();


                // =====================================
                // REFRESH UI
                // =====================================

                renderRecords();


                console.log(
                    "✅ Health record saved for user:",
                    USER_ID
                );


            } catch (error) {

                console.error(
                    "Record save error:",
                    error
                );


                alert(
                    error.message ||
                    "Unable to save health record. Please make sure the server is running."
                );


            } finally {

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "Add Record";

                }

            }

        }
    );

}


// =====================================================
// 📋 DISPLAY RECORDS
// =====================================================

function renderRecords() {

    if (!recordsList) {
        return;
    }


    recordsList.innerHTML =
        "";


    // =========================================
    // UPDATE COUNT
    // =========================================

    if (recordCount) {

        recordCount.textContent =
            healthRecords.length;

    }


    // =========================================
    // NO RECORDS
    // =========================================

    if (
        healthRecords.length === 0
    ) {

        recordsList.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    📋
                </div>

                <h3>
                    No health records yet
                </h3>

                <p>
                    Add your first health record above.
                </p>

            </div>

        `;

        return;

    }


    // =========================================
    // DISPLAY RECORDS
    // =========================================

    healthRecords.forEach(
        function (record) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "record-card";


            card.innerHTML = `

                <div class="record-card-top">

                    <div class="record-info">

                        <div class="record-icon">
                            ${getRecordIcon(record.type)}
                        </div>

                        <div class="record-details">

                            <span class="record-type">
                                ${escapeHTML(record.type)}
                            </span>

                            <h3>
                                ${escapeHTML(record.title)}
                            </h3>

                            <p>
                                📅 ${formatDate(record.date)}
                            </p>

                            ${
                                record.doctor
                                ? `
                                    <p>
                                        🏥 ${escapeHTML(record.doctor)}
                                    </p>
                                `
                                : ""
                            }

                        </div>

                    </div>


                    <button
                        class="delete-record-btn"
                        data-record-id="${record.id}"
                        type="button"
                    >
                        🗑️
                    </button>

                </div>


                ${
                    record.notes
                    ? `
                        <div class="record-notes">
                            ${escapeHTML(record.notes)}
                        </div>
                    `
                    : ""
                }

            `;


            // =====================================
            // DELETE BUTTON
            // =====================================

            const deleteButton =
                card.querySelector(
                    ".delete-record-btn"
                );


            if (deleteButton) {

                deleteButton.addEventListener(
                    "click",
                    function () {

                        const recordId =
                            Number(
                                deleteButton.dataset.recordId
                            );


                        deleteRecord(
                            recordId
                        );

                    }
                );

            }


            recordsList.appendChild(
                card
            );

        }
    );

}


// =====================================================
// 📋 RECORD ICON
// =====================================================

function getRecordIcon(
    type
) {

    if (
        type ===
        "Prescription"
    ) {

        return "💊";

    }


    if (
        type ===
        "Lab Report"
    ) {

        return "🧪";

    }


    if (
        type ===
        "Doctor Visit"
    ) {

        return "🩺";

    }


    if (
        type ===
        "Vaccination"
    ) {

        return "💉";

    }


    if (
        type ===
        "Medical Report"
    ) {

        return "📄";

    }


    return "📁";

}


// =====================================================
// 🗑️ DELETE RECORD
// =====================================================

async function deleteRecord(
    id
) {

    if (!id) {
        return;
    }


    const confirmDelete =
        confirm(
            "Are you sure you want to delete this health record?"
        );


    if (!confirmDelete) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE}/api/records/${USER_ID}/${id}`,
                {

                    method:
                        "DELETE"

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Unable to delete record."
            );

        }


        // =========================================
        // REMOVE FROM LOCAL DISPLAY ARRAY
        // =========================================

        healthRecords =
            healthRecords.filter(
                function (record) {

                    return (
                        Number(
                            record.id
                        ) !==
                        Number(id)
                    );

                }
            );


        renderRecords();


        console.log(
            "✅ Record deleted from database."
        );


    } catch (error) {

        console.error(
            "Record delete error:",
            error
        );


        alert(
            error.message ||
            "Unable to delete health record."
        );

    }

}


// =====================================================
// 📅 FORMAT DATE
// =====================================================

function formatDate(
    date
) {

    if (!date) {
        return "";
    }


    const parts =
        date.split("-");


    if (
        parts.length !== 3
    ) {

        return date;

    }


    return (
        `${parts[2]}/${parts[1]}/${parts[0]}`
    );

}


// =====================================================
// 🔐 SECURITY
// =====================================================

function escapeHTML(
    text
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}


// =====================================================
// ⬅️ BACK BUTTON
// =====================================================

if (backBtn) {

    backBtn.addEventListener(
        "click",
        function () {

            window.location.href =
                "home.html";

        }
    );

}


// =====================================================
// 🚀 INITIAL LOAD
// =====================================================

loadRecords();