// =====================================================
// 👤 PROFILE SYSTEM - DATABASE VERSION
// =====================================================


// =====================================================
// 🔐 GET LOGGED-IN USER
// =====================================================

function getLoggedInUser() {

    try {

        const savedUser =
            localStorage.getItem(
                "healthAppUser"
            );


        if (!savedUser) {

            return null;

        }


        const user =
            JSON.parse(savedUser);


        if (
            !user ||
            !user.id
        ) {

            return null;

        }


        return user;


    } catch (error) {

        console.error(
            "Unable to read logged-in user:",
            error
        );

        return null;

    }

}


// =====================================================
// 🔐 CHECK LOGIN
// =====================================================

const loggedInUser =
    getLoggedInUser();


if (!loggedInUser) {

    window.location.href =
        "login.html";

    throw new Error(
        "No logged-in user."
    );

}


// =====================================================
// 👤 USER ID
// =====================================================

const USER_ID =
    loggedInUser.id;


// =====================================================
// 🌐 API
// =====================================================

const API_BASE =
    "http://localhost:5000";


// =====================================================
// ELEMENTS
// =====================================================

const backBtn =
    document.getElementById(
        "backBtn"
    );


const profileImageInput =
    document.getElementById(
        "profileImageInput"
    );


const profileImage =
    document.getElementById(
        "profileImage"
    );


const profileInitials =
    document.getElementById(
        "profileInitials"
    );


const profileDisplayName =
    document.getElementById(
        "profileDisplayName"
    );


const profileDisplayEmail =
    document.getElementById(
        "profileDisplayEmail"
    );


const infoName =
    document.getElementById(
        "infoName"
    );


const infoEmail =
    document.getElementById(
        "infoEmail"
    );


const editProfileBtn =
    document.getElementById(
        "editProfileBtn"
    );


const editProfileSection =
    document.getElementById(
        "editProfileSection"
    );


const nameInput =
    document.getElementById(
        "nameInput"
    );


const emailInput =
    document.getElementById(
        "emailInput"
    );


const saveProfileBtn =
    document.getElementById(
        "saveProfileBtn"
    );


const cancelProfileBtn =
    document.getElementById(
        "cancelProfileBtn"
    );


const editGoalsBtn =
    document.getElementById(
        "editGoalsBtn"
    );


const editGoalsSection =
    document.getElementById(
        "editGoalsSection"
    );


const stepsGoal =
    document.getElementById(
        "stepsGoal"
    );


const waterGoal =
    document.getElementById(
        "waterGoal"
    );


const stepsGoalInput =
    document.getElementById(
        "stepsGoalInput"
    );


const waterGoalInput =
    document.getElementById(
        "waterGoalInput"
    );


const saveGoalsBtn =
    document.getElementById(
        "saveGoalsBtn"
    );


const cancelGoalsBtn =
    document.getElementById(
        "cancelGoalsBtn"
    );


const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


// =====================================================
// DEFAULT VALUES
// =====================================================

const DEFAULT_STEPS =
    8000;


const DEFAULT_WATER =
    8;


// =====================================================
// PROFILE DATA
// =====================================================

let profileData = {

    name:
        loggedInUser.name ||
        "Your Name",

    email:
        loggedInUser.email ||
        "your@email.com",

    steps:
        DEFAULT_STEPS,

    water:
        DEFAULT_WATER,

    photo:
        null

};


// =====================================================
// GET INITIALS
// =====================================================

function getInitials(name) {

    if (
        !name ||
        name === "Your Name"
    ) {

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

        parts[0].charAt(0) +

        parts[
            parts.length - 1
        ].charAt(0)

    ).toUpperCase();

}


// =====================================================
// 📥 LOAD PROFILE FROM DATABASE
// =====================================================

async function loadProfile() {

    try {

        const response =
            await fetch(
                `${API_BASE}/api/profile/${USER_ID}`
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Unable to load profile."
            );

        }


        if (data.profile) {

            profileData =
                {

                    name:
                        data.profile.name ||
                        loggedInUser.name,

                    email:
                        data.profile.email ||
                        loggedInUser.email,

                    steps:
                        Number(
                            data.profile.steps
                        ) || DEFAULT_STEPS,

                    water:
                        Number(
                            data.profile.water
                        ) || DEFAULT_WATER,

                    photo:
                        data.profile.photo ||
                        null

                };

        }


        displayProfile();

        displayGoals();

        loadProfilePhoto();


        // ==========================================
        // UPDATE LOGIN SESSION
        // ==========================================

        localStorage.setItem(
            "healthAppUser",
            JSON.stringify({

                id:
                    USER_ID,

                name:
                    profileData.name,

                email:
                    profileData.email

            })
        );


        console.log(
            "✅ Profile loaded for User ID:",
            USER_ID
        );


    } catch (error) {

        console.error(
            "Profile loading error:",
            error
        );


        alert(
            "Unable to load profile. Please make sure the server is running."
        );

    }

}


// =====================================================
// DISPLAY PROFILE
// =====================================================

function displayProfile() {

    if (profileDisplayName) {

        profileDisplayName.textContent =
            profileData.name;

    }


    if (profileDisplayEmail) {

        profileDisplayEmail.textContent =
            profileData.email;

    }


    if (infoName) {

        infoName.textContent =
            profileData.name;

    }


    if (infoEmail) {

        infoEmail.textContent =
            profileData.email;

    }


    if (profileInitials) {

        profileInitials.textContent =
            getInitials(
                profileData.name
            );

    }


    if (nameInput) {

        nameInput.value =
            profileData.name;

    }


    if (emailInput) {

        emailInput.value =
            profileData.email;

    }

}


// =====================================================
// DISPLAY GOALS
// =====================================================

function displayGoals() {

    if (stepsGoal) {

        stepsGoal.textContent =
            Number(
                profileData.steps
            ).toLocaleString(
                "en-IN"
            );

    }


    if (waterGoal) {

        waterGoal.textContent =
            profileData.water;

    }


    if (stepsGoalInput) {

        stepsGoalInput.value =
            profileData.steps;

    }


    if (waterGoalInput) {

        waterGoalInput.value =
            profileData.water;

    }

}


// =====================================================
// 📷 LOAD PROFILE PHOTO
// =====================================================

function loadProfilePhoto() {

    if (
        !profileImage ||
        !profileInitials
    ) {

        return;

    }


    if (
        profileData.photo
    ) {

        profileImage.src =
            profileData.photo;

        profileImage.classList.remove(
            "hidden"
        );

        profileInitials.classList.add(
            "hidden"
        );

    } else {

        profileImage.classList.add(
            "hidden"
        );

        profileInitials.classList.remove(
            "hidden"
        );

    }

}


// =====================================================
// 📷 SAVE PROFILE PHOTO
// =====================================================

if (profileImageInput) {

    profileImageInput.addEventListener(
        "change",
        function () {

            const file =
                profileImageInput.files[0];


            if (!file) {

                return;

            }


            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                alert(
                    "Please select an image file."
                );

                profileImageInput.value =
                    "";

                return;

            }


            if (
                file.size >
                5 * 1024 * 1024
            ) {

                alert(
                    "Please select an image smaller than 5 MB."
                );

                profileImageInput.value =
                    "";

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                async function (event) {

                    const imageData =
                        event.target.result;


                    try {

                        const response =
                            await fetch(
                                `${API_BASE}/api/profile/${USER_ID}/photo`,
                                {

                                    method:
                                        "PUT",

                                    headers: {

                                        "Content-Type":
                                            "application/json"

                                    },

                                    body:
                                        JSON.stringify({

                                            photo:
                                                imageData

                                        })

                                }
                            );


                        const data =
                            await response.json();


                        if (!response.ok) {

                            throw new Error(
                                data.error ||
                                "Unable to save photo."
                            );

                        }


                        profileData.photo =
                            imageData;

                        localStorage.setItem(
                            `healthAppProfilePhoto_${USER_ID}`,
                            imageData
                        );


                        loadProfilePhoto();


                        console.log(
                            "✅ Profile photo saved."
                        );


                    } catch (error) {

                        console.error(
                            "Photo save error:",
                            error
                        );


                        alert(
                            "Unable to save profile photo."
                        );

                    }

                };


            reader.readAsDataURL(
                file
            );

        }
    );

}


// =====================================================
// ✏️ OPEN EDIT PROFILE
// =====================================================

if (editProfileBtn) {

    editProfileBtn.addEventListener(
        "click",
        function () {

            editProfileSection.classList.remove(
                "hidden"
            );


            editGoalsSection.classList.add(
                "hidden"
            );


            editProfileSection.scrollIntoView({

                behavior:
                    "smooth",

                block:
                    "center"

            });

        }
    );

}


// =====================================================
// ❌ CANCEL PROFILE
// =====================================================

if (cancelProfileBtn) {

    cancelProfileBtn.addEventListener(
        "click",
        function () {

            editProfileSection.classList.add(
                "hidden"
            );


            displayProfile();

        }
    );

}


// =====================================================
// 💾 SAVE PROFILE TO DATABASE
// =====================================================

if (saveProfileBtn) {

    saveProfileBtn.addEventListener(
        "click",
        async function () {

            const name =
                nameInput
                    ? nameInput.value.trim()
                    : "";


            const email =
                emailInput
                    ? emailInput.value.trim()
                    : "";


            if (!name) {

                alert(
                    "Please enter your name."
                );

                nameInput.focus();

                return;

            }


            if (!email) {

                alert(
                    "Please enter your email."
                );

                emailInput.focus();

                return;

            }


            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (
                !emailPattern.test(
                    email
                )
            ) {

                alert(
                    "Please enter a valid email address."
                );

                emailInput.focus();

                return;

            }


            saveProfileBtn.disabled =
                true;


            saveProfileBtn.textContent =
                "Saving...";


            try {

                const response =
                    await fetch(
                        `${API_BASE}/api/profile/${USER_ID}`,
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
                                        name,

                                    email:
                                        email

                                })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.error ||
                        "Unable to update profile."
                    );

                }


                profileData.name =
                    name;


                profileData.email =
                    email;


                // ==================================
                // UPDATE SESSION
                // ==================================

                localStorage.setItem(
                    "healthAppUser",
                    JSON.stringify({

                        id:
                            USER_ID,

                        name:
                            name,

                        email:
                            email

                    })
                );


                displayProfile();


                editProfileSection.classList.add(
                    "hidden"
                );


                console.log(
                    "✅ Profile saved to database."
                );


            } catch (error) {

                console.error(
                    "Profile save error:",
                    error
                );


                alert(
                    error.message ||
                    "Unable to save profile."
                );

            } finally {

                saveProfileBtn.disabled =
                    false;

                saveProfileBtn.textContent =
                    "Save Profile";

            }

        }
    );

}


// =====================================================
// 🎯 OPEN EDIT GOALS
// =====================================================

if (editGoalsBtn) {

    editGoalsBtn.addEventListener(
        "click",
        function () {

            editGoalsSection.classList.remove(
                "hidden"
            );


            editProfileSection.classList.add(
                "hidden"
            );


            editGoalsSection.scrollIntoView({

                behavior:
                    "smooth",

                block:
                    "center"

            });

        }
    );

}


// =====================================================
// ❌ CANCEL GOALS
// =====================================================

if (cancelGoalsBtn) {

    cancelGoalsBtn.addEventListener(
        "click",
        function () {

            editGoalsSection.classList.add(
                "hidden"
            );


            displayGoals();

        }
    );

}


// =====================================================
// 💾 SAVE GOALS TO DATABASE
// =====================================================

if (saveGoalsBtn) {

    saveGoalsBtn.addEventListener(
        "click",
        async function () {

            const steps =
                Number(
                    stepsGoalInput.value
                );


            const water =
                Number(
                    waterGoalInput.value
                );


            if (
                !Number.isInteger(steps) ||
                steps < 100 ||
                steps > 100000
            ) {

                alert(
                    "Steps goal must be between 100 and 100,000."
                );

                stepsGoalInput.focus();

                return;

            }


            if (
                !Number.isInteger(water) ||
                water < 1 ||
                water > 30
            ) {

                alert(
                    "Water goal must be between 1 and 30 glasses."
                );

                waterGoalInput.focus();

                return;

            }


            saveGoalsBtn.disabled =
                true;


            saveGoalsBtn.textContent =
                "Saving...";


            try {

                const response =
                    await fetch(
                        `${API_BASE}/api/profile/${USER_ID}/goals`,
                        {

                            method:
                                "PUT",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    steps:
                                        steps,

                                    water:
                                        water

                                })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.error ||
                        "Unable to save goals."
                    );

                }


                profileData.steps =
                    steps;


                profileData.water =
                    water;

                localStorage.setItem(
                    `healthAppHealth_${USER_ID}`,
                    JSON.stringify({
                        steps_count: 0,
                        steps_goal: steps,
                        water_count: 0,
                        water_goal: water
                    })
                );


                displayGoals();


                editGoalsSection.classList.add(
                    "hidden"
                );


                console.log(
                    "✅ Goals saved to database."
                );


            } catch (error) {

                console.error(
                    "Goals save error:",
                    error
                );


                alert(
                    error.message ||
                    "Unable to save goals."
                );

            } finally {

                saveGoalsBtn.disabled =
                    false;

                saveGoalsBtn.textContent =
                    "Save Goals";

            }

        }
    );

}


// =====================================================
// 🔙 BACK BUTTON
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
// 🚪 LOGOUT
// =====================================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function () {

            const confirmLogout =
                confirm(
                    "Are you sure you want to logout?"
                );


            if (!confirmLogout) {

                return;

            }


            localStorage.removeItem(
                "healthAppUser"
            );


            window.location.href =
                "login.html";

        }
    );

}


// =====================================================
// 🚀 INITIALIZE
// =====================================================

loadProfile();


// =====================================================
// ✅ READY
// =====================================================

console.log(
    "Profile system initialized for User ID:",
    USER_ID
);
