// =====================================================
// NEARBY HEALTHCARE
// =====================================================


// ================= ELEMENTS =================

const backBtn =
    document.getElementById("backBtn");

const locationBtn =
    document.getElementById("locationBtn");

const locationStatus =
    document.getElementById("locationStatus");

const hospitalServiceBtn =
    document.getElementById("hospitalServiceBtn");

const pharmacyServiceBtn =
    document.getElementById("pharmacyServiceBtn");

const clinicServiceBtn =
    document.getElementById("clinicServiceBtn");

const labServiceBtn =
    document.getElementById("labServiceBtn");

const mapsBtn =
    document.getElementById("mapsBtn");


// ================= LOCATION DATA =================

let userLatitude = null;
let userLongitude = null;


// =====================================================
// BACK BUTTON
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
// GET USER LOCATION
// =====================================================

function getUserLocation() {

    return new Promise(
        function (resolve, reject) {

            if (!navigator.geolocation) {

                reject(
                    new Error(
                        "Geolocation is not supported."
                    )
                );

                return;
            }


            navigator.geolocation.getCurrentPosition(

                function (position) {

                    userLatitude =
                        position.coords.latitude;

                    userLongitude =
                        position.coords.longitude;


                    resolve(position);

                },

                function (error) {

                    reject(error);

                },

                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }

            );

        }
    );

}


// =====================================================
// LOCATION BUTTON
// =====================================================

if (locationBtn) {

    locationBtn.addEventListener(
        "click",
        async function () {

            locationBtn.disabled = true;

            locationBtn.textContent =
                "📍 Getting Location...";


            try {

                await getUserLocation();


                locationStatus.textContent =
                    "✓ Location detected. You can now search nearby healthcare services.";


                locationBtn.textContent =
                    "✓ Location Ready";


            } catch (error) {

                console.error(
                    "Location Error:",
                    error
                );


                locationStatus.textContent =
                    "⚠️ Location access was not available. Please allow location permission and try again.";

                locationBtn.textContent =
                    "📍 Try Again";

                locationBtn.disabled = false;

            }

        }
    );

}


// =====================================================
// OPEN MAP SEARCH
// =====================================================

function openNearbySearch(service) {

    let searchTerm = service;


    if (
        userLatitude !== null &&
        userLongitude !== null
    ) {

        const url =
            `https://www.google.com/maps/search/${encodeURIComponent(
                searchTerm
            )}/@${userLatitude},${userLongitude},14z`;


        window.open(
            url,
            "_blank"
        );

        return;
    }


    // If location has not been obtained,
    // ask the user to enable it first.

    const shouldContinue =
        confirm(
            "Your location has not been detected yet.\n\n" +
            "Would you like to use Google Maps to search for " +
            service +
            " near you?"
        );


    if (!shouldContinue) {
        return;
    }


    const url =
        `https://www.google.com/maps/search/${encodeURIComponent(
            service + " near me"
        )}`;


    window.open(
        url,
        "_blank"
    );

}


// =====================================================
// HOSPITALS
// =====================================================

if (hospitalServiceBtn) {

    hospitalServiceBtn.addEventListener(
        "click",
        function () {

            openNearbySearch(
                "hospitals"
            );

        }
    );

}


// =====================================================
// PHARMACIES
// =====================================================

if (pharmacyServiceBtn) {

    pharmacyServiceBtn.addEventListener(
        "click",
        function () {

            openNearbySearch(
                "pharmacies"
            );

        }
    );

}


// =====================================================
// CLINICS
// =====================================================

if (clinicServiceBtn) {

    clinicServiceBtn.addEventListener(
        "click",
        function () {

            openNearbySearch(
                "clinics"
            );

        }
    );

}


// =====================================================
// DIAGNOSTIC LABS
// =====================================================

if (labServiceBtn) {

    labServiceBtn.addEventListener(
        "click",
        function () {

            openNearbySearch(
                "diagnostic labs"
            );

        }
    );

}


// =====================================================
// OPEN MAPS
// =====================================================

if (mapsBtn) {

    mapsBtn.addEventListener(
        "click",
        function () {

            openNearbySearch(
                "healthcare"
            );

        }
    );

}