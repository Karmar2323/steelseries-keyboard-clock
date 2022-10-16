import fs from 'node:fs';
// import path from 'node:path';

class FileHandler {
    constructor() { }

    /* In: (string) file path  
        Out: (string) address with port number or
             null, if address not found:  */
    readFileContent(file) {
        // console.log("# ~ readPortJSON ~ file", file);

        let fileContent;
        try {
            fileContent = fs.readFileSync(file);
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