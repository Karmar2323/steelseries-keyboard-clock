# Real-time clock for SteelSeries keyboards

Some SteelSeries keyboard models have an OLED screen for displaying small images, keyboard configurations or events from compatible games and apps. The aim of this project is to enable viewing of real time clock digits on the SteelSeries keyboard screen.

## Work in progress
The project was started on October 9th 2022 by taking a look at [SteelSeries GameSense SDK](https://github.com/SteelSeries/gamesense-sdk). Programming continued with small steps on October 14th and 15th, progressing to the first contribution on the 16th.

The minimum functionality target, the local time on the OLED screen, was achieved on October 30th 2022. Further development may include e.g. stability improvement, sleep mode/screen saver, start/stop schedule, using of illumination/RGB lighting...

The next new functionality was devised in early September 2023 as the evenings begun darkening again. Inputting a number on the command line changes the clock event update interval. This might be useful if, for instance, another app also has events to show on the screen. The restriction of intervals to under 15 seconds is due to GameSense's deactivation [timeout](https://github.com/SteelSeries/gamesense-sdk/blob/master/doc/api/sending-game-events.md#heartbeatkeepalive-events).

## Working functionality
On the OLED screen is displayed
- the [icon](https://github.com/SteelSeries/gamesense-sdk/blob/master/doc/api/event-icons.md) for clock from SteelSeries GameSense SDK,
- the current time (e.g. 9.37 or 22.02 or 12:33),
- a progress bar that depicts the seconds accumulating toward the next minute.

<img src="./readme_images/clock_bar_144_40.jpg" alt="Photo of the screen of SteelSeries Apex 7" width = "144" height="40" title="View of the OLED screen of SteelSeries Apex 7">

The command line interface
- accepts numbers from <kbd>1</kbd> to <kbd>14</kbd> to set the clock update interval in seconds.

## Requirements
- [Node.js](https://nodejs.org/en) version 18
- SteelSeries Engine 3 or SteelSeries GG on Windows
- A screened SteelSeries device

## Instructions
- Download the code from this repository with a browser: Click "Code", then "Download ZIP".
- Unpack the downloaded ZIP file.
- Open a command prompt at the location of the unpacked files.
- Start the app with the command: <kbd>node main.js</kbd> or <kbd>node main</kbd>.
- Change update interval of the on-screen clock: input a number (<kbd>1</kbd> to <kbd>14</kbd> accepted).
- Terminate the app: Use the force (<kbd>⌃C</kbd>, <kbd>⌃C</kbd>).
- Install dependencies (for testing and development) with the npm package manager: <kbd>npm install</kbd>.
- Run the test script: <kbd>npm test</kbd>.
- Troubleshooting: Try restarting SteelSeries Engine or GG.

More readme content may be coming later.
