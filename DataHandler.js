class DataHandler {
    _destination;
    get destination() {
        return this._destination;
    }
    set destination(value) {
        this._destination = value;
    }

    constructor() { }


    /* Post the data to destination 
        In:  (string) dest localhost address 
             (string) data 
        Out: (boolean) true if successful, false otherwise */
    postJSON(dest, data) {

        let success = false;

        if (this._destination !== dest) {
            console.debug("New destination: ", dest);
            this._destination = dest;
        }

        if (data === undefined) {
            const msg = data ?? "Nothing to post";
            return false;
        }

        if (dest !== null) {
            //TODO start posting
            // success = true;
            console.log(`Waiting to post: ${data}`);
        } else {
            console.log(`Cannot post '${data}`);
            return false;
        }

        return success;
    }
} export default DataHandler;