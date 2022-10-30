class ClockData {
    gameName = "CLOCK";
    eventName = "TIME";
    displayName = "Clock";

    registerGameData = {
        "game": this.gameName,
        "game_display_name": this.displayName,
        "developer": "My Game Studios"
    }

    messageData = {
        "game": this.gameName,
        "event": this.eventName,
        "data": {
            "value": 15,
            "frame": {
                "textvalue": "test text",
                "numericalvalue": 12
            }
        }
    }

    registerEventData = {
        "game": this.gameName,
        "event": this.eventName,
        "min_value": 0,
        "max_value": 59,
        "value_optional": true
    }


    // "Note: Engine 3.7.0 and later"
    screenHandler = {
        "device-type": "screened",
        "zone": "one",
        "mode": "screen",
        "datas": [{
            "icon-id": 15,
            "lines": [
                {
                    "has-text": true,
                    "context-frame-key": "textvalue",
                    // "context-frame-key": "numericalvalue",
                    // "arg": "(value: self)",
                    // "prefix": " Hour :("
                    // "suffix": ":",
                    "bold": true

                },
                {
                    "has-text": false,
                    // "context-frame-key": "second-line",
                    "has-progress-bar": true
                }

            ]
        }]
    }

    bindEventData = this.registerEventData;

    constructor() {
        this.bindEventData["handlers"] = [this.screenHandler];
    }

} export default ClockData;
