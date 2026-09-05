// =====================================================
// 💊 MEDICINE REMINDER - SERVER + WEB PUSH
// =====================================================

const API_BASE = "";

// -----------------------------------------------------
// 👤 GET LOGGED-IN USER
// -----------------------------------------------------

function getLoggedInUser() {

    try {

        return JSON.parse(
            localStorage.getItem("healthAppUser")
        );

    } catch (error) {

        console.error(
            "Unable to read logged-in user:",
            error
        );

        return null;
    }
}

const currentUser = getLoggedInUser();

// -----------------------------------------------------
// 🔐 LOGIN CHECK
// -----------------------------------------------------

if (!currentUser || !currentUser.id) {

    alert("Please login first.");

    window.location.href = "login.html";

}

// -----------------------------------------------------
// 📦 ELEMENTS
// -----------------------------------------------------

const medicineForm =
    document.getElementById("medicineForm");

const medicineList =
    document.getElementById("medicineList");

const medicineCount =
    document.getElementById("medicineCount");

const backBtn =
    document.getElementById("backBtn");


// -----------------------------------------------------
// 💊 LOAD MEDICINES FROM SERVER
// -----------------------------------------------------

async function loadMedicines() {

    try {

        const response = await fetch(
            `${API_BASE}/api/medicines/${currentUser.id}`
        );

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.error ||
                "Unable to load medicines."
            );

        }

        const medicines =
            data.medicines || [];

        renderMedicines(medicines);

    } catch (error) {

        console.error(
            "Medicine loading error:",
            error
        );

        medicineList.innerHTML = `
            <p class="empty-message">
                Unable to load medicines.
            </p>
        `;

        medicineCount.textContent = "0";
    }
}


// -----------------------------------------------------
// 🎨 DISPLAY MEDICINES
// -----------------------------------------------------

function renderMedicines(medicines) {

    medicineCount.textContent =
        medicines.length;

    if (medicines.length === 0) {

        medicineList.innerHTML = `
            <div class="empty-message">
                💊 No medicines added yet.
            </div>
        `;

        return;
    }

    medicineList.innerHTML =
        medicines.map(function (medicine) {

            return `
                <div class="medicine-card">

                    <div class="medicine-card-content">

                        <h3>
                            💊 ${escapeHTML(medicine.name)}
                        </h3>

                        <p>
                            <strong>Dosage:</strong>
                            ${escapeHTML(medicine.dosage || "Not specified")}
                        </p>

                        <p>
                            <strong>Frequency:</strong>
                            ${escapeHTML(medicine.frequency)}
                        </p>

                        <p>
                            <strong>Time:</strong>
                            ${escapeHTML(medicine.time)}
                        </p>

                        <p>
                            <strong>Start Date:</strong>
                            ${escapeHTML(medicine.startDate)}
                        </p>

                        ${
                            medicine.endDate
                                ? `
                                    <p>
                                        <strong>End Date:</strong>
                                        ${escapeHTML(medicine.endDate)}
                                    </p>
                                `
                                : ""
                        }

                    </div>

                    <button
                        class="delete-btn"
                        onclick="deleteMedicine(${medicine.id})"
                    >
                        🗑️ Delete
                    </button>

                </div>
            `;

        }).join("");
}


// -----------------------------------------------------
// 🛡️ BASIC HTML ESCAPE
// -----------------------------------------------------

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// -----------------------------------------------------
// ➕ ADD MEDICINE
// -----------------------------------------------------

medicineForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const name =
            document.getElementById(
                "medicineName"
            ).value.trim();

        const dosage =
            document.getElementById(
                "dosage"
            ).value.trim();

        const frequency =
            document.getElementById(
                "frequency"
            ).value;

        const time =
            document.getElementById(
                "medicineTime"
            ).value;

        const startDate =
            document.getElementById(
                "startDate"
            ).value;

        const endDate =
            document.getElementById(
                "endDate"
            ).value;


        // -------------------------------------------------
        // VALIDATION
        // -------------------------------------------------

        if (!name) {

            alert("Please enter medicine name.");

            return;
        }

        if (!dosage) {

            alert("Please enter dosage.");

            return;
        }

        if (!time) {

            alert("Please select reminder time.");

            return;
        }

        if (!startDate) {

            alert("Please select start date.");

            return;
        }

        if (
            endDate &&
            endDate < startDate
        ) {

            alert(
                "End date cannot be before start date."
            );

            return;
        }


        // -------------------------------------------------
        // SEND MEDICINE TO SERVER
        // -------------------------------------------------

        try {

            const response = await fetch(
                `${API_BASE}/api/medicines/${currentUser.id}`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        name: name,

                        dosage: dosage,

                        frequency: frequency,

                        time: time,

                        startDate: startDate,

                        endDate: endDate || ""

                    })
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Unable to save medicine."
                );

            }


            // -------------------------------------------------
            // SUCCESS
            // -------------------------------------------------

            alert(
                "✅ Medicine reminder saved successfully."
            );

            medicineForm.reset();

            await loadMedicines();


            // Make sure Push subscription exists

            await setupPushNotifications();


        } catch (error) {

            console.error(
                "Medicine save error:",
                error
            );

            alert(
                "❌ " +
                error.message
            );

        }

    }
);


// -----------------------------------------------------
// 🗑️ DELETE MEDICINE
// -----------------------------------------------------

async function deleteMedicine(
    medicineId
) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this medicine?"
        );

    if (!confirmed) {

        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE}/api/medicines/${currentUser.id}/${medicineId}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Unable to delete medicine."
            );

        }


        alert(
            "✅ Medicine deleted successfully."
        );

        await loadMedicines();


    } catch (error) {

        console.error(
            "Medicine delete error:",
            error
        );

        alert(
            "❌ " +
            error.message
        );

    }

}


// -----------------------------------------------------
// 🔔 REGISTER SERVICE WORKER
// -----------------------------------------------------

async function registerServiceWorker() {

    if (
        !("serviceWorker" in navigator)
    ) {

        console.error(
            "Service Worker is not supported."
        );

        return null;
    }


    try {

        const registration =
            await navigator.serviceWorker.register(
                "/service-worker.js"
            );


        console.log(
            "✅ Service Worker registered:",
            registration.scope
        );


        await navigator.serviceWorker.ready;


        return registration;


    } catch (error) {

        console.error(
            "❌ Service Worker registration failed:",
            error
        );

        return null;
    }
}


// -----------------------------------------------------
// 🔑 GET VAPID PUBLIC KEY
// -----------------------------------------------------

async function getVapidPublicKey() {

    const response =
        await fetch(
            "/api/notifications/vapid-public-key"
        );


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            data.error ||
            "Unable to get VAPID public key."
        );

    }


    return data.publicKey;
}


// -----------------------------------------------------
// 🔄 CONVERT VAPID KEY
// -----------------------------------------------------

function urlBase64ToUint8Array(
    base64String
) {

    const padding =
        "=".repeat(
            (4 -
                (base64String.length % 4)) % 4
        );

    const base64 =
        (
            base64String +
            padding
        )
            .replace(/-/g, "+")
            .replace(/_/g, "/");


    const rawData =
        window.atob(base64);


    return Uint8Array.from(
        [...rawData].map(
            char => char.charCodeAt(0)
        )
    );
}


// -----------------------------------------------------
// 🔔 SETUP PUSH NOTIFICATIONS
// -----------------------------------------------------

async function setupPushNotifications() {

    try {

        // Browser support

        if (
            !("serviceWorker" in navigator)
        ) {

            console.error(
                "Service Worker not supported."
            );

            return;
        }


        if (
            !("PushManager" in window)
        ) {

            console.error(
                "Push notifications are not supported."
            );

            return;
        }


        // Notification permission

        if (
            !("Notification" in window)
        ) {

            console.error(
                "Browser notifications are not supported."
            );

            return;
        }


        let permission =
            Notification.permission;


        if (
            permission === "default"
        ) {

            permission =
                await Notification.requestPermission();

        }


        if (
            permission !== "granted"
        ) {

            console.warn(
                "Notification permission was not granted."
            );

            return;
        }


        // Register service worker

        const registration =
            await registerServiceWorker();


        if (!registration) {

            return;
        }


        // Get VAPID public key

        const vapidPublicKey =
            await getVapidPublicKey();


        // Check existing subscription

        let subscription =
            await registration.pushManager
                .getSubscription();


        // Create subscription if missing

        if (!subscription) {

            subscription =
                await registration.pushManager
                    .subscribe({

                        userVisibleOnly: true,

                        applicationServerKey:
                            urlBase64ToUint8Array(
                                vapidPublicKey
                            )

                    });

        }


        console.log(
            "✅ Push subscription created."
        );


        // -------------------------------------------------
        // SEND SUBSCRIPTION TO SERVER
        // -------------------------------------------------

        const response =
            await fetch(
                `/api/notifications/subscribe/${currentUser.id}`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            subscription
                        )

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Unable to save push subscription."
            );

        }


        console.log(
            "✅ Push subscription saved on server."
        );


    } catch (error) {

        console.error(
            "❌ Push setup error:",
            error
        );

    }
}


// -----------------------------------------------------
// 🔙 BACK BUTTON
// -----------------------------------------------------

if (backBtn) {

    backBtn.addEventListener(
        "click",
        function () {

            window.history.back();

        }
    );

}


// -----------------------------------------------------
// 🚀 START
// -----------------------------------------------------

async function initializeMedicinePage() {

    console.log(
        "💊 Medicine Reminder starting..."
    );

    await loadMedicines();

    await setupPushNotifications();

    console.log(
        "✅ Medicine Reminder ready."
    );

}

initializeMedicinePage();