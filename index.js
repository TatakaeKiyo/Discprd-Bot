const Discord = require('discord.js');
const client = new Discord.Client();
// const { diff } = require('deep-diff');
const prefix = '/';
// const ytdl = require('ytdl-core');
// const ytSearch = require('yt-search');
// const assignments = {};
// let currentAssignment = null;

    const commands = {
        '/test': 'Создать тест с вариантами ответов: !test <вопрос> <вариант1> <вариант2> ...',
        '/createchannel': 'Создать текстовый и голосовой канал для роли: !createchannel <имя роли>',
        '/getRole': 'Создать и выдать роль упомянутым пользователям: !getRole <имя роли> @пользователь1 @пользователь2 ...'
    };

client.on('ready', () => {
    console.log('Bot Ready!');
});

client.on('message', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;
    if (message.content === "/options") {
        // Выводим подсказку с командами
        const embed = new Discord.MessageEmbed()
            .setTitle('Доступные команды:')
            .setColor('#0099ff')
            .setDescription(Object.entries(commands).map(([command, description]) => `${command}: ${description}`).join('\n'));

        message.channel.send(embed);
        return; // Прерываем обработку сообщения
    }

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'test') {
        const question = args[0];
        const options = args.slice(1);

        if (!question || options.length < 2) {
            return message.reply('Используйте: /test <вопрос> <вариант1> <вариант2> ...');
        }

        const formattedOptions = options.map((option, index) => `${index + 1}. ${option}`).join('\n');

        const embed = new Discord.MessageEmbed()
            .setTitle('Тест')
            .setColor('#0099ff')
            .setDescription(question)
            .addField('Варианты ответов', formattedOptions);

        message.channel.send(embed)
            .then(sentMessage => {
                options.forEach((_, index) => {
                    sentMessage.react(`${index + 1}️⃣`);
                });
            });
    }

    if (command === 'createchannel') {
        if (!message.member.permissions.has('MANAGE_CHANNELS')) {
            return message.reply('У вас нет прав на создание каналов.');
        }

        const roleName = args[0];
        const role = message.guild.roles.cache.find(r => r.name === roleName);

        if (!role) {
            return message.reply('Роль не найдена.');
        }

        message.guild.channels.create(roleName, {
            type: 'text',
            permissionOverwrites: [
                {
                    id: role.id, // Разрешаем доступ только указанной роли
                    allow: ['VIEW_CHANNEL', 'SEND_MESSAGES']
                },
                {
                    id: message.guild.id, // Запрещаем доступ всем остальным
                    deny: ['VIEW_CHANNEL']
                }
            ]
        })
            .then(channel => message.channel.send(`Канал для роли ${roleName} создан: ${channel}`))
            .catch(console.error);

        message.guild.channels.create(roleName, {
            type: 'voice',
            permissionOverwrites: [
                {
                    id: role.id, // Разрешаем доступ только указанной роли
                    allow: ['VIEW_CHANNEL', 'CONNECT']
                },
                {
                    id: message.guild.id, // Запрещаем доступ всем остальным
                    deny: ['VIEW_CHANNEL']
                }
            ]
        })
            .then(channel => message.channel.send(`Канал для роли ${roleName} создан: ${channel}`))
            .catch(console.error);
    }

    if (command === 'createrole'){
        if (message.member.permissions.has('ADMINISTRATOR')) {
            // Разбираем аргументы команды
            const args = message.content.split(' ');
            const roleName = args[1]; // Название роли
            const mentionedMembers = message.mentions.members.array(); // Массив упомянутых пользователей

            if (!roleName) {
                message.channel.send('Укажите имя роли!');
                return;
            }

            if (mentionedMembers.length === 0) {
                message.channel.send('Укажите пользователей, которым выдать роль!');
                return;
            }

            const randomColor = Math.floor(Math.random() * 16777215).toString(16); // 16777215 - максимальное значение для цвета в шестнадцатеричной системе

            // Создаем роль
            const role = await message.guild.roles.create({
                data: {
                    name: roleName,
                    color: `#${randomColor}` // Добавляем '#' в начало для формата hex цвета
                }
            });

            // Выдаем роль всем упомянутым пользователям
            for (const member of mentionedMembers) {
                await member.roles.add(role);
            }

            message.channel.send(`Роль "${roleName}" была выдана ${mentionedMembers.length} пользователям.`);

        } else {
            message.channel.send('У вас нет прав для выполнения этой команды.');
        }
    }

    if (command === 'lesson') {
        if (args.length < 3) {
            return message.channel.send('Необходимо указать ссылку, комментарий и канал, куда отправить сообщение.');
        }

        const link = args[0];
        const comment = args[1];
        const channelName = args[2];

        const channelId = args[2];
        const channel = message.guild.channels.cache.get(channelId);
        if (!channel) {
            return message.channel.send('Указанный канал не найден.');
        }

        const embed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Урок')
            .setURL(link)
            .setDescription(comment);

        channel.send(embed);
    }

    if (command === 'getrole') {
        if (!message.member.permissions.has('MANAGE_ROLES')) {
            return message.reply('У вас нет прав для выполнения этой команды.');
        }

        const roleName = args[0]; // Имя роли
        const mentionedMembers = message.mentions.members.array(); // Массив упомянутых пользователей

        if (!roleName) {
            return message.reply('Укажите имя роли!');
        }

        if (mentionedMembers.length === 0) {
            return message.reply('Укажите пользователей, которым выдать роль!');
        }

        const role = message.guild.roles.cache.find(r => r.name === roleName); // Находим роль по имени

        if (!role) {
            return message.reply(`Роль "${roleName}" не найдена.`);
        }

        // Выдаем роль всем упомянутым пользователям
        for (const member of mentionedMembers) {
            await member.roles.add(role);
        }

        message.channel.send(`Роль "${roleName}" была выдана ${mentionedMembers.length} пользователям.`);
    }
    // if (command === 'set_assignment') {
    //     handleSetAssignment(message, args);
    //   } else if (command === 'submit') {
    //     handleSubmit(message, args);
    //   } else if (command === 'clear_assignment') {
    //     handleClearAssignment(message);
    //   }

    // if (command === 'play') {
    //     if (message.member.voice.channel) {
    //         const connection = await message.member.voice.channel.join();

    //         const songName = args.join(' ');
    //         ytSearch(songName, async (err, result) => {
    //             if (err) return console.log(err);

    //             const videoUrl = result.videos[0].url;
    //             const stream = ytdl(videoUrl, { filter: 'audioonly' });
    //             const dispatcher = connection.play(stream);

    //             dispatcher.on('finish', () => {
    //                 connection.disconnect();
    //             });
    //         });
    //     } else {
    //         message.reply('Вы должны присоединиться к голосовому каналу!');
    //     }
    // }
    }); 
//     async function handleSetAssignment(message, args) {
//       const assignmentText = args.join(' ');
//       assignments[message.author.id] = assignmentText;
    
//       await message.reply('Задание установлено!');
//     }
    
//     async function handleSubmit(message, args) {
//       const submissionText = args.join(' ');
//       const authorId = message.author.id;
    
//       if (authorId in assignments) {
//         const assignment = assignments[authorId];
    
//         const differences = diff(assignment, submissionText);
    
//         if (differences) {
//           // Вывод подсказки с информацией о различиях
//           const diffText = differences.map(d => `\n- ${d.path.join('.')}: ${d.lhs}\n+ ${d.path.join('.')}: ${d.rhs}`).join(''); 
//           await message.reply(`Неверно! Попробуйте снова. Вот подсказка:n${diffText}`);
//         } else {
//           await message.reply('Правильно! Вы справились!');
//         }
//       } else {
//         await message.reply('Задание для вас не установлено. Сначала используйте команду set_assignment.');
//       }
// }
// async function handleClearAssignment(message) {
//     const authorId = message.author.id;
//     if (authorId in assignments) {
//       delete assignments[authorId];
//       await message.reply('Задание удалено!');
//     } else {
//       await message.reply('Задание не было установлено.');
//     }
//   }
client.login(
    ""
);
