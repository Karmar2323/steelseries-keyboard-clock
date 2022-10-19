import http from 'node:http';
import { setTimeout as setTimeoutPromise } from 'node:timers/promises';

class DataHandler {
    _destination;
    get destination() {
        return this._destination;
    }
    set destination(value) {
        this._destination = value;
    }

    gameName = "MY_PC_APP";
    eventName = "TIME";

    message = {
        "game": this.gameName,
        "event": this.eventName,
        "data": {
            "value": 75
        }
    }

    constructor() { }


    /* Remove all occurences of a character from string
        In: string, string | RegExp
        Out: string */
    removeCharsFromString(oldString, charToRemove) {

        const replacer = function () {
            return "";
        }

        // make regexp
        const re = new RegExp(charToRemove, 'g');

        // replace matches
        const newString = oldString.replace(re, replacer);


        return newString;
    }


    stringToJSON(value) {

        let jsonData;

        try {
            jsonData = JSON.stringify(value);
        }
        catch (e) {
            console.error(e);
            return null;
        }
        return jsonData;
    }


    /* Form JSON from data string
    In: string
    Out: JSON formatted string */
    formatJSONstring(data) {

        if (typeof data !== 'string') {
            data = data.toString();
        }

        // let JSONdata = this.stringToJSON();


        let msg = this.message;

        // make integer for test posting TODO
        // let numberDataValue = this.removeCharsFromString(data, data.substring(2,3));
        let numberDataValue = new Date().getHours(); // try hours

        msg.data["value"] = numberDataValue;
        // msg.data["value"] = JSONdata;

        return JSON.stringify(msg);

    }


    /* Request options */
    formOptions(dest) {

        let optionObj = {};

        let delimiterPos = dest.indexOf(":");

        optionObj.localAddress = dest.substring(0, delimiterPos);

        optionObj.localPort = Number.parseInt(dest.substring(delimiterPos + 1));

        optionObj.method = 'POST';

        return optionObj;
    }



    // TODO alternative
    async postToLocalHost(options, data) {

        let done = null;

        const postRequest = http.request(options, (res) => {
            res.on('data', (chunk) => {
                console.log(`BODY: ${chunk}`);
            });
            res.setEncoding('utf8');
            res.on('end', () => {
                console.log('No more data in response.');
                done = true;
            });
        });

        postRequest.on('error', (e) => {
            console.error(`problem with request: ${e.message}`);
            done = false;
        });

        postRequest.write(data);
        postRequest.end();

        await setTimeoutPromise(500);
        return done;
    }


    /* Post the data to destination 
        In:  (string) dest localhost address 
             (string) data 
        Out: (boolean) true if successful, false otherwise */
    async postJSON(dest, data) {
        // TODO is dest empty
        let success = false;

        // format data
        data = this.formatJSONstring(data);

        let requestOptions = this.formOptions(dest, data);

        if (requestOptions === null) {
            success = false;
            console.log('Unable to post');
            return false;
        }


        if (this._destination !== dest) {
            console.log("New destination: ", dest);
            this._destination = dest;
        }

        if (data === null) {
            console.log("Nothing to post");
            return false;
        }

        if (dest !== null) {

            console.log(`Waiting to post: ${data}`);

            try {
                // TODO start posting
                const res = await this.postToLocalHost(requestOptions, data);
                // TODO handle response

                success = res;

            } catch (e) {
                console.error(e);
                success = false;
            }


        } else {
            console.log(`Cannot post '${data}`);
            return false;
        }

        return success;
    }


} export default DataHandler;
