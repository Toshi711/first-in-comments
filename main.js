import {Snake} from 'tgsnake'
import { formatId,log, readFile, fileExists, arrayRandom, askPath } from "./utils.js";
import handler from './messageChanger.js';
import config from './config.js'
import fs from 'fs/promises'
import input from 'input';
import chalk from 'chalk';
import path from 'path';
import printMessage from 'print-message'

printMessage([
    "Привет 🤙",
    "Первонах для телеграма (0.0.1)",
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

    const bot = new Snake({
        session: sessionPath,
        apiHash: config.appHash,
        apiId: config.appId,
        deviceModel: 'Android',
        systemVersion: '4.16.30-vxCUSTOM',
        storeSession: false,
        connectionRetries: 5
    })

    bot.run()
    handler.init(bot).interval()
    
    bot.on("message", async (ctx)=>{
        if(!ctx.senderChat?.id || !ctx?.replies) return
        try{
            const senderId = formatId(ctx.senderChat.id)
            const chat = ctx.chat.id
            const type = ctx.senderChat.type
            const views = ctx.views

            if(type == 'channel' && (!chats || chats.includes(senderId)) && views < 15){
                const message = await ctx.telegram.sendMessage(chat,arrayRandom(messages), {replyToMsgId: ctx.id})
                log.success(`Оставлен комментарий в ${ctx.senderChat.title}`)
                handler.push(config.changeTime * 1000, {chat, id: message.message.id, text: arrayRandom(secondMessages)})
            }

        } catch{     
            log.error('Ошибка')
        }
    })
      
    bot.on("connected", async () =>{
        const savedSession = `sessions/${bot.aboutMe.firstName}_${bot.aboutMe.id}.session`
        if(!(await fileExists('./sessions'))) await fs.mkdir('sessions')
        if(storeSession == 'Да'){
            await fs.writeFile(savedSession, await bot.save())
            log.success('📦 Cессия сохранена '+savedSession)
        }
    })

}
 
main();