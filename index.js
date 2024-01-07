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

        this.app.get("/auth/osu/cb", (req, res) => {
            res.json({
                code: req.query.code,
                message: "Success!",
            });
        });

        const host = "localhost";
        const port = process.env.PORT || 8000;
        this.app.listen(port, host);
    }
}

new Server().start();
