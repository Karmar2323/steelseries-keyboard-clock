/* ClockHandler.js: initialize data and execute operations
* Project: "clock-for-steelseries-oled"
* Project purpose: Display clock digits on SteelSeries keyboard OLED
*/

import { setTimeout as setTimeoutPromise } from 'node:timers/promises';
import os from 'node:os';
import path from 'node:path';
import FileHandler from './FileHandler.js';
import DataHandler from './DataHandler.js';
import ClockData from './ClockData.js';
import TrafficHandler from './TrafficHandler.js';
import ClockEventEmitter from './ClockEventEmitter.js';

class ClockHandler {
    constructor(){
        this.dataHandler = new DataHandler();
        this.trafficHandler = new TrafficHandler();
        this.clockData = new ClockData();
        this.eventEmitter = new ClockEventEmitter(this);
        this.initialize(this.corePropName);
    }
    portFileOnOSX = "/Library/Application Support/SteelSeries Engine 3/coreProps.json";
    portFileOnWindows = "%PROGRAMDATA%/SteelSeries/SteelSeries Engine 3/coreProps.json";
    registerURLpath = "/register_game_event";
    bindURLpath = "/bind_game_event";
    eventPath = "/game_event";
    removeEventPath = "/remove_game_event";
    removeGamePath = "/remove_game";
    protocol = 'http://';
    corePropName = "address"; // property name in JSON file
    registered = false; // event registration status
    _updateInterval = 1000;
    get updateInterval() {
        return this._updateInterval;
    }
    set updateInterval(value) {
        this._updateInterval = value;
    }

    /*
    In: (string) property name to find in JSON file
    Out: undefined
        */
    async initialize(altPropName) {
        this.printInfo();
        console.log("Initializing app");
        // Get platform and destination info
        const infoFile = this.getFilePath(os.platform());

        if(typeof infoFile === "number") {
            this.stopApp(infoFile); // no valid path found
            return;
        }

        // Get the destination address from file
        let dest = this.getDestination(infoFile, altPropName);
        console.log("New destination: ", dest);
        // try to bind handler to destination
        this.registered = await this.registerOrBindGameEvent(this.protocol + dest, 'bind');
        if(this.registered) {
            this.mainLoop(dest);
        }
        else {
            // binding failed, try registering
            await setTimeoutPromise(5000);
            this.registered = await this.registerOrBindGameEvent(this.protocol + dest, 'register');

            if(this.registered) {
                this.mainLoop(dest);
            } else {
                this.tryInitializing(altPropName, dest);
            }
        }
    };

    /* Remove event from gamesense */
    async removeEvent(url) {

        let result = await this.trafficHandler.postToLocalHttpHostAlt(
            this.protocol + url + this.removeEventPath, 
            JSON.stringify(this.clockData.removeEventData), 'POST');

        if(result) {
            console.log("Event removed");
        } else {
            console.log("Event removal failed");
        }

        return result;
    }


    /* Wait some and start over
    In: (string) property name to find in JSON file
    Out: undefined */
    async tryInitializing(propName, currentDest) {

        console.log("Trying to remove event in 5 s...");
        await setTimeoutPromise(5000);
        let removed = await this.removeEvent(currentDest);

        console.log("Starting over in 30 s...");
        await setTimeoutPromise(30000);
        this.initialize(propName); 

    }


    /* Register or bind event to destination to enable its handling of data
    In: url for destination (string), action (string)
    Out: (boolean) true when successful | false otherwise */
    async registerOrBindGameEvent(url, action) {

        let registerData;

        if(action === 'bind') {
            url = url + this.bindURLpath;
            registerData = this.clockData.bindEventData;
        } else {
            url  =  url + this.registerURLpath;
            registerData = this.clockData.registerEventData;

        }

        console.log(`Trying to ${action} event with SSE`);

        /* working alternative using fetch */
        let result = await this.trafficHandler.postToLocalHttpHostAlt(url, JSON.stringify(registerData), 'POST');

        if( !result) {
            console.log(`Event ${action}ing failed`);
        } else {
            console.log(`Event ${action}ing successful`);
        }
        return result;

    }


    /* Out:  (string) Current time in local format */
    getTimeString() {
        return new Date().toLocaleTimeString();
    }


    /* Get the necessary destination address.
        Out: null, if address is not found or
            (string) address  */
    getDestination(filePath, propName) {
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
    getFilePath(osPlatform) {
        let filePath = "";

        switch (osPlatform) {
            case 'win32':
                filePath = this.resolveWin32Path(this.portFileOnWindows);
                break;
            case "darwin":
                filePath = this.portFileOnOSX;
                // unsupported: real path not tested
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
    resolveWin32Path(filepath) {

        let pathEnd = filepath;

        // get root directory
        let rootDir = path.parse(process.env.PATH.split(path.delimiter)[0]).root;

        pathEnd = this.dataHandler.removeCharsFromString(pathEnd, pathEnd.substring(0, 1));

        // final path
        pathEnd = path.join(rootDir, path.sep, pathEnd);

        return pathEnd;
    }


    /* Print exit code and set it to process */
    stopApp(code) {
        console.log("exit code: " + code);
        process.exitCode = code;
    }


    /* Make JSON from string, start posting JSON to url
        In: url (string), data (string), object (format for JSON)
        Out: undefined */
    async postClockData(dest, dataString, dataObjTemplate) {

        let jsonData = this.dataHandler.formatJSONtimeString(dataString, dataObjTemplate);

        if(jsonData !== null) {
            await this.trafficHandler.startPostingData(dest, jsonData);
        }
        else {
            console.log("Can not find JSON data!");
        }

    }

    /* Loop and try posting data. Stop if too many fails happen and start over from app start.
        In: url (string)
        */
    async mainLoop(destination) {

        let failCount = 0; // count failed posts

        while (true) {

            if (failCount > 30) {
                // Stop after consecutive fails to post
                break;
            }

            let clockTime = this.getTimeString();

            this.postClockData(this.protocol + destination + this.eventPath,
                clockTime, this.clockData.messageData);

            await setTimeoutPromise(this.updateInterval);

            if(!this.trafficHandler._postSuccessful) {
                failCount++;
                console.debug("Fails: ", failCount);
            } else {
                // successful post resets counter
                failCount = 0;
            }
        }

        // Start again 
        this.tryInitializing(this.corePropName, destination);
    }

    /* Read package.json and print version info to console */
    printInfo() {
        let packageFileJSON = new FileHandler().getObjectFromJSON('./package.json');
        let appVersion = "ver. ";
        if (packageFileJSON === null) {
            appVersion = appVersion + "no version info";
        } else {
            appVersion = appVersion + packageFileJSON["version"] + " (C) " + packageFileJSON["author"];
        }
        const infoText = `\nClock app for SteelSeries OLED [${appVersion}]\n`;
        console.log(infoText);
    }
}
export default ClockHandler;
