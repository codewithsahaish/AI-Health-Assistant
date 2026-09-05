// =====================================================
// 🏥 AI HEALTH ASSISTANT - COMPLETE SERVER
// =====================================================

const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({
    path: path.join(__dirname, ".env")
});

const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const { GoogleGenAI } = require("@google/genai");
const webpush = require("web-push");

const app = express();
// =====================================================
// 🔔 WEB PUSH NOTIFICATIONS
// =====================================================

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT;

if (
    VAPID_PUBLIC_KEY &&
    VAPID_PRIVATE_KEY &&
    VAPID_SUBJECT
) {
    webpush.setVapidDetails(
        VAPID_SUBJECT,
        VAPID_PUBLIC_KEY,
        VAPID_PRIVATE_KEY
    );

    console.log("✅ Web Push notifications configured.");
} else {
    console.warn(
        "⚠️ Web Push is not configured. Check VAPID values in .env"
    );
}


// =====================================================
// ⚙️ MIDDLEWARE
// =====================================================

app.use(cors());

app.use(
    express.json({
        limit: "10mb"
    })
);
// =====================================================
// 🌐 SERVE FRONTEND FROM SAME NODE SERVER
// =====================================================

app.use(
    express.static(
        path.join(__dirname, "..")
    )
);
// =====================================================
// 🌐 FRONTEND HTML FILES
// =====================================================

app.get("/medicine.html", function (req, res) {
    res.sendFile(
        path.join(__dirname, "..", "medicine.html")
    );
});

// =====================================================
// 🤖 GEMINI AI
// =====================================================

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});


// =====================================================
// 🗄️ SQLITE DATABASE
// =====================================================

const dbPath =
    path.join(__dirname, "reviews.db");

const db =
    new sqlite3.Database(
        dbPath,
        function (error) {

            if (error) {

                console.error(
                    "Database connection error:",
                    error
                );

            } else {

                console.log(
                    "SQLite database connected."
                );

            }

        }
    );


// =====================================================
// 👤 USERS TABLE
// =====================================================

db.run(
    `
    CREATE TABLE IF NOT EXISTS users (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        name TEXT NOT NULL,

        email TEXT NOT NULL UNIQUE,

        password_hash TEXT NOT NULL,

        steps_goal INTEGER DEFAULT 8000,

        water_goal INTEGER DEFAULT 8,

        profile_photo TEXT,

        created_at DATETIME
            DEFAULT CURRENT_TIMESTAMP

    )
    `,
    function (error) {

        if (error) {

            console.error(
                "Unable to create users table:",
                error
            );

        } else {

            console.log(
                "Users table ready."
            );

        }

    }
);


// =====================================================
// 👤 USER TABLE MIGRATION
// =====================================================

db.serialize(() => {

    db.all(
        `PRAGMA table_info(users)`,
        [],
        function (
            error,
            columns
        ) {

            if (error) {

                console.error(
                    "Unable to inspect users table:",
                    error
                );

                return;

            }

            const columnNames =
                columns.map(
                    column =>
                        column.name
                );


            // =================================================
            // STEPS GOAL
            // =================================================

            if (
                !columnNames.includes(
                    "steps_goal"
                )
            ) {

                db.run(
                    `
                    ALTER TABLE users
                    ADD COLUMN steps_goal INTEGER
                    DEFAULT 8000
                    `,
                    function (migrationError) {

                        if (migrationError) {

                            console.error(
                                "Steps goal migration error:",
                                migrationError
                            );

                        } else {

                            console.log(
                                "✅ steps_goal column added."
                            );

                        }

                    }
                );

            }


            // =================================================
            // WATER GOAL
            // =================================================

            if (
                !columnNames.includes(
                    "water_goal"
                )
            ) {

                db.run(
                    `
                    ALTER TABLE users
                    ADD COLUMN water_goal INTEGER
                    DEFAULT 8
                    `,
                    function (migrationError) {

                        if (migrationError) {

                            console.error(
                                "Water goal migration error:",
                                migrationError
                            );

                        } else {

                            console.log(
                                "✅ water_goal column added."
                            );

                        }

                    }
                );

            }


            // =================================================
            // PROFILE PHOTO
            // =================================================

            if (
                !columnNames.includes(
                    "profile_photo"
                )
            ) {

                db.run(
                    `
                    ALTER TABLE users
                    ADD COLUMN profile_photo TEXT
                    `,
                    function (migrationError) {

                        if (migrationError) {

                            console.error(
                                "Profile photo migration error:",
                                migrationError
                            );

                        } else {

                            console.log(
                                "✅ profile_photo column added."
                            );

                        }

                    }
                );

            }

        }
    );

});


// =====================================================
// 🚶💧 HEALTH TRACKER TABLE
// =====================================================

db.run(
    `
    CREATE TABLE IF NOT EXISTS health (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        user_id INTEGER NOT NULL UNIQUE,

        date TEXT NOT NULL,

        steps_count INTEGER NOT NULL DEFAULT 0,

        steps_goal INTEGER NOT NULL DEFAULT 8000,

        water_count INTEGER NOT NULL DEFAULT 0,

        water_goal INTEGER NOT NULL DEFAULT 8,

        created_at DATETIME
            DEFAULT CURRENT_TIMESTAMP,

        updated_at DATETIME
            DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (user_id)
            REFERENCES users(id)

    )
    `,
    function (error) {

        if (error) {

            console.error(
                "Unable to create health table:",
                error
            );

        } else {

            console.log(
                "Health tracker table ready."
            );

        }

    }
);


// =====================================================
// 📋 HEALTH RECORDS TABLE
// =====================================================

db.run(
    `
    CREATE TABLE IF NOT EXISTS health_records (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        user_id INTEGER NOT NULL,

        type TEXT NOT NULL,

        title TEXT NOT NULL,

        date TEXT NOT NULL,

        doctor TEXT,

        notes TEXT,

        created_at DATETIME
            DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (user_id)
            REFERENCES users(id)

    )
    `,
    function (error) {

        if (error) {

            console.error(
                "Unable to create health_records table:",
                error
            );

        } else {

            console.log(
                "Health records table ready."
            );

        }

    }
);


// =====================================================
// 🚨 EMERGENCY CONTACTS TABLE
// =====================================================

db.run(
    `
    CREATE TABLE IF NOT EXISTS emergency_contacts (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        user_id INTEGER NOT NULL UNIQUE,

        name TEXT NOT NULL,

        phone TEXT NOT NULL,

        created_at DATETIME
            DEFAULT CURRENT_TIMESTAMP,

        updated_at DATETIME
            DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (user_id)
            REFERENCES users(id)

    )
    `,
    function (error) {

        if (error) {

            console.error(
                "Unable to create emergency_contacts table:",
                error
            );

        } else {

            console.log(
                "Emergency contacts table ready."
            );

        }

    }
);


// =====================================================
// ⭐ REVIEWS TABLE
// =====================================================

db.run(
    `
    CREATE TABLE IF NOT EXISTS reviews (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        user_id INTEGER,

        name TEXT NOT NULL,

        rating INTEGER NOT NULL,

        message TEXT NOT NULL,

        created_at DATETIME
            DEFAULT CURRENT_TIMESTAMP

    )
    `,
    function (error) {

        if (error) {

            console.error(
                "Unable to create reviews table:",
                error
            );

        } else {

            console.log(
                "Reviews table ready."
            );

        }

    }
);
// =====================================================
// 💊 MEDICINES TABLE
// =====================================================

db.run(
    `
    CREATE TABLE IF NOT EXISTS medicines (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        user_id INTEGER NOT NULL,

        name TEXT NOT NULL,

        dosage TEXT,

        frequency TEXT NOT NULL,

        time TEXT NOT NULL,

        start_date TEXT NOT NULL,

        end_date TEXT,

        created_at DATETIME
            DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (user_id)
            REFERENCES users(id)
            ON DELETE CASCADE
    )
    `,
    function (error) {

        if (error) {

            console.error(
                "Unable to create medicines table:",
                error
            );

        } else {

            console.log(
                "Medicine table ready."
            );

        }

    }
);


// =====================================================
// 🔔 PUSH SUBSCRIPTIONS TABLE
// =====================================================

db.run(
    `
    CREATE TABLE IF NOT EXISTS push_subscriptions (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        user_id INTEGER NOT NULL,

        endpoint TEXT NOT NULL UNIQUE,

        p256dh TEXT NOT NULL,

        auth TEXT NOT NULL,

        created_at DATETIME
            DEFAULT CURRENT_TIMESTAMP,

        updated_at DATETIME
            DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (user_id)
            REFERENCES users(id)
            ON DELETE CASCADE
    )
    `,
    function (error) {

        if (error) {

            console.error(
                "Unable to create push_subscriptions table:",
                error
            );

        } else {

            console.log(
                "Push subscriptions table ready."
            );

        }

    }
);


// =====================================================
// 🔔 MEDICINE REMINDER LOG
// =====================================================

db.run(
    `
    CREATE TABLE IF NOT EXISTS medicine_reminder_logs (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        medicine_id INTEGER NOT NULL,

        user_id INTEGER NOT NULL,

        reminder_date TEXT NOT NULL,

        reminder_time TEXT NOT NULL,

        sent_at DATETIME
            DEFAULT CURRENT_TIMESTAMP,

        UNIQUE (
            medicine_id,
            reminder_date,
            reminder_time
        ),

        FOREIGN KEY (medicine_id)
            REFERENCES medicines(id)
            ON DELETE CASCADE,

        FOREIGN KEY (user_id)
            REFERENCES users(id)
            ON DELETE CASCADE
    )
    `,
    function (error) {

        if (error) {

            console.error(
                "Unable to create medicine_reminder_logs table:",
                error
            );

        } else {

            console.log(
                "Medicine reminder log table ready."
            );

        }

    }
);


// =====================================================
// ⭐ REVIEW USER_ID MIGRATION
// =====================================================

db.serialize(() => {

    db.all(
        `PRAGMA table_info(reviews)`,
        [],
        function (
            error,
            columns
        ) {

            if (error) {

                console.error(
                    "Unable to inspect reviews table:",
                    error
                );

                return;

            }

            const hasUserId =
                columns.some(
                    column =>
                        column.name === "user_id"
                );


            if (!hasUserId) {

                db.run(
                    `
                    ALTER TABLE reviews
                    ADD COLUMN user_id INTEGER
                    `,
                    function (migrationError) {

                        if (migrationError) {

                            console.error(
                                "Review user_id migration error:",
                                migrationError
                            );

                        } else {

                            console.log(
                                "✅ user_id added to reviews."
                            );

                        }

                    }
                );

            }


            db.run(
                `
                CREATE UNIQUE INDEX IF NOT EXISTS
                unique_review_per_user

                ON reviews(user_id)

                WHERE user_id IS NOT NULL
                `,
                function (indexError) {

                    if (indexError) {

                        console.error(
                            "Review unique index error:",
                            indexError
                        );

                    } else {

                        console.log(
                            "✅ One-review-per-user rule ready."
                        );

                    }

                }
            );

        }
    );

});


// =====================================================
// 🤖 AI HEALTH CHAT
// =====================================================

app.post(
    "/api/health-chat",
    async function (
        req,
        res
    ) {

        try {

            if (!process.env.GEMINI_API_KEY) {
                return res.status(503).json({
                    error: "Gemini is not configured. Add GEMINI_API_KEY to server/.env and restart the server."
                });
            }

            const userMessage =
                req.body.message;

            const conversation =
                req.body.conversation || [];


            // =================================================
            // EMERGENCY CHECK
            // =================================================

            const emergencyKeywords = [

                "severe chest pain",
                "chest pain and difficulty breathing",
                "difficulty breathing",
                "can't breathe",
                "cannot breathe",
                "unconscious",
                "not breathing",
                "severe bleeding",
                "heavy bleeding",
                "stroke",
                "face drooping",
                "slurred speech",
                "sudden weakness",
                "severe allergic reaction",
                "anaphylaxis"

            ];


            const lowerMessage =
                userMessage
                    ? userMessage.toLowerCase()
                    : "";


            const emergencyDetected =
                emergencyKeywords.some(
                    function (
                        keyword
                    ) {

                        return lowerMessage.includes(
                            keyword
                        );

                    }
                );


            if (emergencyDetected) {

                return res.json({

                    emergency:
                        true,

                    reply:
                        `🚨 This may be a medical emergency.

The symptoms you described could require urgent medical attention.

Please seek emergency medical care immediately or contact your local emergency medical service.

Do not rely on an AI assistant for emergency diagnosis or treatment.

If possible, stay with someone you trust and follow instructions from qualified medical professionals.`

                });

            }


            // =================================================
            // VALIDATE MESSAGE
            // =================================================

            if (
                !userMessage ||
                !userMessage.trim()
            ) {

                return res.status(
                    400
                ).json({

                    error:
                        "Message is required."

                });

            }


            // =================================================
            // CONVERSATION
            // =================================================

            const conversationText =
                conversation
                    .map(
                        function (
                            item
                        ) {

                            return `${item.role}: ${item.content}`;

                        }
                    )
                    .join("\n");


            // =================================================
            // AI PROMPT
            // =================================================

            const prompt = `

You are AI Health Assistant.

You provide general health information in simple language.

You must NOT diagnose the user or claim to be a doctor.

For common symptoms, explain possible general causes and give
safe, general self-care suggestions when appropriate.

Ask useful follow-up questions when necessary.

Always mention important warning signs.

If the user describes a possible medical emergency such as severe
chest pain, severe difficulty breathing, unconsciousness, stroke-like
symptoms or severe bleeding, advise them to seek urgent medical care.

Do not prescribe prescription medicines.

For medicine questions, advise the user to check the package,
prescription, pharmacist or doctor.

Keep answers clear and easy to understand.

IMPORTANT:
Use the previous conversation below to understand the user's context.
Do not unnecessarily repeat questions that the user has already answered.

Previous conversation:
${conversationText}

Current user question:
${userMessage}

Give the most helpful response based on the conversation.

End health-related answers with a short reminder that this information
does not replace a qualified healthcare professional.

`;


            // =================================================
            // GEMINI
            // =================================================

            let response;
            let lastError;

            // Gemini can briefly return 503 when its free tier is busy.
            // Retry twice before sending a clear message to the user.
            for (let attempt = 0; attempt < 3; attempt++) {
                try {
                    response = await ai.models.generateContent({
                        model: "gemini-3.6-flash",
                        contents: prompt
                    });
                    break;
                } catch (requestError) {
                    lastError = requestError;

                    if (
                        Number(requestError.status) !== 503 ||
                        attempt === 2
                    ) {
                        throw requestError;
                    }

                    await new Promise(function (resolve) {
                        setTimeout(resolve, 1500 * (attempt + 1));
                    });
                }
            }


            res.json({

                reply:
                    response.text

            });


        } catch (error) {

            console.error(
                "Gemini Error:",
                error
            );


            const isBusy = Number(error.status) === 503;

            res.status(isBusy ? 503 : 500).json({
                error: isBusy
                    ? "Gemini is busy right now. Please try again in a minute."
                    : "Unable to get AI response."
            });

        }

    }
);


// =====================================================
// 👤 CREATE ACCOUNT
// =====================================================

app.post(
    "/api/auth/register",
    async function (
        req,
        res
    ) {

        try {

            const {
                name,
                email,
                password
            } = req.body;


            // =================================================
            // VALIDATION
            // =================================================

            if (
                !name ||
                !name.trim()
            ) {

                return res.status(
                    400
                ).json({

                    error:
                        "Full name is required."

                });

            }


            if (
                !email ||
                !email.trim()
            ) {

                return res.status(
                    400
                ).json({

                    error:
                        "Email is required."

                });

            }


            if (!password) {

                return res.status(
                    400
                ).json({

                    error:
                        "Password is required."

                });

            }


            if (
                password.length < 6
            ) {

                return res.status(
                    400
                ).json({

                    error:
                        "Password must be at least 6 characters."

                });

            }


            const cleanName =
                name.trim();


            const cleanEmail =
                email
                    .trim()
                    .toLowerCase();


            // =================================================
            // CHECK EXISTING EMAIL
            // =================================================

            db.get(
                `
                SELECT id
                FROM users
                WHERE email = ?
                `,
                [
                    cleanEmail
                ],
                async function (
                    error,
                    existingUser
                ) {

                    if (error) {

                        console.error(
                            "User lookup error:",
                            error
                        );

                        return res.status(
                            500
                        ).json({

                            error:
                                "Unable to create account."

                        });

                    }


                    if (existingUser) {

                        return res.status(
                            409
                        ).json({

                            error:
                                "An account with this email already exists."

                        });

                    }


                    // =================================================
                    // HASH PASSWORD
                    // =================================================

                    const passwordHash =
                        await bcrypt.hash(
                            password,
                            12
                        );


                    // =================================================
                    // CREATE USER
                    // =================================================

                    db.run(
                        `
                        INSERT INTO users
                        (
                            name,
                            email,
                            password_hash,
                            steps_goal,
                            water_goal
                        )
                        VALUES
                        (?, ?, ?, 8000, 8)
                        `,
                        [
                            cleanName,
                            cleanEmail,
                            passwordHash
                        ],
                        function (
                            insertError
                        ) {

                            if (insertError) {

                                console.error(
                                    "User creation error:",
                                    insertError
                                );

                                return res.status(
                                    500
                                ).json({

                                    error:
                                        "Unable to create account."

                                });

                            }


                            res.status(
                                201
                            ).json({

                                success:
                                    true,

                                message:
                                    "Account created successfully.",

                                user: {

                                    id:
                                        this.lastID,

                                    name:
                                        cleanName,

                                    email:
                                        cleanEmail

                                }

                            });

                        }
                    );

                }
            );

        } catch (error) {

            console.error(
                "Register Error:",
                error
            );


            res.status(
                500
            ).json({

                error:
                    "Unable to create account."

            });

        }

    }
);


// =====================================================
// 👤 GUEST LOGIN
// =====================================================

app.post(
    "/api/auth/guest",
    async function (req, res) {

        try {

            const uniquePart = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
            const guestName = "Guest User";
            const guestEmail = `guest-${uniquePart}@demo.local`;
            const passwordHash = await bcrypt.hash(uniquePart, 12);

            db.run(
                `
                INSERT INTO users (name, email, password_hash, steps_goal, water_goal)
                VALUES (?, ?, ?, 8000, 8)
                `,
                [guestName, guestEmail, passwordHash],
                function (error) {

                    if (error) {
                        console.error("Guest account error:", error);
                        return res.status(500).json({
                            error: "Unable to create guest session."
                        });
                    }

                    return res.status(201).json({
                        success: true,
                        user: {
                            id: this.lastID,
                            name: guestName,
                            email: guestEmail,
                            isGuest: true
                        }
                    });

                }
            );

        } catch (error) {

            console.error("Guest login error:", error);
            return res.status(500).json({
                error: "Unable to create guest session."
            });

        }

    }
);


// =====================================================
// 🔐 LOGIN
// =====================================================

app.post(
    "/api/auth/login",
    function (
        req,
        res
    ) {

        const {
            email,
            password
        } = req.body;


        if (
            !email ||
            !email.trim()
        ) {

            return res.status(
                400
            ).json({

                error:
                    "Email is required."

            });

        }


        if (!password) {

            return res.status(
                400
            ).json({

                error:
                    "Password is required."

            });

        }


        const cleanEmail =
            email
                .trim()
                .toLowerCase();


        db.get(
            `
            SELECT
                id,
                name,
                email,
                password_hash
            FROM users
            WHERE email = ?
            `,
            [
                cleanEmail
            ],
            async function (
                error,
                user
            ) {

                if (error) {

                    console.error(
                        "Login lookup error:",
                        error
                    );

                    return res.status(
                        500
                    ).json({

                        error:
                            "Unable to login."

                    });

                }


                if (!user) {

                    return res.status(
                        401
                    ).json({

                        error:
                            "Invalid email or password."

                    });

                }


                const passwordMatch =
                    await bcrypt.compare(
                        password,
                        user.password_hash
                    );


                if (!passwordMatch) {

                    return res.status(
                        401
                    ).json({

                        error:
                            "Invalid email or password."

                    });

                }


                res.json({

                    success:
                        true,

                    message:
                        "Login successful.",

                    user: {

                        id:
                            user.id,

                        name:
                            user.name,

                        email:
                            user.email

                    }

                });

            }
        );

    }
);


// =====================================================
// 👤 GET PROFILE
// =====================================================

app.get(
    "/api/profile/:userId",
    function (
        req,
        res
    ) {

        const userId =
            Number(
                req.params.userId
            );


        if (
            !Number.isInteger(userId) ||
            userId <= 0
        ) {

            return res.status(
                400
            ).json({

                error:
                    "Invalid user ID."

            });

        }


        db.get(
            `
            SELECT
                id,
                name,
                email,
                steps_goal,
                water_goal,
                profile_photo
            FROM users
            WHERE id = ?
            `,
            [
                userId
            ],
            function (
                error,
                user
            ) {

                if (error) {

                    console.error(
                        "Profile fetch error:",
                        error
                    );

                    return res.status(
                        500
                    ).json({

                        error:
                            "Unable to load profile."

                    });

                }


                if (!user) {

                    return res.status(
                        404
                    ).json({

                        error:
                            "User not found."

                    });

                }


                res.json({

                    success:
                        true,

                    profile: {

                        id:
                            user.id,

                        name:
                            user.name,

                        email:
                            user.email,

                        steps:
                            user.steps_goal ||
                            8000,

                        water:
                            user.water_goal ||
                            8,

                        photo:
                            user.profile_photo ||
                            null

                    }

                });

            }
        );

    }
);


// =====================================================
// 👤 UPDATE PROFILE
// =====================================================

app.put(
    "/api/profile/:userId",
    function (
        req,
        res
    ) {

        const userId =
            Number(
                req.params.userId
            );


        const {
            name,
            email
        } = req.body;


        if (
            !Number.isInteger(userId) ||
            userId <= 0
        ) {

            return res.status(
                400
            ).json({

                error:
                    "Invalid user ID."

            });

        }


        if (
            !name ||
            !name.trim()
        ) {

            return res.status(
                400
            ).json({

                error:
                    "Name is required."

            });

        }


        if (
            !email ||
            !email.trim()
        ) {

            return res.status(
                400
            ).json({

                error:
                    "Email is required."

            });

        }


        const cleanName =
            name.trim();


        const cleanEmail =
            email
                .trim()
                .toLowerCase();


        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (
            !emailPattern.test(
                cleanEmail
            )
        ) {

            return res.status(
                400
            ).json({

                error:
                    "Invalid email address."

            });

        }


        db.get(
            `
            SELECT id
            FROM users
            WHERE email = ?
            AND id != ?
            `,
            [
                cleanEmail,
                userId
            ],
            function (
                error,
                existingUser
            ) {

                if (error) {

                    console.error(
                        "Email check error:",
                        error
                    );

                    return res.status(
                        500
                    ).json({

                        error:
                            "Unable to update profile."

                    });

                }


                if (existingUser) {

                    return res.status(
                        409
                    ).json({

                        error:
                            "This email is already registered with another account."

                    });

                }


                db.run(
                    `
                    UPDATE users
                    SET
                        name = ?,
                        email = ?
                    WHERE id = ?
                    `,
                    [
                        cleanName,
                        cleanEmail,
                        userId
                    ],
                    function (
                        updateError
                    ) {

                        if (updateError) {

                            console.error(
                                "Profile update error:",
                                updateError
                            );

                            return res.status(
                                500
                            ).json({

                                error:
                                    "Unable to update profile."

                            });

                        }


                        res.json({

                            success:
                                true,

                            message:
                                "Profile updated successfully.",

                            profile: {

                                id:
                                    userId,

                                name:
                                    cleanName,

                                email:
                                    cleanEmail

                            }

                        });

                    }
                );

            }
        );

    }
);


// =====================================================
// 🎯 UPDATE GOALS
// =====================================================

app.put(
    "/api/profile/:userId/goals",
    function (req, res) {

        const userId = Number(req.params.userId);

        const steps = Number(req.body.steps);
        const water = Number(req.body.water);

        if (
            !Number.isInteger(userId) ||
            userId <= 0
        ) {
            return res.status(400).json({
                error: "Invalid user ID."
            });
        }

        if (
            !Number.isInteger(steps) ||
            steps < 100 ||
            steps > 100000
        ) {
            return res.status(400).json({
                error: "Steps goal must be between 100 and 100,000."
            });
        }

        if (
            !Number.isInteger(water) ||
            water < 1 ||
            water > 30
        ) {
            return res.status(400).json({
                error: "Water goal must be between 1 and 30 glasses."
            });
        }

        // First verify user exists
        db.get(
            `
            SELECT id
            FROM users
            WHERE id = ?
            `,
            [userId],
            function (userError, user) {

                if (userError) {
                    console.error(
                        "Goals user lookup error:",
                        userError
                    );

                    return res.status(500).json({
                        error: "Unable to verify user."
                    });
                }

                if (!user) {
                    return res.status(404).json({
                        error: "User not found."
                    });
                }

                // Update profile goals
                db.run(
                    `
                    UPDATE users
                    SET
                        steps_goal = ?,
                        water_goal = ?
                    WHERE id = ?
                    `,
                    [
                        steps,
                        water,
                        userId
                    ],
                    function (userUpdateError) {

                        if (userUpdateError) {
                            console.error(
                                "Profile goals update error:",
                                userUpdateError
                            );

                            return res.status(500).json({
                                error: "Unable to save goals."
                            });
                        }

                        // Create the tracker row when this is the user's
                        // first goal save, otherwise update its goals.
                        db.run(
                            `
                            INSERT INTO health
                            (
                                user_id,
                                date,
                                steps_count,
                                steps_goal,
                                water_count,
                                water_goal
                            )
                            VALUES (?, DATE('now'), 0, ?, 0, ?)
                            ON CONFLICT(user_id) DO UPDATE SET
                                steps_goal = excluded.steps_goal,
                                water_goal = excluded.water_goal,
                                updated_at = CURRENT_TIMESTAMP
                            `,
                            [
                                userId,
                                steps,
                                water
                            ],
                            function (healthUpdateError) {

                                if (healthUpdateError) {
                                    console.error(
                                        "Health goals update error:",
                                        healthUpdateError
                                    );

                                    return res.status(500).json({
                                        error: "Goals saved to profile but could not sync with health data."
                                    });
                                }

                                res.json({
                                    success: true,
                                    message: "Goals saved successfully.",
                                    goals: {
                                        steps: steps,
                                        water: water
                                    }
                                });

                            }
                        );

                    }
                );

            }
        );

    }
);


// =====================================================
// 📷 UPDATE PROFILE PHOTO
// =====================================================

app.put(
    "/api/profile/:userId/photo",
    function (req, res) {

        const userId = Number(req.params.userId);
        const photo = req.body.photo;

        if (
            !Number.isInteger(userId) ||
            userId <= 0
        ) {
            return res.status(400).json({
                error: "Invalid user ID."
            });
        }

        // Allow removing photo
        if (
            photo !== null &&
            typeof photo !== "string"
        ) {
            return res.status(400).json({
                error: "Invalid profile photo."
            });
        }

        // If photo is supplied, validate it
        if (photo) {

            // Must be a data URL
            if (
                !photo.startsWith("data:image/")
            ) {
                return res.status(400).json({
                    error: "Invalid image format."
                });
            }

            // Prevent extremely large images
            if (
                Buffer.byteLength(photo, "utf8") >
                7 * 1024 * 1024
            ) {
                return res.status(400).json({
                    error: "Profile photo is too large. Maximum size is 7 MB."
                });
            }
        }

        // Verify user
        db.get(
            `
            SELECT id
            FROM users
            WHERE id = ?
            `,
            [userId],
            function (userError, user) {

                if (userError) {

                    console.error(
                        "Photo user lookup error:",
                        userError
                    );

                    return res.status(500).json({
                        error: "Unable to verify user."
                    });
                }

                if (!user) {

                    return res.status(404).json({
                        error: "User not found."
                    });
                }

                // Save photo
                db.run(
                    `
                    UPDATE users
                    SET profile_photo = ?
                    WHERE id = ?
                    `,
                    [
                        photo || null,
                        userId
                    ],
                    function (updateError) {

                        if (updateError) {

                            console.error(
                                "Photo update error:",
                                updateError
                            );

                            return res.status(500).json({
                                error: "Unable to save profile photo."
                            });
                        }

                        return res.json({
                            success: true,
                            message: "Profile photo saved successfully.",
                            photo: photo || null
                        });

                    }
                );

            }
        );

    }
);

// =====================================================
// 🚶💧 GET USER HEALTH DATA
// =====================================================

app.get(
    "/api/health/:userId",
    function (
        req,
        res
    ) {

        const userId =
            Number(
                req.params.userId
            );


        if (
            !Number.isInteger(userId) ||
            userId <= 0
        ) {

            return res.status(
                400
            ).json({

                error:
                    "Invalid user ID."

            });

        }


        db.get(
            `
            SELECT
                id,
                user_id,
                date,
                steps_count,
                steps_goal,
                water_count,
                water_goal
            FROM health
            WHERE user_id = ?
            `,
            [
                userId
            ],
            function (
                error,
                health
            ) {

                if (error) {

                    console.error(
                        "Health data fetch error:",
                        error
                    );

                    return res.status(
                        500
                    ).json({

                        error:
                            "Unable to load health data."

                    });

                }


                if (!health) {

                    const today =
                        new Date()
                            .toISOString()
                            .split("T")[0];


                    return res.json({

                        success:
                            true,

                        health: {

                            user_id:
                                userId,

                            date:
                                today,

                            steps_count:
                                0,

                            steps_goal:
                                8000,

                            water_count:
                                0,

                            water_goal:
                                8

                        }

                    });

                }


                res.json({

                    success:
                        true,

                    health:
                        health

                });

            }
        );

    }
);


// =====================================================
// 🚶💧 SAVE USER HEALTH DATA
// =====================================================

app.put(
    "/api/health/:userId",
    function (
        req,
        res
    ) {

        const userId =
            Number(
                req.params.userId
            );


        if (
            !Number.isInteger(userId) ||
            userId <= 0
        ) {

            return res.status(
                400
            ).json({

                error:
                    "Invalid user ID."

            });

        }


        const {
            stepsCount,
            stepsGoal,
            waterCount,
            waterGoal
        } = req.body;


        const cleanStepsCount =
            Math.max(
                0,
                Number(stepsCount) || 0
            );


        const cleanStepsGoal =
            Math.min(
                100000,
                Math.max(
                    100,
                    Number(stepsGoal) || 8000
                )
            );


        const cleanWaterCount =
            Math.max(
                0,
                Number(waterCount) || 0
            );


        const cleanWaterGoal =
            Math.min(
                30,
                Math.max(
                    1,
                    Number(waterGoal) || 8
                )
            );


        const today =
            new Date()
                .toISOString()
                .split("T")[0];


        // =================================================
        // CHECK USER
        // =================================================

        db.get(
            `
            SELECT id
            FROM users
            WHERE id = ?
            `,
            [
                userId
            ],
            function (
                userError,
                user
            ) {

                if (userError) {

                    console.error(
                        "Health user lookup error:",
                        userError
                    );

                    return res.status(
                        500
                    ).json({

                        error:
                            "Unable to verify user."

                    });

                }


                if (!user) {

                    return res.status(
                        404
                    ).json({

                        error:
                            "User not found."

                    });

                }


                // =================================================
                // CHECK EXISTING HEALTH DATA
                // =================================================

                db.get(
                    `
                    SELECT id
                    FROM health
                    WHERE user_id = ?
                    `,
                    [
                        userId
                    ],
                    function (
                        healthError,
                        existingHealth
                    ) {

                        if (healthError) {

                            console.error(
                                "Health lookup error:",
                                healthError
                            );

                            return res.status(
                                500
                            ).json({

                                error:
                                    "Unable to load health data."

                            });

                        }


                        // =================================================
                        // UPDATE
                        // =================================================

                        if (existingHealth) {

                            db.run(
                                `
                                UPDATE health

                                SET
                                    date = ?,
                                    steps_count = ?,
                                    steps_goal = ?,
                                    water_count = ?,
                                    water_goal = ?,
                                    updated_at = CURRENT_TIMESTAMP

                                WHERE user_id = ?
                                `,
                                [
                                    today,
                                    cleanStepsCount,
                                    cleanStepsGoal,
                                    cleanWaterCount,
                                    cleanWaterGoal,
                                    userId
                                ],
                                function (
                                    updateError
                                ) {

                                    if (updateError) {

                                        console.error(
                                            "Health update error:",
                                            updateError
                                        );

                                        return res.status(
                                            500
                                        ).json({

                                            error:
                                                "Unable to save health data."

                                        });

                                    }


                                    // Keep profile goals synced
                                    db.run(
                                        `
                                        UPDATE users
                                        SET
                                            steps_goal = ?,
                                            water_goal = ?
                                        WHERE id = ?
                                        `,
                                        [
                                            cleanStepsGoal,
                                            cleanWaterGoal,
                                            userId
                                        ]
                                    );


                                    res.json({

                                        success:
                                            true,

                                        message:
                                            "Health data saved successfully."

                                    });

                                }
                            );

                            return;

                        }


                        // =================================================
                        // CREATE
                        // =================================================

                        db.run(
                            `
                            INSERT INTO health
                            (
                                user_id,
                                date,
                                steps_count,
                                steps_goal,
                                water_count,
                                water_goal
                            )
                            VALUES
                            (?, ?, ?, ?, ?, ?)
                            `,
                            [
                                userId,
                                today,
                                cleanStepsCount,
                                cleanStepsGoal,
                                cleanWaterCount,
                                cleanWaterGoal
                            ],
                            function (
                                insertError
                            ) {

                                if (insertError) {

                                    console.error(
                                        "Health insert error:",
                                        insertError
                                    );

                                    return res.status(
                                        500
                                    ).json({

                                        error:
                                            "Unable to save health data."

                                    });

                                }


                                db.run(
                                    `
                                    UPDATE users
                                    SET
                                        steps_goal = ?,
                                        water_goal = ?
                                    WHERE id = ?
                                    `,
                                    [
                                        cleanStepsGoal,
                                        cleanWaterGoal,
                                        userId
                                    ]
                                );


                                res.status(
                                    201
                                ).json({

                                    success:
                                        true,

                                    message:
                                        "Health data created successfully."

                                });

                            }
                        );

                    }
                );

            }
        );

    }
);


// =====================================================
// 🚨 GET EMERGENCY CONTACT
// =====================================================

app.get(
    "/api/emergency/:userId",
    function (
        req,
        res
    ) {

        const userId =
            Number(
                req.params.userId
            );


        if (
            !Number.isInteger(userId) ||
            userId <= 0
        ) {

            return res.status(
                400
            ).json({

                error:
                    "Invalid user ID."

            });

        }


        db.get(
            `
            SELECT
                id,
                user_id,
                name,
                phone
            FROM emergency_contacts
            WHERE user_id = ?
            `,
            [
                userId
            ],
            function (
                error,
                contact
            ) {

                if (error) {

                    console.error(
                        "Emergency contact fetch error:",
                        error
                    );

                    return res.status(
                        500
                    ).json({

                        error:
                            "Unable to load emergency contact."

                    });

                }


                res.json({

                    success:
                        true,

                    contact:
                        contact || null

                });

            }
        );

    }
);


// =====================================================
// 🚨 SAVE EMERGENCY CONTACT
// =====================================================

app.put(
    "/api/emergency/:userId",
    function (
        req,
        res
    ) {

        const userId =
            Number(
                req.params.userId
            );


        const {
            name,
            phone
        } = req.body;


        if (
            !Number.isInteger(userId) ||
            userId <= 0
        ) {

            return res.status(
                400
            ).json({

                error:
                    "Invalid user ID."

            });

        }


        if (
            !name ||
            !name.trim()
        ) {

            return res.status(
                400
            ).json({

                error:
                    "Emergency contact name is required."

            });

        }


        if (
            !phone ||
            !phone.trim()
        ) {

            return res.status(
                400
            ).json({

                error:
                    "Emergency contact phone is required."

            });

        }


        const cleanName =
            name.trim();

        const cleanPhone =
            phone.trim();


        db.get(
            `
            SELECT id
            FROM users
            WHERE id = ?
            `,
            [
                userId
            ],
            function (
                userError,
                user
            ) {

                if (userError) {

                    console.error(
                        "Emergency user lookup error:",
                        userError
                    );

                    return res.status(
                        500
                    ).json({

                        error:
                            "Unable to verify user."

                    });

                }


                if (!user) {

                    return res.status(
                        404
                    ).json({

                        error:
                            "User not found."

                    });

                }


                db.get(
                    `
                    SELECT id
                    FROM emergency_contacts
                    WHERE user_id = ?
                    `,
                    [
                        userId
                    ],
                    function (
                        contactError,
                        existingContact
                    ) {

                        if (contactError) {

                            console.error(
                                "Emergency contact lookup error:",
                                contactError
                            );

                            return res.status(
                                500
                            ).json({

                                error:
                                    "Unable to load emergency contact."

                            });

                        }


                        if (existingContact) {

                            db.run(
                                `
                                UPDATE emergency_contacts
                                SET
                                    name = ?,
                                    phone = ?,
                                    updated_at = CURRENT_TIMESTAMP
                                WHERE user_id = ?
                                `,
                                [
                                    cleanName,
                                    cleanPhone,
                                    userId
                                ],
                                function (
                                    updateError
                                ) {

                                    if (updateError) {

                                        console.error(
                                            "Emergency contact update error:",
                                            updateError
                                        );

                                        return res.status(
                                            500
                                        ).json({

                                            error:
                                                "Unable to save emergency contact."

                                        });

                                    }


                                    res.json({

                                        success:
                                            true,

                                        message:
                                            "Emergency contact saved successfully."

                                    });

                                }
                            );

                            return;

                        }


                        db.run(
                            `
                            INSERT INTO emergency_contacts
                            (
                                user_id,
                                name,
                                phone
                            )
                            VALUES
                            (?, ?, ?)
                            `,
                            [
                                userId,
                                cleanName,
                                cleanPhone
                            ],
                            function (
                                insertError
                            ) {

                                if (insertError) {

                                    console.error(
                                        "Emergency contact insert error:",
                                        insertError
                                    );

                                    return res.status(
                                        500
                                    ).json({

                                        error:
                                            "Unable to save emergency contact."

                                    });

                                }


                                res.status(
                                    201
                                ).json({

                                    success:
                                        true,

                                    message:
                                        "Emergency contact saved successfully."

                                });

                            }
                        );

                    }
                );

            }
        );

    }
);


// =====================================================
// 📋 GET HEALTH RECORDS
// =====================================================

app.get(
    "/api/records/:userId",
    function (
        req,
        res
    ) {

        const userId =
            Number(
                req.params.userId
            );


        if (
            !Number.isInteger(userId) ||
            userId <= 0
        ) {

            return res.status(
                400
            ).json({

                error:
                    "Invalid user ID."

            });

        }


        db.all(
            `
            SELECT
                id,
                user_id,
                type,
                title,
                date,
                doctor,
                notes,
                created_at
            FROM health_records
            WHERE user_id = ?
            ORDER BY id DESC
            `,
            [
                userId
            ],
            function (
                error,
                rows
            ) {

                if (error) {

                    console.error(
                        "Records fetch error:",
                        error
                    );

                    return res.status(
                        500
                    ).json({

                        error:
                            "Unable to load health records."

                    });

                }


                res.json({

                    success:
                        true,

                    records:
                        rows

                });

            }
        );

    }
);


// =====================================================
// ➕ CREATE HEALTH RECORD
// =====================================================

app.post(
    "/api/records/:userId",
    function (
        req,
        res
    ) {

        const userId =
            Number(
                req.params.userId
            );


        const {
            type,
            title,
            date,
            doctor,
            notes
        } = req.body;


        if (
            !Number.isInteger(userId) ||
            userId <= 0
        ) {

            return res.status(
                400
            ).json({

                error:
                    "Invalid user ID."

            });

        }


        if (
            !type ||
            !type.trim()
        ) {

            return res.status(
                400
            ).json({

                error:
                    "Record type is required."

            });

        }


        if (
            !title ||
            !title.trim()
        ) {

            return res.status(
                400
            ).json({

                error:
                    "Record title is required."

            });

        }


        if (!date) {

            return res.status(
                400
            ).json({

                error:
                    "Record date is required."

            });

        }


        db.get(
            `
            SELECT id
            FROM users
            WHERE id = ?
            `,
            [
                userId
            ],
            function (
                userError,
                user
            ) {

                if (userError) {

                    console.error(
                        "Record user check error:",
                        userError
                    );

                    return res.status(
                        500
                    ).json({

                        error:
                            "Unable to verify user."

                    });

                }


                if (!user) {

                    return res.status(
                        404
                    ).json({

                        error:
                            "User not found."

                    });

                }


                db.run(
                    `
                    INSERT INTO health_records
                    (
                        user_id,
                        type,
                        title,
                        date,
                        doctor,
                        notes
                    )
                    VALUES
                    (?, ?, ?, ?, ?, ?)
                    `,
                    [
                        userId,
                        type.trim(),
                        title.trim(),
                        date,
                        doctor
                            ? doctor.trim()
                            : "",
                        notes
                            ? notes.trim()
                            : ""
                    ],
                    function (
                        insertError
                    ) {

                        if (insertError) {

                            console.error(
                                "Record insert error:",
                                insertError
                            );

                            return res.status(
                                500
                            ).json({

                                error:
                                    "Unable to save health record."

                            });

                        }


                        res.status(
                            201
                        ).json({

                            success:
                                true,

                            message:
                                "Health record saved successfully.",

                            record: {

                                id:
                                    this.lastID,

                                user_id:
                                    userId,

                                type:
                                    type.trim(),

                                title:
                                    title.trim(),

                                date:
                                    date,

                                doctor:
                                    doctor
                                        ? doctor.trim()
                                        : "",

                                notes:
                                    notes
                                        ? notes.trim()
                                        : ""

                            }

                        });

                    }
                );

            }
        );

    }
);


// =====================================================
// 🗑️ DELETE HEALTH RECORD
// =====================================================

app.delete(
    "/api/records/:userId/:recordId",
    function (
        req,
        res
    ) {

        const userId =
            Number(
                req.params.userId
            );


        const recordId =
            Number(
                req.params.recordId
            );


        if (
            !Number.isInteger(userId) ||
            userId <= 0
        ) {

            return res.status(
                400
            ).json({

                error:
                    "Invalid user ID."

            });

        }


        if (
            !Number.isInteger(recordId) ||
            recordId <= 0
        ) {

            return res.status(
                400
            ).json({

                error:
                    "Invalid record ID."

            });

        }


        db.run(
            `
            DELETE FROM health_records
            WHERE id = ?
            AND user_id = ?
            `,
            [
                recordId,
                userId
            ],
            function (
                error
            ) {

                if (error) {

                    console.error(
                        "Record delete error:",
                        error
                    );

                    return res.status(
                        500
                    ).json({

                        error:
                            "Unable to delete health record."

                    });

                }


                if (
                    this.changes === 0
                ) {

                    return res.status(
                        404
                    ).json({

                        error:
                            "Record not found."

                    });

                }


                res.json({

                    success:
                        true,

                    message:
                        "Health record deleted successfully."

                });

            }
        );

    }
);


// =====================================================
// ⭐ CREATE REVIEW
// =====================================================

app.post(
    "/api/reviews",
    function (
        req,
        res
    ) {

        const {
            userId,
            name,
            rating,
            message
        } = req.body;


        const numericUserId =
            Number(
                userId
            );


        if (
            !Number.isInteger(
                numericUserId
            ) ||
            numericUserId <= 0
        ) {

            return res.status(
                401
            ).json({

                error:
                    "You must be logged in to submit a review."

            });

        }


        if (
            !name ||
            !name.trim()
        ) {

            return res.status(
                400
            ).json({

                error:
                    "Name is required."

            });

        }


        const numericRating =
            Number(
                rating
            );


        if (
            !Number.isInteger(
                numericRating
            ) ||
            numericRating < 1 ||
            numericRating > 5
        ) {

            return res.status(
                400
            ).json({

                error:
                    "Rating must be between 1 and 5."

            });

        }


        if (
            !message ||
            !message.trim()
        ) {

            return res.status(
                400
            ).json({

                error:
                    "Review message is required."

            });

        }


        db.get(
            `
            SELECT
                id,
                name,
                email
            FROM users
            WHERE id = ?
            `,
            [
                numericUserId
            ],
            function (
                userError,
                user
            ) {

                if (userError) {

                    console.error(
                        "User verification error:",
                        userError
                    );

                    return res.status(
                        500
                    ).json({

                        error:
                            "Unable to verify user."

                    });

                }


                if (!user) {

                    return res.status(
                        401
                    ).json({

                        error:
                            "User account not found."

                    });

                }


                db.get(
                    `
                    SELECT id
                    FROM reviews
                    WHERE user_id = ?
                    `,
                    [
                        numericUserId
                    ],
                    function (
                        reviewError,
                        existingReview
                    ) {

                        if (reviewError) {

                            console.error(
                                "Review check error:",
                                reviewError
                            );

                            return res.status(
                                500
                            ).json({

                                error:
                                    "Unable to check existing review."

                            });

                        }


                        if (existingReview) {

                            return res.status(
                                409
                            ).json({

                                error:
                                    "You have already submitted a review."

                            });

                        }


                        db.run(
                            `
                            INSERT INTO reviews
                            (
                                user_id,
                                name,
                                rating,
                                message
                            )
                            VALUES
                            (?, ?, ?, ?)
                            `,
                            [
                                numericUserId,
                                user.name,
                                numericRating,
                                message.trim()
                            ],
                            function (
                                insertError
                            ) {

                                if (insertError) {

                                    if (
                                        insertError.message.includes(
                                            "UNIQUE constraint failed"
                                        )
                                    ) {

                                        return res.status(
                                            409
                                        ).json({

                                            error:
                                                "You have already submitted a review."

                                        });

                                    }


                                    console.error(
                                        "Review insert error:",
                                        insertError
                                    );

                                    return res.status(
                                        500
                                    ).json({

                                        error:
                                            "Unable to save review."

                                    });

                                }


                                res.status(
                                    201
                                ).json({

                                    success:
                                        true,

                                    message:
                                        "Review submitted successfully.",

                                    review: {

                                        id:
                                            this.lastID,

                                        userId:
                                            numericUserId,

                                        name:
                                            user.name,

                                        rating:
                                            numericRating,

                                        message:
                                            message.trim()

                                    }

                                });

                            }
                        );

                    }
                );

            }
        );

    }
);


// =====================================================
// ⭐ CHECK WHETHER USER HAS REVIEWED
// =====================================================

app.get(
    "/api/reviews/user/:userId",
    function (req, res) {

        const userId = Number(req.params.userId);

        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({ error: "Invalid user ID." });
        }

        db.get(
            `
            SELECT id, name, rating, message, created_at
            FROM reviews
            WHERE user_id = ?
            `,
            [userId],
            function (error, review) {

                if (error) {
                    console.error("User review lookup error:", error);
                    return res.status(500).json({
                        error: "Unable to check review status."
                    });
                }

                return res.json({
                    success: true,
                    reviewed: Boolean(review),
                    review: review || null
                });

            }
        );

    }
);


// =====================================================
// ⭐ GET REVIEWS
// =====================================================

app.get(
    "/api/reviews",
    function (
        req,
        res
    ) {

        db.all(
            `
            SELECT
                id,
                name,
                rating,
                message,
                created_at
            FROM reviews
            ORDER BY id DESC
            `,
            [],
            function (
                error,
                rows
            ) {

                if (error) {

                    console.error(
                        "Review fetch error:",
                        error
                    );

                    return res.status(
                        500
                    ).json({

                        error:
                            "Unable to fetch reviews."

                    });

                }


                res.json({

                    success:
                        true,

                    reviews:
                        rows

                });

            }
        );

    }
);


// =====================================================
// ⭐ REVIEW SUMMARY
// =====================================================

app.get(
    "/api/reviews/summary",
    function (
        req,
        res
    ) {

        db.get(
            `
            SELECT

                COUNT(*) AS total_reviews,

                COALESCE(
                    ROUND(
                        AVG(rating),
                        1
                    ),
                    0
                ) AS average_rating

            FROM reviews
            `,
            [],
            function (
                error,
                row
            ) {

                if (error) {

                    console.error(
                        "Review summary error:",
                        error
                    );

                    return res.status(
                        500
                    ).json({

                        error:
                            "Unable to fetch review summary."

                    });

                }


                res.json({

                    success:
                        true,

                    totalReviews:
                        row.total_reviews,

                    averageRating:
                        row.average_rating

                });

            }
        );

    }
);
// =====================================================
// 🔑 GET VAPID PUBLIC KEY
// =====================================================

app.get(
    "/api/notifications/vapid-public-key",
    function (req, res) {

        if (!VAPID_PUBLIC_KEY) {

            return res.status(503).json({
                error:
                    "Web Push is not configured on the server."
            });

        }

        res.json({
            success: true,
            publicKey: VAPID_PUBLIC_KEY
        });

    }
);


// =====================================================
// 🔔 SAVE PUSH SUBSCRIPTION
// =====================================================

app.post(
    "/api/notifications/subscribe/:userId",
    function (req, res) {

        const userId =
            Number(req.params.userId);

        const subscription =
            req.body;

        if (
            !Number.isInteger(userId) ||
            userId <= 0
        ) {

            return res.status(400).json({
                error: "Invalid user ID."
            });

        }

        if (
            !subscription ||
            !subscription.endpoint ||
            !subscription.keys ||
            !subscription.keys.p256dh ||
            !subscription.keys.auth
        ) {

            return res.status(400).json({
                error:
                    "Invalid push subscription."
            });

        }

        db.get(
            `
            SELECT id
            FROM users
            WHERE id = ?
            `,
            [userId],
            function (userError, user) {

                if (userError) {

                    console.error(
                        "Push user lookup error:",
                        userError
                    );

                    return res.status(500).json({
                        error:
                            "Unable to verify user."
                    });

                }

                if (!user) {

                    return res.status(404).json({
                        error:
                            "User not found."
                    });

                }

                db.run(
                    `
                    INSERT INTO push_subscriptions
                    (
                        user_id,
                        endpoint,
                        p256dh,
                        auth
                    )
                    VALUES (?, ?, ?, ?)

                    ON CONFLICT(endpoint)
                    DO UPDATE SET

                        user_id = excluded.user_id,

                        p256dh = excluded.p256dh,

                        auth = excluded.auth,

                        updated_at =
                            CURRENT_TIMESTAMP
                    `,
                    [
                        userId,
                        subscription.endpoint,
                        subscription.keys.p256dh,
                        subscription.keys.auth
                    ],
                    function (error) {

                        if (error) {

                            console.error(
                                "Push subscription save error:",
                                error
                            );

                            return res.status(500).json({
                                error:
                                    "Unable to save push subscription."
                            });

                        }

                        res.json({
                            success: true,
                            message:
                                "Push notifications enabled."
                        });

                    }
                );

            }
        );

    }
);


// =====================================================
// 💊 GET MEDICINES
// =====================================================

app.get(
    "/api/medicines/:userId",
    function (req, res) {

        const userId =
            Number(req.params.userId);

        if (
            !Number.isInteger(userId) ||
            userId <= 0
        ) {

            return res.status(400).json({
                error: "Invalid user ID."
            });

        }

        db.all(
            `
            SELECT

                id,

                user_id,

                name,

                dosage,

                frequency,

                time,

                start_date AS startDate,

                end_date AS endDate,

                created_at

            FROM medicines

            WHERE user_id = ?

            ORDER BY time ASC, id DESC
            `,
            [userId],
            function (error, rows) {

                if (error) {

                    console.error(
                        "Medicine fetch error:",
                        error
                    );

                    return res.status(500).json({
                        error:
                            "Unable to load medicines."
                    });

                }

                res.json({
                    success: true,
                    medicines: rows
                });

            }
        );

    }
);


// =====================================================
// ➕ ADD MEDICINE
// =====================================================

app.post(
    "/api/medicines/:userId",
    function (req, res) {

        const userId =
            Number(req.params.userId);

        const {
            name,
            dosage,
            frequency,
            time,
            startDate,
            endDate
        } = req.body;

        if (
            !Number.isInteger(userId) ||
            userId <= 0
        ) {

            return res.status(400).json({
                error: "Invalid user ID."
            });

        }

        if (
            !name ||
            !name.trim()
        ) {

            return res.status(400).json({
                error:
                    "Medicine name is required."
            });

        }

        if (
            !frequency ||
            !frequency.trim()
        ) {

            return res.status(400).json({
                error:
                    "Medicine frequency is required."
            });

        }

        if (
            !time ||
            !/^\d{2}:\d{2}$/.test(time)
        ) {

            return res.status(400).json({
                error:
                    "Valid medicine time is required."
            });

        }

        if (
            !startDate ||
            !/^\d{4}-\d{2}-\d{2}$/.test(startDate)
        ) {

            return res.status(400).json({
                error:
                    "Valid start date is required."
            });

        }

        if (
            endDate &&
            !/^\d{4}-\d{2}-\d{2}$/.test(endDate)
        ) {

            return res.status(400).json({
                error:
                    "Invalid end date."
            });

        }

        if (
            endDate &&
            endDate < startDate
        ) {

            return res.status(400).json({
                error:
                    "End date cannot be before start date."
            });

        }

        db.get(
            `
            SELECT id
            FROM users
            WHERE id = ?
            `,
            [userId],
            function (userError, user) {

                if (userError) {

                    console.error(
                        "Medicine user lookup error:",
                        userError
                    );

                    return res.status(500).json({
                        error:
                            "Unable to verify user."
                    });

                }

                if (!user) {

                    return res.status(404).json({
                        error:
                            "User not found."
                    });

                }

                db.run(
                    `
                    INSERT INTO medicines
                    (
                        user_id,
                        name,
                        dosage,
                        frequency,
                        time,
                        start_date,
                        end_date
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    `,
                    [
                        userId,
                        name.trim(),
                        dosage
                            ? dosage.trim()
                            : "",
                        frequency.trim(),
                        time,
                        startDate,
                        endDate || null
                    ],
                    function (insertError) {

                        if (insertError) {

                            console.error(
                                "Medicine insert error:",
                                insertError
                            );

                            return res.status(500).json({
                                error:
                                    "Unable to save medicine."
                            });

                        }

                        res.status(201).json({

                            success: true,

                            message:
                                "Medicine reminder saved successfully.",

                            medicine: {

                                id: this.lastID,

                                user_id:
                                    userId,

                                name:
                                    name.trim(),

                                dosage:
                                    dosage
                                        ? dosage.trim()
                                        : "",

                                frequency:
                                    frequency.trim(),

                                time:
                                    time,

                                startDate:
                                    startDate,

                                endDate:
                                    endDate || ""

                            }

                        });

                    }
                );

            }
        );

    }
);


// =====================================================
// 🗑️ DELETE MEDICINE
// =====================================================

app.delete(
    "/api/medicines/:userId/:medicineId",
    function (req, res) {

        const userId =
            Number(req.params.userId);

        const medicineId =
            Number(req.params.medicineId);

        if (
            !Number.isInteger(userId) ||
            userId <= 0
        ) {

            return res.status(400).json({
                error: "Invalid user ID."
            });

        }

        if (
            !Number.isInteger(medicineId) ||
            medicineId <= 0
        ) {

            return res.status(400).json({
                error:
                    "Invalid medicine ID."
            });

        }

        db.run(
            `
            DELETE FROM medicines

            WHERE id = ?

            AND user_id = ?
            `,
            [
                medicineId,
                userId
            ],
            function (error) {

                if (error) {

                    console.error(
                        "Medicine delete error:",
                        error
                    );

                    return res.status(500).json({
                        error:
                            "Unable to delete medicine."
                    });

                }

                if (this.changes === 0) {

                    return res.status(404).json({
                        error:
                            "Medicine not found."
                    });

                }

                res.json({
                    success: true,
                    message:
                        "Medicine reminder deleted successfully."
                });

            }
        );

    }
);
// =====================================================
// 🔔 MEDICINE REMINDER SCHEDULER
// =====================================================

function getLocalDateTime() {

    const now = new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            now.getDate()
        ).padStart(2, "0");

    const hours =
        String(
            now.getHours()
        ).padStart(2, "0");

    const minutes =
        String(
            now.getMinutes()
        ).padStart(2, "0");

    return {

        date:
            `${year}-${month}-${day}`,

        time:
            `${hours}:${minutes}`

    };

}


async function sendMedicineReminder(
    medicine
) {

    return new Promise(function (resolve) {

        db.all(
            `
            SELECT

                id,

                endpoint,

                p256dh,

                auth

            FROM push_subscriptions

            WHERE user_id = ?
            `,
            [
                medicine.user_id
            ],
            async function (
                error,
                subscriptions
            ) {

                if (error) {

                    console.error(
                        "Subscription lookup error:",
                        error
                    );

                    return resolve(false);

                }

                if (
                    !subscriptions ||
                    subscriptions.length === 0
                ) {

                    console.log(
                        `⚠️ No push subscription for user ${medicine.user_id}`
                    );

                    return resolve(false);

                }

                const payload =
                    JSON.stringify({

                        type:
                            "medicine-reminder",

                        title:
                            "💊 Medicine Reminder",

                        body:
                            `Time to take ${medicine.name}` +
                            (
                                medicine.dosage
                                    ? ` — ${medicine.dosage}`
                                    : ""
                            ),

                        medicineId:
                            medicine.id

                    });

                let successCount = 0;

                for (
                    const subscription
                    of subscriptions
                ) {

                    const pushSubscription = {

                        endpoint:
                            subscription.endpoint,

                        keys: {

                            p256dh:
                                subscription.p256dh,

                            auth:
                                subscription.auth

                        }

                    };

                    try {

                        await webpush.sendNotification(
                            pushSubscription,
                            payload
                        );

                        successCount++;

                    } catch (pushError) {

                        console.error(
                            "Push notification error:",
                            pushError.statusCode,
                            pushError.message
                        );

                        // Subscription expired/invalid
                        if (
                            pushError.statusCode === 404 ||
                            pushError.statusCode === 410
                        ) {

                            db.run(
                                `
                                DELETE FROM push_subscriptions
                                WHERE id = ?
                                `,
                                [
                                    subscription.id
                                ]
                            );

                        }

                    }

                }

                resolve(
                    successCount > 0
                );

            }
        );

    });

}


async function checkScheduledMedicineReminders() {

    if (
        !VAPID_PUBLIC_KEY ||
        !VAPID_PRIVATE_KEY ||
        !VAPID_SUBJECT
    ) {

        return;

    }

    const {
        date: currentDate,
        time: currentTime
    } = getLocalDateTime();

    db.all(
        `
        SELECT

            id,

            user_id,

            name,

            dosage,

            frequency,

            time,

            start_date,

            end_date

        FROM medicines

        WHERE time = ?

        AND start_date <= ?

        AND (
            end_date IS NULL
            OR end_date >= ?
        )
        `,
        [
            currentTime,
            currentDate,
            currentDate
        ],
        async function (
            error,
            medicines
        ) {

            if (error) {

                console.error(
                    "Medicine scheduler error:",
                    error
                );

                return;

            }

            if (
                !medicines ||
                medicines.length === 0
            ) {

                return;

            }

            for (
                const medicine
                of medicines
            ) {

                const alreadySent =
                    await new Promise(
                        function (resolve) {

                            db.get(
                                `
                                SELECT id

                                FROM medicine_reminder_logs

                                WHERE medicine_id = ?

                                AND reminder_date = ?

                                AND reminder_time = ?
                                `,
                                [
                                    medicine.id,
                                    currentDate,
                                    currentTime
                                ],
                                function (
                                    checkError,
                                    row
                                ) {

                                    if (checkError) {

                                        console.error(
                                            "Reminder log check error:",
                                            checkError
                                        );

                                        return resolve(false);

                                    }

                                    resolve(
                                        Boolean(row)
                                    );

                                }
                            );

                        }
                    );

                if (alreadySent) {

                    continue;

                }

                const sent =
                    await sendMedicineReminder(
                        medicine
                    );

                if (sent) {

                    db.run(
                        `
                        INSERT OR IGNORE INTO
                        medicine_reminder_logs
                        (
                            medicine_id,
                            user_id,
                            reminder_date,
                            reminder_time
                        )
                        VALUES (?, ?, ?, ?)
                        `,
                        [
                            medicine.id,
                            medicine.user_id,
                            currentDate,
                            currentTime
                        ],
                        function (logError) {

                            if (logError) {

                                console.error(
                                    "Reminder log save error:",
                                    logError
                                );

                            } else {

                                console.log(
                                    `🔔 Medicine reminder sent: ${medicine.name} → User ${medicine.user_id}`
                                );

                            }

                        }
                    );

                }

            }

        }
    );

}


// Check every 10 seconds
setInterval(
    checkScheduledMedicineReminders,
    10000
);

// Also check when server starts
setTimeout(
    checkScheduledMedicineReminders,
    3000
);


// =====================================================
// ❤️ SERVER HEALTH CHECK
// =====================================================

app.get(
    "/api/health",
    function (
        req,
        res
    ) {

        res.json({

            success:
                true,

            message:
                "AI Health Assistant server is running.",

            database:
                "SQLite connected"

        });

    }
);


// =====================================================
// 🚀 SERVER
// =====================================================

const PORT =
    5000;


app.listen(
    PORT,
    function () {

        console.log("");

        console.log(
            "=============================================="
        );

        console.log(
            "🏥 AI Health Assistant Server"
        );

        console.log(
            "=============================================="
        );

        console.log(
            `Server: http://localhost:${PORT}`
        );

        console.log("");

        console.log(
            "AUTH"
        );

        console.log(
            "POST /api/auth/register"
        );

        console.log(
            "POST /api/auth/login"
        );

        console.log("");

        console.log(
            "PROFILE"
        );

        console.log(
            "GET  /api/profile/:userId"
        );

        console.log(
            "PUT  /api/profile/:userId"
        );

        console.log(
            "PUT  /api/profile/:userId/goals"
        );

        console.log(
            "PUT  /api/profile/:userId/photo"
        );

        console.log("");

        console.log(
            "HEALTH TRACKER"
        );

        console.log(
            "GET  /api/health/:userId"
        );

        console.log(
            "PUT  /api/health/:userId"
        );

        console.log("");

        console.log(
            "EMERGENCY"
        );

        console.log(
            "GET  /api/emergency/:userId"
        );

        console.log(
            "PUT  /api/emergency/:userId"
        );

        console.log("");

        console.log(
            "HEALTH RECORDS"
        );

        console.log(
            "GET    /api/records/:userId"
        );

        console.log(
            "POST   /api/records/:userId"
        );

        console.log(
            "DELETE /api/records/:userId/:recordId"
        );

        console.log("");

        console.log(
            "AI"
        );

        console.log(
            "POST /api/health-chat"
        );

        console.log("");

        console.log(
            "REVIEWS"
        );

        console.log(
            "GET  /api/reviews"
        );

        console.log(
            "POST /api/reviews"
        );

        console.log(
            "GET  /api/reviews/summary"
        );

        console.log("");

        console.log(
            "=============================================="
        );

        console.log("");
        console.log("");

console.log("MEDICINE REMINDERS");

console.log(
    "GET  /api/notifications/vapid-public-key"
);

console.log(
    "POST /api/notifications/subscribe/:userId"
);

console.log(
    "GET  /api/medicines/:userId"
);

console.log(
    "POST /api/medicines/:userId"
);

console.log(
    "DELETE /api/medicines/:userId/:medicineId"
);

    }
);
