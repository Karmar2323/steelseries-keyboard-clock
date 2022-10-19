import assert from 'assert';
import DataHandler from '../DataHandler.js';

describe ('DataHandler', () => {
    const dataHandler = new DataHandler();
    describe ('removeCharsFromString', () => {
        const unwanted =  "g";
        it(`should return string with no ${unwanted}`, () => {
            const result = dataHandler.removeCharsFromString(`12${unwanted}34${unwanted}21`, unwanted);
            console.debug("# ~ it ~ result", result);
            assert.equal(result.includes(unwanted), false);
        });
    });
});