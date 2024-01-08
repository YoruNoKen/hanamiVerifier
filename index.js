const express = require("express");
const { default: OsuStrategy } = require("passport-osu");
const passport = require("passport");
const session = require("express-session");

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
        const callbackUrl = "https://hanami-verifier.vercel.app/auth/osu/cb";

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
            (req, res) => {
                fetch(
                    "https://discord.com/api/webhooks/1193720156975796244/bTq_MvupioG0JxO4r_VhlpOZ1wjUfodg4facV_Pm3T2uv5XmdvT6W7rs9QoLtT1mmRkc",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            // the username to be displayed
                            username: "webhook",
                            // the avatar to be displayed
                            avatar_url:
                                "https://cdn.discordapp.com/avatars/411256446638882837/9a12fc7810795ded801fdb0401db0be6.png",
                            // contents of the message to be sent
                            content: "message",
                            // enable mentioning of individual users or roles, but not @everyone/@here
                            allowed_mentions: {
                                parse: ["users", "roles"],
                            },
                            // embeds to be sent
                            embeds: [
                                {
                                    // decimal number colour of the side of the embed
                                    color: 11730954,
                                    // author
                                    // - icon next to text at top (text is a link)
                                    author: {
                                        name: "dragonwocky",
                                        url: "https://dragonwocky.me/",
                                        icon_url:
                                            "https://dragonwocky.me/assets/avatar.jpg",
                                    },
                                    // embed title
                                    // - link on 2nd row
                                    title: "title",
                                    url: "https://gist.github.com/dragonwocky/ea61c8d21db17913a43da92efe0de634",
                                    // thumbnail
                                    // - small image in top right corner.
                                    thumbnail: {
                                        url: "https://cdn.discordapp.com/avatars/411256446638882837/9a12fc7810795ded801fdb0401db0be6.png",
                                    },
                                    // embed description
                                    // - text on 3rd row
                                    description: "description",
                                    // custom embed fields: bold title/name, normal content/value below title
                                    // - located below description, above image.
                                    fields: [
                                        {
                                            name: "field 1",
                                            value: "value",
                                        },
                                        {
                                            name: "field 2",
                                            value: "other value",
                                        },
                                    ],
                                    // image
                                    // - picture below description(and fields)
                                    image: {
                                        url: "http://tolkiengateway.net/w/images/thumb/7/75/J.R.R._Tolkien_-_Ring_verse.jpg/300px-J.R.R._Tolkien_-_Ring_verse.jpg",
                                    },
                                    // footer
                                    // - icon next to text at bottom
                                    footer: {
                                        text: "footer",
                                        icon_url:
                                            "https://cdn.discordapp.com/avatars/411256446638882837/9a12fc7810795ded801fdb0401db0be6.png",
                                    },
                                },
                            ],
                        }),
                    }
                );
                // sendMessage(
                //     `Discord ID: ${req.query.state}\nosu! ID: ${req.user.id}`
                // );
                res.json({
                    envs: `${process.env.webhookURL}`,
                    message: "You can now close this tab.",
                });
            }
        );

        const host = "localhost";
        const port = process.env.PORT || 8000;
        this.app.listen(port, host);
    }
}

new Server().start();
