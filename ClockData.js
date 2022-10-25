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
            "value": 15
        }
    }

    registerEventData = {
        "game": this.gameName,
        "event": this.eventName,
        "min_value": 0,
        "max_value": 59,
        "icon_id": 0,
        "value_optional": false
      }

    constructor(){}

} export default ClockData;