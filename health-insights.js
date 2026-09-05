// =====================================================
// 📊 HEALTH INSIGHTS — DATABASE + CURRENT USER DATA
// =====================================================

const API_BASE = "http://localhost:5000";
const backBtn = document.getElementById("backBtn");
const stepsInsight = document.getElementById("stepsInsight");
const stepsInsightText = document.getElementById("stepsInsightText");
const waterInsight = document.getElementById("waterInsight");
const waterInsightText = document.getElementById("waterInsightText");
const medicineInsight = document.getElementById("medicineInsight");
const medicineInsightText = document.getElementById("medicineInsightText");
const recordsInsight = document.getElementById("recordsInsight");
const recordsInsightText = document.getElementById("recordsInsightText");
const dailyInsights = document.getElementById("dailyInsights");

let currentUser = null;
let healthData = {
    steps_count: 0,
    steps_goal: 8000,
    water_count: 0,
    water_goal: 8
};
let recordCount = 0;

try {
    currentUser = JSON.parse(localStorage.getItem("healthAppUser"));
} catch (error) {
    currentUser = null;
}

if (!currentUser || !currentUser.id) {
    window.location.href = "login.html";
    throw new Error("No logged-in user.");
}

const MEDICINE_KEY = `healthMedicines_${currentUser.id}`;

if (backBtn) {
    backBtn.addEventListener("click", function () {
        window.location.href = "home.html";
    });
}

function getMedicineCount() {
    try {
        const medicines = JSON.parse(localStorage.getItem(MEDICINE_KEY));
        return Array.isArray(medicines) ? medicines.length : 0;
    } catch (error) {
        return 0;
    }
}

function addDailyInsight(icon, title, message) {
    if (!dailyInsights) return;
    const item = document.createElement("div");
    item.className = "daily-insight-item";
    item.innerHTML = `<span class="daily-insight-icon">${icon}</span><div><strong>${title}</strong><p>${message}</p></div>`;
    dailyInsights.appendChild(item);
}

function updateUI() {
    const steps = Number(healthData.steps_count) || 0;
    const stepsGoal = Number(healthData.steps_goal) || 8000;
    const water = Number(healthData.water_count) || 0;
    const waterGoal = Number(healthData.water_goal) || 8;
    const medicines = getMedicineCount();

    if (stepsInsight) {
        stepsInsight.textContent = `${steps.toLocaleString()} / ${stepsGoal.toLocaleString()} steps`;
    }
    if (stepsInsightText) {
        const remaining = Math.max(0, stepsGoal - steps);
        stepsInsightText.textContent = remaining === 0
            ? "🎉 Daily step goal completed. Great job!"
            : `${remaining.toLocaleString()} steps remaining to reach your goal.`;
    }

    if (waterInsight) {
        waterInsight.textContent = `${water} / ${waterGoal} glasses`;
    }
    if (waterInsightText) {
        const remaining = Math.max(0, waterGoal - water);
        waterInsightText.textContent = remaining === 0
            ? "💧 Water goal completed."
            : `${remaining} glass${remaining === 1 ? "" : "es"} remaining to reach your goal.`;
    }

    if (medicineInsight) medicineInsight.textContent = medicines;
    if (medicineInsightText) {
        medicineInsightText.textContent = medicines === 0
            ? "No medicine reminders saved for this user yet."
            : `You have ${medicines} medicine reminder${medicines === 1 ? "" : "s"}.`;
    }

    if (recordsInsight) recordsInsight.textContent = recordCount;
    if (recordsInsightText) {
        recordsInsightText.textContent = recordCount === 0
            ? "No health records saved for this user yet."
            : `You have ${recordCount} saved health record${recordCount === 1 ? "" : "s"}.`;
    }

    if (dailyInsights) {
        dailyInsights.innerHTML = "";
        addDailyInsight("🚶", "Step Goal", steps >= stepsGoal ? "You reached today's step goal." : `${Math.max(0, stepsGoal - steps).toLocaleString()} more steps to go.`);
        addDailyInsight("💧", "Hydration", water >= waterGoal ? "You reached today's water goal." : `${Math.max(0, waterGoal - water)} more glass${waterGoal - water === 1 ? "" : "es"} to go.`);
        addDailyInsight("💚", "Keep Going", "Small, consistent habits support a healthier routine.");
    }
}

async function loadInsights() {
    try {
        const [healthResponse, recordsResponse] = await Promise.all([
            fetch(`${API_BASE}/api/health/${currentUser.id}`),
            fetch(`${API_BASE}/api/records/${currentUser.id}`)
        ]);

        const healthResult = await healthResponse.json();
        const recordsResult = await recordsResponse.json();

        if (healthResponse.ok && healthResult.health) {
            healthData = healthResult.health;
        }

        if (recordsResponse.ok && Array.isArray(recordsResult.records)) {
            recordCount = recordsResult.records.length;
        }

        updateUI();
    } catch (error) {
        console.error("Insights loading error:", error);
        updateUI();
    }
}

loadInsights();
