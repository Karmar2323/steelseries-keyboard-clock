import assert from 'assert';
import DataHandler from '../DataHandler.js';
import ClockData from '../ClockData.js';

const dataHandler = new DataHandler();
const clockData = new ClockData();
describe('DataHandler', () => {

    describe('removeCharsFromString', () => {
        const unwanted = "g";
        it(`should return string with no ${unwanted}`, () => {
            const result = dataHandler.removeCharsFromString(`12${unwanted}34${unwanted}21`, unwanted);
            console.debug("# ~ it ~ result", result);
            assert.equal(result.includes(unwanted), false);
        });
        it(`should return input string`, () => {
            let input = `12x34x21`;
            const result = dataHandler.removeCharsFromString(input, unwanted);
            console.debug("# ~ it ~ result", result);
            assert.equal(result.includes(input), true);
        });

    });
    describe('normalizeNumberFromString', () => {
        const inputs = ['-50', '-1', '0', '1', '59', '60'];

        for (const numIn of inputs) {
            const result = dataHandler.normalizeNumberFromString(numIn, 60, 100);
            it('should return integer', () => {
                assert.equal(Number.isInteger(result), true);
            });
            it('should return integer', () => {
                const result = dataHandler.normalizeNumberFromString(Number.parseInt(numIn), 60, 100);
                assert.equal(Number.isInteger(result), true);
            });
        }
        it('should return 0', () => {
            const result = dataHandler.normalizeNumberFromString('a', 60, 100);
            assert.equal(result, 0);
        });
    });
    describe('formatJSONtimeString', () => {
        const expected = ['9.22', '12.22', '23.59', '0.00'];
        const input = ['9.22.22', '12.22.22', '23.59.59', '0.00.00'];
        for (let i = 0; i < input.length; i++) {
            it(`should return JSON with data field ${expected[i]}`, () => {
                const result = dataHandler.formatJSONtimeString(input[i], clockData.messageData);
                assert.equal (JSON.parse(result).data["frame"]["textvalue"], expected[i]);
            });
        }
    });
});
