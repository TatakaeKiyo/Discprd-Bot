const { Client, IntentsBitField, SlashCommandBuilder, MessageEmbed, PermissionsBitField } = require('discord.js');

const client = new Client({ intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.GuildMembers] });

const commands = {
    'createchannel': 'Создает текстовый канал для указанной роли.',
    'getrole': 'Выдает роль указанным пользователям.',
    'createrole': 'Создает новую роль.',
    'test': 'Выводит модульное окно с вариантами ответов для заданного вопроса.'
};

client.on('ready', async () => {
    console.log('Bot Ready!');

    // Создайте команды Slash Command
    const pingCommand = new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Проверяет доступность бота');
    client.application.commands.create(pingCommand);

    const createChannelCommand = new SlashCommandBuilder()
        .setName('createchannel')
        .setDescription('Создает текстовый канал для указанной роли')
        .addStringOption(option => 
            option.setName('name')
                .setDescription('Имя канала')
                .setRequired(true)
        )
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Роль для которой создавать канал')
                .setRequired(true)
        );
    client.application.commands.create(createChannelCommand);

    const getRoleCommand = new SlashCommandBuilder()
        .setName('getrole')
        .setDescription('Выдает роль указанным пользователям')
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Роль, которую нужно выдать')
                .setRequired(true)
        )
        .addUserOption(option =>
            option.setName('users')
                .setDescription('Пользователи, которым нужно выдать роль')
                .setRequired(true)
        );
    client.application.commands.create(getRoleCommand);

    const createRoleCommand = new SlashCommandBuilder()
        .setName('createrole')
        .setDescription('Создает новую роль')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Имя роли')
                .setRequired(true)
        );
    client.application.commands.create(createRoleCommand);

    const testCommand = new SlashCommandBuilder()
        .setName('test')
        .setDescription('Выводит модульное окно с вариантами ответов')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('Вопрос')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('answers')
                .setDescription('Варианты ответов, разделенные запятыми')
                .setRequired(true)
        );
    client.application.commands.create(testCommand);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'ping') {
        await interaction.reply('Pong!');
    } else if (interaction.commandName === 'createchannel') {
        const channelName = interaction.options.getString('name');
        const targetRole = interaction.options.getRole('role');
        const guild = interaction.guild;
        const channel = await guild.channels.create({
            name: channelName,
            type: 'GUILD_TEXT',
            permissionOverwrites: [
                {
                    id: targetRole.id,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                },
                {
                    id: guild.roles.everyone.id,
                    deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                },
                {
                    id: guild.me.id,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels],
                },
            ],
        });
        await interaction.reply(`Создан канал ${channelName} для роли ${targetRole.name}`);
    } else if (interaction.commandName === 'getrole') {
        const role = interaction.options.getRole('role');
        const users = interaction.options.getUsers('users');
        users.forEach(user => user.roles.add(role));
        await interaction.reply(`Роль ${role.name} выдана ${users.length} пользователям`);
    } else if (interaction.commandName === 'createrole') {
        const roleName = interaction.options.getString('name');
        const guild = interaction.guild;
        const newRole = await guild.roles.create({ name: roleName });
        await interaction.reply(`Создана роль ${roleName}`);
    } else if (interaction.commandName === 'test') {
        const question = interaction.options.getString('question');
        const answers = interaction.options.getString('answers').split(',');
        const embed = new MessageEmbed()
            .setTitle(question)
            .setColor('#0099ff');
        answers.forEach((answer, index) => {
            embed.addField(`Вариант ${index + 1}, answer`);
        });
        await interaction.reply({ embeds: [embed], components: [] });
    }
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (message.content.startsWith('/options')) {
        // Выводим подсказку с командами
        const embed = new MessageEmbed()
            .setTitle('Доступные команды:')
            .setColor('#0099ff')
            .setDescription(Object.entries(commands).map(([command, description]) => `${command}: ${description}`).join('n'));
        message.channel.send(embed);
        return; // Прерываем обработку сообщения
    }
});
client.login(
    ""
);
