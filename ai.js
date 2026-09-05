let conversationHistory = [];
const chatMessages = document.getElementById("chatMessages");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const backBtn = document.getElementById("backBtn");


// =====================================================
// SEND MESSAGE TO GEMINI
// =====================================================

async function sendMessage() {

    const message = userInput.value.trim();

    if (message === "") {
        return;
    }

    // Show user's message
    addUserMessage(message);

    // Clear input
    userInput.value = "";

    // Disable button while AI is responding
    sendBtn.disabled = true;

    // Show AI thinking
    showTyping();

    scrollChat();


    try {

        const response = await fetch(
            "http://localhost:5000/api/health-chat",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },
            body: JSON.stringify({
            message: message,
            conversation: conversationHistory
                })
            }
        );


        const data = await response.json();


        removeTyping();


        if (!response.ok) {

            throw new Error(
                data.error || "Server error"
            );

        }
        conversationHistory.push({
    role: "user",
    content: message
});

conversationHistory.push({
    role: "assistant",
    content: data.reply
});


        // Show Gemini response
        addBotMessage(
            data.reply || "I couldn't generate a response.",
            data.emergency === true
        );

        scrollChat();


    } catch (error) {

        console.error("AI Error:", error);

        removeTyping();

        addBotMessage(
            "⚠️ I am unable to connect to the AI right now. Please make sure the AI server is running."
        );

        scrollChat();

    } finally {

        sendBtn.disabled = false;

        userInput.focus();

    }

}


// =====================================================
// USER MESSAGE
// =====================================================

function addUserMessage(message) {

    const messageDiv =
        document.createElement("div");

    messageDiv.className =
        "message user-message";


    const content =
        document.createElement("div");

    content.className =
        "message-content";


    const paragraph =
        document.createElement("p");

    paragraph.textContent =
        message;


    content.appendChild(paragraph);

    messageDiv.appendChild(content);

    chatMessages.appendChild(messageDiv);

}


// =====================================================
// BOT / GEMINI MESSAGE
// =====================================================

function addBotMessage(message, isEmergency = false) {

    const messageDiv = document.createElement("div");
    messageDiv.className = "message bot-message";

    if (isEmergency) {
        messageDiv.classList.add("emergency-message");
    }


    const icon =
        document.createElement("div");

    icon.className =
        "message-icon";

    icon.textContent =
        "🤖";


    const content =
        document.createElement("div");

    content.className =
        "message-content";


    const paragraph =
        document.createElement("p");


    // Format Gemini response
    paragraph.innerHTML =
        formatAIResponse(message);


    content.appendChild(paragraph);

    messageDiv.appendChild(icon);

    messageDiv.appendChild(content);

    chatMessages.appendChild(messageDiv);

}


// =====================================================
// FORMAT GEMINI RESPONSE
// =====================================================

function formatAIResponse(text) {

    let formatted = text || "";


    // Basic HTML safety
    formatted = formatted
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");


    // ### Heading
    formatted = formatted.replace(
        /^###\s+(.*)$/gm,
        "<strong class='ai-heading'>$1</strong>"
    );


    // ## Heading
    formatted = formatted.replace(
        /^##\s+(.*)$/gm,
        "<strong class='ai-heading'>$1</strong>"
    );


    // **Bold text**
    formatted = formatted.replace(
        /\*\*(.*?)\*\*/g,
        "<strong>$1</strong>"
    );


    // Numbered list
    formatted = formatted.replace(
        /^(\d+)\.\s+(.*)$/gm,
        "<div class='ai-list-item'><strong>$1.</strong> $2</div>"
    );


    // Bullet list
    formatted = formatted.replace(
        /^[*-]\s+(.*)$/gm,
        "<div class='ai-list-item'>• $1</div>"
    );


    // New lines
    formatted = formatted.replace(
        /\n/g,
        "<br>"
    );


    return formatted;

}


// =====================================================
// AI THINKING INDICATOR
// =====================================================

function showTyping() {

    const typingDiv =
        document.createElement("div");

    typingDiv.id =
        "typingIndicator";

    typingDiv.className =
        "message bot-message";


    typingDiv.innerHTML = `
        <div class="message-icon">
            🤖
        </div>

        <div class="message-content">
            <p class="typing">
                AI Health Assistant is thinking...
            </p>
        </div>
    `;


    chatMessages.appendChild(typingDiv);

    scrollChat();

}


// =====================================================
// REMOVE THINKING INDICATOR
// =====================================================

function removeTyping() {

    const typing =
        document.getElementById(
            "typingIndicator"
        );

    if (typing) {

        typing.remove();

    }

}


// =====================================================
// QUICK QUESTIONS
// =====================================================

const quickButtons =
    document.querySelectorAll(".quick-btn");


quickButtons.forEach(function (button) {

    button.addEventListener(
        "click",
        function () {

            const question =
                button.getAttribute(
                    "data-question"
                );


            userInput.value =
                question;


            sendMessage();

        }
    );

});


// =====================================================
// SEND BUTTON
// =====================================================

sendBtn.addEventListener(
    "click",
    sendMessage
);


// =====================================================
// ENTER KEY
// =====================================================

userInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            event.preventDefault();

            sendMessage();

        }

    }
);


// =====================================================
// BACK TO HOME
// =====================================================

backBtn.addEventListener(
    "click",
    function () {

        window.location.href =
            "home.html";

    }
);


// =====================================================
// SCROLL CHAT
// =====================================================

function scrollChat() {

    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}