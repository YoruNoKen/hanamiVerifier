const express = require("express");
const { default: OsuStrategy } = require("passport-osu");
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

        const clientId = process.env.CLIENT_ID || "clientID";
        const clientSecret = process.env.CLIENT_SECRET || "clientSecret";
        const callbackUrl = "http://hanami-verifier.vercel.app/auth/osu/cb";

        const strat = new OsuStrategy(
            {
                clientID: clientId,
                clientSecret,
                userProfileUrl: "https://osu.ppy.sh/api/v2/me/osu",
                callbackURL: callbackUrl,
            },
            (_accessToken, _refreshToken, profile, cb) => {
                console.log(profile);
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
            (req, res) => {
                res.json({
                    profile: req.query.profile,
                    code: req.query.code,
                    message: "Success!",
                });
            }
        );

        const host = "localhost";
        const port = process.env.PORT || 8000;
        this.app.listen(port, host);
    }
}

new Server().start();
