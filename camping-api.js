import fetch from 'node-fetch';
import parser from 'node-html-parser';

import {getStore} from './store.js';

const URL = 'https://buchen.tooc24.de/customer/rerik/';

const assembleUrlQuery = (params) => {
    return Object.entries(params).reduce(
        (acc, val) =>
            acc ? acc + `&${val[0]}=${val[1]}` : `${val[0]}=${val[1]}`,
        '',
    );
};

const getSessionID = async () => {
    return await fetch(URL + 'index.php', {
        method: 'GET',
        mode: 'cors',
    }).then((res) => {
        const setCookie = res.headers.get('set-cookie');
        const sessionID = setCookie.match(/.*=(.*);.*/)[1];
        return sessionID;
    });
};

const fetchData = async ({anreise, abreise, tage}) => {
    const endpoint = URL + 'index.php?listcat';

    const params = {
        objgrp: -1,
        /**
         * Objektkategorie
         * -1: Alle
         * 1: Appartement Seeseite
         * 2: Appartement Seeblick
         * 3: Bungalow Kolibri
         * 4: Bungalow Pelikan
         * 5: Bungalow Möwe
         * 7: Komfortplatz
         * 8: Stellplatz 1. Reihe
         * 9: Stellplatz normal
         * 10: Stellplatz preiswert
         * 11: Zeltwiese
         */
        objkat: -1,
        /**
         * Früheste Anreise
         */
        anreise: anreise,
        /**
         * Späteste Abreise
         */
        abreise: abreise,
        /**
         * Übernachtungen
         */
        tage: tage,
        /**
         * Anzahl Erwachsene
         */
        1: 2,
        /**
         * Anzahl Jugendliche 14 - 18
         */
        2: 0,
        /**
         * Anzahl Kinder 3 -13
         */
        3: 0,
        /**
         * Anzahl Babys
         */
        4: 0,
        /**
         * Anzahl Haustiere
         */
        5: 0,
        submit_home: 'Jetzt+Suchen',
    };

    const sessionID = await getSessionID();

    const paramsString = assembleUrlQuery(params);

    return await fetch(endpoint, {
        headers: {
            'cache-control': 'max-age=0',
            'content-type': 'application/x-www-form-urlencoded',
            cookie: `PHPSESSID=${sessionID}; EU_COOKIE_LAW_CONSENT=true`,
        },
        body: paramsString,
        method: 'POST',
        mode: 'cors',
    }).then((res) => res.text());
};

const parseData = (htmlData) => {
    const root = parser.parse(htmlData);
    const dataElements = root.querySelector('.ctnfw > .ovrop');

    const children = dataElements.querySelectorAll('.ovrele');

    const data = children.map((node) => {
        const h2 = node.querySelector('h2');
        const infoDiv = node.querySelector('.ovrfwnoobj');
        const button = node.querySelector('.button');

        const object = h2.textContent;
        const objectsText = infoDiv ? infoDiv.textContent : button.textContent;
        const free = objectsText.match(/\d+/g)[0];

        return {
            object,
            free,
        };
    });

    return {
        timestamp: Date.now(),
        objects: data,
    };
};

export const searchBookings = async () => {
    const {anreise, abreise, tage} = getStore();
    const rawData = await fetchData({anreise, abreise, tage});
    return parseData(rawData);
};
