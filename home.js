// =====================================================
// 🏠 AI HEALTH ASSISTANT - HOME.JS
// 👤 MULTI USER DATABASE VERSION
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
// CURRENT LOGGED-IN USER
// =====================================================

const currentUser =
    checkLoginSession();


// =====================================================
// API
// =====================================================

const API_BASE =
    "http://localhost:5000";


// =====================================================
// IF NO USER - STOP
// =====================================================

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
// 🚀 NAVIGATION
// =====================================================


// ================= SCANNER =================

const scannerNav =
    document.getElementById(
        "scannerNav"
    );

if (scannerNav) {

    scannerNav.addEventListener(
        "click",
        function () {

            window.location.href =
                "scanner.html";

        }
    );

}


// ================= AI BUTTON =================

const aiAssistantBtn =
    document.getElementById(
        "aiAssistantBtn"
    );

if (aiAssistantBtn) {

    aiAssistantBtn.addEventListener(
        "click",
        function () {

            window.location.href =
                "ai.html";

        }
    );

}


// ================= AI NAV =================

const aiNav =
    document.getElementById(
        "aiNav"
    );

if (aiNav) {

    aiNav.addEventListener(
        "click",
        function () {

            window.location.href =
                "ai.html";

        }
    );

}


// ================= MEDICINE =================

const medicineBtn =
    document.getElementById(
        "medicineBtn"
    );

if (medicineBtn) {

    medicineBtn.addEventListener(
        "click",
        function () {

            window.location.href =
                "medicine.html";

        }
    );

}


// ================= RECORDS BUTTON =================

const recordsBtn =
    document.getElementById(
        "recordsBtn"
    );

if (recordsBtn) {

    recordsBtn.addEventListener(
        "click",
        function () {

            window.location.href =
                "records.html";

        }
    );

}


// ================= HEALTHCARE =================

const healthcareBtn =
    document.getElementById(
        "healthcareBtn"
    );

if (healthcareBtn) {

    healthcareBtn.addEventListener(
        "click",
        function () {

            window.location.href =
                "healthcare.html";

        }
    );

}


// ================= HEALTH INSIGHTS =================

const insightsBtn =
    document.getElementById(
        "insightsBtn"
    );

if (insightsBtn) {

    insightsBtn.addEventListener(
        "click",
        function () {

            window.location.href =
                "health-insights.html";

        }
    );

}


// ================= PROFILE =================

const profileNav =
    document.getElementById(
        "profileNav"
    );

if (profileNav) {

    profileNav.addEventListener(
        "click",
        function () {

            window.location.href =
                "profile.html";

        }
    );

}


// =====================================================
// 👤 LOAD LOGGED-IN USER NAME
// =====================================================

function loadProfileName() {

    const userName =
        document.getElementById(
            "userName"
        );

    if (!userName) {
        return;
    }


    userName.textContent =
        currentUser.name ||
        "User";

}

loadProfileName();


// =====================================================
// 📷 LOAD PROFILE PHOTO
// =====================================================

function loadHomeProfilePhoto() {

    const profileImage =
        document.getElementById(
            "homeProfileImage"
        );

    const fallback =
        document.getElementById(
            "homeProfileFallback"
        );


    if (
        !profileImage ||
        !fallback
    ) {

        return;
    }


    const savedPhoto =
        localStorage.getItem(
            `healthAppProfilePhoto_${USER_ID}`
        );


    if (savedPhoto) {

        profileImage.src =
            savedPhoto;

        profileImage.classList.remove(
            "hidden"
        );

        fallback.classList.add(
            "hidden"
        );

    } else {

        profileImage.classList.add(
            "hidden"
        );

        fallback.classList.remove(
            "hidden"
        );

    }

}

loadHomeProfilePhoto();


// Always use the latest profile saved in the database. The old dashboard only
// checked a browser key, so profile photos and changed names stayed outdated.
async function syncHomeProfile() {

    try {

        const response = await fetch(
            `${API_BASE}/api/profile/${USER_ID}`
        );

        const data = await response.json();

        if (!response.ok || !data.profile) {
            return;
        }

        currentUser.name = data.profile.name || currentUser.name;
        currentUser.email = data.profile.email || currentUser.email;

        localStorage.setItem(
            "healthAppUser",
            JSON.stringify(currentUser)
        );

        const userName = document.getElementById("userName");
        const profileImage = document.getElementById("homeProfileImage");
        const fallback = document.getElementById("homeProfileFallback");

        if (userName) userName.textContent = currentUser.name || "User";

        if (data.profile.photo && profileImage && fallback) {
            profileImage.src = data.profile.photo;
            profileImage.classList.remove("hidden");
            fallback.classList.add("hidden");
            localStorage.setItem(
                `healthAppProfilePhoto_${USER_ID}`,
                data.profile.photo
            );
        }

    } catch (error) {
        console.warn("Home profile sync skipped:", error);
    }

}

syncHomeProfile();


// =====================================================
// 🎯 HEALTH DATA
// =====================================================

const today =
    new Date()
        .toISOString()
        .split("T")[0];


// =====================================================
// DEFAULT HEALTH DATA
// =====================================================

let stepData = {

    date:
        today,

    count:
        0,

    goal:
        8000

};


let waterData = {

    date:
        today,

    count:
        0,

    goal:
        8

};


// =====================================================
// 🔄 LOAD USER HEALTH DATA FROM DATABASE
// =====================================================

async function loadHealthData() {

    try {

        const response =
            await fetch(
                `${API_BASE}/api/health/${USER_ID}`
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Unable to load health data."
            );

        }


        const health =
            data.health;


        if (health) {

            stepData = {

                date:
                    health.date,

                count:
                    Number(
                        health.steps_count
                    ),

                goal:
                    Number(
                        health.steps_goal
                    )

            };


            waterData = {

                date:
                    health.date,

                count:
                    Number(
                        health.water_count
                    ),

                goal:
                    Number(
                        health.water_goal
                    )

            };

        }


        updateStepsUI();

        updateWaterUI();


        console.log(
            "✅ User health data loaded from database."
        );


    } catch (error) {

        console.error(
            "Health data loading error:",
            error
        );


        // Safe default if server unavailable

        stepData = {

            date:
                today,

            count:
                0,

            goal:
                8000

        };


        waterData = {

            date:
                today,

            count:
                0,

            goal:
                8

        };


        updateStepsUI();

        updateWaterUI();

    }

}


// =====================================================
// 💾 SAVE USER HEALTH DATA TO DATABASE
// =====================================================

async function saveHealthData() {

    try {

        const response =
            await fetch(
                `${API_BASE}/api/health/${USER_ID}`,
                {

                    method:
                        "PUT",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            stepsCount:
                                stepData.count,

                            stepsGoal:
                                stepData.goal,

                            waterCount:
                                waterData.count,

                            waterGoal:
                                waterData.goal

                        })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Unable to save health data."
            );

        }


        console.log(
            "✅ Health data saved for user:",
            USER_ID
        );


    } catch (error) {

        console.error(
            "Health data save error:",
            error
        );

        alert(
            "Unable to save your health data. Please make sure the server is running."
        );

    }

}


// =====================================================
// ELEMENTS
// =====================================================


// ================= STEPS =================

const stepsCount =
    document.getElementById(
        "stepsCount"
    );

const stepsGoal =
    document.getElementById(
        "stepsGoal"
    );

const stepsProgress =
    document.getElementById(
        "stepsProgress"
    );

const stepsProgressText =
    document.getElementById(
        "stepsProgressText"
    );

const stepsPercentage =
    document.getElementById(
        "stepsPercentage"
    );

const stepStatus =
    document.getElementById(
        "stepStatus"
    );


// ================= WATER =================

const waterCount =
    document.getElementById(
        "waterCount"
    );

const waterGoal =
    document.getElementById(
        "waterGoal"
    );

const waterProgress =
    document.getElementById(
        "waterProgress"
    );

const waterProgressText =
    document.getElementById(
        "waterProgressText"
    );

const waterPercentage =
    document.getElementById(
        "waterPercentage"
    );

const waterCurrentDisplay =
    document.getElementById(
        "waterCurrentDisplay"
    );


// =====================================================
// 🚶 UPDATE STEPS UI
// =====================================================

function updateStepsUI() {

    if (!stepsCount) {
        return;
    }


    stepsCount.textContent =
        stepData.count.toLocaleString(
            "en-IN"
        );


    if (stepsGoal) {

        stepsGoal.textContent =
            stepData.goal.toLocaleString(
                "en-IN"
            );

    }


    const percentage =
        stepData.goal > 0
            ? Math.min(
                100,
                Math.round(
                    (
                        stepData.count /
                        stepData.goal
                    ) * 100
                )
            )
            : 0;


    if (stepsProgressText) {

        stepsProgressText.textContent =
            `${stepData.count.toLocaleString("en-IN")} / ${stepData.goal.toLocaleString("en-IN")} steps`;

    }


    if (stepsPercentage) {

        stepsPercentage.textContent =
            `${percentage}%`;

    }


    if (stepsProgress) {

        stepsProgress.style.width =
            `${percentage}%`;

    }


    if (stepStatus) {

        if (
            stepData.count >=
            stepData.goal
        ) {

            stepStatus.textContent =
                "🎉 Daily step goal completed! Great job!";

        } else {

            const remaining =
                stepData.goal -
                stepData.count;

            stepStatus.textContent =
                `${remaining.toLocaleString("en-IN")} steps remaining today.`;

        }

    }

}


// =====================================================
// 💧 UPDATE WATER UI
// =====================================================

function updateWaterUI() {

    if (!waterCount) {
        return;
    }


    waterCount.textContent =
        waterData.count;


    if (waterGoal) {

        waterGoal.textContent =
            waterData.goal;

    }


    const percentage =
        waterData.goal > 0
            ? Math.min(
                100,
                Math.round(
                    (
                        waterData.count /
                        waterData.goal
                    ) * 100
                )
            )
            : 0;


    if (waterProgressText) {

        waterProgressText.textContent =
            `${waterData.count} / ${waterData.goal} glasses`;

    }


    if (waterPercentage) {

        waterPercentage.textContent =
            `${percentage}%`;

    }


    if (waterProgress) {

        waterProgress.style.width =
            `${percentage}%`;

    }


    if (waterCurrentDisplay) {

        waterCurrentDisplay.textContent =
            `${waterData.count} glasses`;

    }

}


// =====================================================
// 🚶 STEP + BUTTON
// =====================================================

const increaseStepsBtn =
    document.getElementById(
        "increaseStepsBtn"
    );


if (increaseStepsBtn) {

    increaseStepsBtn.addEventListener(
        "click",
        async function () {

            stepData.count +=
                100;


            updateStepsUI();

            await saveHealthData();

        }
    );

}


// =====================================================
// 🚶 STEP - BUTTON
// =====================================================

const decreaseStepsBtn =
    document.getElementById(
        "decreaseStepsBtn"
    );


if (decreaseStepsBtn) {

    decreaseStepsBtn.addEventListener(
        "click",
        async function () {

            stepData.count =
                Math.max(
                    0,
                    stepData.count - 100
                );


            updateStepsUI();

            await saveHealthData();

        }
    );

}


// =====================================================
// 💧 WATER + BUTTON
// =====================================================

const increaseWaterBtn =
    document.getElementById(
        "increaseWaterBtn"
    );


if (increaseWaterBtn) {

    increaseWaterBtn.addEventListener(
        "click",
        async function () {

            if (
                waterData.count <
                waterData.goal
            ) {

                waterData.count++;

                updateWaterUI();

                await saveHealthData();

            }

        }
    );

}


// =====================================================
// 💧 WATER - BUTTON
// =====================================================

const decreaseWaterBtn =
    document.getElementById(
        "decreaseWaterBtn"
    );


if (decreaseWaterBtn) {

    decreaseWaterBtn.addEventListener(
        "click",
        async function () {

            waterData.count =
                Math.max(
                    0,
                    waterData.count - 1
                );


            updateWaterUI();

            await saveHealthData();

        }
    );

}


// =====================================================
// 🎯 CHANGE STEP GOAL
// =====================================================

const changeStepGoalBtn =
    document.getElementById(
        "changeStepGoalBtn"
    );


if (changeStepGoalBtn) {

    changeStepGoalBtn.addEventListener(
        "click",
        async function () {

            const newGoal =
                prompt(
                    "Enter your daily step goal:",
                    stepData.goal
                );


            if (
                newGoal === null
            ) {

                return;

            }


            const goal =
                parseInt(
                    newGoal
                );


            if (
                isNaN(goal) ||
                goal < 100 ||
                goal > 100000
            ) {

                alert(
                    "Please enter a goal between 100 and 100,000 steps."
                );

                return;

            }


            stepData.goal =
                goal;


            updateStepsUI();

            await saveHealthData();

        }
    );

}


// =====================================================
// 🎯 CHANGE WATER GOAL
// =====================================================

const changeWaterGoalBtn =
    document.getElementById(
        "changeWaterGoalBtn"
    );


if (changeWaterGoalBtn) {

    changeWaterGoalBtn.addEventListener(
        "click",
        async function () {

            const newGoal =
                prompt(
                    "Enter your daily water goal in glasses:",
                    waterData.goal
                );


            if (
                newGoal === null
            ) {

                return;

            }


            const goal =
                parseInt(
                    newGoal
                );


            if (
                isNaN(goal) ||
                goal < 1 ||
                goal > 30
            ) {

                alert(
                    "Please enter a goal between 1 and 30 glasses."
                );

                return;

            }


            waterData.goal =
                goal;


            // If current intake is greater
            // than new goal, keep actual count

            updateWaterUI();

            await saveHealthData();

        }
    );

}


// =====================================================
// 🚶 AUTOMATIC STEP DETECTION
// =====================================================

let stepTracking =
    false;

let lastStepTime =
    0;

let lastMagnitude =
    0;


const startStepsBtn =
    document.getElementById(
        "startStepsBtn"
    );


const STEP_THRESHOLD =
    1.15;


const STEP_DELAY =
    300;


// =====================================================
// START / STOP TRACKING
// =====================================================

if (startStepsBtn) {

    startStepsBtn.addEventListener(
        "click",
        async function () {

            // ================= STOP =================

            if (stepTracking) {

                stepTracking =
                    false;


                window.removeEventListener(
                    "devicemotion",
                    detectStep
                );


                startStepsBtn.textContent =
                    "▶ Start Tracking";


                startStepsBtn.classList.remove(
                    "tracking"
                );


                if (stepStatus) {

                    stepStatus.textContent =
                        "Step tracking stopped.";

                }


                return;

            }


            // ================= SENSOR CHECK =================

            if (
                !(
                    "DeviceMotionEvent"
                    in window
                )
            ) {

                if (stepStatus) {

                    stepStatus.textContent =
                        "⚠️ Motion sensor is not supported. Use + / − manually.";

                }

                return;

            }


            // ================= IOS PERMISSION =================

            if (
                typeof DeviceMotionEvent.requestPermission ===
                "function"
            ) {

                try {

                    const permission =
                        await DeviceMotionEvent.requestPermission();


                    if (
                        permission !==
                        "granted"
                    ) {

                        if (stepStatus) {

                            stepStatus.textContent =
                                "⚠️ Motion permission was denied. Please allow it or use manual controls.";

                        }

                        return;

                    }

                } catch (error) {

                    console.error(
                        "Motion permission error:",
                        error
                    );

                    return;

                }

            }


            // ================= START =================

            stepTracking =
                true;


            window.addEventListener(
                "devicemotion",
                detectStep
            );


            startStepsBtn.textContent =
                "⏹ Stop Tracking";


            startStepsBtn.classList.add(
                "tracking"
            );


            if (stepStatus) {

                stepStatus.textContent =
                    "🚶 Step tracking is active. Keep your phone with you while walking.";

            }

        }
    );

}


// =====================================================
// 🚶 DETECT STEP
// =====================================================

function detectStep(event) {

    if (!stepTracking) {
        return;
    }


    const acceleration =
        event.accelerationIncludingGravity;


    if (!acceleration) {
        return;
    }


    const x =
        acceleration.x || 0;

    const y =
        acceleration.y || 0;

    const z =
        acceleration.z || 0;


    const magnitude =
        Math.sqrt(
            x * x +
            y * y +
            z * z
        );


    const movement =
        Math.abs(
            magnitude - 9.81
        );


    const now =
        Date.now();


    if (
        movement >
        STEP_THRESHOLD &&

        movement >
        lastMagnitude &&

        now -
        lastStepTime >
        STEP_DELAY
    ) {

        stepData.count++;

        lastStepTime =
            now;


        updateStepsUI();


        // Save to database

        saveHealthData();

    }


    lastMagnitude =
        movement;

}


// =====================================================
// 🚨 EMERGENCY HELP
// =====================================================

const emergencyBtn =
    document.getElementById(
        "emergencyBtn"
    );

const hospitalBtn =
    document.getElementById(
        "hospitalBtn"
    );

const locationBtn =
    document.getElementById(
        "locationBtn"
    );

const contactBtn =
    document.getElementById(
        "contactBtn"
    );


// =====================================================
// 🚨 EMERGENCY CALL
// =====================================================

if (emergencyBtn) {

    emergencyBtn.addEventListener(
        "click",
        function () {

            const confirmEmergency =
                confirm(
                    "Are you experiencing an emergency?\n\nYou will be directed to emergency assistance."
                );


            if (!confirmEmergency) {
                return;
            }


            window.location.href =
                "tel:112";

        }
    );

}


// =====================================================
// 🏥 FIND HOSPITAL
// =====================================================

if (hospitalBtn) {

    hospitalBtn.addEventListener(
        "click",
        function () {

            window.open(
                "https://www.google.com/maps/search/hospitals+near+me",
                "_blank"
            );

        }
    );

}


// =====================================================
// 📍 SHARE LOCATION
// =====================================================

if (locationBtn) {

    locationBtn.addEventListener(
        "click",
        function () {

            if (
                !navigator.geolocation
            ) {

                alert(
                    "Location is not supported by this browser."
                );

                return;

            }


            navigator.geolocation.getCurrentPosition(

                async function (
                    position
                ) {

                    const latitude =
                        position.coords.latitude;

                    const longitude =
                        position.coords.longitude;


                    const locationUrl =
                        `https://www.google.com/maps?q=${latitude},${longitude}`;


                    if (
                        navigator.share
                    ) {

                        try {

                            await navigator.share({

                                title:
                                    "My Emergency Location",

                                text:
                                    "I may need assistance. Here is my current location:",

                                url:
                                    locationUrl

                            });

                        } catch (
                            error
                        ) {

                            console.log(
                                "Share cancelled."
                            );

                        }

                    } else {

                        try {

                            await navigator.clipboard.writeText(
                                locationUrl
                            );


                            alert(
                                "Location link copied. You can now share it."
                            );

                        } catch (
                            error
                        ) {

                            prompt(
                                "Copy this location link:",
                                locationUrl
                            );

                        }

                    }

                },

                function () {

                    alert(
                        "Unable to get your location. Please allow location permission and try again."
                    );

                },

                {

                    enableHighAccuracy:
                        true,

                    timeout:
                        10000,

                    maximumAge:
                        0

                }

            );

        }
    );

}


// =====================================================
// 🚨 EMERGENCY CONTACT
// =====================================================

if (contactBtn) {

    contactBtn.addEventListener(
        "click",
        async function () {

            try {

                const response =
                    await fetch(
                        `${API_BASE}/api/emergency/${USER_ID}`
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.error
                    );

                }


                const savedContact =
                    data.contact;


                // ================= NO CONTACT =================

                if (!savedContact) {

                    const name =
                        prompt(
                            "Enter emergency contact name:"
                        );


                    if (!name) {
                        return;
                    }


                    const phone =
                        prompt(
                            "Enter emergency contact phone number:"
                        );


                    if (!phone) {
                        return;
                    }


                    const saveResponse =
                        await fetch(
                            `${API_BASE}/api/emergency/${USER_ID}`,
                            {

                                method:
                                    "PUT",

                                headers: {

                                    "Content-Type":
                                        "application/json"

                                },

                                body:
                                    JSON.stringify({

                                        name:
                                            name.trim(),

                                        phone:
                                            phone.trim()

                                    })

                            }
                        );


                    const saveData =
                        await saveResponse.json();


                    if (
                        !saveResponse.ok
                    ) {

                        throw new Error(
                            saveData.error
                        );

                    }


                    updateEmergencyContact();


                    alert(
                        "Emergency contact saved successfully."
                    );


                    return;

                }


                // ================= EXISTING CONTACT =================

                if (
                    confirm(
                        `Call ${savedContact.name}?\n\n${savedContact.phone}`
                    )
                ) {

                    window.location.href =
                        `tel:${savedContact.phone}`;

                }

            } catch (error) {

                console.error(
                    "Emergency contact error:",
                    error
                );


                alert(
                    "Unable to load emergency contact."
                );

            }

        }
    );

}


// =====================================================
// 🚨 LOAD EMERGENCY CONTACT
// =====================================================

async function updateEmergencyContact() {

    const contactText =
        document.getElementById(
            "emergencyContactText"
        );


    if (!contactText) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE}/api/emergency/${USER_ID}`
            );


        const data =
            await response.json();


        if (
            !response.ok
        ) {

            throw new Error(
                data.error
            );

        }


        const contact =
            data.contact;


        if (!contact) {

            contactText.textContent =
                "No emergency contact saved";

            return;

        }


        contactText.textContent =
            `${contact.name} • ${contact.phone}`;

    } catch (error) {

        console.error(
            "Emergency contact loading error:",
            error
        );


        contactText.textContent =
            "No emergency contact saved";

    }

}


updateEmergencyContact();


// =====================================================
// ⭐ REVIEW SYSTEM
// =====================================================

const REVIEW_API =
    `${API_BASE}/api/reviews`;

const REVIEW_USAGE_GOAL =
    3;

const REVIEW_USAGE_KEY =
    "healthAppReviewUsage";

const REVIEW_SUBMITTED_KEY =
    "healthAppReviewSubmitted";

let reviewAlreadySubmitted =
    localStorage.getItem(
        `${REVIEW_SUBMITTED_KEY}_${USER_ID}`
    ) === "true";


// =====================================================
// REVIEW ELEMENTS
// =====================================================

const reviewSection =
    document.getElementById(
        "reviewSection"
    );

const reviewForm =
    document.getElementById(
        "reviewForm"
    );

const userReview =
    document.getElementById(
        "userReview"
    );

const recentReviews =
    document.getElementById(
        "recentReviews"
    );

const reviewsList =
    document.getElementById(
        "reviewsList"
    );

const averageRating =
    document.getElementById(
        "averageRating"
    );

const starButtons =
    document.querySelectorAll(
        ".star-btn"
    );

const ratingText =
    document.getElementById(
        "ratingText"
    );

const reviewName =
    document.getElementById(
        "reviewName"
    );

const reviewMessage =
    document.getElementById(
        "reviewMessage"
    );

const submitReviewBtn =
    document.getElementById(
        "submitReviewBtn"
    );


// =====================================================
// RATING LABELS
// =====================================================

const ratingLabels = {

    1:
        "Poor",

    2:
        "Needs Improvement",

    3:
        "Good",

    4:
        "Very Good",

    5:
        "Excellent"

};


// =====================================================
// REVIEW USAGE
// =====================================================

function getReviewUsage() {

    try {

        const saved =
            localStorage.getItem(
                `${REVIEW_USAGE_KEY}_${USER_ID}`
            );


        if (!saved) {
            return [];
        }


        const parsed =
            JSON.parse(saved);


        return Array.isArray(parsed)
            ? parsed
            : [];

    } catch (error) {

        return [];

    }

}


function saveReviewUsage(
    usage
) {

    localStorage.setItem(
        `${REVIEW_USAGE_KEY}_${USER_ID}`,
        JSON.stringify(
            usage
        )
    );

}


function trackReviewUsage(
    actionName
) {

    if (!actionName) {
        return;
    }


    const usage =
        getReviewUsage();


    if (
        !usage.includes(
            actionName
        )
    ) {

        usage.push(
            actionName
        );

        saveReviewUsage(
            usage
        );

    }


    updateReviewVisibility();

}


// =====================================================
// REVIEW TRACKED FEATURES
// =====================================================

const reviewTrackedFeatures = [

    "aiAssistantBtn",

    "scannerNav",

    "scannerBtn",

    "medicineBtn",

    "recordsNav",

    "recordsBtn",

    "healthcareBtn",

    "insightsBtn",

    "viewHealthBtn"

];


reviewTrackedFeatures.forEach(
    function (id) {

        const element =
            document.getElementById(
                id
            );


        if (!element) {
            return;
        }


        element.addEventListener(
            "click",
            function () {

                trackReviewUsage(
                    id
                );

            }
        );

    }
);


// =====================================================
// CHECK USER REVIEW
// =====================================================

function hasUserSubmittedReview() {

    return reviewAlreadySubmitted;

}


// =====================================================
// REVIEW VISIBILITY
// =====================================================

function updateReviewVisibility() {

    if (!reviewSection) {
        return;
    }


    if (
        hasUserSubmittedReview()
    ) {

        reviewSection.classList.add(
            "hidden"
        );

        return;

    }


    const usage =
        getReviewUsage();


    if (
        usage.length >=
        REVIEW_USAGE_GOAL
    ) {

        reviewSection.classList.remove(
            "hidden"
        );


        if (reviewForm) {

            reviewForm.classList.remove(
                "hidden"
            );

        }


        if (userReview) {

            userReview.classList.add(
                "hidden"
            );

        }

    } else {

        reviewSection.classList.add(
            "hidden"
        );

    }

}


// =====================================================
// ⭐ STAR SELECTION
// =====================================================

let selectedRating =
    0;


starButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                selectedRating =
                    Number(
                        button.dataset.rating
                    );


                updateStars();


                if (ratingText) {

                    ratingText.textContent =
                        ratingLabels[
                            selectedRating
                        ];

                }

            }
        );

    }
);


// =====================================================
// UPDATE STARS
// =====================================================

function updateStars() {

    starButtons.forEach(
        function (button) {

            const rating =
                Number(
                    button.dataset.rating
                );


            if (
                rating <=
                selectedRating
            ) {

                button.classList.add(
                    "active"
                );

            } else {

                button.classList.remove(
                    "active"
                );

            }

        }
    );

}


// =====================================================
// INITIALS
// =====================================================

function getInitials(
    name
) {

    if (!name) {
        return "U";
    }


    const parts =
        name
            .trim()
            .split(/\s+/);


    if (
        parts.length === 1
    ) {

        return parts[0]
            .charAt(0)
            .toUpperCase();

    }


    return (

        parts[0]
            .charAt(0) +

        parts[
            parts.length - 1
        ]
            .charAt(0)

    ).toUpperCase();

}


// =====================================================
// STAR STRING
// =====================================================

function getStarString(
    rating
) {

    let stars =
        "";


    for (
        let i = 1;
        i <= 5;
        i++
    ) {

        stars +=
            i <= Number(rating)
                ? "★"
                : "☆";

    }


    return stars;

}


// =====================================================
// SAFE TEXT
// =====================================================

function escapeReviewText(
    text
) {

    return String(text)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// =====================================================
// ⭐ SUBMIT REVIEW
// =====================================================

if (submitReviewBtn) {

    submitReviewBtn.addEventListener(
        "click",
        async function () {

            if (
                hasUserSubmittedReview()
            ) {

                alert(
                    "You have already submitted a review."
                );

                return;

            }


            if (
                selectedRating < 1 ||
                selectedRating > 5
            ) {

                alert(
                    "Please select a star rating first."
                );

                return;

            }


            const name =
                currentUser.name ||
                "";


            const message =
                reviewMessage
                    ? reviewMessage.value.trim()
                    : "";


            if (!message) {

                alert(
                    "Please write your review."
                );

                if (reviewMessage) {

                    reviewMessage.focus();

                }

                return;

            }


            submitReviewBtn.disabled =
                true;

            submitReviewBtn.textContent =
                "Submitting...";


            try {

                const response =
                    await fetch(
                        REVIEW_API,
                        {

                            method:
                                "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    userId:
                                        USER_ID,

                                    name:
                                        name,

                                    rating:
                                        selectedRating,

                                    message:
                                        message

                                })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.error ||
                        "Unable to save review."
                    );

                }


                localStorage.setItem(
                    `${REVIEW_SUBMITTED_KEY}_${USER_ID}`,
                    "true"
                );

                reviewAlreadySubmitted = true;


                updateReviewVisibility();


                console.log(
                    "✅ Review saved for user:",
                    USER_ID
                );


            } catch (error) {

                console.error(
                    "Review submission error:",
                    error
                );


                alert(
                    error.message ||
                    "Unable to submit review."
                );


            } finally {

                submitReviewBtn.disabled =
                    false;

                submitReviewBtn.textContent =
                    "⭐ Submit Review";

            }

        }
    );

}


// =====================================================
// ⭐ LOAD REVIEWS
// =====================================================

async function loadReviews() {

    if (!recentReviews) {
        return;
    }


    try {

        const response =
            await fetch(
                REVIEW_API
            );


        if (!response.ok) {

            throw new Error(
                "Unable to fetch reviews."
            );

        }


        const data =
            await response.json();


        const reviews =
            data.reviews ||
            [];


        if (
            reviews.length === 0
        ) {

            recentReviews.classList.add(
                "hidden"
            );

            return;

        }


        recentReviews.classList.remove(
            "hidden"
        );


        if (reviewsList) {

            reviewsList.innerHTML =
                "";


            reviews.forEach(
                function (review) {

                    const item =
                        document.createElement(
                            "div"
                        );


                    item.className =
                        "review-item";


                    item.innerHTML = `

                        <div class="review-item-header">

                            <div class="review-user">

                                <div class="review-user-avatar">
                                    ${getInitials(review.name)}
                                </div>

                                <div class="review-user-name">
                                    ${escapeReviewText(review.name)}
                                </div>

                            </div>

                            <div class="review-item-stars">
                                ${getStarString(review.rating)}
                            </div>

                        </div>

                        <p class="review-item-message">
                            ${escapeReviewText(review.message)}
                        </p>

                    `;


                    reviewsList.appendChild(
                        item
                    );

                }
            );

        }


        const total =
            reviews.reduce(
                function (
                    sum,
                    review
                ) {

                    return (
                        sum +
                        Number(
                            review.rating
                        )
                    );

                },
                0
            );


        const average =
            (
                total /
                reviews.length
            ).toFixed(1);


        if (averageRating) {

            averageRating.textContent =
                `⭐ ${average} (${reviews.length})`;

        }


    } catch (error) {

        console.error(
            "Unable to load reviews:",
            error
        );

    }

}


async function syncUserReviewStatus() {

    try {

        const response = await fetch(
            `${REVIEW_API}/user/${USER_ID}`
        );

        const data = await response.json();

        if (!response.ok) return;

        reviewAlreadySubmitted = Boolean(data.reviewed);

        if (reviewAlreadySubmitted) {
            localStorage.setItem(
                `${REVIEW_SUBMITTED_KEY}_${USER_ID}`,
                "true"
            );
        }

        updateReviewVisibility();

    } catch (error) {
        console.warn("Review status sync skipped:", error);
    }

}


// =====================================================
// INITIALIZE REVIEWS
// =====================================================

updateReviewVisibility();

syncUserReviewStatus();

loadReviews();


// =====================================================
// 🚀 INITIALIZE DATABASE HEALTH DATA
// =====================================================

loadHealthData();
