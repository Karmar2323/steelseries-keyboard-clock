/* Project purpose: Display clock digits on SteelSeries keyboard OLED and/or backlit keys */

import { setTimeout as setTimeoutPromise } from 'node:timers/promises';
import os from 'node:os';
import path from 'node:path';
import FileHandler from './FileHandler.js';
import DataHandler from './DataHandler.js';



const portFileOnOSX = "/Library/Application Support/SteelSeries Engine 3/coreProps.json";
const portFileOnWindows = "%PROGRAMDATA%/SteelSeries/SteelSeries Engine 3/coreProps.json";

const dataHandler = new DataHandler();


function initialize() {

    // Get platform and destination info
    const infoFile = getFilePath(os.platform());

    /* Get the destination address from file */
    let dest = getDestination(infoFile);

    // TODO
    // bindGameSenseEvent();

    mainLoop(dest);

};


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

    const replacer = function () {
        return "";
    }
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


async function mainLoop(destination) {

    let postingStatus = false; // indicate failed or successful post
    let failCount = 0; // count failures

    while (true) {

        if (failCount > 60) {
            // Stop after consecutive fails to post
            break;
        }
        let clockTime = getTimeString();

        postingStatus = await dataHandler.postJSON(destination, clockTime);

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

