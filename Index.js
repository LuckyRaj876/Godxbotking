const { Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder } = require('discord.js');
const db = require('quick.db');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });

client.once('ready', () => {
    console.log('Bot is online!');
});

client.on('guildMemberAdd', member => {
    const welcomeChannelId = db.get(`welcomeChannel_${member.guild.id}`);
    const welcomeMessage = db.get(`welcomeMessage_${member.guild.id}`);
    const welcomeEnabled = db.get(`welcomeEnabled_${member.guild.id}`);

    if (welcomeEnabled && welcomeChannelId && welcomeMessage) {
        const channel = member.guild.channels.cache.get(welcomeChannelId);
        if (channel) {
            channel.send(welcomeMessage.replace('{user}', member.user));
        }
    }
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    const content = message.content.toLowerCase();

    if (content === '!hi') {
        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('Hello!')
            .setDescription('Hello there! How can I help you?')
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    } else if (content === '!ping') {
        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('Pong!')
            .setDescription('Ping command executed successfully.')
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    } else if (content === '!serverinfo') {
        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('Server Info')
            .setDescription(`Server name: ${message.guild.name}\nTotal members: ${message.guild.memberCount}`)
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    } else if (content === '!help') {
        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('Help')
            .setDescription('Available commands:\n!hi\n!ping\n!serverinfo\n!userinfo @user\n!kick @user\n!ban @user\n!setwelcome #channel [message]\n!enablewelcome\n!disablewelcome')
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    } else if (content.startsWith('!kick')) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return message.reply('You do not have permissions to kick members.');
        }

        const member = message.mentions.members.first();
        if (!member) {
            return message.reply('You need to mention the member you want to kick.');
        }

        if (!member.kickable) {
            return message.reply('I cannot kick this user.');
        }

        await member.kick();
        message.channel.send(`${member.user.tag} has been kicked.`);
    } else if (content.startsWith('!ban')) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.reply('You do not have permissions to ban members.');
        }

        const member = message.mentions.members.first();
        if (!member) {
            return message.reply('You need to mention the member you want to ban.');
        }

        if (!member.bannable) {
            return message.reply('I cannot ban this user.');
        }

        await member.ban();
        message.channel.send(`${member.user.tag} has been banned.`);
    } else if (content.startsWith('!userinfo')) {
        const member = message.mentions.members.first() || message.member;
        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('User Info')
            .setDescription(`User: ${member.user.tag}\nID: ${member.id}\nJoined server: ${member.joinedAt}`)
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    } else if (content.startsWith('!setwelcome')) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('You do not have permissions to set the welcome message.');
        }

        const args = message.content.split(' ').slice(1);
        const channel = message.mentions.channels.first();

        if (!channel) {
            return message.reply('Please mention a channel.');
        }

        const welcomeMessage = args.slice(1).join(' ');
        if (!welcomeMessage) {
            return message.reply('Please provide a welcome message. Use {user} to mention the user.');
        }

        db.set(`welcomeChannel_${message.guild.id}`, channel.id);
        db.set(`welcomeMessage_${message.guild.id}`, welcomeMessage);
        db.set(`welcomeEnabled_${message.guild.id}`, true);

        message.channel.send('Welcome message set!');
    } else if (content === '!enablewelcome') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('You do not have permissions to enable the welcome message.');
        }

        db.set(`welcomeEnabled_${message.guild.id}`, true);
        message.channel.send('Welcome message enabled!');
    } else if (content === '!disablewelcome') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('You do not have permissions to disable the welcome message.');
        }

        db.set(`welcomeEnabled_${message.guild.id}`, false);
        message.channel.send('Welcome message disabled!');
    }
});

client.login('MTE1ODE0NDY3MTIzNTcyMzI3NQ.GtOMoo.N4DG8QS2OcgKvDzD6STJSBnfjGd6Ejp0ap_W2Q');
