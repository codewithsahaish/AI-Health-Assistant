const loginForm = document.getElementById("loginForm");

const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");

const guestLogin = document.getElementById("guestLogin");
const signupBtn = document.getElementById("signupBtn");
const forgotPassword = document.getElementById("forgotPassword");


// Show / Hide Password
togglePassword.addEventListener("click", function () {

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        togglePassword.textContent = "🙈";
    } else {
        passwordInput.type = "password";
        togglePassword.textContent = "👁";
    }

});


// Login
loginForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = passwordInput.value;

    if (email === "" || password === "") {
        alert("Please enter your email and password.");
        return;
    }

    alert("Login successful! Welcome to AI Health Assistant.");

    // Dashboard will be connected here later.
});


// Guest Login
guestLogin.addEventListener("click", function () {

    alert("Guest mode activated.");

});


// Create Account
signupBtn.addEventListener("click", function (event) {

    event.preventDefault();

    alert("Signup page will be added in the next step.");

});


// Forgot Password
forgotPassword.addEventListener("click", function (event) {

    event.preventDefault();

    const email = prompt("Enter your registered email:");

    if (email) {
        alert("Password reset instructions will be added with Firebase.");
    }

});