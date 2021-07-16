import TelegramBot from 'node-telegram-bot-api';
import {findTimeZone, getZonedTime} from 'timezone-support';

import {getStore} from './store.js';

let bot = null;
let chatId = null;

const getDateTimeString = (dt) => {
    return `<i>Stand: ${dt.day}.${dt.month} - ${dt.hours}:${dt.minutes} Uhr</i>`;
};

const getObjectAvailabilityString = (objects) => {
    return objects.reduce((acc, {object, free}) => {
        let result = acc ? acc + '\n\n' : acc;

        result += `<b>${object}:</b>\n${free} freie Plätze`;

        return result;
    }, '');
};

const getRequestParametersString = (abreise, anreise) => {
    return `<i>Anreise: ${anreise}\nAbreise: ${abreise}</i>`;
};

export const initBot = ({token, newChatId}) => {
    bot = new TelegramBot(token, {polling: true});
    chatId = newChatId;

    bot.onText(/\/init/, (msg) => {
        console.log(msg.chat.id);
    });

    bot.onText(/\/status/, sendStatus);
};

export const sendStatus = () => {
    if (!bot) {
        console.log('Error: Bot not initialized');
        return;
    }

    if (!chatId) {
        console.log('Error: No Chat ID');
        return;
    }

    const {timestamp, abreise, anreise, objects} = getStore();

    var nativeDate = new Date(timestamp);
    const berlin = findTimeZone('Europe/Berlin');
    const berlinTime = getZonedTime(nativeDate, berlin);

    let message =
        `🤖 So sieht es gerade aus. Ich sage Bescheid, wenn es neue Infos gibt. Schreibe /status in den Chat, wenn du sicher gehen willst wie der Stand ist.\n\n` +
        `${getDateTimeString(berlinTime)}\n` +
        `${getRequestParametersString(abreise, anreise)}\n\n` +
        `${getObjectAvailabilityString(objects)}\n\n` +
        `<a href="https://buchen.tooc24.de/customer/rerik/index.php">Link zur Buchungsseite</a>`;

    bot.sendMessage(chatId, message, {
        parse_mode: 'HTML',
    });
};
