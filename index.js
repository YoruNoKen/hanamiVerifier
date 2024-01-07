const express = require("express");
const passport = require("passport");
const session = require("express-session");

async function sendMessage(message) {
    fetch(process.env.webhookURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            content: message,
        }),
    });
}

async function getUser(auth) {
    try {
        const token = await fetch(
            `https://osu.ppy.sh/oauth/token?code=${auth}`,
            {
                method: "POST",
            }
        );
        const { access_token } = await token.json();

        const response = await fetch("https://osu.ppy.sh/api/v2/me/osu", {
            method: "GET",
            headers: { Authorization: `Bearer ${access_token}` },
        });

        if (!response.ok) {
            throw new Error(
                `API request failed with status ${response.status}`
            );
        }

        return await response.json();
    } catch (error) {
        // Handle errors
        console.error("Error making API request:", error.message);
    }
}

class Server {
    constructor() {
        this.app = express();
        this.app.use(
            session({
                secret: "your-secret-key",
                resave: true,
                saveUninitialized: true,
            })
        );
    }

    start() {
        this.app.use(passport.initialize());
        this.app.use(passport.session());

        this.app.get(
            "/auth/osu",
            (_req, _res, next) => {
                next();
            },
            passport.authenticate("osu")
        );

        this.app.get("/auth/osu/cb", async (req, res) => {
            const code = req.query.code;
            const discordId = req.query.status;
            const user = await getUser(code);

            sendMessage(
                `User ${user.username} has logged in!\nDiscord ID: ${discordId}`
            );
            res.json({
                message: "You can now safely close this tab",
            });
        });

        const host = "localhost";
        const port = process.env.PORT || 8000;
        this.app.listen(port, host);
    }
}

new Server().start();
