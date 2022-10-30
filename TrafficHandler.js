import http from 'node:http';
import { setTimeout as setTimeoutPromise } from 'node:timers/promises';
import axios from 'axios';

class TrafficHandler {

    contentType = 'application/json';

    _destination = "";
    get destination() {
        return this._destination;
    }
    set destination(value) {
        if (this._destination === value) {
            return;
        }
        this._destination = value;
        console.log("New destination: ", this._destination);
    }

    _postSuccessful = true;
    get postSuccessful() {
        return this._postSuccessful;
    }
    set postSuccessful(value) {
        this._postSuccessful = value;
    }

    axiosInstance = {};

    constructor() {
        this.axiosInstance = axios.create({
            baseURL: this._destination
        });
        this.axiosInstance.defaults.headers.post['Content-Type'] = this.contentType;
     }


    /* Parse URL to node.js http request options 
        In: URL (string), http method (string)
        Out: http options (object) */
    getHttpOptions(url, method) {

        let optionObj = {};

        let delimiterPos = url.indexOf(":");

        optionObj.localAddress = url.substring(0, delimiterPos);

        optionObj.localPort = Number.parseInt(url.substring(delimiterPos + 1));

        optionObj.path = url.substring(url.indexOf('/'));

        optionObj.method = method;

        optionObj.headers = {
            'Content-Type': this.contentType
          }
        return optionObj;
    }


    interpretResponse(response) {
        // TODO
        if (response.status !== undefined) {

            if(response.status === 200) {
                return true;
            } else {
                console.debug("response.status", response.status);
                return false;
            }

        }
        console.log("Unknown response");
        return false;
    }


    // TODO
    interpretError(error) {
        // console.debug("# ~ TrafficHandler ~ interpretError ~ error", error);
        return false;
    }


    /* In: url (string), data for request, http method (string)
        Out: response (object) | error */
    async postToLocalHttpHostAxios(url, data, method) {

        let options = {url: url, data: data, method: method};
        let response;
        // console.debug("# ~ TrafficHandler ~ postToLocalHttpHostAxios ~ options", options);

        try {
            // response = await axios(options);
            response = await this.axiosInstance(options);
        } catch (e) {
            console.error (e.code + ': ' + e.message + ': ' + options.url + ', data: ' + options.data);
            return this.interpretError(e);
        }

        return this.interpretResponse(response);
    }


    /* In: url (string), data for request, http method (string)
        Out: response (object) | error */
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



    // TODO fix, return value
    /* In: node.js http options (object), data for request
        Out: success (boolean) */
    async postToLocalHttpHost(options, data) {

        let done;

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
            console.error(`${e.code} problem with request: ${e.message}`);
            done = false;
        });


        postRequest.write(data);
        postRequest.end();

        await setTimeoutPromise(1000);
        // return postRequest.writableEnded;
        return done;
    }


    /* Post the data to destination 
        In:  (string) dest localhost address 
             (string) data 
        Out: (boolean) true if successful, false otherwise */
    async startPostingData(dest, data) {

        let success = false;

        this.destination = dest.localAddress ?? dest;

        if (data === null) {
            console.log("Nothing to post");
            return false;
        }

        if (dest.localAddress !== null) {

            // console.log(`Waiting to post: ${data}`);

            // start posting
            // const res = await this.postToLocalHttpHost(dest, data);
            // working alternatives:
            const res = await this.postToLocalHttpHostAlt(dest, data, 'POST');
            // const res = await this.postToLocalHttpHostAxios(dest, data, 'POST');

            // TODO handle response, signal fail/success
            // success = res;

            if (res === false) {
                this._postSuccessful = res;
            } else {
                this._postSuccessful = true;
            }


        } else {
            console.log(`Cannot post ${data}`);
            return false;
        }

        // return success;
    }

}
export default TrafficHandler;
