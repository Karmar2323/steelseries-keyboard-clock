import http from 'node:http';
import { setTimeout as setTimeoutPromise } from 'node:timers/promises';

class TrafficHandler {

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

    constructor() { }

    
    /* Parse URL to node.js http request options 
        In: URL (string)
        Out: http options (object) */
    getHttpOptions(url) {

        let optionObj = {};

        let delimiterPos = url.indexOf(":");

        optionObj.localAddress = url.substring(0, delimiterPos);

        optionObj.localPort = Number.parseInt(url.substring(delimiterPos + 1));

        optionObj.path = url.substring(url.indexOf('/'));

        optionObj.method = 'POST';

        return optionObj;
    }



    async postToLocalHttpHostAlt (options, data) {
        
    }


    // TODO alternative
    async postToLocalHttpHost(options, data) {

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
    async startPostingData(dest, data) {

        let success = false;

        this.destination = dest.localAddress;

        if (data === null) {
            console.log("Nothing to post");
            return false;
        }

        if (dest.localAddress !== null) {

            console.log(`Waiting to post: ${data}`);

            try {
                // start posting
                const res = await this.postToLocalHttpHost(dest, data);
                // TODO handle response

                success = res;

            } catch (e) {
                console.error(e);
                success = false;
            }


        } else {
            console.log(`Cannot post ${data}`);
            return false;
        }

        return success;
    }

}
export default TrafficHandler;
