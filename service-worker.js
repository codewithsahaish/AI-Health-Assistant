// =====================================================
// 🔔 MEDICINE REMINDER SERVICE WORKER
// =====================================================

// -----------------------------------------------------
// PUSH EVENT
// -----------------------------------------------------

self.addEventListener("push", function (event) {

    console.log("🔔 Push notification received.");

    let data = {
        title: "💊 Medicine Reminder",
        body: "It's time to take your medicine.",
        medicineId: null
    };

    // -------------------------------------------------
    // READ PUSH DATA
    // -------------------------------------------------

    if (event.data) {

        try {

            data = event.data.json();

        } catch (error) {

            data.body = event.data.text();

        }
    }

    // -------------------------------------------------
    // SHOW NOTIFICATION
    // -------------------------------------------------

    const notificationTitle =
        data.title || "💊 Medicine Reminder";

    const notificationOptions = {

        body:
            data.body ||
            "It's time to take your medicine.",

        tag:
            data.medicineId
                ? `medicine-${data.medicineId}`
                : "medicine-reminder",

        requireInteraction: true,

        data: {
            medicineId:
                data.medicineId || null
        }
    };

    event.waitUntil(

        self.registration.showNotification(
            notificationTitle,
            notificationOptions
        )

    );

});

// -----------------------------------------------------
// NOTIFICATION CLICK
// -----------------------------------------------------

self.addEventListener(
    "notificationclick",
    function (event) {

        event.notification.close();

        event.waitUntil(

            clients.matchAll({
                type: "window",
                includeUncontrolled: true
            })

            .then(function (clientList) {

                for (const client of clientList) {

                    if ("focus" in client) {

                        return client.focus();

                    }

                }

                // Open medicine page

                if (clients.openWindow) {

                    return clients.openWindow(
                        new URL(
                            "medicine.html",
                            self.registration.scope
                        ).href
                    );

                }

            })

        );

    }
);