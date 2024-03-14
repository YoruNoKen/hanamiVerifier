const express = require("express");
const { default: OsuStrategy } = require("passport-osu");
const passport = require("passport");
const session = require("express-session");
// const axios = require("axios");
// require("dotenv/config");

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

        const clientId = process.env.CLIENT_ID;
        const clientSecret = process.env.CLIENT_SECRET;
        const callbackUrl = true
            ? "http://verify.yorunoken.com/auth/osu/cb"
            : "http://localhost:8000/auth/osu/cb";

        if (
            typeof clientId === "undefined" ||
            typeof clientSecret === "undefined"
        ) {
            throw new Error("CLIENT ID or CLIENT SECRET are not set");
        }
        console.log(callbackUrl);

        const strat = new OsuStrategy(
            {
                clientID: clientId,
                clientSecret,
                userProfileUrl: "https://osu.ppy.sh/api/v2/me/osu",
                callbackURL: callbackUrl,
            },
            (_accessToken, _refreshToken, profile, cb) => {
                // console.log(profile);
                return cb(null, profile);
            }
        );

        passport.use(strat);

        passport.serializeUser((user, done) => {
            done(null, user);
        });

        passport.deserializeUser((user, done) => {
            done(null, user);
        });

        this.app.get(
            "/auth/osu",
            (_req, _res, next) => {
                next();
            },
            passport.authenticate("osu")
        );

        this.app.get(
            "/auth/osu/cb",
            passport.authenticate("osu", { failureRedirect: "/" }),
            async (req, res) => {
                const message = `${req.query.state}\n${req.user.id}`;

                try {
                    const response = await fetch(process.env.webhookURL, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ content: message }),
                    });

                    if (response.status === 204)
                        res.json({
                            message:
                                "A DM has been sent, confirm it to link your osu! account.",
                        });
                    else
                        res.json({
                            message: "Something went wrong. Please try again.",
                        });
                } catch (error) {
                    console.error("Error sending webhook:", error);
                    res.json({
                        message: "An error occurred. Please try again later.",
                    });
                }
            }
        );

        const host = "localhost";
        const port = process.env.PORT || 8000;
        this.app.listen(port, host);
        console.log(`Server running at http://${host}:${port}/`);
    }
}

new Server().start();
