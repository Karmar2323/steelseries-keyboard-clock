/* FileHandler.js: read JSON files
* Project: "clock-for-steelseries-oled"
*/
import fs from 'node:fs';

class FileHandler {
    constructor() { }

    /* In: (string) file path  
        Out: (string) file content or
             null, if error is thrown  */
    readFileContent(file) {

        let fileContent;
        try {
            fileContent = fs.readFileSync(file, {'encoding': 'utf8'});
        } catch (err) {
            console.log(err.message);

            return null;
        }

        return fileContent;
    }


    /* Read JSON file, parse it and return result 
        in: (string) filepath 
        out: object, or
            null if JSON error */
    getObjectFromJSON(filePath) {
        const content = this.readFileContent(filePath);
        if (content === null) {
            return null;
        }
        const jsonObj = this.parseJSONfile(content);
        return jsonObj;
    }


    /* Parse JSON
        in: (string) file content 
        out: object from JSON string or
            null, if JSON error */
    parseJSONfile(coreObj) {
        // File was read
        try {
            coreObj = JSON.parse(coreObj);
        } catch (e) {
            return null;
        }
        return coreObj;
    }
}
export default FileHandler;
