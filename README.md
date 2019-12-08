## Boltobserv: A CSGO radar made specifically for observing

<div align="center">
	<img src="https://i.imgur.com/PDiQuLl.png" /><br />
	<strong>Giving CSGO observers a powerful new radar.</strong><br />
	<span>Easy to read, infinitely resizable, and with plenty of features the default CSGO radar does not have.</span>
</div>

## Features

### Advanced player dots

Just like in the default CSGO radar, players are represented as dots. Every dot has its observer slot number on top of it.

The type of dots displayed by Boltobserv:

| Dot                                    | Type              | Description                                                                                                          |
|----------------------------------------|-------------------|----------------------------------------------------------------------------------------------------------------------|
| ![](https://i.imgur.com/TfzvrAS.png)   | Default           | Player dots as seen on the normal CSGO radar, normally with a slot number on them.                                   |
| ![](https://i.imgur.com/dEDwuue.png)   | Dead              | Killed players are still faintly visible on the radar as a small cross.                                              |
| ![](https://i.imgur.com/AT9Ee6y.png)   | Bomb carrier      | For Ts only. Shows the player that has the C4 with them. Easily spottable on the radar because of the color difference.   |

### Clean radar backgrounds

Using radar backgrounds from [simpleradar.com](http://simpleradar.com/) that are even more accurate and clean than those in-game.
They're also much easier on the eyes.

![](https://i.imgur.com/Pvfi8vx.png)

### Advisories

Advisories are automatically detected events that the observer might want to switch to.
To make switching to this event easier, the observer slot number is displayed next to an icon noting the type of advisory.
The observer should still make his own judgment of the situation.

All possible advisories are (with increasing priority):

| Advisory                               | Type          | Description                                                                                                                    |
|----------------------------------------|---------------|--------------------------------------------------------------------------------------------------------------------------------|
| ![](https://i.imgur.com/xR9eknI.png)   | Default       | This is displayed when no other events are happening.                                                                          |
| ![](https://i.imgur.com/FCZ8oB0.png)   | Sole survivor | Only one member of a team is left standing. It's a good idea to observe this player, as all action will involve him.           |
| ![](https://i.imgur.com/DD2El5N.png)   | Bomb plant    | A terrorist has the bomb in his hands on a bombsite. Chances are that he'll plant it soon.                                     |
| ![](https://i.imgur.com/Xy1oLON.png)   | Defusing      | A CT is defusing the bomb. Because of a CSGO limitation, which CT is defusing is unclear if multiple CTs are on the bomb site. |

### Infinitely scalable

Because Boltobserv runs as an external application, it can be resized to be whatever size you want, and be moved to any display you want.
Running without window borders enables it to dedicate as much space as possible to the radar.

It can even [run in a browser](https://github.com/boltgolt/boltobserv/wiki/Opening-radar-in-browser), allowing you to view the radar over the network.

### And more

 - Smokes and molotovs
 - Split maps (nuke & vertigo)
 - Automatic zoom
 - Transparent radar background
 - Etc.


## Installation

1. Download the latest .zip form the [releases](https://github.com/boltgolt/boltobserv/releases) page and unzip it.
2. Launch `Boltobserv.exe`, it should ask you to automatically install the .cfg file. If it doesn't, copy the `gamestate_integration_boltobserv.cfg` file from the .zip to your CSGO config folder (the same folder you'd put an `autoexec.cfg`).
3. You're done! (Re)start CSGO and  Boltobserv should automatically connect.

Please report any bugs or feature requests here on Github.

## Special thanks

Thanks to [Inygon](https://inygon.com/) for supporting open source development on Boltobserv

[![Inygon](https://i.imgur.com/bQjz86D.png)](https://inygon.com/)

If you want to support development on specific functionality, don't hesitate to contact me. Supporting me through [Github Sponsors](https://github.com/sponsors/boltgolt/) is also very appreciated.

## License

This project is licensed under GPL-3. In short, this means that all changes you make to this project need to be made open source (among other things). Commercial use is encouraged, as is distribution.

The paragraph above is not legal advice and is not legally binding. See the LICENSE file for the full license.
