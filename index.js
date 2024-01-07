const express = require('express')
const app = express()
const PORT = 4000
const { sendMessage } = require('./discordBot')


app.get('/home', (req, res) => {
  res.status(200).json('Welcome, your app is working well');
});

app.get('/sendDiscordMessage', (req, res) => {
  const message = 'Hello, this is your Express app sending a Discord message!';
  sendMessage(message);
  res.send('Message sent!');
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

module.exports = app