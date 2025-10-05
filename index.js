// FP Skyblock Giveaways Bot
const { Client, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');
require('dotenv').config();
const ms = require('ms');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

const PREFIX = process.env.PREFIX || '!';
const GIVEAWAY_ROLE_ID = process.env.GIVEAWAY_ROLE_ID || '';

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

function finishGiveaway(channel, prize, winners, roleId) {
  const mentions = winners.map((id) => `<@${id}>`).join(', ');
  const embed = new EmbedBuilder()
    .setTitle('🎉 Giveaway Ended!')
    .setDescription(`**Prize:** ${prize}\n**Winners:** ${mentions}`)
    .setTimestamp();
  channel.send({ content: roleId ? `<@&${roleId}>` : undefined, embeds: [embed] });
}

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const [cmd, ...args] = message.content.slice(PREFIX.length).trim().split(/ +/g);

  if (cmd === 'gstart') {
    // Usage: !gstart 1h 1 Legendary Sword
    const time = args.shift();
    const winnerCount = parseInt(args.shift() || '1');
    const prize = args.join(' ');
    if (!time || !prize) return message.reply('Usage: !gstart <duration> <winners> <prize>');
    const endsAt = Date.now() + ms(time);
    const msg = await message.channel.send(
      `<@&${GIVEAWAY_ROLE_ID}> 🎉 New Giveaway! Prize: **${prize}**. Ends in: ${time}`
    );
    await msg.react('🎉');
    setTimeout(() => {
      finishGiveaway(message.channel, prize, [message.author.id], GIVEAWAY_ROLE_ID); // simple demo
    }, ms(time));
    message.reply('Giveaway started!');
  }

  if (cmd === 'ping') {
    const sent = await message.channel.send('Pinging...');
    sent.edit(`Pong! ${client.ws.ping}ms`);
  }
});

client.login(process.env.DISCORD_TOKEN);
