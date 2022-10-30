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
const bindURLpath = "/bind_game_event";
const eventPath = "/game_event";
const removeEventPath = "/remove_game_event";
const removeGamePath = "/remove_game";
const protocol = 'http://';
const corePropName = "address"; // property name in JSON file
let registered = false; // event registration status

const dataHandler = new DataHandler();
const trafficHandler = new TrafficHandler();
const clockData = new ClockData();

/*
In: (string) property name to find in JSON file
Out: undefined
    */
async function initialize(altPropName) {

    // Get platform and destination info
    const infoFile = getFilePath(os.platform());

    if(typeof infoFile === "number") {
        stopApp(infoFile); // no valid path found
        return;
    }

    /* Get the destination address from file */
    let dest = getDestination(infoFile, altPropName);

    // try to bind handler to destination
    registered = await registerOrBindGameEvent(protocol + dest, 'bind');

    if(registered) {
        mainLoop(dest);
    }
    else {
        // binding failed, try registering
        await setTimeoutPromise(5000);
        registered = await registerOrBindGameEvent(protocol + dest, 'register');

        if(registered) {
            mainLoop(dest);
        } else {
            tryInitializing(altPropName, dest);
        }
    }

};


async function removeEvent(url) {

    let result = await trafficHandler.postToLocalHttpHostAlt(protocol + url + removeEventPath, JSON.stringify(clockData.removeEventData), 'POST');
    if(result) {
        console.log("Event removed");
    } else {
        console.log("Event removal failed");
    }
}


/* Wait some and start over
In: (string) property name to find in JSON file
Out: undefined */
async function tryInitializing(propName, currentDest) {
    console.log("Trying again shortly...");
    removeEvent(currentDest);
    await setTimeoutPromise(30000);
    initialize(propName); 

}


/* Register or bind event to destination to enable its handling of data
In: url for destination (string), action (string)
Out: (boolean) true when successful | false otherwise */
async function registerOrBindGameEvent(url, action) {

    let registerData;

    if(action === 'bind') {
        url = url + bindURLpath;
        registerData = new ClockData().bindEventData;
    } else {
        url  =  url + registerURLpath;
        registerData = new ClockData().registerEventData;

    }

    // postClockData(url, "", registerData);
    let result = await trafficHandler.postToLocalHttpHostAlt(url, JSON.stringify(registerData), 'POST');
    // let result = await trafficHandler.postToLocalHttpHostAxios(url, registerData, 'POST');

    if( !result) {
        console.log(`Event ${action}ing failed`);
    } else {
        console.log(`Event ${action}ing successful`);
    }
    return result;

}


/* Out:  (string) Current time in local format */
function getTimeString() {
    return new Date().toLocaleTimeString();
}


/* Get the necessary destination address.
    Out: null, if address is not found or
        (string) address  */
function getDestination(filePath, propName) {
    console.log(`Getting destination address`);

    const addressObj = new FileHandler().getObjectFromJSON(filePath);
    return addressObj[`${propName}`];

}


/* In: os platform (string) 
    Out: file path (string) | exit code (number) */
function getFilePath(osPlatform) {
    let filePath = "";

    switch (osPlatform) {
        case 'win32':
            filePath = resolveWin32Path(portFileOnWindows);
            break;
        case "darwin":
            filePath = portFileOnOSX;
            // TODO real path
            // break;
        default:
            console.log("Unsupported OS. Exiting app");
            return 0;
    }

    return filePath;
}


/* Remove all of '%' (first char) from string
and add root ('C:\' from first entry in PATH) to beginning
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


/* Print exit code and set it to process */
function stopApp(code) {
    console.log("exit code: " + code);
    process.exitCode = code;
    // process.exit(code);
}


function checkOptions(options) {

    //TODO check address options
    return options;
}


/* Make JSON from string, start posting JSON to url
    In: url (string), data (string), object (format for JSON)
    Out: undefined */
async function postClockData(dest, dataString, dataObjTemplate) {

    let jsonData = dataHandler.formatJSONtimeString(dataString, dataObjTemplate);
    // let requestOptions = trafficHandler.getHttpOptions(dest, "POST"); // for node.js http
    // checkOptions(requestOptions);
    if(jsonData !== null) {
        // await trafficHandler.startPostingData(requestOptions, jsonData);
        await trafficHandler.startPostingData(dest, jsonData);
    }

}

/* Loop and try posting data. Stop if too many fails happen and start over from app start.
    In: url (string)
    */
async function mainLoop(destination) {

    let postingStatus = false; // indicate failed or successful post
    let failCount = 0; // count failures


    while (true) {

        if (failCount > 30) {
            // Stop after consecutive fails to post
            break;
        }

        let clockTime = getTimeString();

        // postingStatus = await postClockData(destination, clockTime, new ClockData().messageData);
        postClockData(protocol + destination + eventPath, clockTime, clockData.messageData);

        // if (!postingStatus) {
        //     failCount++;
        // } else {
        //     // successful post resets counter
        //     failCount = 0;
        // }

        await setTimeoutPromise(1000);

        if(!trafficHandler._postSuccessful) {
            failCount++;
            console.debug("Fails: ", failCount);
        } else {
            // successful post resets counter
            failCount = 0;
        }
    }

    // Start again 
    tryInitializing(corePropName, destination);
}

/* App start */
initialize(corePropName);
