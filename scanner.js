let stream = null;

const camera = document.getElementById("camera");
const canvas = document.getElementById("canvas");

const startCameraBtn = document.getElementById("startCameraBtn");
const captureBtn = document.getElementById("captureBtn");
const imageInput = document.getElementById("imageInput");

const processing = document.getElementById("processing");
const resultSection = document.getElementById("resultSection");
const cameraMessage = document.getElementById("cameraMessage");


// =====================================================
// CAMERA
// =====================================================

startCameraBtn.addEventListener("click", async function () {

    try {

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert("Camera is not supported by this browser.");
            return;
        }

        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: {
                    ideal: "environment"
                },
                width: {
                    ideal: 1280
                },
                height: {
                    ideal: 720
                }
            },
            audio: false
        });

        camera.srcObject = stream;

        captureBtn.disabled = false;

        cameraMessage.textContent =
            "Place the medicine clearly inside the frame";

        startCameraBtn.textContent = "✓ Camera Ready";

    } catch (error) {

        console.error("Camera Error:", error);

        alert(
            "Camera permission is not available. " +
            "You can use Upload Medicine Image instead."
        );

    }

});


// =====================================================
// CAPTURE PHOTO
// =====================================================

captureBtn.addEventListener("click", function () {

    if (!stream) {
        alert("Please start the camera first.");
        return;
    }

    const width = camera.videoWidth;
    const height = camera.videoHeight;

    if (!width || !height) {
        alert("Camera image is not ready. Please wait a moment.");
        return;
    }

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    context.drawImage(
        camera,
        0,
        0,
        width,
        height
    );

    canvas.toBlob(function (blob) {

        if (blob) {
            processMedicineImage(blob);
        }

    }, "image/jpeg", 0.95);

});


// =====================================================
// UPLOAD IMAGE
// =====================================================

imageInput.addEventListener("change", function () {

    const file = imageInput.files[0];

    if (!file) {
        return;
    }

    if (!file.type.startsWith("image/")) {
        alert("Please select an image file.");
        return;
    }

    processMedicineImage(file);

});


// =====================================================
// MAIN IMAGE PROCESSING
// =====================================================

async function processMedicineImage(image) {

    processing.classList.remove("hidden");
    resultSection.classList.add("hidden");

    cameraMessage.textContent = "Preparing image...";

    try {

        const imageData = await loadImage(image);

        const angles = [0, 90, 180, 270];

        let bestResult = "";
        let bestScore = -1;

        for (const angle of angles) {

            cameraMessage.textContent =
                `Reading medicine package... ${angle}°`;

            const processedCanvas =
                createProcessedCanvas(imageData, angle);

            const result = await Tesseract.recognize(
                processedCanvas,
                "eng",
                {
                    logger: function (info) {

                        if (
                            info.status === "recognizing text" &&
                            info.progress
                        ) {

                            const progress =
                                Math.round(info.progress * 100);

                            cameraMessage.textContent =
                                `Reading package... ${progress}%`;
                        }

                    },

                    tessedit_pageseg_mode: "6"
                }
            );

            const text = result.data.text || "";

            const score = calculateOCRScore(text);

            console.log(
                `OCR ${angle}° score:`,
                score,
                text
            );

            if (score > bestScore) {

                bestScore = score;
                bestResult = text;

            }
        }

        console.log("BEST OCR RESULT:");
        console.log(bestResult);

        showMedicineDetails(bestResult);

    } catch (error) {

        console.error("OCR Error:", error);

        alert(
            "The medicine image could not be read. " +
            "Please upload a clearer, straight image."
        );

    } finally {

        processing.classList.add("hidden");

        cameraMessage.textContent =
            "Place the medicine inside the frame";
    }

}


// =====================================================
// LOAD IMAGE
// =====================================================

function loadImage(source) {

    return new Promise(function (resolve, reject) {

        const img = new Image();

        img.onload = function () {
            resolve(img);
        };

        img.onerror = function () {
            reject(new Error("Unable to load image."));
        };

        if (source instanceof Blob) {

            img.src = URL.createObjectURL(source);

        } else {

            img.src = source;

        }

    });

}


// =====================================================
// IMAGE PROCESSING
// =====================================================

function createProcessedCanvas(img, angle) {

    const maxWidth = 1800;

    let width = img.width;
    let height = img.height;

    if (width > maxWidth) {

        const ratio = maxWidth / width;

        width = maxWidth;
        height = Math.round(height * ratio);

    }

    const radians = angle * Math.PI / 180;

    const rotated90 =
        angle === 90 || angle === 270;

    const canvas = document.createElement("canvas");

    if (rotated90) {

        canvas.width = height;
        canvas.height = width;

    } else {

        canvas.width = width;
        canvas.height = height;

    }

    const ctx = canvas.getContext("2d");

    ctx.translate(
        canvas.width / 2,
        canvas.height / 2
    );

    ctx.rotate(radians);

    ctx.drawImage(
        img,
        -width / 2,
        -height / 2,
        width,
        height
    );

    // ---------------------------------------------
    // Convert image to grayscale + improve contrast
    // ---------------------------------------------

    const imageData = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
    );

    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {

        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Grayscale
        let gray =
            (0.299 * r) +
            (0.587 * g) +
            (0.114 * b);

        // Contrast
        gray =
            ((gray - 128) * 1.35) + 128;

        gray = Math.max(
            0,
            Math.min(255, gray)
        );

        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
    }

    ctx.putImageData(
        imageData,
        0,
        0
    );

    return canvas;

}


// =====================================================
// OCR QUALITY SCORE
// =====================================================

function calculateOCRScore(text) {

    if (!text) {
        return 0;
    }

    let score = 0;

    const upper = text.toUpperCase();

    // More readable text = better score
    score += Math.min(text.length, 500) / 10;

    // Important medicine keywords
    const keywords = [
        "MFG",
        "MFD",
        "MANUFACTURING",
        "MANUFACTURED",
        "EXP",
        "EXPIRY",
        "EXPIRATION",
        "BATCH",
        "LOT",
        "TABLET",
        "CAPSULE",
        "MG",
        "ML",
        "PHARMACEUTICAL",
        "MEDICINE"
    ];

    keywords.forEach(function (keyword) {

        if (upper.includes(keyword)) {
            score += 15;
        }

    });

    return score;

}


// =====================================================
// SHOW MEDICINE DETAILS
// =====================================================

function showMedicineDetails(text) {

    const cleanText =
        cleanOCRText(text);

    document.getElementById("detectedText").textContent =
        cleanText || "No readable text detected.";


    // Medicine name
    const medicineName =
        findMedicineName(cleanText);

    document.getElementById("medicineName").textContent =
        medicineName;


    // Manufacturing date
    const manufacturingDate =
        findDateByKeyword(
            cleanText,
            [
                "MFG",
                "MFD",
                "MANUFACTURED",
                "MANUFACTURING"
            ]
        );

    document.getElementById("manufacturingDate").textContent =
        manufacturingDate;


    // Expiry date
    const expiryDate =
        findDateByKeyword(
            cleanText,
            [
                "EXP",
                "EXPIRY",
                "EXPIRATION",
                "USE BEFORE"
            ]
        );

    document.getElementById("expiryDate").textContent =
        expiryDate;


    // Batch
    const batchNumber =
        findBatchNumber(cleanText);

    document.getElementById("batchNumber").textContent =
        batchNumber;


    // Manufacturer
    const manufacturer =
        findManufacturer(cleanText);

    document.getElementById("manufacturer").textContent =
        manufacturer;


    // Expiry status
    updateExpiryStatus(expiryDate);


    resultSection.classList.remove("hidden");

    resultSection.scrollIntoView({
        behavior: "smooth"
    });

}


// =====================================================
// CLEAN OCR TEXT
// =====================================================

function cleanOCRText(text) {

    return text
        .replace(/\r/g, "")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{2,}/g, "\n")
        .trim();

}


// =====================================================
// MEDICINE NAME
// =====================================================

function findMedicineName(text) {

    const lines =
        text
            .split("\n")
            .map(line => line.trim())
            .filter(line => line.length >= 4);


    const ignoredWords = [
        "MFG",
        "MFD",
        "EXP",
        "EXPIRY",
        "BATCH",
        "LOT",
        "MRP",
        "TABLET",
        "TABLETS",
        "CAPSULE",
        "CAPSULES",
        "COMPOSITION",
        "PHARMACEUTICAL",
        "MANUFACTURED",
        "WARNING",
        "STORAGE",
        "DOSAGE"
    ];


    for (const line of lines) {

        const upper = line.toUpperCase();

        if (
            ignoredWords.some(word =>
                upper.includes(word)
            )
        ) {
            continue;
        }

        // Skip lines that are mostly numbers
        const letters =
            line.replace(/[^A-Za-z]/g, "").length;

        if (letters < 3) {
            continue;
        }

        // Avoid extremely long paragraph lines
        if (line.length > 80) {
            continue;
        }

        return line.substring(0, 60);

    }

    return "Not detected";

}


// =====================================================
// DATE DETECTION
// =====================================================

function findDateByKeyword(text, keywords) {

    const lines =
        text.split("\n");


    for (const line of lines) {

        const upper =
            line.toUpperCase();

        const hasKeyword =
            keywords.some(keyword =>
                upper.includes(keyword)
            );

        if (!hasKeyword) {
            continue;
        }


        // DD/MM/YYYY
        let match =
            line.match(
                /\b\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}\b/
            );

        if (match) {
            return match[0];
        }


        // MM/YYYY
        match =
            line.match(
                /\b\d{1,2}[\/.-]\d{2,4}\b/
            );

        if (match) {
            return match[0];
        }


        // Month YYYY
        match =
            line.match(
                /\b(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*[ -]\d{2,4}\b/i
            );

        if (match) {
            return match[0];
        }

    }

    return "Not detected";

}


// =====================================================
// BATCH NUMBER
// =====================================================

function findBatchNumber(text) {

    const lines =
        text.split("\n");


    for (const line of lines) {

        const match =
            line.match(
                /(?:BATCH|BATCH NO|BATCH NUMBER|LOT)[\s:.-]*([A-Z0-9\/-]{3,})/i
            );

        if (match) {

            return match[1];

        }

    }

    return "Not detected";

}


// =====================================================
// MANUFACTURER
// =====================================================

function findManufacturer(text) {

    const lines =
        text.split("\n");


    for (const line of lines) {

        if (
            /MANUFACTURED BY|MANUFACTURER|MFR/i.test(line)
        ) {

            const parts =
                line.split(/MANUFACTURED BY|MANUFACTURER|MFR/i);

            if (
                parts.length > 1 &&
                parts[1].trim().length > 2
            ) {

                return parts[1]
                    .replace(/^[:\-\s]+/, "")
                    .trim()
                    .substring(0, 80);

            }

        }

    }

    return "Not detected";

}


// =====================================================
// EXPIRY STATUS
// =====================================================

function updateExpiryStatus(expiryText) {

    const status =
        document.getElementById("expiryStatus");


    if (
        !expiryText ||
        expiryText === "Not detected"
    ) {

        status.textContent =
            "⚠️ Expiry date could not be detected. Please verify manually.";

        status.style.background =
            "#fff8e6";

        status.style.color =
            "#735d28";

        return;
    }


    const date =
        parseExpiryDate(expiryText);


    if (!date) {

        status.textContent =
            "⚠️ Expiry date detected but could not be verified automatically.";

        status.style.background =
            "#fff8e6";

        status.style.color =
            "#735d28";

        return;
    }


    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    if (date < today) {

        status.textContent =
            "❌ This medicine appears to be expired. Verify the package before use.";

        status.style.background =
            "#fff0f0";

        status.style.color =
            "#c0392b";

    } else {

        status.textContent =
            "✓ Expiry date appears to be valid. Please verify the package.";

        status.style.background =
            "#eaf8f4";

        status.style.color =
            "#168b75";

    }

}


// =====================================================
// PARSE EXPIRY DATE
// =====================================================

function parseExpiryDate(text) {

    let match =
        text.match(
            /^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})$/
        );


    if (match) {

        let day =
            parseInt(match[1]);

        let month =
            parseInt(match[2]);

        let year =
            parseInt(match[3]);

        if (year < 100) {
            year += 2000;
        }

        return new Date(
            year,
            month - 1,
            day
        );

    }


    match =
        text.match(
            /^(\d{1,2})[\/.-](\d{2,4})$/
        );


    if (match) {

        let month =
            parseInt(match[1]);

        let year =
            parseInt(match[2]);

        if (year < 100) {
            year += 2000;
        }

        // Last day of expiry month
        return new Date(
            year,
            month,
            0
        );

    }


    return null;

}


// =====================================================
// BACK BUTTON
// =====================================================

document.getElementById("backBtn").addEventListener(
    "click",
    function () {

        stopCamera();

        window.location.href =
            "home.html";

    }
);


// =====================================================
// SCAN AGAIN
// =====================================================

document.getElementById("scanAgainBtn").addEventListener(
    "click",
    function () {

        resultSection.classList.add("hidden");

        imageInput.value = "";

        cameraMessage.textContent =
            "Place the medicine inside the frame";

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }
);


// =====================================================
// STOP CAMERA
// =====================================================

function stopCamera() {

    if (!stream) {
        return;
    }

    stream.getTracks().forEach(
        function (track) {
            track.stop();
        }
    );

    stream = null;

}
// =====================================================
// SAVE SCANNED MEDICINE TO HEALTH RECORDS
// =====================================================

const saveRecordBtn =
    document.getElementById("saveRecordBtn");


if (saveRecordBtn) {

    saveRecordBtn.addEventListener(
        "click",
        function () {

            const medicineName =
                document.getElementById("medicineName").textContent.trim();

            const manufacturingDate =
                document.getElementById("manufacturingDate").textContent.trim();

            const expiryDate =
                document.getElementById("expiryDate").textContent.trim();

            const batchNumber =
                document.getElementById("batchNumber").textContent.trim();

            const manufacturer =
                document.getElementById("manufacturer").textContent.trim();


            if (
                !medicineName ||
                medicineName === "Not detected"
            ) {

                alert(
                    "Medicine name could not be detected."
                );

                return;

            }


            const scannedRecord = {

                id: Date.now(),

                type: "Prescription",

                title: medicineName,

                date: new Date()
                    .toISOString()
                    .split("T")[0],

                doctor:
                    manufacturer !== "Not detected"
                        ? manufacturer
                        : "",

                notes:
                    `Manufacturing Date: ${manufacturingDate}
Expiry Date: ${expiryDate}
Batch Number: ${batchNumber}
Manufacturer: ${manufacturer}
Source: Medicine Scanner`

            };


            let healthRecords =
                JSON.parse(
                    localStorage.getItem("healthRecords")
                ) || [];


            healthRecords.push(
                scannedRecord
            );


            localStorage.setItem(
                "healthRecords",
                JSON.stringify(healthRecords)
            );


            alert(
                "Medicine saved to Health Records successfully! 📋"
            );


            window.location.href =
                "records.html";

        }
    );

}