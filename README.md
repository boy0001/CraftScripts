## CraftScripts
Scripts allow you to program small tasks without having to learn Java, figure out how to compile WorldEdit, or bother with reinventing the wheel. CraftScripts are written in JavaScript.

The scripting support that was available before v0.8 of WorldEdit is different.

> Warning: Do not run scripts from untrusted sources.

#### Bundled scripts
The following scripts are included (copy them to plugins/WorldEdit/craftscripts/ folder if you want them).

| Filename |    Parameters     | Description |
| --- | --- | --- |
| `build.js`	| `<various>` | Various tools: [see here](http://inhaze.net/resources/build_commands/#commands). |
| `maze.js` | `<block> [width] [length]` | Generates a maze with wall height<br> of two made out of the specified block. |
| `draw.js` | `<image-file> [v]` | Renders an image file in-game with colored cloth blocks. <br>Use the v parameter to draw it vertically. <br>Image file must be placed into a plugins/WorldEdit/drawings/ directory. |
| `quickshot.js` | `<note1> [note2] ...` | Creates a basic set of note blocks <br>linked together with Redstone. <br>Example usage: quickshot.js 1a# 1c 2f |
| `roof.js`	| `<block>` | Builds a pyramid roof over your selection. |
| `deletegpclaims.js`	|  | Deletes all GriefPrevention claims in your selection |

> Feel free to add your own scripts here.    
You can also find more scripts [here](http://forum.enginehub.org/forums/craftscripts.6/?order=view_count)

#### Running scripts
 - `/cs <script name> [args...]`    
 - `/.s [args...]` (re-executes last used script)    
 - `/<script>.js [args...]` (shortcut)    
This command runs the script. Don't forget the `.js` extension. Extra parameters can be given to the script file if it uses them.

## Installing
In case your version of Java doesn't come with the necessary components (you get a "Failed to find an installed script engine."), you will have to install the Rhino JavaScript engine. If you get a "ReferenceError," then installing Rhino may fix your problem.

**Download**: https://github.com/downloads/mozilla/rhino/rhino1_7R4.zip   
**Extract**: `js.jar` to `plugins` or `mods` directory`    

## Writing scripts
Please see the [development page.](http://wiki.sk89q.com/wiki/WorldEdit/Scripting/Development)

Scripts are written in JavaScript.
