// =====================================================
// 🔐 LOGIN & SIGN UP SYSTEM
// =====================================================


// =====================================================
// API
// =====================================================

const API_BASE_URL =
    "";


// =====================================================
// ELEMENTS
// =====================================================

const loginForm =
    document.getElementById("loginForm");

const signupForm =
    document.getElementById("signupForm");

const showSignupBtn =
    document.getElementById("showSignupBtn");

const showLoginBtn =
    document.getElementById("showLoginBtn");

const loginBtn =
    document.getElementById("loginBtn");

const signupBtn =
    document.getElementById("signupBtn");

const guestLoginBtn =
    document.getElementById("guestLoginBtn");

const forgotPasswordBtn =
    document.getElementById("forgotPasswordBtn");


function saveLoginSession(user) {

    localStorage.setItem(
        "healthAppUser",
        JSON.stringify(user)
    );

    localStorage.setItem(
        "healthAppProfile",
        JSON.stringify({
            name: user.name,
            email: user.email
        })
    );

}


if (forgotPasswordBtn) {

    forgotPasswordBtn.addEventListener(
        "click",
        function () {

            const email = prompt("Enter your registered email address:");

            if (!email) return;

            alert(
                "For this college-project demo, email reset is not connected yet. Please create a new account or contact the app developer."
            );

        }
    );

}


if (guestLoginBtn) {

    guestLoginBtn.addEventListener(
        "click",
        async function () {

            guestLoginBtn.disabled = true;
            guestLoginBtn.textContent = "Opening guest mode...";

            try {

                const response = await fetch(
                    `${API_BASE_URL}/api/auth/guest`,
                    {
                        method: "POST"
                    }
                );

                const data = await response.json();

                if (!response.ok || !data.user) {
                    throw new Error(data.error || "Unable to open guest mode.");
                }

                saveLoginSession(data.user);
                window.location.href = "home.html";

            } catch (error) {

                alert(error.message || "Unable to connect to the server.");
                guestLoginBtn.disabled = false;
                guestLoginBtn.textContent = "Continue as Guest";

            }

        }
    );

}


// =====================================================
// SHOW SIGN UP
// =====================================================

if (showSignupBtn) {

    showSignupBtn.addEventListener(
        "click",
        function () {

            loginForm.classList.add(
                "hidden"
            );

            signupForm.classList.remove(
                "hidden"
            );

        }
    );

}


// =====================================================
// SHOW LOGIN
// =====================================================

if (showLoginBtn) {

    showLoginBtn.addEventListener(
        "click",
        function () {

            signupForm.classList.add(
                "hidden"
            );

            loginForm.classList.remove(
                "hidden"
            );

        }
    );

}


// =====================================================
// 👤 CREATE ACCOUNT
// =====================================================

if (signupBtn) {

    signupBtn.addEventListener(
        "click",
        async function () {

            const name =
                document.getElementById(
                    "signupName"
                ).value.trim();

            const email =
                document.getElementById(
                    "signupEmail"
                ).value.trim();

            const password =
                document.getElementById(
                    "signupPassword"
                ).value;

            const confirmPassword =
                document.getElementById(
                    "signupConfirmPassword"
                ).value;


            // ================= NAME =================

            if (!name) {

                alert(
                    "Please enter your full name."
                );

                return;

            }


            // ================= EMAIL =================

            if (!email) {

                alert(
                    "Please enter your email."
                );

                return;

            }


            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (
                !emailPattern.test(email)
            ) {

                alert(
                    "Please enter a valid email address."
                );

                return;

            }


            // ================= PASSWORD =================

            if (!password) {

                alert(
                    "Please create a password."
                );

                return;

            }


            if (
                password.length < 6
            ) {

                alert(
                    "Password must be at least 6 characters."
                );

                return;

            }


            // ================= CONFIRM PASSWORD =================

            if (
                password !==
                confirmPassword
            ) {

                alert(
                    "Passwords do not match."
                );

                return;

            }


            // ================= BUTTON =================

            signupBtn.disabled =
                true;

            signupBtn.textContent =
                "Creating Account...";


            try {

                // ================= API =================

                const response =
                    await fetch(
                        `${API_BASE_URL}/api/auth/register`,
                        {

                            method:
                                "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    name:
                                        name,

                                    email:
                                        email,

                                    password:
                                        password

                                })

                        }
                    );


                const data =
                    await response.json();


                // ================= ERROR =================

                if (!response.ok) {

                    alert(
                        data.error ||
                        "Unable to create account."
                    );

                    return;

                }


                // ================= SAVE USER =================

                if (
                    data.user
                ) {

                    localStorage.setItem(
                        "healthAppUser",
                        JSON.stringify(
                            data.user
                        )
                    );

                }


                // ================= CONNECT PROFILE =================

                localStorage.setItem(
                    "healthAppProfile",
                    JSON.stringify({

                        name:
                            data.user.name,

                        email:
                            data.user.email

                    })
                );


                // ================= SUCCESS =================

                alert(
                    "🎉 Account created successfully!"
                );


                // ================= HOME =================

                window.location.href =
                    "home.html";


            } catch (error) {

                console.error(
                    "Register error:",
                    error
                );


                alert(
                    "Unable to connect to the server. Please make sure the server is running."
                );

            } finally {

                signupBtn.disabled =
                    false;

                signupBtn.textContent =
                    "👤 Create Account";

            }

        }
    );

}


// =====================================================
// 🔐 LOGIN
// =====================================================

if (loginBtn) {

    loginBtn.addEventListener(
        "click",
        async function () {

            const email =
                document.getElementById(
                    "loginEmail"
                ).value.trim();

            const password =
                document.getElementById(
                    "loginPassword"
                ).value;


            // ================= EMAIL =================

            if (!email) {

                alert(
                    "Please enter your email."
                );

                return;

            }


            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (
                !emailPattern.test(email)
            ) {

                alert(
                    "Please enter a valid email address."
                );

                return;

            }


            // ================= PASSWORD =================

            if (!password) {

                alert(
                    "Please enter your password."
                );

                return;

            }


            // ================= BUTTON =================

            loginBtn.disabled =
                true;

            loginBtn.textContent =
                "Logging in...";


            try {

                // ================= API =================

                const response =
                    await fetch(
                        `${API_BASE_URL}/api/auth/login`,
                        {

                            method:
                                "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    email:
                                        email,

                                    password:
                                        password

                                })

                        }
                    );


                const data =
                    await response.json();


                // ================= ERROR =================

                if (!response.ok) {

                    alert(
                        data.error ||
                        "Invalid email or password."
                    );

                    return;

                }


                // ================= SAVE USER =================

                if (
                    data.user
                ) {

                    localStorage.setItem(
                        "healthAppUser",
                        JSON.stringify(
                            data.user
                        )
                    );


                    // ================= PROFILE SYNC =================

                    localStorage.setItem(
                        "healthAppProfile",
                        JSON.stringify({

                            name:
                                data.user.name,

                            email:
                                data.user.email

                        })
                    );

                }


                // ================= SUCCESS =================

                alert(
                    `Welcome back, ${data.user.name}! 👋`
                );


                // ================= HOME =================

                window.location.href =
                    "home.html";


            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                alert(
                    "Unable to connect to the server. Please make sure the server is running."
                );

            } finally {

                loginBtn.disabled =
                    false;

                loginBtn.textContent =
                    "🔐 Login";

            }

        }
    );

}
