const express = require("express");
const app = express();
const PORT = 4000;

async function sendMessage(message) {
    return fetch(process.env.webhookURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
}

app.get("/home", (req, res) => {
    res.status(200).json("Welcome, your app is working well");
});

app.get("/send", (req, res) => {
    const message =
        "Hello, this is your Express app sending a Discord message!";

    sendMessage(message).then((resolved) => {
        res.send({
            message: "You can now safely close this tab.",
            resolved,
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

module.exports = app;
