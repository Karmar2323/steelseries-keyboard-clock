
/* ClockEventEmitter.js: interface and signal handlers
* Project: "clock-for-steelseries-oled"
*/
import EventEmitter from 'node:events';
import * as readline from 'node:readline';
import { stdin as input, stdout as output } from 'node:process';

class ClockEventEmitter extends EventEmitter {
    constructor(clockHandler) {
        super();
        this.clockHandler = clockHandler; // allow reference to properties
        this.rlInterface = readline.createInterface({input, output});
        this.addListeners();
    }

    /* signals */
    lineChanged = "line";

    /* add signal listeners */
    addListeners() {
        this.rlInterface.on(this.lineChanged, (input) => {
            let testedInput = this.testInput(input);
            if(!isNaN(testedInput)) {
                this.clockHandler._updateInterval = 1000 * testedInput;
            }
            this.printInstruction();
        });

        setTimeout(() => {
            this.printInstruction();
        }, 2000);
    }

    /* */
    printInstruction(){
        console.log(`  ${this.clockHandler._updateInterval * 0.001}`
        + ` s clock update interval. To change, give a number (1...14)`);
    }

    /* In: any (user input)
       Out: Number (NaN | integer 1...14)
     */
    testInput(input){
        let inputNumber = Number(input);
        let out = 1;

        if(isNaN(inputNumber)) {
            return NaN;
        } else {
            out = Math.floor(inputNumber);
        }

        //allow 1...14 since gamesense deactivates events after 15 s
        if(out > 14) {
            out = 14;
        } else {
            if (out < 1) {
                out = 1;
            }
        }
        return out;
    }

}
export default ClockEventEmitter;
