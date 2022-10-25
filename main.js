/* Project purpose: Display clock digits on SteelSeries keyboard OLED and/or backlit keys */

import { setTimeout as setTimeoutPromise } from 'node:timers/promises';
import os from 'node:os';
import path from 'node:path';
import FileHandler from './FileHandler.js';
import DataHandler from './DataHandler.js';
import ClockData from './ClockData.js';
import TrafficHandler from './TrafficHandler.js';


const portFileOnOSX = "/Library/Application Support/SteelSeries Engine 3/coreProps.json";
const portFileOnWindows = "%PROGRAMDATA%/SteelSeries/SteelSeries Engine 3/coreProps.json";
const registerURLpath = "/register_game_event";

const dataHandler = new DataHandler();
const trafficHandler = new TrafficHandler();


function initialize() {

    // Get platform and destination info
    const infoFile = getFilePath(os.platform());

    /* Get the destination address from file */
    let dest = getDestination(infoFile);

    // TODO
    // bindGameEvent();
    registerGameEvent(dest);

    mainLoop(dest);

};


function registerGameEvent(url) {

    let registerData = new ClockData().registerEventData;

    //TODO post,
    url  = url + registerURLpath;
    postClockData(url, "", registerData);
}

function bindGameEvent() {


}


/* Out:  (string) Current time in local format */
function getTimeString() {
    return new Date().toLocaleTimeString();
}


/* Get the necessary destination address.
    Out: null, if address is not found or
        (string) address  */
function getDestination(filePath) {
    console.log(`Getting destination address`);

    const addressObj = new FileHandler().getObjectFromJSON(filePath);
    return addressObj.address;

}


/* */
function getFilePath(osPlatform) {
    let filePath = "";

    switch (osPlatform) {
        case 'win32':
            filePath = resolveWin32Path(portFileOnWindows);
            break;
        case "darwin":
            filePath = portFileOnOSX;
            // TODO real path
            break;
        default:
            console.log("Unsupported OS. Exiting app");
            stopApp(-1);
    }

    return filePath;
}


/* Remove all of '%' and add 'C:\' to beginning 
    In: (string) path 
    Out:  (string) path */
function resolveWin32Path(filepath) {

    let pathEnd = filepath;

    // get root directory
    let rootDir = path.parse(process.env.PATH.split(path.delimiter)[0]).root;

    pathEnd = dataHandler.removeCharsFromString(pathEnd, pathEnd.substring(0, 1));

    // final path
    pathEnd = path.join(rootDir, path.sep, pathEnd);

    return pathEnd;
}

function stopApp(code) {
    console.log("exit code: " + code);
    process.exit(code);
}


function checkOptions(options) {

    //TODO check address options
    return options;
}


// async function postClockData(dest, cTime) {
//     let jsonData = dataHandler.formatJSONstring(cTime, new ClockData().messageData);
//     let requestOptions = trafficHandler.getHttpOptions(dest);
//     // checkOptions(requestOptions);
//     await trafficHandler.startPostingData(requestOptions, jsonData);
// }

/* Make http options from url and JSON from string, start posting JSON to url
    In: url (string), string, object
    Out: */
async function postClockData(dest, dataString, dataObj) {

    let jsonData = dataHandler.formatJSONstring(dataString, dataObj);
    let requestOptions = trafficHandler.getHttpOptions(dest);
    // checkOptions(requestOptions);
    await trafficHandler.startPostingData(requestOptions, jsonData);
}


async function mainLoop(destination) {

    let postingStatus = false; // indicate failed or successful post
    let failCount = 0; // count failures

    while (true) {

        if (failCount > 60) {
            // Stop after consecutive fails to post
            break;
        }

        let clockTime = getTimeString();

        postingStatus = await postClockData(destination, clockTime, new ClockData().messageData);

        if (!postingStatus) {
            failCount++;
        } else {
            // successful post resets counter
            failCount = 0;
        }
        await setTimeoutPromise(500);

    }

    // Start again 
    initialize();
}

/* App start */
initialize();
