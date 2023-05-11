import chalk from "chalk"
import { log } from "./utils.js"

class MessageChanger{
    constructor(){
        this.list = []
    }

    init(bot){
        this.bot = bot
        return this
    }

    interval(){
        const foo = () => {
            this.list = this.list.filter(item => {
                if(item.date - Date.now() <= 0){
                    this.bot.telegram.editMessage(item.chat,item.id,item.text)
                        .then(
                            () => log.success('Текст комментария отредактирован'),
                            () => log.error('Не удалось обновить текст')
                        )
                    return false
                }
                return true
            })
            setTimeout(foo,10_000)
        }
        setTimeout(foo,10_000)
    }
    
    push(time,data){
        this.list.push({date: Date.now() + time,...data})
    }
}

export default new MessageChanger()
