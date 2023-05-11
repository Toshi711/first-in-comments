import chalk from 'chalk'
import fs from 'fs/promises'
import path from 'path';
import input from 'input';

export const log = {
    error(text){
        console.log(chalk.bold.red(`[${new Date().toLocaleTimeString()}] ${text}`))
    },
    success(text){
        console.log(chalk.bold.greenBright(`[${new Date().toLocaleTimeString()}] ${text}`))
    }
}

export function formatId(id){
    return  String(id).replace('n','')
}

export async function readFile(path){
    return (await fs.readFile(path)).toString().split('\r\n').filter(item => !!item.trim())
}

export const fileExists = path => fs.stat(path).then(() => true, () => false);

export function arrayRandom(arr){
    return arr[Math.floor((Math.random()*arr.length))]
}

export async function askPath(text){
    let result
    while(true){
        result = await input.text(text);
        const file = await fileExists(result)
         if(!file){
            log.error('❗️Файл не найден')
            continue
         }
         const extension = path.extname(result)
         if(extension !== '.txt'){
            log.error('❗️Неверное расширение файла')
            continue
        }
        break
     }
    return result
}