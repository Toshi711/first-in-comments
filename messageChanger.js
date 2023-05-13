import chalk from "chalk"
import { log } from "./utils.js"
import { Api } from "telegram"

class MessageChanger{
    constructor(){
        this.list = []
    }

    init(client,Api){
        this.client = client
        return this
    }

    interval(){
        const foo = () => {
            this.list = this.list.filter(item => {
                if(item.date - Date.now() <= 0){
                    this.client.invoke(new Api.messages.EditMessage({peer: item.chat, id: item.id, message: item.text}))
                    .then(
                            () => log.success('Текст комментария отредактирован'),
                            (e) => log.error(e)
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

 