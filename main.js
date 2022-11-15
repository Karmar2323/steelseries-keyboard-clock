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


const { trafficHandler, clockData, dataHandler } = initGlobals();

function initGlobals() {
    const dataHandler = new DataHandler();
    const trafficHandler = new TrafficHandler();
    const clockData = new ClockData();
    return { trafficHandler, clockData, dataHandler };
}

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
    await setTimeoutPromise(5000);
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
        registerData = clockData.bindEventData;
    } else {
        url  =  url + registerURLpath;
        registerData = clockData.registerEventData;

    }

    /* TODO remove test alternative */
    // let requestOptions = trafficHandler.getHttpOptions(url, "POST"); // for node.js http
    // requestOptions = checkOptions(requestOptions);
    // let result = trafficHandler.postToLocalHttpHost(url, requestOptions, JSON.stringify(registerData));

    /* working alt */
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
    if(addressObj !== null) {
        return addressObj[`${propName}`];
    } else {
        return null;
    }

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
console.debug("# ~ checkOptions ~ options", options);

    //TODO check address options
    return options;
}


/* Make JSON from string, start posting JSON to url
    In: url (string), data (string), object (format for JSON)
    Out: undefined */
async function postClockData(dest, dataString, dataObjTemplate) {

    let jsonData = dataHandler.formatJSONtimeString(dataString, dataObjTemplate);

    /* broken alternative (EADDRINUSE) TODO remove*/
    // let requestOptions = trafficHandler.getHttpOptions(dest, "POST"); // for node.js http
    // requestOptions = checkOptions(requestOptions);
    // trafficHandler.postToLocalHttpHost(dest, requestOptions, jsonData);
    // jsonData = null;

    /* working alternatives fetch or axios TODO choose */
    if(jsonData !== null) {
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
            //TODO check file
        } else {
            // successful post resets counter
            failCount = 0;
        }
    }

    // Start again 
    tryInitializing(corePropName, destination);
}

/* App start */
printInfo();
initialize(corePropName);


/* Post some info to OLED
    In: info text
    TODO */
async function postInfo(info) {
    let done = false;
    await setTimeoutPromise(5000);

    if (registered) {
        //TODO post to device, set done

    }

    if (!done) {
        // try again
        const infoTimer = setInterval(() => {
            //TODO post to device, set done

            if (done) {
                clearInterval(infoTimer);
            }
        }, 5000);
    }

    setTimeout((infoTimer) => {
        // stop trying
        if (!done) {
            clearInterval(infoTimer);
        }
    }, 30000);

}

/* Read package.json and print version info to console */
function printInfo() {
    let packageFileJSON = new FileHandler().getObjectFromJSON('./package.json');
    let appVersion = "ver. ";
    if (packageFileJSON === null) {
        appVersion = appVersion + "[no version info]";
    } else {
        appVersion = appVersion + packageFileJSON["version"] + " by " + packageFileJSON["author"];
    }
    const infoText = `\nClock app for SteelSeries OLED (${appVersion})\n`;
    console.log(infoText);

    postInfo(infoText);
}
