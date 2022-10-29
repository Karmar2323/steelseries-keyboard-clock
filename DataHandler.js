
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

        if (typeof data !== 'string') {
            data = data.toString();
        }

        // let JSONdata = this.stringToJSON();

        // make integer for test posting TODO
        // let numberDataValue = this.removeCharsFromString(data, data.substring(2,3));

        if (message.data !== undefined) {
            /* Sending an event, not registering it with other object */
            let numberDataValue = new Date().getHours(); // try hours

            message.data["value"] = numberDataValue;
            // msg.data["value"] = JSONdata;
        }

        return JSON.stringify(message);

    }

} export default DataHandler;
