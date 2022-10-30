
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


    normalizeNumberFromString(numberString, oldMax, newMax) {
        let newNumber = Math.round(Number.parseInt(numberString) / oldMax * newMax);
        return newNumber;
    }


    /* Form JSON from data string: locale time string with format hh-mm-ss, where
            hh: 0...9 | 10...23,
            - : any character but 0...9,
            mm: 00...59,
            ss: 00...59
    In: string, ClockData messageData property
    Out: JSON formatted string */
    formatJSONtimeString(data, message) {

        let numberDataValue = 0;

        if (typeof data !== 'string') {
            data = data.toString();
        }

        if (message.data !== undefined) {
            /* Sending an event, not registering it with other object */
            // fill progress bar with integer 0...100
            let delimiter = data[data.search(/[^0-9]/)];
            numberDataValue = this.normalizeNumberFromString(data.slice(data.lastIndexOf(delimiter) + 1), 60, 100);
            message.data["value"] = numberDataValue;

            // time data: hour & min as text
            message.data["frame"]["textvalue"] = data.slice(0, data.lastIndexOf(delimiter));
        }

        // return JSON.stringify(message);
        return this.stringToJSON(message);
        // return message; // works with axios

    }

} export default DataHandler;
