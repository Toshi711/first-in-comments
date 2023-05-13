import { formatId,log, readFile, fileExists, arrayRandom, askPath } from "./utils.js";
import handler from './messageChanger.js';
import config from './config.js'
import fs from 'fs/promises'
import input from 'input';
import chalk from 'chalk';
import path from 'path';
import printMessage from 'print-message'
import { TelegramClient, Api, Logger } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { NewMessage } from "telegram/events/index.js";


printMessage([
    "Привет 🤙",
    "Первонах для телеграма (0.0.2)",
    "Разработчик "+chalk.bold.underline('t.me/Caed3s')
], {
    border: true,
    color: 'green', // Text color
    borderColor: 'blue', // Border color is blue
    sideSymbol: '',
    marginTop: 3, // Margin before border is begins
    marginBottom: 3, // Margin after border is end
    paddingTop: 1, // Padding top after border begins
    paddingBottom: 1, // Padding bottom before border ends
});

if(!config || !config.appId || !config.appHash){
    log.error('App_id или App_hash не найдены')
    process.exit()
}

async function main() {
 
    let sessionPath
    if(await fileExists('./sessions')){
        const filesList = (await fs.readdir(path.join(path.resolve(),'sessions'))).filter((e) => path.extname(e).toLowerCase() === '.session');
        if(filesList.length > 0) {
            sessionPath = await input.select('🔰Выберите сессию', ['Новая сессия', ...filesList])
            sessionPath = sessionPath == 'Новая сессия' ? null : (await fs.readFile('./sessions/'+sessionPath)).toString()
        }
    }

    const firstMessagePath = await askPath('🔰Введите путь до файла с сообщениями >');
    const secondMessagePath = await askPath('🔰Введите путь до файла с сообщениями, которые будут заменять предыдущие >')
    const select = await input.select('🔰Каналы для спама', ['Все каналы, которые есть на аккаунте','.txt файл с каналами'])

    let chats
    if(select  == '.txt файл с каналами'){
        chats = await readFile(await askPath('🔰Введите путь до файла с группами >'))
    }

    const storeSession = await input.select('📃Cохранить сессию?', ['Да','Нет'])

    const messages = await readFile(firstMessagePath)
    const secondMessages = await readFile(secondMessagePath)

    const client = new TelegramClient(new StringSession(sessionPath), config.appId, config.appHash, {
        connectionRetries: 5,
        deviceModel: 'Android',
        systemVersion: '4.16.30-vxCUSTOM',
        baseLogger: new Logger('error')
    });

    await client.start({
        phoneNumber: async () => await input.text("Введите номер телефона >"),
        password: async () => await input.text("2Fa >"),
        phoneCode: async () => await input.text("Код подтверждения >"),
        onError: (err) => log.error('Ошибка авторизации!'),
    });

    handler.init(client).interval()
    
    const me = await client.getMe()
    const savedSession = `sessions/${me.firstName}_${me.id.value}.session`
    if(!(await fileExists('./sessions'))) await fs.mkdir('sessions')
    if(storeSession == 'Да'){
        await fs.writeFile(savedSession, client.session.save())
        log.success('📦 Cессия сохранена '+savedSession)
    }

    async function eventPrint(event) {
        const message = event.message;
        const replies = event.message.replies
    
        if(!replies || !replies?.channelId?.value) return
    
        const channel = await message.getSender();
        const chat = replies.channelId.value
        const views = message.views
        const type = channel.className
        const channelId = channel.id.value

        try{
            const discussionMessage = await client.invoke(new Api.messages.GetDiscussionMessage({peer: channelId,msgId: message.id}))
            const id = discussionMessage.messages[0].id
            
            if(type == 'Channel' && views < 15){
                const sent = await client.sendMessage(chat, {message: arrayRandom(messages), replyTo: id})
                handler.push(1000 * config.changeTime, {text: arrayRandom(secondMessages), chat, id: sent.id})
                log.success('Оставлен комментарий в '+channel.title)
            }
        }
        catch(e){
            log.error('Ошибка')
        }
         
    }


    client.addEventHandler(eventPrint, new NewMessage({chats: chats ? chats : null}));


}
 
main();