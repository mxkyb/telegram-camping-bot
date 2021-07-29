import {findTimeZone, getZonedTime} from 'timezone-support';

import * as dotenv from 'dotenv';

import {initBot, sendStatus} from './bot.js';
import {searchBookings} from './camping-api.js';
import {updateStore} from './store.js';

dotenv.config();

initBot({
    token: process.env.TELEGRAM_BOT_TOKEN,
    newChatId: process.env.CHAT_ID,
});

const anreise = '16.08.2021';
const abreise = '23.08.2021';
const tage = '7';

updateStore({
    anreise,
    abreise,
    tage,
});

const checkCampingSite = async () => {
    const nativeDate = new Date();
    const berlin = findTimeZone('Europe/Berlin');
    const dt = getZonedTime(nativeDate, berlin);
    console.log(
        `[${dt.day}.${dt.month}-${dt.hours}:${dt.minutes}:${dt.seconds}] Check new Data`,
    );

    const data = await searchBookings();

    const result = updateStore(data);

    if (result) {
        sendStatus();
    }
};

await checkCampingSite();

sendStatus();

setInterval(async () => {
    await checkCampingSite();
}, 1000 * 1 * 60);
