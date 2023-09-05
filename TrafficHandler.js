/* TrafficHandler.js: handles the http related operations
* Project: "clock-for-steelseries-oled"
*/
class TrafficHandler {

    contentType = 'application/json';

    _postSuccessful = true;
    get postSuccessful() {
        return this._postSuccessful;
    }
    set postSuccessful(value) {
        this._postSuccessful = value;
    }

    constructor() {
     }


    /* In: http response
        Out: (boolean) true for status 200, false otherwise */
    interpretResponse(response) {

        if(!(response instanceof Response)) {
            throw new TypeError("Input type error!");
        }

        if (response.status !== undefined) {

            if(response.status === 200) {
                return true;
            } else {
                console.debug("Response.status: ", response.status);
                return false;
            }

        }
        console.log("Unknown response");
        return false;
    }


    // TODO?
    interpretError(error) {

        return false;
    }


    /* In: url (string), data for request, http method (string)
        Out: (boolean) returned via interpretResponse or interpretError */
    async postToLocalHttpHostAlt(url, data, method) {

        let response;

        const options = {
            method: method,
            headers: {
                'Content-Type': this.contentType
                },
            body: data
         };

        try {
            response = await fetch(url, options);
        }
        catch (e) {
            console.error(e.message + ': ' + e.cause);
            return this.interpretError(e);
        }
        return this.interpretResponse(response);
    }


    /* Post the data to destination 
        In:  (string) dest localhost address 
             (string) data 
        Out: (boolean) true if successful, false otherwise */
    async startPostingData(dest, data) {

        if (data === null) {
            console.log("Nothing to post");
            return false;
        }

        if (dest.localAddress !== null) {

            const res = await this.postToLocalHttpHostAlt(dest, data, 'POST');

            if (res === false) {
                this._postSuccessful = res;
            } else {
                this._postSuccessful = true;
            }

        } else {
            console.log(`Cannot post ${data}`);
            return false;
        }

        return true;

    }

}
export default TrafficHandler;
