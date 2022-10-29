
class DataHandler {

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


    /* In: any value
        Out: JSON string or null if JSON throws error */

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
    In: string, ClockData messageData property
    Out: JSON formatted string */
    formatJSONstring(data, message) {

        let numberDataValue = 0;

        if (typeof data !== 'string') {
            data = data.toString();
        }

        if (message.data !== undefined) {
            /* Sending an event, not registering it with other object */
             // fill progress bar with integer 0..100
            numberDataValue = Math.floor(new Date().getSeconds() / 60 * 100);
            message.data["value"] = numberDataValue;
            // time data: hour & min as text
            message.data["frame"]["textvalue"] = data.slice(0, 5);
        }

        // return JSON.stringify(message);
        return this.stringToJSON(message);
        // return message; // works with axios

    }

} export default DataHandler;
