const { Client, GatewayIntentBits } = require('discord.js');
const channelID = '1193529619907891331';

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages, GatewayIntentBits.MessageContent],
});

client.once('ready', () => {
  console.log('Bot is ready!');
});

function sendMessage(message) {
  const channel = client.channels.cache.get(channelID);

  if (channel) {
    channel.send(message);
  } else {
    console.error(`Could not find channel with ID ${channelID}`);
  }
}

client.login(process.env.CLIENT_KEY);

module.exports = {
  sendMessage,
};
