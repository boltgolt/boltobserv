<div align="center">
	<img src="https://i.imgur.com/VxEv6oI.png" alt="Boltobserv logo" /><br /><br />
	<strong>Giving CSGO observers a powerful new radar.</strong><br />
	<span>Easy to read, infinitely resizeable, and with tons of features the default CSGO radar does not have.</span><br /><br />
	<img src="https://i.imgur.com/ydc2Hf9.gif" />
</div>

## Features

### Advanced player dots

Player dots show more than just the location of the player. With 6 different dot states an observer can see exactly what a player is doing. The player slot number is shown as clear as possible on top of each dot.

| Dots                                   | Type              | Description                                                                                                             |
|----------------------------------------|-------------------|-------------------------------------------------------------------------------------------------------------------------|
| ![](https://i.imgur.com/rS7z3Hh.png)   | Default           | Player dots as seen on the normal CSGO radar, normally with a slot number on them.                                      |
| ![](https://i.imgur.com/qCqMGfY.png)   | Flashed           | Flashed players have a semi-white glow. This only shows when players are fully flashed (white screen).                  |
| ![](https://i.imgur.com/QNhkhlV.png)   | Active            | A ring is shown around players that the observer selects to show the POV from.                                          |
| ![](https://i.imgur.com/lemRnpz.png)   | Shooting          | Muzzle flashes when a player fires a shot with any weapon. Shows for 1 frame for each shot.                             |
| ![](https://i.imgur.com/HgQuHIY.png)   | Being damaged     | When any amount of health is lost the player dot shows a red line on the back of a player dot.                          |
| ![](https://i.imgur.com/ahtStgB.png)   | Bomb carrier      | For Ts only. Shows the player that has the C4 with them. Easily spottable on the radar because of the color difference. |
| ![](https://i.imgur.com/dFSweaR.png)   | Dead              | Killed players are still faintly visible on the radar as a small cross.                                                 |

### Clean radar backgrounds

The radar images used are made in close cooperation with [simpleradar](https://readtldr.gg/simpleradar) and [readtldr.gg](https://readtldr.gg/), and are much higher quality and with more exact positioning of wall than the in-game radar. Every radar image is custom made for Boltobserv, allowing features like buyzones that are only shown during buytime. The style used by simpleradar is also much easier on the eyes.

![](https://i.imgur.com/Pvfi8vx.png)

### Follow the action

<img src="https://imgur.com/2i10hEO.gif"  align="right"/>

When only a few players are alive most of the radar is just empty and only a very small part contains all the action. Boltobserv has an autozoom feature that fixes this. The radar image can automatically pan and zoom according to where the players are located, and smoothly follows the action.

Autozoom tries to keep the action in the middle, with a safe padding around any players so they can never accidentality run off the radar image. it also has a minimal zoom level, so that the radar only zooms in when the action is concentrated in a small part of the map.

### Advisories

Advisories are automatically detected events that the observer might want to switch to.
To make switching to this event easier, the observer slot number is displayed next to an icon noting the type of advisory.
The observer should still make his own judgment of the situation.

All possible advisories are (with increasing priority):

| Advisory                               | Type          | Description                                                                                                          |
|----------------------------------------|---------------|----------------------------------------------------------------------------------------------------------------------|
| ![](https://i.imgur.com/xR9eknI.png)   | Default       | This is displayed when no other notable events are happening.                                                        |
| ![](https://i.imgur.com/DD2El5N.png)   | Bomb plant    | A terrorist is planting the bomb on a bombsite.                                                                      |
| ![](https://i.imgur.com/Xy1oLON.png)   | Defusing      | A CT is defusing the bomb.                                                                                           |
| ![](https://i.imgur.com/FCZ8oB0.png)   | Sole survivor | Only one member of a team is left standing. It's a good idea to observe this player, as all action will involve him. |

### Infinitely scalable

Because Boltobserv runs as an external application, it can be resized to be whatever size you want, and be moved to any display you want.
Running without window borders enables it to dedicate as much space as possible to the radar.

It can even [run in a browser](https://github.com/boltgolt/boltobserv/wiki/Opening-radar-in-browser), allowing you to view the radar over the network. This also means that the radar can be added as a browser source in applications like OBS with ransparent background.

### And much more

 - Smokes, molotovs and flashbangs shown on the map
 - Split maps for upper and lower on Nuke and Vertigo
 - Any radar background color, including full transparency
 - Always-on-top and fixed on-screen positioning
 - Player dot z-height indicators, either by color dot or scale
 - [Custom configurable OS-level keybinds](https://github.com/boltgolt/boltobserv/wiki/How-to-use-keybinds)
 - Automatic .cfg file installation
 - Show radar as an application window, in [the browser](https://github.com/boltgolt/boltobserv/wiki/Opening-radar-in-browser) or [capture it directly in OBS](https://github.com/boltgolt/boltobserv/wiki/How-to-capture-Boltobserv-in-OBS)


## Installation

1. Download the latest .zip form the [releases](https://github.com/boltgolt/boltobserv/releases) page and unzip it.
2. Launch `Boltobserv.exe`, it should ask you to automatically install the .cfg file. If it doesn't, copy the `gamestate_integration_boltobserv.cfg` file from the .zip to your CSGO config folder (the same folder you'd put an `autoexec.cfg`).
3. You're done! (Re)start CSGO and Boltobserv should automatically connect.

Please report any bugs or feature requests here on Github.

## Configuration

Most functions of Boltoberv are configurable. To make your own config, go to `/resources/app/config` and either edit the `config.json5` file directly or duplicate it and rename the copy to `config.override.json5`. Using a override file will allow you to move your settings to a different machine or version without breaking the base config file.

## Special thanks

Thanks to [PGL](https://www.pglesports.com/) and [Inygon](https://inygon.com/) for supporting open source development on Boltobserv

[![PGL](https://i.imgur.com/0LaJULP.png)](https://www.pglesports.com/)
[![Inygon](https://i.imgur.com/bQjz86D.png)](https://inygon.com/)

If you want to support development on specific functionality, don't hesitate to contact me. Supporting me through [Github Sponsors](https://github.com/sponsors/boltgolt/) is also very appreciated.

## License

This project is licensed under GPL-3. In short, this means that all changes you make to this project need to be made open source (among other things). Commercial use is encouraged, as is distribution.

The paragraph above is not legal advice and is not legally binding. See the LICENSE file for the full license.
