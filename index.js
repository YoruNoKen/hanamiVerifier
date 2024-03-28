const express = require("express");
const { default: OsuStrategy } = require("passport-osu");
const passport = require("passport");
const session = require("express-session");
const path = require("path");
const { createDecipheriv } = require("crypto");

class Server {
    constructor() {
        this.app = express();
        this.app.use(
            session({
                secret: process.env.SECRET ?? "",
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
        const webhookUrl = process.env.webhookURL;
        const keyString = process.env.KEY;
        const ivString = process.env.IV;
        const callbackUrl = parseInt(process.env.DEV) === 1 ? "http://localhost:8000/auth/osu/cb" : "http://verify.yorunoken.com/auth/osu/cb";

        if (typeof clientId === "undefined" || typeof clientSecret === "undefined" || typeof webhookUrl === "undefined" || typeof keyString === "undefined" || typeof ivString === "undefined") {
            throw new Error("ENV variables are not set!");
        }

        const key = Buffer.from(keyString.split(",").map(Number));
        const iv = Buffer.from(ivString.split(",").map(Number));
        const algorithm = "aes-256-cbc";

        function decrypt(encryptedData) {
            try {
                const decipher = createDecipheriv(algorithm, key, iv);
                let decrypted = decipher.update(encryptedData, "hex", "utf8");
                decrypted += decipher.final("utf8");
                return decrypted;
            } catch (e) {
                return null;
            }
        }

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

        this.app.get("/", (_req, res) => {
            res.sendFile(__dirname + "/html/index.html");
        });

        this.app.get(
            "/auth/osu",
            (_req, _res, next) => {
                next();
            },
            passport.authenticate("osu")
        );

        this.app.get("/auth/osu/cb", passport.authenticate("osu", { failureRedirect: "/" }), async (req, res) => {
            const encryptedDiscordId = req.query.state;
            const osuId = req.user.id;

            const discordId = decrypt(encryptedDiscordId);
            if (discordId === null) {
                res.sendFile(__dirname + "/html/invalid-buffer.html");
                return;
            }

            const message = `${discordId}\n${osuId}`;
            const response = await fetch(webhookUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ content: message }),
            });

            if (response.status === 204) res.sendFile(__dirname + "/html/success.html");
            else res.sendFile(__dirname + "/html/error.html");
        });

        this.app.get("*", (_req, res) => {
            res.sendFile(path.join(__dirname, "public", "/html/index.html"));
        });

        const host = "localhost";
        const port = process.env.PORT || 8000;
        this.app.listen(port, host);
        console.log(`Server running at http://${host}:${port}/`);
    }
}

new Server().start();
