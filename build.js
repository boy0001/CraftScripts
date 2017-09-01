/*
 * Build Commands for WorldEdit
 * Copyright (C) 2015 inHaze <http://inhaze.net>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
*/
var global = this;

importPackage(Packages.java.awt.image);
importPackage(Packages.javax.imageio);
importPackage(Packages.java.io);
importPackage(Packages.org.bukkit);
importPackage(Packages.com.sk89q.worldedit);
importPackage(Packages.com.sk89q.worldedit.blocks);
importPackage(Packages.com.sk89q.worldedit.patterns);
importPackage(Packages.com.sk89q.worldedit.vector);
importPackage(Packages.com.sk89q.worldedit.regions);
importPackage(Packages.com.sk89q.worldedit.regions.region);
importPackage(Packages.com.sk89q.worldedit.tools);
importPackage(Packages.com.sk89q.worldedit.tools.brushes);
importPackage(Packages.com.sk89q.worldedit.world.biome);
importPackage(Packages.com.sk89q.worldedit.command.tool);
importPackage(Packages.com.sk89q.worldedit.command.tool.brush);
importPackage(Packages.com.sk89q.worldedit.function.operation);
importPackage(Packages.com.sk89q.worldedit.function.pattern);
importPackage(Packages.com.sk89q.worldedit.extension.platform.permission);

var version = "1.8";
var stage = 0;
var invert = 1;
var zVec = new Vector(0,0,0);
var gVec = new Vector(0,0,0);
var gSize = -1;

context.getSession().setTool(player.getItemInHand(), null)
var tool = context.getSession().getBrushTool(player.getItemInHand());
var airMat = new BlockPattern(new BaseBlock(0,1));
var gMat = airMat;

tool.setSize(gSize);
tool.setFill(gMat);

var offsetVec = [];
var entityList = [];
var oreList = [];
var vecList = [];
var myKit = [];
var myShape = [];
var tools = [];
var trees = [];
var shapes = [];
var blocks = [];
var blockColors = [];
var text = [];
var es;	//global var to hold the editsession

SetObjectGroups();

var ErrorHandler =  function ErrorHandler() {
	this.errors = [];
	this.errorTime = 0;
	this.errorCnt = 0;
	this.errorTotal = 0;
	this.reload = true;
	
	ErrorHandler.prototype.handle = function handle(err, errStr, topLevel) {
		err = typeof err !== 'undefined' ? err : {};
		errStr = typeof errStr !== 'undefined' ? errStr : "General Error";
		topLevel = typeof topLevel === 'number' ? topLevel : 10;
		
		this.errorTotal++;
		
		if (typeof errStr === 'object') {
			var tmpStr = err;
			err = errStr;
			errStr = tmpStr;
		}
		
		var timeNow = java.util.Date().getTime();
		if (timeNow < this.errorTime + 200) this.errorCnt++;
		else this.errorCnt = 1;
		
		this.errorTime = timeNow;
		
		this.errors.push(err);	
		if (this.errorCnt < 2) {
			if (topLevel > 2 && this.errorFrame(err, errStr)) return true;
			if (topLevel > 1 && this.errorChat(err, errStr)) return true;
			if (topLevel > 0 && this.errorConsole(err, errStr)) return true;
			return false;
		}
		return true;
	
	};
	ErrorHandler.prototype.report = function report(err, errStr) {
	
		try {
			var errReport = 'http://inhaze.net/resources/build_commands_se/error.php';
			
			var ver = typeof $bc !== 'undefined' && typeof $bc.version !== 'undefined' ? $bc.version : 'null';
			var file = typeof err.fileName !== 'undefined' ? String(err.fileName) : 'null';
			var line = typeof err.lineNumber !== 'undefined' ? String(err.lineNumber) : 'null';
			var stack = typeof err.stack !== 'undefined' ? String(err.stack) : 'null';
			var error = String(err);
			
			if (typeof err.rhinoException !== 'undefined' && typeof err.javaException !== 'undefined') {
				error = String(String(err.rhinoException) + String(err.javaException));
			}
			else if (typeof err.rhinoException !== 'undefined') {
				error = String(err.rhinoException);
			}
			else if (typeof err.javaException !== 'undefined') {
				error = String(err.javaException);
			}
			
			var qryStr = new String;
			qryStr += '?v=' + ver;
			qryStr += '&f=' + file;
			qryStr += '&l=' + line;
			qryStr += '&e=' + error;
			qryStr += '&s=' + stack;
			qryStr = qryStr.replace(/ /g,"%20").replace(/#/g,"-");
			qryStr = qryStr.replace(/\r/g,"").replace(/\n/g,"").replace(/\t/g,"");
			
			errReport += qryStr;
			
			var retVal = loadFile(errReport, null, true);
			print("Error Return: " + retVal);
			return retVal;

		} 
		catch(e) { 
			$err.handle(e); 
		}
		
	};
	ErrorHandler.prototype.reload = function reload(state) {
		this.reload = state;
	};
	ErrorHandler.prototype.errorFrame = function errorFrame(err, errStr) {

		if (typeof $frames === 'undefined') return false;
	
		try {
			var errFrame = $frames.createFrame('error'); 
			errFrame.initialize();
			errFrame.setError(err, errStr);
		}
		catch(e) {
			return false;
		}
		return true;
	};
	ErrorHandler.prototype.errorChat = function errorChat(err, errStr) {
		
		//if (typeof MinecraftHelper === 'undefined' || typeof $mc === 'undefined' || typeof $mc.print === 'undefined') return false;
		var $mc = {};
		$mc.print = function(str) { player.print(str) };
		
		var capitalize = function(str) {return str.charAt(0).toUpperCase() + str.slice(1);}
		try {
			$mc.print("");
			$mc.print(text.White + " " + text.Red + text.Underline + errStr + " Error" + text.White + " #" + this.errorCnt)
			$mc.print("");
			for (var inc in err) {
				if (err[inc]) {
					var tmpStr = java.lang.String(err[inc]).replace("\\", "/").replace("\t", " ").replace("\r", "").replace("\n", " ")
					$mc.print(" " + text.Gold + capitalize(String(inc)) + ": " + text.White + tmpStr);			
				}
			}
			$mc.print("");
		}
		catch(e) {
			return false;
		}
		return true;
	};
	ErrorHandler.prototype.errorConsole = function errorConsole(err, errStr) {
	
		// printing to server console in bukkit
		// Bukkit.getConsoleSender().sendMessage(ChatColor.GREEN + "Bukkit Console Text");
		
		if (typeof print === 'undefined') return false;
	
		try {
			print(errStr + " Error: \r\n" + this.errorToString(err));
		}
		catch(e) {
			return false;
		}
		return true;
	};
	ErrorHandler.prototype.errorToString = function errorToString(err) {
		var tmp = "\n";
		for (var inc in err) {
			if (err[inc]) {
				tmp += String(inc + " = " + String(err[inc]) + "\n");	
			}
		}
		return tmp;
	};

}

var $err = new ErrorHandler();

var modeArg = argv.length > 1 ? argv[1] : 2;
var mode = parseMode(modeArg);		//test and return a good mode value

var brush = new Brush({		//Setup the brush - This is what runs each time it's clicked
    build : function(editSession,posB,mat,size) {
		
		try	{
			var pos = checkFlag("~") ? player.getBlockTrace(parseInt(checkFlag("~")), true) : player.getBlockTrace(200, false);
			if (pos == null) { return; }

			vecList.unshift(pos);
			
			es = editSession;
			var blackList = [6,31,32,37,38,39,30,78];	//Move the position down one if a natural block is clicked (grass, flowers, etc)
			if (parseInt(blackList.indexOf(getBlock(pos).id)) != -1)	{
				pos = pos.add(0,-1,0);
			}
			
			gMat = ((mat.apply(new Vector(0,0,0)).getType() == 0) && (mat.apply(new Vector(0,0,0)).getData() == 1)) ? gMat : mat;		//set gMat if brush mat has changed
			gSize = size != -1 ? size : -1; 
			invert = pos.getY() <= player.getBlockIn().getY() ? 1 : -1;
			
			tools[mode].mySub(pos, editSession);		//run the function for the specified mode
			
			if(getBlock(player.getBlockIn().add(0,1,0)).id != 0)	{		//if player has been covered, find free spot
				player.findFreePosition();
			}
		}
		catch (e)	{
			$err.handle(e);
		}
    },
	
});

if (argv.length < 2)  {
	HelpText(0);
} 
else {
	InitializeBrush();
}

//////////////////////////////////////////////////////////
//				Internal Utility Functions
//////////////////////////////////////////////////////////


function SetObjectGroups()	{

	oreList = {
		'1':  {BlockID:  16,			//Coal Ore
			chance:   100,			//Weighted probability, coal ore is considered baseline at 100, use 0 to stop an item from spawning completely
			minSize:   8,			//minimum possible vein size
			maxSize:	16,			//maximum possible vein size
			minY:	0,				//Lowest possible spawning y height
			maxY:	256				//Highest possible spawning y height
		},
		'2':  {BlockID:  15,			//Iron Ore
			chance:   60,
			minSize:   6,
			maxSize:	12,
			minY:	16,
			maxY:	256	
		},
		'3':  {BlockID:  14,			//Gold Ore
			chance:   18,
			minSize:   6,
			maxSize:	10,
			minY:	4,
			maxY:	32
		},
		'4':  {BlockID:  56,			//Diamond Ore
			chance:   16,
			minSize:   4,
			maxSize:	8,
			minY:	0,
			maxY:	16	
		},
		'5':  {BlockID:  21,			//Lapis Lazuli Ore
			chance:   14,
			minSize:   4,
			maxSize:	10,
			minY:	0,
			maxY:	32
		},
		'6':  {BlockID:  73,			//Redstone Ore
			chance:   75,
			minSize:   6,
			maxSize:	10,
			minY:	0,
			maxY:	15
		},
		'7':  {BlockID:  129,			//Emerald Ore
			chance:   .25,
			minSize:   2,
			maxSize:	45,
			minY:	0,
			maxY:	125
		},
		'8':  {BlockID:  12,			//Sand
			chance:   5,
			minSize:   6,
			maxSize:	20,
			minY:	65,
			maxY:	130
		},
		'9':  {BlockID:  13,			//Gravel
			chance:   5,
			minSize:   6,
			maxSize:	16,
			minY:	25,
			maxY:	90
		},
		'10':  {BlockID:  82,			//Clay
			chance:   5,
			minSize:   4,
			maxSize:	12,
			minY:	50,
			maxY:	110
		},
		'11':  {BlockID:  3,			//Dirt
			chance:   5,
			minSize:   4,
			maxSize:	12,
			minY:	60,
			maxY:	175
		},
		'12':  {BlockID:  45,			//Bricks - Test Item
			chance:   0,
			minSize:   10,
			maxSize:	150,
			minY:	50,
			maxY:	60
		}
	};

	trees = {
		'bush':  {
			woodBlock:  new BaseBlock(BlockID.LOG),			
			leafBlock:   new BaseBlock(BlockID.LEAVES, 4),			
			minSize:   6,
			maxChg:	0,
			leafSize: 5,
			mySub:	CreateBush
		},
		'small':  {
			woodBlock:  new BaseBlock(BlockID.LOG),			
			leafBlock:   new BaseBlock(BlockID.LEAVES, 4),			
			minSize:   6,
			maxChg:	0,
			leafSize: 5,
			mySub:	CreateSmallTree
		},
		'medium':  {
			woodBlock:  new BaseBlock(BlockID.LOG),			
			leafBlock:   new BaseBlock(BlockID.LEAVES, 4),			
			minSize:  5,
			maxChg:	8,
			branchSize:	.5,
			leafSize:	7,
			mySub:	CreateMediumTree
		},
		'large':  {
			woodBlock:  new BaseBlock(BlockID.LOG),			
			leafBlock:   new BaseBlock(BlockID.LEAVES, 4),			
			minSize:  20,
			maxChg:	8,
			branchSize:	.1,
			branchProb:	.5,
			leafSize:	7,
			mySub:	CreateLargeTree
		},
		'branched':  {
			woodBlock:  new BaseBlock(BlockID.LOG),			
			leafBlock:   new BaseBlock(BlockID.LEAVES, 4),			
			minSize:  25,
			maxChg:	1,
			branchSize1:	.3,
			branchSize2:	.15,
			branchSize3:	.1,
			branchProb1:	.7,
			branchProb2:	.7,
			branchProb3:	.7,
			leafSize:	13,
			mySub:	CreateBranchedTree
		},			
		'rainforest':  {
			woodBlock:  new BaseBlock(BlockID.LOG, 3),			
			leafBlock:   new BaseBlock(BlockID.LEAVES, 7),			
			minSize:  20,
			maxChg:	8,
			branchSize:	.15,
			branchProb:	.6,
			branchHeight: .6,
			leafSize:	12,
			mySub:	CreateRainforestTree
		},
		'palm':  {
			woodBlock:  new BaseBlock(BlockID.LOG),			
			leafBlock:   new BaseBlock(BlockID.LEAVES, 4),			
			minSize:  5,
			maxChg:	4,
			branchSize:	.5,
			leafSize:	3,
			mySub:	CreatePalmTree
		},
		'stick':  {
			woodBlock:  new BaseBlock(BlockID.LOG, 0),
			leafBlock:   new BaseBlock(BlockID.LEAVES, 4),				
			minSize:  1,
			density:	.1,
			maxChg:	3,
			mySub:	CreateStickTree
		},
		'mushroom':  {
			woodBlock:  new BaseBlock(35, 4),			
			leafBlock:   new BaseBlock(35, 14),			
			minSize:  15,
			maxChg:	40,
			leafSize:	25,
			mySub:	CreateMushroom
		},
		'spike':  {
			woodBlock:  new BaseBlock(BlockID.LOG),			
			leafBlock:   new BaseBlock(BlockID.LEAVES, 4),			
			minSize:  25,
			maxChg:	1,
			branchSize1:	.3,
			branchSize2:	.15,
			branchSize3:	.1,
			branchProb1:	.7,
			branchProb2:	.7,
			branchProb3:	.7,
			leafSize:	13,
			mySub:	CreateSpikeTree
		}		
	}
	
	shapes = {
		'PalmLeaf':  {
			offset:	Vector(0,0,0),
			angle: 0,
			shape: {
				'1': {vec: Vector(0,1,0), id: "18:4"},
				'2': {vec: Vector(0,2,0), id: "18:4"},
				'3': {vec: Vector(1,1,0), id: "18:4"},
				'4': {vec: Vector(1,2,0), id: "18:4"},
				'5': {vec: Vector(2,1,0), id: "18:4"},
				'6': {vec: Vector(3,1,0), id: "18:4"},
				'7': {vec: Vector(3,0,0), id: "18:4"},
				'8': {vec: Vector(4,0,0), id: "18:4"},
				'9': {vec: Vector(4,-1,0), id: "18:4"},
				'10': {vec: Vector(1,1,-1), id: "18:4"},
				'11': {vec: Vector(1,1,1), id: "18:4"}
			},
		},
		'Test':  {
			offset:	Vector(0,0,0),
			angle: 0,
			shape: {
				'1': {vec: Vector(0,1,0), id: "18:4"},
				'2': {vec: Vector(0,2,0), id: "18:4"},
				'3': {vec: Vector(1,1,0), id: "18:4"},
				'4': {vec: Vector(1,2,0), id: "18:4"},
				'5': {vec: Vector(2,1,0), id: "18:4"},
				'6': {vec: Vector(3,1,0), id: "18:4"},
				'7': {vec: Vector(3,0,0), id: "18:4"},
				'8': {vec: Vector(4,0,0), id: "18:4"},
				'9': {vec: Vector(4,-1,0), id: "18:4"},
				'10': {vec: Vector(1,1,-1), id: "18:4"},
				'11': {vec: Vector(1,1,1), id: "18:4"},
				'12': {vec: Vector(2,2,0), id: "5:1"},
				'13': {vec: Vector(4,1,0), id: "5:1"},
				'14': {vec: Vector(3,2,0), id: "50:1"},
				'15': {vec: Vector(5,1,0), id: "50:1"}
			},
		}		

	}

	blocks = {
		'plants':	{
			list:	{
					'0':  {block: new BaseBlock(31, 1), chance: 100, },
					'1':  {block: new BaseBlock(31, 2), chance: 100, },
					'2':  {block: new BaseBlock(37, 0), chance: 5, },
					'3':  {block: new BaseBlock(38, 0), chance: 5, },
					'4':  {block: new BaseBlock(86, 0), chance: .2, },
					'5':  {block: new BaseBlock(103, 0), chance: .2,}
			}
		},
		'ruin':	{
			list:	{
					'0':  {block: new BaseBlock(98, 0), chance: 100, },
					'1':  {block: new BaseBlock(98, 1), chance: 100, },
					'2':  {block: new BaseBlock(98, 2), chance: 100, },
					'3':  {block: new BaseBlock(98, 3), chance: 5, },
					'4':  {block: new BaseBlock(109, 0), chance: 10, },
					'5':  {block: new BaseBlock(109, 4), chance: 10, },
					'6':  {block: new BaseBlock(44, 5), chance: 5,},
					'7':  {block: new BaseBlock(44, 13), chance: 5,},
					'8':  {block: new BaseBlock(97, 2), chance: 1,}
			}
		}		
	}
	
	text = {
		Black: '\u00A70',
		DarkBlue: '\u00A71',
		DarkGreen: '\u00A72',
		DarkAqua: '\u00A73',
		DarkRed: '\u00A74',
		Purple: '\u00A75',
		Gold: '\u00A76',
		Grey: '\u00A77',
		DarkGrey: '\u00A78',
		Indigo: '\u00A79',
		BrightGreen: '\u00A7a',
		Aqua: '\u00A7b',
		Red: '\u00A7c',
		Pink: '\u00A7d',
		Yellow: '\u00A7e',
		White: '\u00A7f',
		Random: '\u00A7k',
		Bold: '\u00A7l',
		Strike: '\u00A7m',
		Underline: '\u00A7n',
		Italics: '\u00A7o',		
		Reset: '\u00A7r',
		Not: '\u00AC',
		Bar: '\u007C',
		Arrow: '\u00BB',
		ArrowLeft: '\u00AB',
		TBlock: '\u2580',
		BBlock: '\u2584',		
		LBlock: '\u258C',
		RBlock: '\u2590',		
		Block: '\u2588',		
		LShade: '\u2591',
		MShade: '\u2592',
		DShade: '\u2593',
		Colon: '\u003A',
	};
	
	tools = {
		'0':  {name:  "Help",			
			note:  "General, or command specific info.",			
			args:   ["command"],
			aFlags:	[""],
			keys: 	["help", "h", "?"],
			brush:	0,
			mySub:	HelpText,
		},
		'1':  {name:  "Command List(Short)",			
			note:  "List Commands - Short",			
			args:  [""],
			aFlags:	[""],
			keys:  ["list", "shortlist"],
			brush:	0,
			mySub:	CommandListShort,
		},
		'2':  {name:  "Command List(Long)",			
			note:  "List Commands - Long",			
			args:  [""],
			aFlags:	[""],
			keys:  ["commands", "command", "longlist"],
			brush:	0,
			mySub:	CommandList,
		},
		'3':  {name:  "Clear Nature",			
			note:  "Destroys and clears all natural blocks.",			
			args:  ["size"],
			aFlags:	["s"],
			keys:  ["clear", "killnature", "kill", "kn", "clearnature"],
			brush:	1,
			mySub:	ClearNature,
		},
		'4':  {name:  "Tree",			
			note:  "Creates a randomly generated tree type.",			
			args:   ["treeType", "size", "woodBlock", "leafBlock", "clump"],
			aFlags:	["", "s", "w", "l", "c"],
			keys: 	["tree"],
			brush:	1,
			mySub:	BuildTree,
		},
		'5':  {name:  "Grass Patch",			
			note:  "Creates a random patch of long grass(super bonemeal!)",			
			args:  ["size", "density"],
			aFlags:	["s", "d"],
			keys:  ["grass", "grasspatch", "bonemeal"],
			brush:	1,
			mySub:	BuildGrassPatch,
		},
		'6':  {name:  "Stick Patch",			
			note:  "Creates a random patch of blocks to random custom heights.",			
			args:  ["size", "block", "minLength,maxChg", "density"],
			aFlags:	["s", "b", "l", "d"],
			keys:  ["stickpatch", "stick"],
			brush:	1,
			mySub:	BuildStickPatch,
		},		
		'7':  {name:  "Overlay",			
			note:  "Covers all natural items to custom blocks and depths.",			
			args:  ["size", "topBlock,depth", "mid,depth", "end,depth", "all"],
			aFlags:["s", "t", "m", "e", "a"],
			keys:  ["overlay", "overlaypatch", "over"],
			brush:	1,
			mySub:	BuildOverlayPatch,
		},			
		'8':  {name:  "Spike",			
			note:  "Creates a custom spike wherever clicked.",			
			args:  ["baseSize", "block", "minLength,maxChg"],
			aFlags:["s", "b", "l"],
			keys:  ["spike", "cone"],
			brush:	1,
			mySub:	BuildSpike,
		},
		'9':  {name:  "Vine",			
			note:  "Smart custom vine brush.",			
			args:  ["size", "density", "length", "block", ],
			aFlags:["s", "d", "l", "b"],
			keys:  ["vine", "vines"],
			brush:	1,
			mySub:	BuildVines,
		},
		'10':  {name:  "Test",			
			note:  "Function Testing Area",			
			args:  [""],
			aFlags:	[""],
			keys:  ["test"],
			brush:	1,
			mySub:	BuildTest,
		},
		'11':  {name:  "Save Shape",			
			note:  "Save the current selection to shape file.",			
			args:  ["fileName", "excludeBlock"],
			aFlags:	["", "!"],
			keys:  ["save"],
			brush:	1,
			mySub:	saveShape,
		},
		'12':  {name:  "Shape",			
			note:  "Load a shape object from the selection, or shape file.",			
			args:  ["fileName", "angleLock", "excludeID", "select"],
			aFlags:["", "<", "!", "$"],
			keys:  ["shape", "load"],
			brush:	1,
			mySub:	BuildShape,
		},	
		'13':  {name:  "Line",			
			note:  "Draws a custom line in single, continous, or fixed origin mode.",			
			args:  ["mode", "size", "block", "extendCnt"],
			aFlags:	["m", "s", "b", "e"],
			keys:  ["line", "lines"],
			brush:	1,
			mySub:	BuildLine,
		},
		'14':  {name:  "Bump",			
			note:  "Brush that allows bumping terrain up or down by a given strength.",			
			args:  ["size", "strength"],
			aFlags:["s", "t"],
			keys:  ["bump"],
			brush:	1,
			mySub:	BuildBump,
		},
		'15':  {name:  "Flatten",			
			note:  "Level all terrain to a custom height.",			
			args:  ["size", "depth", "surfaceBlock"],
			aFlags:["s", "d", "b"],
			keys:  ["flatten", "flat", "level"],
			brush:	1,
			mySub:	BuildFlat,
		},	
		'16':  {name:  "Shape Kit",			
			note:  "Loads, and binds a list of custom shapes.",			
			args:  ["fileName", "angleLock", "excludeID", "select"],
			aFlags:["", "<", "!", "$"],
			keys:  ["kit","shapekit"],
			brush:	1,
			mySub:	BuildShapeKit,
		},
		'17':  {name:  "Platform",			
			note:  "Creates a custom platform, or path under your feet.",			
			args:  ["size", "block"],
			aFlags:	["s", "b"],
			keys:  ["platform", "path"],
			brush:	1,
			mySub:	BuildPlatform,
		},
		'18':  {name:  "Mirror",			
			note:  "Mirrors your current selection around a selected point.",			
			args:  ["shift", "delete"],
			aFlags:	["s", "d"],
			keys:  ["mirror"],
			brush:	1,
			mySub:	BuildMirror,
		},
		'19':  {name:  "Biome",			
			note:  "Creates a brush that paints a custom biome (multiplayer only)",			
			args:  ["biome", "size"],
			aFlags:	["", "#"],
			keys:  ["biome"],
			brush:	1,
			mySub:	BuildBiome,
		},
		'20':  {name:  "Laser",			
			note:  "Shoots a custom beam of blocks from your fingertips!",			
			args:  ["size", "depth", "aboveMat", "belowMat"],
			aFlags:	["s", "d", "a", "b"],
			keys:  ["laser", "beam"],
			brush:	1,
			mySub:	BuildLaser,
		},
		'21':  {name:  "Revolve",			
			note:  "Revolves a 2D slice selection around a center point.",			
			args:  ["count", "useBlock"],
			aFlags:	["c", "b"],
			keys:  ["revolve"],
			brush:	1,
			mySub:	BuildRevolve,
		},
		'22':  {name:  "Rotate",			
			note:  "Rotates a 3D selection to a set angle or # of increments.",			
			args:  ["items/-angleInc", "resolution", "single"],
			aFlags:	["i", "r", "s"],
			keys:  ["rotate"],
			brush:	1,
			mySub:	BuildRotate,
		},
		'23':  {name:  "Erode",			
			note:  "Erode the terrain away using a custom face setting.",			
			args:  ["size", "maxFaces", "iterations"],
			aFlags:	["s", "f", "i"],
			keys:  ["erode"],
			brush:	1,
			mySub:	BuildErode,
		},
		'24':  {name:  "Fill",			
			note:  "Fill the terrain in using a custom face setting.",			
			args:  ["size", "maxFaces", "iterations"],
			aFlags:	["s", "f", "i"],
			keys:  ["fill"],
			brush:	1,
			mySub:	BuildFill,
		},
		'25':  {name:  "Smart Wand",			
			note:  "A smarter, more user friendly selection wand.",			
			args:  [""],
			aFlags:	[""],
			keys:  ["wand"],
			brush:	1,
			mySub:	BuildWand,
		},
		'26':  {name:  "Ore Generator",			
			note:  "Generates new veins of ore based on custom settings.",			
			args:  ["size", "overBlock", "density", "region"],
			aFlags:	["s", "b", "d", "r"],
			keys:  ["ore", "ores"],
			brush:	1,
			mySub:	BuildOre,
		},
		'27':  {name:  "Fragment",			
			note:  "Creates a fragmented sphere shape.",			
			args:  ["size", "block", "density", "hollow"],
			aFlags:	["s", "b", "d", "h"],
			keys:  ["fragment", "frag"],
			brush:	1,
			mySub:	BuildFragment,
		},
		'28':  {name:  "Shoreline",			
			note:  "Attemtps to create a smooth shoreline",			
			args:  ["size","block","multi","depth"],
			aFlags:	["s","b","m","d"],
			keys:  ["shore", "shoreline"],
			brush:	1,
			mySub:	BuildShoreline,
		},
		'29':  {name:  "Land",			
			note:  "A special brush that builds land up based on the distsance from water.",			
			args:  ["size","block","multi","preload"],
			aFlags:	["s","b","m","p"],
			keys:  ["land"],
			brush:	1,
			mySub:	BuildLand,
		},
		'30':  {name:  "Pattern",			
			note:  "Replaces blocks with a custom predefined set.",			
			args:  ["blockSet", "size"],
			aFlags:	["b", "s"],
			keys:  ["pattern", "pat", "replace"],
			brush:	1,
			mySub:	BuildPattern,
		},
		'31':  {name:  "Array",			
			note:  "Arrays a selection up to 3 different directions.",			
			args:  ["totalA", "totalB", "totalC"],
			aFlags:	["a", "b", "c"],
			keys:  ["array", "stack"],
			brush:	1,
			mySub:	BuildArray,
		},
		'32':  {name:  "Map",			
			note:  "Saves a map of the area around you to a image file.",			
			args:  ["fileName", "size", "heightMap"],
			aFlags:	["", "s", "h"],
			keys:  ["map"],
			brush:	1,
			mySub:	BuildMap,
		},	
		'33':  {name:  "Flip",			
			note:  "Flips the current selection around the clicked point.",			
			args:  ["shift", "delete"],
			aFlags:	["s", "d"],
			keys:  ["flip"],
			brush:	1,
			mySub:	BuildFlip,
		},
		'34':  {name:  "Box",			
			note:  "Creates a custom sized rectangle box brush.",			
			args:  ["xSize", "ySize", "zSize", "hollow", "angled", "block", "insideBlock"],
			aFlags:	["x", "y", "z", "h", "a", "b", "i"],
			keys:  ["box", "rect", "rectangle"],
			brush:	1,
			mySub:	BuildBox,
		},
		'35':  {name:  "Ellipse",			
			note:  "Creates a custom size ellipse brush",			
			args:  ["xSize", "ySize", "zSize", "hollow", "angled", "block", "insideBlock"],
			aFlags:	["x", "y", "z", "h", "a", "b", "i"],
			keys:  ["ellipse"],
			brush:	1,
			mySub:	BuildEllipse,
		},
		'36':  {name:  "Spiral",			
			note:  "Creates a custom spiral object.",			
			args:  ["radius/-growth", "stretch", "count", "flip", "double"],
			aFlags:	["r", "s", "c", "f", "d"],
			keys:  ["spiral"],
			brush:	1,
			mySub:	BuildSpiral,
		},
		'37':  {name:  "Minesweeper",			
			note:  "Play a game of Minesweeper, Minecraft style!",			
			args:  ["xSize", "ySize", "mines", "wool", "cheat", "begginer/intermediate/expert", "hardcore"],
			aFlags:	["x", "y", "m", "w", "c", "b/i/e", "h"],
			keys:  ["minesweeper", "mine", "sweeper"],
			brush:	1,
			mySub:	BuildMineSweeper,
		},
		'38':  {name:  "Flood",			
			note:  "Flood fill an area of the same blocks.",			
			args:  ["block", "maxSize"],
			aFlags:	["b","s"],
			keys:  ["flood"],
			brush:	1,
			mySub:	BuildFlood
		},		
		
	}
	
	blockColors = {
		0: [0,0,0],			//Air
		1: [180,180,180],	//stone
		2: [0,225,0],		//grass
		3: [168,117,68],	//dirt
		4: [125,125,125],	//cobblestone
		5: [185,133,83],	//wood planks
		6: [0,210,0],		//saplings
		7: [60,60,60],		//bedrock
		8: [0,0,255],		//water (flowing]
		9: [0,0,235],		//water (stationary]
		10: [255,155,102],	//lava (flowing]
		11: [255,129,61],	//lava (stationary]	
		12: [228,216,174],	//sand
		13: [190,190,210],	//gravel
		14: [245,232,73],	//gold ore
		15: [211,179,160],	//iron ore
		16: [61,61,61],		//coal ore
		17: [165,103,53],	//wood
		18: [76,150,24],	//leaves
		20: [158,255,243],	//glass
		24: [226,206,140],	//sandstone
		31: [0,210,0],		//long grass
		32: [224,162,64],	//shrub
		37: [255,248,56],	//yellow flower
		38: [225,0,0],		//red rose
		41: [255, 215, 0], 	//gold block
		42: [135,135,135],	//iron block
		44: [165,165,165],	//step
		50: [255,248,56],	//torch
		53: [185,133,83],	//wood stairs
		59: [205,222,61],	//wheat crops
		65: [185,133,83],	//ladder
		67: [125,125,125],	//cobblestone stairs
		78: [230,255,255],	//snow layer
		79: [180,255,236],	//ice
		81: [76,150, 24],	//cactus
		82: [150,150,180],	//clay
		83: [89,255, 89],	//reed
		85: [185,133,83],	//wood fence
		99: [168,125,99],	//large brown mushroom
		100: [186,27,27],	//large red mushroom
		102: [158,255,243],	//glass pane
		106: [0,150,0],		//vines
		110: [100,90,100],	//mycelium
		111: [96,188,30],	//lily pad
		128: [226,206,140],	//sandstone stairs
		134: [185,133,83],	//spruce wood stairs
		141: [205,222,61],	//carrot crops
		142: [205,222,61],	//potato crops
		161: [67,132,21],	//dark oak leaves
		
		'38:8': [255,250,155],	//daisy flower
		'175:8': [0,200,0],		//double tall grass and flowers top

		'35:0': [254,254,254], // White - Wools colors borrowed from Sk89q's draw script
		'35:1': [255,100,0], 	// Orange
		'35:2': [200,0,200], 	// Magenta
		'35:3': [87, 132, 223], 	// Light blue
		'35:4': [255, 255, 0], 	// Yellow
		'35:5': [0, 255, 0], 	// Green
		'35:6': [255, 180, 200], // Pink
		'35:7': [72, 72, 72],	// Gray
		'35:8': [173, 173, 173], // Light grey
		'35:9': [0, 100, 160], 	// Cyan
		'35:10': [120, 0, 200], 	// Purple
		'35:11': [0, 0, 175], 	// Blue
		'35:12': [100, 60, 0], 	// Brown
		'35:13': [48, 160, 0], 	// Cactus green
		'35:14': [255, 0, 0], 	// Red
		'35:15': [0, 0, 0], 		// Black		
	}
	
}

function InitializeBrush()	{

	try {
		var mySession = context.remember();

		if (mode != -1)	{	//check to see if the mode exists or not
			
			if (checkFlag("?") != false )	{ 
				HelpText(1); 
				context.getSession().setTool(player.getItemInHand(), null);
				return;
			}
			
			if (tools[mode].brush == 1)	{

				var tmpStr = new Array();
				var errStr = new Array();
				switch (tools[mode].name)	{
					case "Save Shape":
						tmpStr = (text.White + text.Italics + "Click to specify shape origin point.");
						if (argv.length < 3) 	{
							var errStr = (text.Red + "Error:" + text.White + " You need to specify a file name to save under.");
							player.print(errStr);
						}
						break;
					case "Shape":
						if ((argv.length < 3) || (String(argv[2]) == "-")) 	{
							tmpStr = (text.White + text.Italics + "Click to specify selection shape origin point.");
						}
						else	{
							
							BuildShape(Vector(0,0,0), mySession)
							tool.setBrush(brush, "worldedit.brush.build");
							var errStr = "ShapeLoaded";
						}
						break;
					case "Shape Kit":
						if (argv.length < 3) 	{
							var errStr = (text.Red + "Error:" + text.White + " You need to specify a .kit file name to load.");
							player.print(errStr);
						}
						else	{
							BuildShapeKit(Vector(0,0,0), mySession)
							var errStr = "ShapeKitLoaded";
						}
						break;
					case "Biome":
						if (BuildBiome((0,0,0), mySession) == false)	{return;}
						tmpStr = (text.Red + text.Italics + "Changes won't become effective until a chunk reload.");

						break;
					case "Smart Wand":
						BuildWand(zVec, mySession);
						player.print(text.Gold + "Smart Wand" + text.White + " tool bound to " + text.Gold + ItemType.toHeldName(player.getItemInHand()) + ". " );
						return;
					case "Land":
						BuildLand(zVec, mySession);
						//player.print(text.Gold + "Land Brush" + text.White + " tool bound to " + text.Gold + ItemType.toHeldName(player.getItemInHand()) + ". " );
						break;					
					default:
						tmpStr = (text.White + text.Italics + "Ready for first point.");
						break;
				}

				var giveItemStr = String(text.Red + "\u2554" + " " + text.White + tools[mode].name + " Brush" + text.Red + " \u2557");
				setHeldItemInfo(giveItemStr, "");
				
				if(errStr.length < 2)	{
					tool.setBrush(brush, "worldedit.brush.build");;
					
					player.print(text.Gold + tools[mode].name + text.White + " brush bound to " + text.Gold + ItemType.toHeldName(player.getItemInHand()) + ". " );
					if (tmpStr.length > 0) {player.print(tmpStr);}
				}
			}
			else{
				var mySession = context.remember(); 
				var pos = player.getBlockTrace(200);
				invert = pos.getY() <= player.getBlockIn().getY() ? 1 : -1;
				tools[mode].mySub(pos, mySession);
			}
		}
		else	{
			player.print(text.Red + modeArg + text.White + " mode not found. Type " + text.Gold + "/cs build list" + text.White + " for commands.");
		}
	}
	catch(e) {
		$err.handle(e);
	}


}

function getBlock(vec) {
	if (vec instanceof Vector) return es.getBlock(vec);
	else return null;
}

function getBlockRaw(x, y, z) {
	return getBlock(new Vector(x,y,z));
}

function setBlock(vec, block) {
	if (block instanceof BaseBlock) {
		es.setBlock(vec, block)
	}
	else {
		es.setBlock(vec, block.apply(zVec))
	}
}

function setBlockRaw(x, y, z, id, data) {
	return setBlock(new Vector(x,y,z), new BaseBlock(id, data));
}

function importJScript(jScript, dir, globalObj, strBool) {
	try {
		jScript = jScript instanceof Array === true ? jScript : new Array(jScript);
		globalObj = typeof globalObj === 'undefined'  || globalObj === null ? global : globalObj;
		dir = typeof dir === 'undefined' ? "craftscripts\\" : dir;
	 
		var cx = org.mozilla.javascript.Context.getCurrentContext();
		var newScope = cx.initStandardObjects(globalObj);
		var info = [0,0, new java.util.Date().getTime()];

		if (!strBool) {                        //load javascript source from external file(s)
			for (var inc in jScript) {
			 
				var file = context.getSafeFile(dir, jScript[inc]);
				if(!file.exists()){
					player.print("\u00A7cError: \u00A7fUnable to locate import file \u00A76" + file);
					continue;
				}
				var fileSize = file.length();                     
				var buffer = new java.io.FileReader(file);
				cx.evaluateReader(newScope, buffer, "YourScriptIdentifier" + file.getName(), 1, null);
				buffer.close();
				info[0]++;
				info[1]+= fileSize;
			}
		}
		else {                                //load javascript source from internal string(s)
			for (var inc in jScript) {
				cx.evaluateString(newScope, jScript[inc], "YourScriptIdentifier", 1, null);
				info[0]++;
				info[1]+= String(jScript[inc]).length;
			}     
		}
		info[2] = (new java.util.Date().getTime() - info[2]);
		return info;
	}
	catch(e) {
		if (e.javaException) player.print("\u00A7cJava Error: \u00A76{ \u00A7f" + e.javaException + " \u00A76}");
		if (e.rhinoException) player.print("\u00A7cRhino Error: \u00A76{ \u00A7f" + e.rhinoException + " \u00A76}");
	}
};

function loadShape(vec, session)	{

	if ((argv.length > 2) && (String(argv[2]) != "-"))	{

		var aStr = String(argv[2]).slice(String(argv[2]).length-4).toLowerCase();
		type = aStr == ".bo2" ? 2 : 1;

		if (type == 1)	{		// shape file type
			
			var fileName = argv[2];
			if (aStr == ".shp")	{fileName = String(argv[2]).slice(0, String(argv[2]).length-4).toLowerCase()};

			var file = context.getSafeFile("shapes", String(fileName) + '.shp');
			if(!file.exists()){
				player.print(text.Red + "Error! " + text.Gold + "Could not find shape file: " + text.White + text.Italics + file);
				return false;
			}
			
			var tmpStr = loadFile(fileName, 1);
			var tmpShape = parseShapeFile(tmpStr);
			player.print(text.Gold + tmpShape['TMP'].shape.length + text.White + " blocks loaded from file: " + text.Gold + fileName + ".shp");
			player.print(text.White + text.Italics + "Ready to place shape object.");
			
		}
		else if (type == 2)	{		// bo2 file type
		
			var fileName = argv[2];
			var file = context.getSafeFile("bo2s", String(fileName));
			if(!file.exists()){
				player.print(text.Red + "Error! " + text.Gold + "Could not find bo2 file: " + text.White + text.Italics + file);
				return false;
			}
			
			var tmpStr = loadFile(fileName, 2);
			var tmpShape = parseBO2File(tmpStr);
			player.print(text.Gold + tmpShape['TMP'].shape.length + text.White + " blocks loaded from file: " + text.Gold + fileName);
			player.print(text.White + text.Italics + "Ready to place shape object.");
		}
		
	}
	else {		//no file specified, use selection
		var tmpStr = saveShape(vec, session);
		var tmpShape = parseShapeFile(tmpStr);
		player.print(text.Gold + tmpShape['TMP'].shape.length + text.White +" blocks loaded from current selection.");
		player.print(text.White + text.Italics + "Ready to place shape object.");
	}
	
	myShape = tmpShape;

}

function loadShapeKit(vec, session, kitList)	{

	for (inc in kitList)	{

		fStr = kitList[inc].shapeFile;
		var aStr = String(fStr).slice(String(fStr).length-4).toLowerCase();
		type = aStr == ".bo2" ? 2 : 1;

		if (type == 1)	{		// shape file type
			
			var fileName = fStr;
			if (aStr == ".shp")	{fileName = String(fStr).slice(0, String(fStr).length-4).toLowerCase()};
			
			var file = context.getSafeFile("shapes", String(fileName) + '.shp');
			if(!file.exists()){
				player.print(text.Red + "Error! " + text.Gold + "Could not find shape file: " + text.White + text.Italics + file);
				continue;
			}
			
			var tmpStr = loadFile(fileName, 1);
			var tmpShape = parseShapeFile(tmpStr);
			player.print(text.White + "Shape file: " + text.Gold + fileName + ".shp" + text.White + " bound to " + text.Gold + ItemType.toHeldName(kitList[inc].item));
			player.giveItem(kitList[inc].item, 1);
		}
		else if (type == 2)	{		// bo2 file type
		
			var fileName = fStr;
			var file = context.getSafeFile("bo2s", String(fileName));
			if(!file.exists()){
				player.print(text.Red + "Error! " + text.Gold + "Could not find bo2 file: " + text.White + text.Italics + file);
				continue;
			}
			
			var tmpStr = loadFile(fileName, 2);
			var tmpShape = parseBO2File(tmpStr);
			player.print(text.White + "Shape file: " + text.Gold + fileName + text.White + " bound to " + text.Gold + ItemType.toHeldName(kitList[inc].item));
			player.giveItem(kitList[inc].item, 1);
		}
		
		myShape[inc] = tmpShape['TMP'];
	
	}
	player.print(text.White + text.Italics + "Finished loading shapes!"); 
	
}

function saveShape(vec, session)	{

	if ((argv.length > 2) && (String(argv[2]) != "-"))	{
		saveName = argv[2];
	}
	else	{
		if (tools[mode].name == "Save Shape")	{
			player.print(text.Red + "Error:" + text.White + " You need to specify a file name to save under.");
			return false;
		}
	}
	var ignore = checkFlag("!") ? parseBlock(checkFlag("!")) : -1;
	
	var world = context.getSession().getSelectionWorld();
	var region = context.getSession().getWorldSelection(world);
	
	var angle = (parseInt(getDirection().rightAngle)+270) % 360;
	//var angleStr = "^" + String(angle) + "^";
	
	var mergeStr = "^" + String(angle) + "^" + "#0,0,0#|";
	var blockCnt = 0;
	
	for (var x = 0; x < region.getWidth(); x++) {
		for (var y = 0; y < region.getHeight(); y++) {
			for (var z = 0; z < region.getLength(); z++) {
				
				var tmpVec = region.getMinimumPoint().add(x, y, z);
				var block = session.getBlock(tmpVec);
				if (ignore != -1)	{
					if (block.getType() == ignore.getType())	{continue;}
				}
				var blockStr = String(block.getType()) + ":" + String(block.getData());
				var vecStr = String(tmpVec.getX()-vec.getX()) + "," + String(tmpVec.getY()-vec.getY()) + "," + String(tmpVec.getZ()-vec.getZ());
				
				mergeStr = mergeStr + (blockStr + "@" + vecStr + "|");
				blockCnt++;
			}
		}
	}
	
	mergeStr += "%";
	
	if (tools[mode].name == "Save Shape") {
		var file = context.getSafeFile("shapes", String(saveName) + '.shp');
		saveFile(saveName, mergeStr);
		player.print(text.Gold + blockCnt + text.White + " blocks saved to shape file " + text.Gold + saveName + ".shp" + text.Red + " @ " + text.White + text.Italics + file);
	}
	else	{
		return mergeStr;
	}
	//player.print(blockCnt + " totals blocks saved. [" + mergeStr.length + " total chars]");
	
}

function loadFile(fileName, type)	{
	
	if (type == 1)	{
		var file = context.getSafeFile("shapes", String(fileName) + '.shp');
	}
	else if (type == 2)	{
		var file = context.getSafeFile("bo2s", String(fileName));
	}
	else if (type == 3)	{
		var file = context.getSafeFile("shapes", String(fileName) + '.kit');
	}

	if(!file.exists()){
		return 0;
	}
	
	var buffer = new BufferedReader(new FileReader(file));
	var bufStr = new Array();

	while (line = buffer.readLine()) {
		bufStr = bufStr + line;
		if (type == 2 || type == 3)	{
			bufStr = bufStr + "\n";
		}
	}
	buffer.close();
	return bufStr;

}

function saveFile(fileName, textStr)	{

	var file = context.getSafeFile("shapes", String(fileName) + '.shp');
	
	if(!file.exists()){
		file.createNewFile();
	}
	
	buffer = new BufferedWriter(new FileWriter(file));
	buffer.write(String(textStr));
	buffer.close();
	
}

function parseShapeFile(shapeStr)	{

	var tmpShape = new Array();
	
	tmpShape = {
		'TMP':  {
			offset:	Vector(0,0,0),
			shape: []
									
		}
	}
	
		//	 |17:4@25,3,-6|
	var cnt = 0;
	var inc = 0;
	while (inc <= shapeStr.length)	{
	
		if (shapeStr.slice(inc+1, inc+2) == "%")	{
	
			break;
		}
		else if (shapeStr.slice(inc, inc+1) == "^")	{
			
			var anglePos = shapeStr.indexOf("^", inc+1);
			var angleInc = anglePos+1;
			var anglePos2 = anglePos;
			tmpShape['TMP'].angle = String(shapeStr.slice(inc+1, anglePos2));
			inc = angleInc;
		}
		else if (shapeStr.slice(inc, inc+1) == "#")	{
			
			var offsetPos = shapeStr.indexOf("#", inc+1);
			var offsetInc = offsetPos+1;
			var offsetPos2 = offsetPos;
			tmpShape['TMP'].offset = parseVector(String(shapeStr.slice(inc+1, offsetPos2)));
			inc = offsetInc;
		}
		else if (shapeStr.slice(inc, inc+1) == "|")	{

			var blockPos = shapeStr.indexOf("@", inc+1);
			var blockInc = blockPos;
			var blockPos2 = blockPos;
			var block = parseBlock(String(shapeStr.slice(inc+1, blockPos2)));
					
			var vecPos = shapeStr.indexOf("|", blockInc);
			var vecInc = vecPos+1;
			var vecPos2 = vecPos;
			var vec = parseVector(String(shapeStr.slice(blockPos+1, vecPos2)));
			
			var abc = "'" + cnt + "'";
			
			idStr = block.getType() + ":" + block.getData();
			
			tmpShape['TMP'].shape.push({vec: vec, id: idStr});
			
			inc = vecInc-1;
			cnt++;
		}
		else	{

			inc++;
		}
		

	}
	return tmpShape;
}

function parseBO2File(shapeStr)	{

	var tmpShape = new Array();
	
	tmpShape = {
		'TMP':  {
			offset:	Vector(0,0,0),
			angle: 0,
			shape: []
		}
	}
	
	var inc = shapeStr.indexOf("[DATA]");

	while (inc <= shapeStr.length)	{
		if (shapeStr.slice(inc, inc+1) == "\n")	{

			var vecPos = shapeStr.indexOf(":", inc+1);
			if (vecPos != -1)	{
			
				var vecInc = vecPos;
				var vecPos2 = vecPos;
				var vec = parseVector(String(shapeStr.slice(inc+1, vecPos2)));
				vec = Vector(vec.getX(), vec.getZ()+1, vec.getY());
				
				var blockPos = shapeStr.indexOf("\n", vecInc);
				var blockInc = blockPos+1;
				var blockPos2 = blockPos;
				
				var block = parseBlock(String(shapeStr.slice(vecPos+1, blockPos2)));
				var idStr = block.getType() + ":" + block.getData();

				tmpShape['TMP'].shape.push({vec: vec, id: idStr});
				
				inc = blockInc-1;
			}
			else 	{
				inc++
			}
		}
		else	{
			inc++;
		}
	}
	return tmpShape;
}

function parseKitFile(kitStr)	{

	var tmpKit = [];
	var inc = 0;
	kitStr = "\n" + kitStr + "\n";

	while (inc <= kitStr.length)	{
		if (kitStr.slice(inc, inc+1) == "\n")	{

			var shapePos = kitStr.indexOf(":", inc+1);
			if (shapePos != -1)	{
				var shapeInc = shapePos;
				var shapePos2 = shapePos;
				var fileStr = String(kitStr.slice(inc+1, shapePos2));

				var itemPos = kitStr.indexOf("\n", shapeInc);
				var itemInc = itemPos+1;
				var itemPos2 = itemPos;
				
				var itemID = parseInt(kitStr.slice(shapePos+1, itemPos2));
				tmpKit.push ({shapeFile: fileStr, item: itemID});

				inc = itemInc-1;
			}
			else 	{
				inc++
			}
		}
		else	{
			inc++;
		}
	}
	return tmpKit;
}

function parseBlock(blockStr)	{
	
	blockStr = blockStr.replace(".",":");
	pos = blockStr.indexOf(":");
	
	if (pos == -1)	{return new BaseBlock(parseInt(blockStr), 0);}

	id = blockStr.slice(0, pos);
	data = blockStr.slice(pos+1);

	return new BaseBlock(parseInt(id), parseInt(data));

}

function parseVector(blockStr)	{

	blockStr = blockStr.replace(/["'\(\)]/g, "");
	var pos = blockStr.indexOf(",", 0);
	var pos2 = blockStr.indexOf(",", pos+1);
	
	var x = parseInt(blockStr.slice(0, pos));
	var y = parseInt(blockStr.slice(pos+1, pos2));
	var z = parseInt(blockStr.slice(pos2+1));
	
	return Vector(x, y, z);
}

function parseBlockExtra(blockStr)	{

	pos = blockStr.indexOf(":");
	pos2 = blockStr.indexOf(",");
	var blockExtra = [];

	if ((pos != -1) && (pos2 != -1))	{
	
		blockExtra = {
			block:	new BaseBlock(parseInt(blockStr.slice(0, pos)), blockStr.slice(pos+1, pos2)),	
			extra: parseInt(blockStr.slice(pos2+1))
		}		
	}
	
	if ((pos != -1) &&  (pos2 == -1))	{
	
		blockExtra = {
			block:	new BaseBlock(parseInt(blockStr.slice(0, pos2)), blockStr.slice(pos+1)),	
			extra: 1
		}		
	}
	
	if ((pos == -1) && (pos2 == -1))	{
		blockExtra = {
			block:	new BaseBlock(parseInt(blockStr), 0),	
			extra: 1
		}
	}
	
	if ((pos == -1) && (pos2 != -1))	{
	
		blockExtra = {
			block:	new BaseBlock(parseInt(blockStr.slice(0, pos2)), 0),	
			extra: parseInt(blockStr.slice(pos2+1))
		}		
	}
	
	return blockExtra;
	
}

function parseMode(modeStr)	{

	var modeVal = -1;
	modeStr = String(modeStr).toLowerCase();
	
	for (inc in tools)	{
		for (keyInc in tools[inc].keys)	{
			if (modeStr == tools[inc].keys[keyInc])	{
				modeVal = inc;
			}
		}
	}
	return modeVal;
}

function getRandomXZVec()	{

	var rngVec = new Vector;
	var rng = Math.random();

	switch (true)	{
		case (rng > 0 && rng < .25):
			rngVec = Vector(1,0,0);
			break;
		case (rng >= .25 && rng < .5):
			rngVec = Vector(-1,0,0);
			break;
		case (rng >= .5 && rng < .75):
			rngVec = Vector(0,0,1);
			break;
		case (rng >= .75 && rng < 1):
			rngVec = Vector(0,0,-1);
			break;
	}

	return rngVec;

}

function getRandomXZSide(vec)	{

	var rngVec = new Vector;
	var rng = Math.random();
	var rng2 = Math.random();
	
	if(vec.getX() == 0)	{
		switch (true)	{
			case (rng > 0 && rng < .5):
				rngVec = Vector(rng2,0,0);
				break
			case (rng >= .5 && rng <= 1):
				rngVec = Vector(-(rng2),0,0);
				break;
			
		}
	}
	else	{
		switch (true)	{
			case (rng > 0 && rng < .5):
				rngVec = Vector(0,0,-(rng2));
				break;
			case (rng >= .5 && rng <= 1):
				rngVec = Vector(0,0,rng2);
				break;

		}
	}

	return rngVec;
}

function getListBlock(list)	{

	var tmpList = new Array();
	//var tmpObj = new Object();
	var maxBlock = 0;
	var maxChance = 0;
	var totalChance = 0;

	for (inc in list){
	
		var tmpObj = new Object();
		tmpObj.myBlock = list[inc].block;
		tmpObj.minChance = totalChance;
		tmpObj.maxChance = totalChance + list[inc].chance;
		tmpList.push(tmpObj);
		totalChance += list[inc].chance;
	}
	
	randomProb = Math.random() * totalChance;
	
	for (var inc = 0; inc < tmpList.length; inc++)	{
		if ((randomProb >= tmpList[inc].minChance) && (randomProb <= tmpList[inc].maxChance))	{
			maxBlock = tmpList[inc].myBlock;
		}
	}
	
	var rng = Math.random();
	switch (true)	{
	case (rng > 0 && rng < .25):
		maxBlock.rotate90();
		break;
	case (rng >= .25 && rng < .5):
		maxBlock.rotate90Reverse();
		break;
	case (rng >= .5 && rng < .75):
		maxBlock.flip();
		break;
	case (rng >= .75 && rng < 1):
		break;
	}

	return maxBlock;
	//var bType = new BaseBlock(oreList[maxOreID].BlockID);
	
}

function getDistance(a, b)	{

var xSize = a.getX()-b.getX();
var ySize = a.getY()-b.getY();
var zSize = a.getZ()-b.getZ();
var distance = Math.sqrt((xSize*xSize)+(ySize*ySize)+(zSize*zSize));

return distance;
}

function getDistanceVec(a, b, length) {	
	//get the vector that is the specified distance away from vec a heading to vec b
	var i = length * (1 / getDistance(a, b));

	var xi = a.getX() + ((b.getX() - a.getX()) * i);
	var yi = a.getY() + ((b.getY() - a.getY()) * i);
	var zi = a.getZ() + ((b.getZ() - a.getZ()) * i);

	var v = new Vector( xi, yi, zi );
	return v;
}

function lengthSq(x, y, z) {
	return ((x * x) + (y * y) + (z * z));
}

function rotateVec(origin, vec, angle)	{
	
	var s = Math.sin(angle * (Math.PI/180));
	var c = Math.cos(angle * (Math.PI/180));
	
	var dx = (vec.getX() - origin.getX()) * c - (vec.getZ() - origin.getZ()) * s;
	var dz = (vec.getX() - origin.getX()) * s + (vec.getZ() - origin.getZ()) * c;

	dx = Math.round(dx + origin.getX());
	dz = Math.round(dz + origin.getZ());
	
	return Vector(dx, vec.getY(), dz);
}

function getDirection()	{		
	//returns object with multiple player direction properties
	
	var yaw = (player.getYaw()) % 360;
    if (yaw < 0)	{
        yaw += 360;
	}
	
	var dir = new Array();
	dir.pitch = player.getPitch();
	dir.yaw = yaw;
	
	switch(true)	{

		case ((yaw > 337.5) || (yaw <= 22.5)):
			dir.text = "South [Z+]";
			dir.vec = Vector(0,0,1);
			dir.angle = 0;
			dir.rightAngle = 0;
			break;	
		case ((yaw > 22.5) && (yaw <= 67.5)):
			dir.text = "South West [X- Z+]";
			dir.vec = Vector(-1,0,1);
			dir.angle = 45;
			dir.rightAngle = yaw < 45 ? 0 : 90;
			break;
		case ((yaw > 67.5) && (yaw <= 112.5)):
			dir.text = "West [X-]";
			dir.vec = Vector(-1,0,0);
			dir.angle = 90;
			dir.rightAngle = 90;
			break;
		case ((yaw > 112.5) && (yaw <= 157.5)):
			dir.text = "North West [X- Z-]";
			dir.vec = Vector(-1,0,-1);
			dir.angle = 135;
			dir.rightAngle = yaw < 135 ? 90 : 180;
			break;
		case ((yaw > 157.5) && (yaw <= 202.5)):
			dir.text = "North [Z-]";
			dir.vec = Vector(0,0,-1);
			dir.angle = 180;
			dir.rightAngle = 180;
			break;
		case ((yaw > 202.5) && (yaw <= 247.5)):
			dir.text = "North East [X+ Z-]";
			dir.vec = Vector(1,0,-1);
			dir.angle = 225;
			dir.rightAngle = yaw < 225 ? 180 : 270;
			break;
		case ((yaw > 247.5) && (yaw <= 292.5)):
			dir.text = "East [X+]";
			dir.vec = Vector(1,0,0);
			dir.angle = 270;
			dir.rightAngle = 270;
			break;
		case ((yaw > 292.5) && (yaw <= 337.5)):
			dir.text = "South West [X+ Z+]";
			dir.vec = Vector(1,0,1);
			dir.angle = 315;
			dir.rightAngle = yaw < 315 ? 270 : 0;
			break;
	}
	
	//player.print("Direction: " + dir.text + " [" + dir.yaw.toFixed(2) + "] [" + dir.pitch.toFixed(2) + "]" );
	return dir;

}

function getWorldEdit(){
	//Thanks to Nividica @ http://forum.sk89q.com/threads/i-need-to-script-schematics.8972/
	//for figuring out how to get worlddit plugin from bukkit
	
	try	{
		// Get the server singleton
		var bukkitServer = Bukkit.server;
	 
		// Get the current plugin manager
		var bukkitPluginManager = bukkitServer.getPluginManager();
	 
		// Get the world edit plugin
		var worldEditPlugin = bukkitPluginManager.getPlugin("WorldEdit");
	 
		// Access the worldedit object
		var we = worldEditPlugin.getWorldEdit();
	}
	catch (e)	{
		player.print(text.Red + "Error: " + text.White + "This feature is only available while playing on a bukkit server.");
		return false
	}
    // Return
    return we;
}

function checkFlag(flag, start)	{

	if (start == undefined) {start = 2;}

	for (var fInc in argv)	{
		if (fInc < start) {continue;}
		tmpStr = (String(argv[fInc]).slice(0, flag.length)).toLowerCase();
		if (tmpStr == String(flag).toLowerCase())	{
			var flagArg = String(argv[fInc]).slice(flag.length);
			if (flagArg.length > 0)	{
				return flagArg;
			}
			else{
				return true;
			}
		}
	}
	return false;
}

function pauseScript(timeMs)	{
    var date = new Date();
    var curDate = null;

    do {curDate = new Date(); }
    while(curDate-date < timeMs);
}

function compressArray(original) {
 
	var compressed = [];
	var copy = original.slice(0);
 
	for (var i = 0; i < original.length; i++) {
 
		var myCount = 0;	
		for (var w = 0; w < copy.length; w++) {
			if (original[i] == copy[w]) {
				myCount++;
				delete copy[w];
			}
		}
 
		if (myCount > 0) {
			var a = new Object();
			a.value = original[i];
			a.count = myCount;
			compressed.push(a);
		}
	}
 
	return compressed;
};

function getColor(r, g, b)	{

	return ((r << 16) | (g << 8) | b);

}

function generateSurfaceImage(vecStart, vecEnd, colorByHeight, returnArray) {

	try {

		var start = {'x': Math.round(Math.min(vecStart.x, vecEnd.x)), 'z': Math.round(Math.min(vecStart.z, vecEnd.z)) };
		var end = {'x': Math.round(Math.max(vecStart.x, vecEnd.x)), 'z': Math.round(Math.max(vecStart.z, vecEnd.z)) };
		var mapWidth = java.lang.Integer(parseInt(end.x - start.x+1));
		var mapHeight = java.lang.Integer(parseInt(end.z - start.z+1));
		
		if (typeof returnArray == 'undefined' || returnArray == false) var img = new java.awt.image.BufferedImage(mapWidth, mapHeight,java.awt.image.BufferedImage.TYPE_INT_RGB);
		
		var lightDir = {
			'SEtoNW': new Vector(1, 0, 1),
			'SWtoNE': new Vector(-1, 0, 1),
			'NEtoSW': new Vector(1, 0, -1),
			'NWtoSE': new Vector(-1, 0, -1)
		}
		
		var colorArray = new Array();
		
		var lightAngle = 'NWtoSE';
		var invertLight = new Vector(-1, 0, -1);
		var hoo = [8,9];
		
		var moda = .75;
		var modb = 1;
		var modc = -130;
		var modd = 4;
		var darkEdge = -.2;
		var lightEdge = .2;
		
		for (var x = 0; x < mapWidth; x++) {
			for (var z = 0; z < mapHeight; z++) {
				var pos = new Vector((start.x + x), 1, (start.z + z));
				var yMax = es.getHighestTerrainBlock(pos.x,pos.z, 0, 256, false);
				var topID = getBlock(new Vector(pos.x, yMax, pos.z)).id;
				var depth = 0;
				for (var y = yMax; y < 256; y++) {
					var topVec = new Vector(pos.x, y, pos.z);
					var aboveBlock = getBlock(topVec.add(0,1,0)).id;
					if(aboveBlock === 0) {
						topID = getBlock(topVec).id;
						if (depth === 0) {
							if (hoo.indexOf(topID) === -1) {
								var edgeL = getBlock(topVec.add(lightDir[lightAngle])).id === 0 ? true : false;
								var edgeD = getBlock(topVec.add(lightDir[lightAngle].multiply(invertLight))).id === 0 ? true : false;	// Check sideblock instead of the actual one... 
							}
							else {
								for (var wy = 0; wy < y; wy++) {
									var under = topVec.add(0,-(wy),0);
									if(hoo.indexOf(getBlock(under).id) === -1) {
										under = under.add(0,1,0);
										var edgeL = hoo.indexOf(getBlock(under.add(lightDir[lightAngle])).id) === -1 ? false : true;
										var edgeD = hoo.indexOf(getBlock(under.add(lightDir[lightAngle].multiply(invertLight))).id) === -1 ? false : true;	// Check sideblock instead of the actual one... 
										depth = wy;
										break;
									}
								}
							}
						}
						break;															
					}
					else if(hoo.indexOf(aboveBlock) !== -1) {
						if (depth === 0) {
							var edgeL = hoo.indexOf(getBlock(topVec.add(lightDir[lightAngle].multiply(invertLight))).id) === -1  ? true : false;
							var edgeD = hoo.indexOf(getBlock(topVec.add(lightDir[lightAngle])).id) === -1 ? true : false;	// Check sideblock instead of the actual one... 
						}
						depth++
					}				
				}  	
				
				var topStr = topID +':' + String(getBlock(topVec.add(0,0,0)).data);
				topID = typeof blockColors[topStr] === 'undefined' ? topID : topStr;
				
				var clr = [255,0,0];
				var clrInc = typeof blockColors[topID] !== 'undefined' ? topID : -1;
				
				if (clrInc !== -1) {
				
					if (colorByHeight === false) {
						clr = buildColor(blockColors[clrInc][0]*moda, blockColors[clrInc][1]*moda, blockColors[clrInc][2]*moda);					
					}
					else {
						var r = blockColors[clrInc][0] + ((y + modc) / modb) - depth * modd; 
						var g = blockColors[clrInc][1] + ((y + modc) / modb) - depth * modd; 
						var b = blockColors[clrInc][2] + ((y + modc) / modb) - depth * modd;
						
						r = r + ((edgeD ? darkEdge * r : 0) + (edgeL ? lightEdge * (255 - r) : 0));
						g = g + ((edgeD ? darkEdge * g : 0) + (edgeL ? lightEdge * (255 - g) : 0));
						b = b + ((edgeD ? darkEdge * b : 0) + (edgeL ? lightEdge * (255 - b) : 0));
						
						r = Math.max(Math.min(r, 255), 0);
						g = Math.max(Math.min(g, 255), 0);
						b = Math.max(Math.min(b, 255), 0);
						
						clr = [r, g, b];
					}
				}
			
				var endClr = getColor(clr[0], clr[1], clr[2]) ;
				
				if (returnArray) {

					//colorArray[Math.round(pos.getX())] = colorArray[Math.round(pos.getX())] ? colorArray[Math.round(pos.getX())] : new Array();
					if (!colorArray[Math.round(pos.x)])  colorArray[Math.round(pos.x)] = new Array();
					if (vecStart.equals(vecEnd)) {
						//var tmpColor = getColor(clr.getRed(), clr.getGreen(), clr.getBlue());
						//if (tmpColor == null || typeof tmpColor == 'null') tmpColor == getColor(1,1,1);
						return endClr;
					}		
					colorArray[Math.round(pos.x)][Math.round(pos.z)] = endClr;
					
				}
				else {	
					img.setRGB(x, z, endClr);
				}
			}
		}
		//printDebug("colorArray", colorArray);
		if (returnArray) {
			return colorArray;
		}
		else {
			return img;
		}
		
		//return (returnArray ? (vecStart == vecEnd ? vecColor : colorArray ): img);
	}
	catch(e) {
		$err.handle("surfaceImage", e);
	}
	
}

var ShapeCycler = function ShapeCycler(callback, xSize, ySize, zSize) {
	this.callback;
	this.enabled;
	this.size;
	this.vec;
	this.round;
	this.inDensity;
	this.outDensity;
	
	ShapeCycler.prototype.initialize = function initialize(callback, xSize, ySize, zSize) {

		try{
			if (this.setCallback(callback) === false) return false;
			this.setSize(xSize, ySize, zSize);
			this.inDensity = 1;
			this.outDensity = 1;
			this.enabled = true;
		}
		catch(e) {
			$err.handle("ShapeCycler Initialize", e);
		}
	};
	
	ShapeCycler.prototype.run = function run(vec, filled) {
		try {

			if (!this.enabled) return false;
			if (!vec.x || !vec.y || !vec.z) return false; 
			
			filled = typeof filled === 'undefined' ? true : filled;

			var setTotal = 0;		
			var bx = parseInt(vec.x);
			var by = parseInt(vec.y);
			var bz = parseInt(vec.z);

			var radiusX = this.size.x/2 + 0.5;
			var radiusY = this.size.y/2 + 0.5;
			var radiusZ = this.size.z/2 + 0.5;

			var invRadiusX = 1 / radiusX;
			var invRadiusY = 1 / radiusY;
			var invRadiusZ = 1 / radiusZ;

			var ceilRadiusX = Math.ceil(radiusX);
			var ceilRadiusY = Math.ceil(radiusY);
			var ceilRadiusZ = Math.ceil(radiusZ);

			//var watch = new StopWatch(true);
			
			var xn, yn, zn;
			var px, nx, py, ny, pz, nz;

			// ellipsoid function copied and converted from worldedit sphere/ellipse function
			var nextXn = 0;
			forX: for (var x = 0; x <= ceilRadiusX; ++x) {
				xn = nextXn;	
				nextXn = (x + 1) * invRadiusX;
				var nextYn = 0;
				forY: for (var y = 0; y <= ceilRadiusY; ++y) {
					yn =  nextYn;
					nextYn = (y + 1) * invRadiusY;
					var nextZn = 0;
					forZ: for (var z = 0; z <= ceilRadiusZ; ++z) {
						zn =  nextZn;
						nextZn = (z + 1) * invRadiusZ;
						
						var lenSq = lengthSq(xn, yn, zn);
						if (lenSq > 1) {
							if (z == 0) {
								if (y == 0) {
									break forX;
								}
								break forY;
							}
							break forZ;
						}

						if (!filled) {
							if (lengthSq(nextXn, yn, zn) <= 1 && lengthSq(xn, nextYn, zn) <= 1 && lengthSq(xn, yn, nextZn) <= 1) {
								continue;
							}
						}
						
						px = x + bx;
						nx = -x + bx;
						py = y + by;
						ny = -y + by;
						pz = z + bz;
						nz = -z + bz;
						
						this.callback(px, py, pz, lenSq);
						this.callback(nx, py, pz, lenSq);
						this.callback(px, ny, pz, lenSq);
						this.callback(px, py, nz, lenSq);
						this.callback(nx, ny, pz, lenSq);
						this.callback(px, ny, nz, lenSq);
						this.callback(nx, py, nz, lenSq);
						this.callback(nx, ny, nz, lenSq);

						setTotal+=8;					
					}
				}
			}
			
			//$print(watch);
			//$print("Blocks per second: " + parseInt(setTotal / watch.getTime()));
		}
		catch(e) {
			$err.handle("ShapeCycler Run", e);
			return false;
		}		
		
		return setTotal;
	};	

	ShapeCycler.prototype.setSize = function setSize(x, y, z) {
		this.size = {};
		this.size.x = typeof x === 'number' ? parseInt(x) : 5;
		this.size.y = typeof y === 'number' ? parseInt(y) : this.size.x;		
		this.size.z = typeof z === 'number' ? parseInt(z) : this.size.x;
	};	
	
	ShapeCycler.prototype.setCallback = function setCallback(ptr) {
		if (!ptr instanceof Function) return false;
		else this.callback = ptr;
	};
	
	ShapeCycler.prototype.setDensity = function setDensity(ind, outd) {
		this.inDensity = typeof ind === 'number' ? (ind > 1 ? ind/100 : ind): this.inDensity;
		this.outDensity = typeof outd === 'number' ? (outd > 1 ? outd/100 : outd): this.outDensity;
	};
	
	this.initialize(callback, xSize, ySize, zSize);

};

var WeightedList = function WeightedList(listArray) {
	this.list = new Array; //typeof listArray === 'undefined' ? new Array() : listArray;
	this.weightTotal;
	this.weightList = new Array;
	this.weightIndex = 0;
	
	WeightedList.prototype.update = function update() {
		
		var weightTotal = 0;
		for (var inc = 0; inc < this.list.length; inc++) {
			
			this.list[inc].minWeight = weightTotal;
			weightTotal+= this.list[inc].weight === -1 ? parseInt(100 / this.list.length) : this.list[inc].weight ;
			this.list[inc].maxWeight = weightTotal;
		}
		this.weightTotal = weightTotal;
	
	};

	WeightedList.prototype.add =  function add(item, weight) {
		if (typeof item.item !== 'undefined') {
			item.weight =  typeof item.weight === 'undefined' ? -1 : item.weight;
			this.list.push(item);
		}
		else {
			
			if (typeof item === 'undefined') return null;
			if (typeof weight === 'undefined') {
				this.list.push({item: item, weight: -1});
			}
			else {
				this.list.push({item: item, weight: weight});
			}
		}
	};

	WeightedList.prototype.ready = function ready(arraySize) {
		this.update();
		
		arraySize = !isNaN(parseInt(arraySize)) ? parseInt(arraySize) : 10000;
		this.weightList = new Array(arraySize);
		
		for (var i = 0; i < this.weightList.length; i++) {
			var rngWeight = Math.floor(Math.random() * this.weightTotal);
			
			for (var inc = 0; inc < this.list.length; inc++) {
				if (rngWeight >= (this.list[inc].minWeight) && rngWeight < this.list[inc].maxWeight) {
					this.weightList[i] = inc;
					break;
				}
			}			
		}
		this.weightIndex = 0;
	};
	
	WeightedList.prototype.next = function next() {
		
		this.weightIndex = this.weightIndex >= this.weightList.length-1 ? 0 : this.weightIndex + 1;
		return this.list[this.weightList[this.weightIndex]].item;
	
	};
	
	WeightedList.prototype.loadString = function loadString(str) {
		try {
			var strArray = String(str).split(",");
			strArray = strArray.length < 2 ? new Array(str) : strArray;
			
			for (var inc = 0; inc < strArray.length; inc++) {
				var weight = 100/strArray.length;
				var strItem = String(strArray[inc]).toLowerCase();
				var pctPos = strItem.indexOf("%");
				if (pctPos !== -1) {
					weight = parseInt(strItem.slice(0, pctPos));
					strItem = strItem.slice(pctPos+1);
				}
				this.add(strItem, weight);
			}
		}
		catch(e) { 
			$err.handle(e);
			return false;
		}
	};

	WeightedList.prototype.toString = function toString() {
		return String("Weighted List" + text.White + "[" + text.Gold + this.list.length + text.White + "]");
	}
 }

var StopWatch = function StopWatch(state) {
	this.startTime = 0;
	this.stopTime = 0;
	this.lapTimes = [];
	this.running = false;
	
	StopWatch.prototype.start = function start() {
		if (this.running) return false;
		
		this.startTime = this.getNow();
		this.running = true;
		return this;
	};
	
	StopWatch.prototype.stop = function stop() {
		if (!this.running) return false;
		this.running = false;
		
		this.stopTime = this.getNow();
		var runTime = (this.stopTime - this.startTime) / 1000;
		this.lapTimes.push(runTime);
		return runTime;
	};

	StopWatch.prototype.getTime = function getTime() {
		if (this.running) {
			var curTime = this.getNow();
			return parseFloat(curTime - this.startTime) / 1000;
		}
		else {
			if (this.lapTimes.length < 1) {
				return null;
			}
			else {
				return parseFloat(this.lapTimes[this.lapTimes.length-1]);
			}
		}
	};
	
	StopWatch.prototype.getNow = function getNow() {
		return java.util.Date().getTime();
	};
	
	StopWatch.prototype.reset = function reset() {
		this.running = false;
		this.startTime = 0;
		this.stopTime = 0;
	};
	
	StopWatch.prototype.resetLaps = function resetLaps() {
		this.lapTimes = [];
	};	

	StopWatch.prototype.addLapTime = function addLapTime() {
		var timeNow = this.getNow();
		var runTime = (timeNow - this.startTime) / 1000;
		this.lapTimes.push(runTime);
		this.startTime = timeNow;
	};
	
	StopWatch.prototype.getLapTimes = function getLapTimes() {
		return this.lapTimes;
	};
	
	StopWatch.prototype.toString = function toString() {
		if (this.running) {
			return (String("Stopwatch [Running] Elapsed Time: " + (this.getNow() - this.startTime) / 1000));
		}
		if (!this.running) {
			if (this.lapTimes.length < 1) {
				return (String("Stopwatch [Not Started]"));
			}
			else {
				return (String("Stopwatch [Stopped] Last Lap Time: " + (this.lapTimes[this.lapTimes.length-1])));
			}
		}
	};
	
	if (state === true) this.start();

};

function setHeldItemInfo(nameStr, loreStr) {
	var bp = org.bukkit.Bukkit.getPlayer(player.getName());
	
	function setHeldItem(itemStack) {		
		return bp.setItemInHand(itemStack);
	};	
	function getHeldItem() {		
		return bp.getItemInHand();
	};		
	function setItemName(item, str) {		
		var itemMeta = item.getItemMeta();
		itemMeta.setDisplayName(str);
		item.setItemMeta(itemMeta);
	};
	function setItemLore(item, strArr) {		
		var itemMeta = item.getItemMeta();
		itemMeta.setLore(strArr);
		item.setItemMeta(itemMeta);
	};

	var item = getHeldItem();
	setItemName(item, nameStr);
	//setItemLore(item, [loreStr]);
	setHeldItem(item);

}
 
//////////////////////////////////////////////////////////
//				Internal Creation Functions
//////////////////////////////////////////////////////////

function CreateLeafSphere(size, yLimit, density, hollow, vec, block, session)	{
	//size, ylimit, density, hollow, vec, block, session
	
	yLimit = yLimit > 0 ? size - yLimit: -(size - Math.abs(yLimit));
	
	for (var x = 0; x <= size; x++) {
		for (var y = 0; y <= size; y++) {
			for (var z = 0; z <= size; z++) {
			
			var pos = vec.add(x - size/2 + .5, y - size/2 + .5, z - size/2 +.5);
			var distance = getDistance(vec, pos);
			
			if (distance > size/2)	{continue;}
			if ((hollow != 0) && (distance <= (size/2 - hollow))) {continue;}

			var diff = (size/2) - ((size/2) * density);
			var pctIn = (1-((distance-((size/2) * density))/diff));
	
			if ((pctIn < Math.random()) && (density != 1))	{continue;}
				
			var adjY = (pos.getY() - (vec.getY()-(size/2)));
			if ((adjY < yLimit) || (adjY > (size) + yLimit))	{continue;}
	
			if (yLimit < 0)	{
				if (Math.abs(yLimit) > (size/2))	{
					pos = pos.add(0,Math.abs(yLimit)-(size/2)+1,0);
				}else	{
					pos = pos.add(0,-(yLimit + (size/2))+1,0);
				}
			}
			if (yLimit > 0)	{
				if (Math.abs(yLimit) > (size/2))	{
					pos = pos.add(0,-(yLimit-(size/2)),0);
				}else	{
					pos = pos.add(0,((size/2) - yLimit),0);
				}
			}
			if (yLimit == 0)	{
				pos = pos.add(0, (size/2)+1,0);
			}
			setBlock(pos.add(0,-.5,0), block);
			
			}
		}
	}

}

function CreateLeafClump(size, vec, block, session)	{
	
	size = Math.round(size * .5);
	
	var x = vec.getX();
	var y = vec.getY();
	var z = vec.getZ();
	
	if (invert == 1)	{
		for(var k = y; k <= y + size; k++) {
			var l = k - y;
			var i1 = size - l;

			for(var j1 = x - i1; j1 <= x + i1; ++j1) {
				var k1 = j1 - x;

				for(var l1 = z - i1; l1 <= z + i1; ++l1) {
					var i2 = l1 - z;

					if(Math.abs(k1) != i1 || Math.abs(i2) != i1 || Math.random() >= 0.5) {
						var dest = new Vector(j1,k,l1);
						setBlock(dest, block);
					}
				}
			}
		}
	}
	if (invert == -1)	{
		for(var k = y; k >= y - size; k--) {
			var l = k - y;
			var i1 = size - l;

			for(var j1 = x - i1; j1 <= x + i1; ++j1) {
				var k1 = j1 - x;

				for(var l1 = z - i1; l1 <= z + i1; ++l1) {
					var i2 = l1 - z;

					if(Math.abs(k1) != i1 || Math.abs(i2) != i1 || Math.random() >= 0.5) {
						var dest = new Vector(j1,k,l1);
						setBlock(dest, block);
					}
				}
			}
		}
	}
}

function CreateTrunk(size, height, vec, block, session)	{

	for(var y = 0; y < height; y++)	{
		CreateLeafSphere(size - (size*(y/height))+.5, 2*invert, 1, 0, vec.add(0,y*invert,0), block, session);
	}
	
}

function CreateShape(shapeObj, origin, angle, blockMat, excludeID, session)	{
	
	//var excludeID = 0;
	var shape = shapeObj.shape;
	var afterBlocks = [];
	var minVec = zVec;
	
	//blacklist are all 'attached' block dependent items that need to be set after everything else
	var blackList = [6,26,27,28,31,37,38,39,40,50,51,54,55,59,63,64,65,66,68,69,70,71,72,75,76,77,78,81,83,93,94,96,104,105,106,111,115,127,131,132,141,142,143];
	var flipList = [44,53,67,108,109,114,126,128,134,135,136];
	
	origin = origin.add(shapeObj.offset);
	for (property in shape){
		
		if (angle == 361)	{		//this is used to make 4 copies at each 90 degree increment
			for (var ang = 0; ang < 360; ang++)	{
				
				if (blockMat.apply(new Vector(0,0,0)).getType() < 1)	{
					var block = parseBlock(shape[property].id);
				}
				else	{
					var block = blockMat.apply(new Vector(0,0,0));
					block = parseBlock(shape[property].id).getType() == 0 ? parseBlock(shape[property].id) : block;
				}
				if (block.getType() == excludeID)	{continue;}
				var ang = ((ang + parseInt(shapeObj.angle)) % 360);
				switch (ang)	{
				
					case 0:
						vec = origin.add(-shape[property].vec.getZ(),shape[property].vec.getY()*invert,shape[property].vec.getX());
						block.rotate90();
						break;
					case 90:
						vec = origin.add(-shape[property].vec.getX(),shape[property].vec.getY()*invert,-shape[property].vec.getZ());
						block.rotate90();
						block.rotate90();
						break;
					case 180:
						vec = origin.add(shape[property].vec.getZ(),shape[property].vec.getY()*invert,-shape[property].vec.getX());
						block.rotate90();
						block.rotate90();
						block.rotate90();
						break;
					case 270:
						vec = origin.add(shape[property].vec.getX(),shape[property].vec.getY()*invert,shape[property].vec.getZ());					
						break;
					default:
						vec = origin;
						break;
				}
				
				
				if (invert == -1)	{
					if (flipList.indexOf(block.getType()) != -1)	{
						block.flip(CuboidClipboard.FlipDirection.UP_DOWN);
					}	
				}	
				
				if (blackList.indexOf(block.getType()) != -1)	{
					var tmpObj = new Object();
					tmpObj.vec = vec;
					tmpObj.block = block;
				
					afterBlocks.push(tmpObj);
				}
				else	{
					setBlock(vec, block);
				}
			}
		}
		else {		//this is used for all normals rotation copies

			var endAngle = (parseInt(angle) + parseInt(shapeObj.angle)) % 360;
			
			if((shapeObj.angle == 0) || (shapeObj.angle == 180))	{
				endAngle = (endAngle + 180) % 360;
			}
			
			if (blockMat.apply(new Vector(0,0,0)).getType() < 1)	{
				var block = parseBlock(shape[property].id);
			}
			else	{
				var block = blockMat.apply(new Vector(0,0,0));
				block = parseBlock(shape[property].id).getType() == 0 ? parseBlock(shape[property].id) : block;
			}
			if (block.getType() == excludeID)	{continue;}
			
			switch (endAngle)	{
				case 0:	
					vec = origin.add(-shape[property].vec.getZ(),shape[property].vec.getY()*invert,shape[property].vec.getX());
					block.rotate90();
					break;
				case 90:
					vec = origin.add(-shape[property].vec.getX(),shape[property].vec.getY()*invert,-shape[property].vec.getZ());
					block.rotate90();
					block.rotate90();
					break;
				case 180:
					vec = origin.add(shape[property].vec.getZ(),shape[property].vec.getY()*invert,-shape[property].vec.getX());
					block.rotate90();
					block.rotate90();
					block.rotate90();
					break;
				case 270:
					vec = origin.add(shape[property].vec.getX(),shape[property].vec.getY()*invert,shape[property].vec.getZ());
					break;	
				default:
					vec = origin.add(shape[property].vec.getX(),shape[property].vec.getY()*invert,shape[property].vec.getZ());
					vec = rotateVec(origin, vec, (angle-shapeObj.angle+270)%360);
					break;
			}
			
			if(minVec == zVec)	{minVec = vec;}
			
			if (invert == -1)	{
				if (flipList.indexOf(block.getType()) != -1)	{
					block.flip(CuboidClipboard.FlipDirection.UP_DOWN);
				}	
			}	
			
			if (vec != origin)	{
				if (blackList.indexOf(block.getType()) != -1)	{
					var tmpObj = new Object();
					tmpObj.vec = vec;
					tmpObj.block = block;
				
					afterBlocks.push(tmpObj);
				}
				else	{
					setBlock(vec, block);
				}
			}
		}
    }
	
	for (inc in afterBlocks){
		setBlock(afterBlocks[inc].vec, afterBlocks[inc].block);
	}
	
	if (checkFlag("$"))	{
		var selector = context.getSession().getRegionSelector(player.getWorld());
		
		if (selector.selectSecondary(vec, ActorSelectorLimits.forActor(player)))
			selector.explainSecondarySelection(player, context.getSession(), vec);

		if (selector.selectPrimary(minVec, ActorSelectorLimits.forActor(player)))
			selector.explainPrimarySelection(player, context.getSession(), minVec);
	}

}

function CreateLine(a, b, block, session)	{

	var distance = getDistance(a, b);
	var step = .9/distance;

	for( var i = 0; i <= 1; i += step) {
			
		var xi = a.getX() + ((b.getX() - a.getX()) * i);
		var yi = a.getY() + ((b.getY() - a.getY()) * i);
		var zi = a.getZ() + ((b.getZ() - a.getZ()) * i);
		
		var vec = new Vector(xi, yi, zi);
		setBlock(vec, block);	
	}
}

function CreateSpike(origin, end, block, session, size)	{

	for (var x = 0; x <= size; x++) {
		for (var y = 0; y <= size; y++) {
			for (var z = 0; z <= size; z++) {
			
				pos = origin.add(x - size/2, y - size/2, z - size/2);
				distance = getDistance(origin, pos);

				if (distance > size/2)	{continue;}
				CreateLine(pos, end, block, session);
			}
		}
	}

}

function CreateSphere(size, hollow, vec, block, session)	{
	//hollow = the number of blocks thicks the "shell" should be, use 0 for solid
	
	for (var x = 0; x <= size; x++) {
		for (var y = 0; y <= size; y++) {
			for (var z = 0; z <= size; z++) {
			
				pos = vec.add(x - size/2 + .5, y - size/2 + .5, z - size/2 + .5);
				distance = getDistance(vec, pos);
				
				if (distance > size/2)	{continue;}
				if ((hollow != 0) && (distance <= (size/2 - hollow))) {continue;}

				setBlock(pos, block);
			
			}
		}
	}

}

//////////////////////////////////////////////////////////
//				Tree Creation Functions
//////////////////////////////////////////////////////////

function CreateBush(vec, session, size, woodBlock, leafBlock)	{
	
	//var size = checkFlag("s", 3) ? parseInt(checkFlag("s"))* (1+Math.random()*.2) : (Math.random() * (trees['bush'].maxChg)) + trees['bush'].minSize;
	//var woodBlock = checkFlag("w") ? parseBlock(checkFlag("w")) : trees['bush'].woodBlock;
	//var leafBlock = checkFlag("l") ? parseBlock(checkFlag("l")) : trees['bush'].leafBlock;
	//size = gSize != -1 ? gSize + (gSize * (1+Math.random()*.2)) : size;
	
	if (checkFlag("c", 3))
		CreateLeafClump(size, vec.add(0,1*invert,0), leafBlock, session);
	else	
		CreateLeafSphere(size, 2*invert, .95, 0, vec.add(0,1*invert,0), leafBlock, session);
	
	setBlock(vec.add(0,1*invert,0), woodBlock);
}

function CreateSmallTree(vec, session, size, woodBlock, leafBlock)	{

	for (var y = 1; y <= size; y++)		{
		setBlock(vec.add(0,y*invert,0), woodBlock);
	}
	
	if (checkFlag("c", 3))	{
		CreateLeafClump(size*.7, vec.add(0,y*invert,0), leafBlock, session);
	}
	else	{	
		CreateLeafSphere(size, (3+(size*.1))*invert , .9, 0, vec.add(0,y*invert,0), leafBlock, session);
	}
	
}

function CreateStickTree(vec, session, size, woodBlock, leafBlock)	{

	//var size = checkFlag("s") ? parseInt(checkFlag("s"))* (1+Math.random()*.2) : (Math.random() * (trees['stick'].maxChg)) + trees['stick'].minSize;
	//var woodBlock = checkFlag("w") ? parseBlock(checkFlag("w")) : trees['stick'].woodBlock;
	//var leafBlock = checkFlag("l") ? parseBlock(checkFlag("l")) : trees['stick'].leafBlock;
	//size = gSize != -1 ? gSize + (gSize * (1+Math.random()*.2)) : size;

	for (var y = 1; y <= size; y++)		{
		setBlock(vec.add(0,y*invert,0), woodBlock);
	}

}

function CreateMediumTree(vec, session, size, woodBlock, leafBlock)	{

	for (var y = 1; y <= size; y++)		{
		
		var randDir = getRandomXZVec();
		var sideDir = getRandomXZSide(randDir);
		var branchLength = (size*trees['medium'].branchSize) + (Math.random()*(size*trees['medium'].branchSize));
		
		for(branch = 1; branch < branchLength; branch++)	{
				var newPnt = vec.add(randDir.getX()*branch, (y*invert)+(branch/2*invert), randDir.getZ()*branch);
				var newPnt = newPnt.add(sideDir.getX()*(branch/2), 0, sideDir.getZ()*(branch/2));
				setBlock(newPnt, woodBlock);
		}
		setBlock(newPnt.add(0,1*invert,0), woodBlock);
		
		if (checkFlag("c", 3))
			CreateLeafClump(trees['medium'].leafSize/2+1, newPnt.add(0,2*invert,0), leafBlock, session);
		else
			CreateLeafSphere(trees['medium'].leafSize, 3*invert, .9, 0, newPnt.add(0,2*invert,0), leafBlock, session);

		setBlock(vec.add(0,y*invert,0), woodBlock);
	}
	if (checkFlag("c", 3))
		CreateLeafClump(6, vec.add(0,y*invert,0), leafBlock, session);
	else
		CreateLeafSphere(8, 4*invert, .8, 0, vec.add(0,y*invert,0), leafBlock, session);
}

function CreateLargeTree(vec, session, size, woodBlock, leafBlock)	{

	if (size < 9)	{size = 10;}

	for (var y = 1; y <= size; y++)		{
		
		if(Math.random() >= (1 - trees['large'].branchProb))	{
		
			var randDir = getRandomXZVec();
			var sideDir = getRandomXZSide(randDir);
			var branchLength = (size*trees['large'].branchSize) + (Math.random()*(size*trees['large'].branchSize));
			
			for(branch = 1; branch < branchLength; branch++)	{
					var newPnt = vec.add(randDir.getX()*branch, (y*invert)+(branch/2*invert), randDir.getZ()*branch);
					var newPnt = newPnt.add(sideDir.getX()*(branch/2), 0, sideDir.getZ()*(branch/2));
					setBlock(newPnt, woodBlock);
			}
			setBlock(newPnt.add(0,1*invert,0), woodBlock);
			
			if (checkFlag("c", 3))
				CreateLeafClump(trees['large'].leafSize/2+1, newPnt.add(0,2*invert,0), leafBlock, session);
			else
				CreateLeafSphere(trees['large'].leafSize, 3*invert, .9, 0, newPnt.add(0,2*invert,0), leafBlock, session);
				
		}
		
		setBlock(vec.add(0,y*invert,0), woodBlock);
	}
	
	CreateTrunk(size*.2, size * .3, vec.add(.5, 0, .5), woodBlock, session);
	
	if (checkFlag("c", 3))
		CreateLeafClump(6, vec.add(0,y*invert,0), leafBlock, session);
	else	
		CreateLeafSphere(8, 4*invert, .8, 0, vec.add(0,y*invert,0), leafBlock, session);
}

function CreateBranchedTree(vec, session, size, woodBlock, leafBlock)	{

	for (var y = 1; y <= size; y++)		{
		
		if(Math.random() >= (1 - trees['branched'].branchProb1))	{
			
			var randDir1 = getRandomXZVec();
			var sideDir1 = getRandomXZSide(randDir1);
			var branchLength1 = (size*trees['branched'].branchSize1) + (Math.random()*(size*trees['branched'].branchSize1));
			
			for(branch1 = 1; branch1 < branchLength1; branch1++)	{
				var newPnt = vec.add(randDir1.getX()*branch1, (y*invert)+(branch1/2*invert), randDir1.getZ()*branch1);
				newPnt = newPnt.add(sideDir1.getX()*(branch1), 0, sideDir1.getZ()*(branch1));
				setBlock(newPnt, woodBlock);
				
				if(Math.random() >= (1 - trees['branched'].branchProb2))	{

					var randDir2 = getRandomXZVec();
					var sideDir2 = getRandomXZSide(randDir2);
					var branchLength2 = (size*trees['branched'].branchSize2) + (Math.random()*(size*trees['branched'].branchSize2));
					
					for(branch2 = 1; branch2 < branchLength2; branch2++)	{
						//var newPnt = vec.add(randDir.getX()*branc1h, (y*invert)+(branch2/2*invert)), randDir.getZ()*branch1);
						var newPnt2 = newPnt.add(sideDir2.getX()*(branch2/2), 1*invert, sideDir2.getZ()*(branch2/2));
						setBlock(newPnt2, woodBlock);
						
					}
					setBlock(newPnt2.add(0,1*invert,0), woodBlock);
					if (checkFlag("c", 3))
						CreateLeafClump(trees['branched'].leafSize/2-1, newPnt2.add(0,2*invert,0), leafBlock, session);
					else	
						CreateLeafSphere(trees['branched'].leafSize, 2*invert, .9, 0, newPnt2.add(0,2*invert,0), leafBlock, session);
				}
			}
			setBlock(newPnt.add(0,1*invert,0), woodBlock);
			
			if (checkFlag("c", 3))
				CreateLeafClump(trees['branched'].leafSize/2-1, newPnt.add(0,2*invert,0), leafBlock, session);
			else
				CreateLeafSphere(trees['branched'].leafSize, 3*invert, .9, 0, newPnt.add(0,2*invert,0), leafBlock, session);
				
		}
		
		setBlock(vec.add(0,y*invert,0), woodBlock);
	}
	
	CreateTrunk(size*.3, size * .35, vec, woodBlock, session);
	if (checkFlag("c", 3))
		CreateLeafClump(6, vec.add(0,y*invert,0), leafBlock, session);
	else	
		CreateLeafSphere(8, 4*invert, .8, 0, vec.add(0,y*invert,0), leafBlock, session);
}

function CreateRainforestTree(vec, session, size, woodBlock, leafBlock)	{
	
	for (var y = 1; y <= size; y++)		{
		
		if (y > (trees['rainforest'].branchHeight * size))	{
			var randDir = getRandomXZVec();
			var sideDir = getRandomXZSide(randDir);
			var branchLength = (size*trees['rainforest'].branchSize) + (Math.random()*(size*trees['rainforest'].branchSize));
			
			if(Math.random() >= (1 - trees['rainforest'].branchProb))	{
		
				for(branch = 1; branch < branchLength; branch++)	{
					var newPnt = vec.add(randDir.getX()*branch, (y*invert)+(branch/2*invert), randDir.getZ()*branch);
					var newPnt = newPnt.add(sideDir.getX()*(branch/2), 0, sideDir.getZ()*(branch/2));
					setBlock(newPnt, woodBlock);
				}
				if (checkFlag("c", 3))
					CreateLeafClump(trees['rainforest'].leafSize/2, newPnt.add(0,1*invert,0), leafBlock, session);
				else
					CreateLeafSphere(trees['rainforest'].leafSize, 2*invert, .95, 0,  newPnt.add(0,1*invert,0), leafBlock, session);
			}
		}			
		setBlock(vec.add(0,y*invert,0), woodBlock);
	}
	
	CreateTrunk(size*.15, size * .2, vec.add(.5, 0, .5), woodBlock, session);
	
	if (checkFlag("c", 3))
		CreateLeafClump(trees['rainforest'].leafSize/2, vec.add(0,y*invert,0), leafBlock, session);
	else
		CreateLeafSphere(trees['rainforest'].leafSize, 3*invert, .9, 0,  vec.add(0,y*invert,0), leafBlock, session);

}

function CreatePalmTree(vec, session, size, woodBlock, leafBlock)	{

	var randDir = getRandomXZVec();
	var sideDir = getRandomXZSide(randDir);
	
	for (var y = 0; y < size; y++)		{
		var setVec = vec.add(randDir.getX()*y*.5, (y+1)*invert, randDir.getZ()*y*.5);
		var setVec = setVec.add(sideDir.getX()*y*.5, 0, sideDir.getZ()*y*.5);
		
		setBlock(setVec, woodBlock);
	}
	if (checkFlag("l"))
		CreateShape(shapes['PalmLeaf'], setVec, 361, new BlockPattern(parseBlock(checkFlag("l"))), -1, session);
	else
		CreateShape(shapes['PalmLeaf'], setVec, 361, airMat, -1, session);
	setBlock(setVec, woodBlock);
}

function CreateSpikeTree(vec, session, size, woodBlock, leafBlock)	{

	//var size = checkFlag("s") ? parseInt(checkFlag("s"))* (1+Math.random()*.2) : (Math.random() * (trees['spike'].maxChg)) + trees['spike'].minSize;
	//var woodBlock = checkFlag("w") ? parseBlock(checkFlag("w")) : trees['spike'].woodBlock;
	//var leafBlock = checkFlag("l") ? parseBlock(checkFlag("l")) : trees['spike'].leafBlock;
	//size = gSize != -1 ? gSize + (gSize * (1+Math.random()*.2)) : size;
	
	for (var y = 1; y <= size; y++)		{
		
		if(Math.random() >= (1 - trees['spike'].branchProb1))	{
		
			var randDir1 = getRandomXZVec();
			var sideDir1 = getRandomXZSide(randDir1);
			var branchLength1 = (size*trees['spike'].branchSize1) + (Math.random()*(size*trees['spike'].branchSize1));
			
			//var maxRange = (Math.random() * 5)+.5;
			
			for(branch1 = 1; branch1 < branchLength1; branch1++)	{
				var newPnt = vec.add(randDir1.getX()*branch1, y+(branch1/2), randDir1.getZ()*branch1);
				newPnt = newPnt.add(sideDir1.getX()*(branch1), 0, sideDir1.getZ()*(branch1));
				setBlock(newPnt, woodBlock);

				if(Math.random() >= (1 - trees['spike'].branchProb2))	{

					var randDir2 = getRandomXZVec();
					var sideDir2 = getRandomXZSide(randDir2);
					var branchLength2 = (size*trees['spike'].branchSize2) + (Math.random()*(size*trees['spike'].branchSize2));
					
					for(branch2 = 1; branch2 < branchLength2; branch2++)	{
						//var newPnt = vec.add(randDir.getX()*branc1h, y+(branch/2), randDir.getZ()*branch1);
						var newPnt2 = newPnt.add(sideDir2.getX()*(branch2/2), 0, sideDir2.getZ()*(branch2/2));
						setBlock(newPnt2, woodBlock);
						
					}
					//CreateSpike(newPnt, newPnt2, trees['spike'].woodBlock, session, 2);
					
					setBlock(newPnt2.add(0,1,0), woodBlock);
					if (checkFlag("c", 3))
						CreateLeafClump(trees['spike'].leafSize/2-1, newPnt2.add(0,2*invert,0), leafBlock, session);
					else	
						CreateLeafSphere(trees['spike'].leafSize, 2*invert, .9, 0, newPnt2.add(0,2*invert,0), leafBlock, session);
				}
			}
			
			CreateSpike(vec.add(0,y,0), newPnt, woodBlock, session, 3);
			if (checkFlag("c", 3))
				CreateLeafClump(trees['spike'].leafSize/2-1, newPnt.add(0,2*invert,0), leafBlock, session);
			else
				CreateLeafSphere(trees['spike'].leafSize, 3*invert, .9, 0, newPnt.add(0,2*invert,0), leafBlock, session);
				
		}
		
	}
	CreateSpike(vec, vec.add(0,size,0), trees['spike'].woodBlock, session, size/10);
	
	if (checkFlag("c", 3))
		CreateLeafClump(6, vec.add(0,y*invert,0), leafBlock, session);
	else	
		CreateLeafSphere(8, 4*invert, .8, 0, vec.add(0,y*invert,0), leafBlock, session);

}

function CreateMushroom(vec, session, size, woodBlock, leafBlock)	{

	leafBlock = (gMat == airMat) ? new BlockPattern(leafBlock) : gMat;

	var randDir = getRandomXZVec();
	var sideDir = getRandomXZSide(randDir);
	//var slopeMod = .3;
	
	for (var y = 0; y < size *.6; y++)		{
		
		var slopeMod = 1-(y/(size*1.1));
		var setVec = vec.add(randDir.getX()*y*slopeMod, (y+1)*invert, randDir.getZ()*y*slopeMod);
		var setVec = setVec.add(sideDir.getX()*y*slopeMod, 0, sideDir.getZ()*y*slopeMod);
		
		CreateLeafSphere(size/3, 2 , .98, 0, setVec, woodBlock, session)
	}
	var slopeMod = 0;
	
	for (var y = 0; y < size * .4; y++)		{
		
		//var slopeMod = 1-(y/size);
		var newVec = setVec.add(randDir.getX()*y*slopeMod/2, (y+1)*invert, randDir.getZ()*y*slopeMod/2);
		var newVec = newVec.add(sideDir.getX()*y*slopeMod/2, 0, sideDir.getZ()*y*slopeMod/2);
		//var newVec = setVec.add(0, (y+1)*invert, 0);
		CreateLeafSphere(size/3, 2 , .98, 0, newVec, woodBlock, session)
	}
	
	CreateLeafSphere(size, (size/2)*invert, 1, (size/8), newVec.add(0,-(size/2-size/8)*invert+1,0), leafBlock, session)
}

//////////////////////////////////////////////////////////
//				Player Tool Commands
//////////////////////////////////////////////////////////

function BuildTest(vec, session)	{

	var timeOut = context.getConfiguration().scriptTimeout;
	player.print(text.White + "Script timeout is currently set to " + text.Gold + timeOut + " (" + (timeOut/1000) + "s).");
	if (timeOut < 10000	)
		player.print(text.White + "This is a little low, I suggest increasing to at least" + text.Gold + " 10000 (10s).");

	return;
		
}

function HelpText(cmdType)  {
	
	if (cmdType != 1)	{
		var helpArg = argv.length > 2 ? argv[2] : -1;
		var helpMode = parseMode(helpArg)
	}
	else{
		var helpArg = argv.length > 1 ? argv[1] : 1;
		var helpMode = parseMode(helpArg)
	}	
	
	if (helpMode != -1)	{
		
		var keyStr = [];	
		var argStr = [];
		
		for (var keyInc in tools[helpMode].keys)	{
			keyStr = keyStr + text.Red + tools[helpMode].keys[keyInc] + text.White + "|";
		}
		for (var argInc in tools[helpMode].args)	{
			argStr = argStr + (text.White + "<");
			if (String(tools[helpMode].aFlags[argInc]).length > 0)	{
				argStr = argStr + (text.Red + tools[helpMode].aFlags[argInc] + text.Gold + text.Arrow);
			}
			argStr = argStr + (text.Red + tools[helpMode].args[argInc] + text.White + ">");
		}

		player.print("\n" + text.Gold + tools[helpMode].name + " " + text.Gold + argStr);
		player.print(text.White + text.Italics + tools[helpMode].note);
		player.print(text.White + "Keywords  |" + text.Red + keyStr );
	}
	else	{

		player.print("\n" + text.Gold + text.Italics + "Build Commands " + text.Red + "v" + version + text.White + " by inHaze \n \n");
		player.print(text.White + "Type " + text.Red + "/cs build list"  + text.White + " or " + text.Red + "/cs build commands" + text.White + " for command usage.");
		player.print(text.White + "Type " + text.Red + "/cs build ? " + text.Gold + "command" + text.White + " for detailed info on any command.");
	}
	
}

function CommandList()	{
	
	var endStr =  [];
	var strList =  [];
	
	for (inc in tools)	{
		var argStr = [];
		var comStr = [];
		for (var argInc in tools[inc].args)	{
			argStr = argStr + (text.White + "<");
			if (String(tools[inc].aFlags[argInc]).length > 0)	{
				argStr = argStr + (text.Red + tools[inc].aFlags[argInc] + text.Gold + text.Arrow);
			}
			argStr = argStr + (text.Red + tools[inc].args[argInc] + text.White + ">");
		}
	
		 comStr = comStr + (text.Gold + tools[inc].keys[0] + " \u00A7c" + argStr + "\n");
		 comStr = comStr + (text.White + text.Italics + tools[inc].note);
		 strList.push (comStr);
	}
	strList.sort();
	for (inc in strList)	{
		endStr = (endStr + strList[inc] + "\n");
	}
	player.print("\n" + text.White + "Command List - Type " + text.Red + "/cs build ? " + text.Gold + "command" + text.White + " for detailed info. \n \n");
	player.print(endStr);
	//saveFile("CommandList", endStr);
	
}

function CommandListShort()	{
	
	var names = [];
	var listStr = text.White + "[";
	
	for (inc in tools)	{
		names.push (String(tools[inc].keys[0]))
	}
	names.sort();
	for (inc in names)	{
		listStr = listStr + (text.Gold + names[inc] + text.White + " | ");
	}
	
	listStr = listStr + "]";
	player.print("\n" + text.White + "Short Command List - Use " + text.Red + "/cs build commands" + text.White + " for a full listing \n \n");
	player.print(listStr);
}

function ClearNature(vec, session)	{

	//var clearType = checkFlag("s") ? parseInt(checkFlag("s")) : 20;
	var size = checkFlag("s") ? parseInt(checkFlag("s")) : 20;
	size = gSize != -1 ? gSize + (gSize * Math.random()*.2) : size;
	
	var blackList = [6,17,18,31,32,37,38,39,40,59,78,81,83,86,99,100,103,104,105,106,111,115,127,141,142,161,162,175];
	
	var cycleSphere = function(x, y, z, d) {
		var pos = new Vector(x,y,z);
		if (blackList.indexOf(getBlock(pos).id) == -1)	return;
		setBlock(pos, new BaseBlock(0));	
	};
	
	var cycler = new ShapeCycler(cycleSphere, size);
	var setTotal = cycler.run(vec);

}

function BuildTree(vec, session)	{
	
	var treeType = argv.length > 2 ? String(argv[2]).toLowerCase() : "";

	typeCheck = -1;
	for (inc in trees)	{
		if (treeType == String(inc).toLowerCase())
			typeCheck = 1;
	}
	if (typeCheck == -1)	{
		var tmpStr = text.White + "[ ";
		for (inc in trees)	{tmpStr = tmpStr + text.Gold + String(inc).toLowerCase() + text.White + " | ";}
		
		player.print("\n" + text.Red + "Error: " + text.White + "Tree type " + text.Gold + treeType + text.White + " not found.");
		player.print(text.White + text.Italics + "Available tree types: \n" + tmpStr + "]");
		return;
	}
	
	var size = checkFlag("s", 3) ? parseInt(checkFlag("s", 3))* (1+Math.random()*.2) : (Math.random() * (trees[treeType].maxChg)) + trees[treeType].minSize;
	var woodBlock = checkFlag("w", 3) ? parseBlock(checkFlag("w", 3)) : trees[treeType].woodBlock;
	var leafBlock = checkFlag("l", 3) ? parseBlock(checkFlag("l", 3)) : trees[treeType].leafBlock;
	size = gSize != -1 ? gSize + (gSize * (1+Math.random()*.2)) : size;
	
	trees[treeType].mySub(vec, session, size, woodBlock, leafBlock);
	
}

function BuildShape(vec, session)	{

	if(myShape.length != 0)	{
		var mat = (gMat == airMat) ? airMat : gMat;
		var excludeID = checkFlag("!") ? parseBlock(checkFlag("!")).getType() : -1;
		
		var angle = checkFlag("<") ? parseFloat(checkFlag("<")) : getDirection().rightAngle;
		angle = checkFlag("<") == 360 ? getDirection().yaw : angle;
		
		CreateShape(myShape['TMP'], vec, angle, mat, excludeID, session);
	}
	else	{
		loadShape(vec, session);
	}

}

function BuildShapeKit(vec, session){

	if (myKit.length != 0)	{
		for (var inc in myKit)	{
			
			if (player.getItemInHand() == myKit[inc].item)	{
				var mat = ((gMat == airMat)) ? airMat : gMat;
				var excludeID = checkFlag("!") ? parseBlock(checkFlag("!")).getType() : -1;
				
				var angle = checkFlag("<") ? parseFloat(checkFlag("<")) : getDirection().rightAngle;
				angle = checkFlag("<") == 360 ? getDirection().yaw : angle;
				
				CreateShape(myShape[inc], vec, angle, mat, excludeID, session);
			}
		}
	}
	else	{
	
		var tmpKit = new Array();
		var tool = new Array();
		var fileName = String(argv[2]);

		var aStr = fileName.slice((fileName.length)-4).toLowerCase();
		if (aStr == ".kit")	{fileName = String(argv[2]).slice(0, String(argv[2]).length-4).toLowerCase()};

		var file = context.getSafeFile("shapes", String(fileName + '.kit'));
		if(!file.exists()){
			player.print(text.Red + "Error! " + text.Gold + "Could not find kit file: " + text.White + text.Italics + file);
			return false;
		}
		
		player.print(text.White + text.Italics + "Loading shapes from kit file: " + text.Gold + fileName + ".kit"); 
		var kitStr = loadFile(fileName, 3);
		tmpKit = parseKitFile(kitStr);

		for (inc in tmpKit)	{		//this is where the brushes get set to the loaded shapeKit list
			context.getSession().setTool(tmpKit[inc].item, null)
			tool[inc] = context.getSession().getBrushTool(tmpKit[inc].item);
			tool[inc].setFill(airMat);
			tool[inc].setBrush(brush, "worldedit.brush.buildShapeKit");
		}
	
		myKit = tmpKit;
		loadShapeKit(vec, session, tmpKit);

	}

}

function BuildGrassPatch(vec, session)	{

	var size = checkFlag("s") ? parseInt(checkFlag("s")) : 15;
	var density = checkFlag("d") ? parseFloat(checkFlag("d")) : .25;
	size = gSize != -1 ? gSize + (gSize * Math.random()*.2) : size;
	
	var blackList = [0,6,31,32,37,38,39,40,81,106];
	var whiteList = [2,3,88];
	
	//var arg = this.args;
	//var vec = this.vec;
	var blackList = [0,6,31,32,37,38,39,40,81,106];
	var whiteList = [2,3,88];
	
	var plantList = new WeightedList();

	plantList.add(new BaseBlock(31, 1), 100);//grass
	plantList.add(new BaseBlock(31, 2), 100);//fern
	plantList.add(new BaseBlock(37, 0), 2);	//dandelion
	plantList.add(new BaseBlock(38, 0), 2);	//poppy
	plantList.add(new BaseBlock(38, 1), 2);	//blue orchid
	plantList.add(new BaseBlock(38, 2), 2);	//allium
	plantList.add(new BaseBlock(38, 3), 2);	//azure bluet
	plantList.add(new BaseBlock(38, 4), 2);	//red tulip
	plantList.add(new BaseBlock(38, 5), 2);	//orange tulip
	plantList.add(new BaseBlock(38, 6), 2);	//white tulip
	plantList.add(new BaseBlock(38, 7), 2);	//pink tulip
	plantList.add(new BaseBlock(38, 8), 2);	//oxeye daisy
	
	plantList.add(new BaseBlock(175, 0), 1);	//sunflower
	plantList.add(new BaseBlock(175, 1), 1);	//lilac
	plantList.add(new BaseBlock(175, 2), 1);	//double tallgrass
	plantList.add(new BaseBlock(175, 3), 1);	//large fern
	plantList.add(new BaseBlock(175, 4), 1);	//rose bush
	plantList.add(new BaseBlock(175, 5), 1);	//peony
	
	plantList.add(new BaseBlock(86, 0), .2);	//pumpkin
	plantList.add(new BaseBlock(103, 0), .2);//melom
	plantList.ready();
	
	var cycleSphere = function(x, y, z, d) {
		
		if (blackList.indexOf(getBlockRaw(x, y, z).id) == -1) return;
		if (blackList.indexOf(getBlockRaw(x, y+1, z).id) == -1) return;
		if (whiteList.indexOf(getBlockRaw(x, y-1, z).id) == -1) return;
		if ((density) > Math.random()) {
			var rngBlock = plantList.next(); 
			setBlockRaw(x, y, z, rngBlock.id, rngBlock.data);
			if (rngBlock.id == 175) {
				setBlockRaw(x, y +1, z, rngBlock.id, 8);
			}
		}					
	};				
	
	var cycler = new ShapeCycler(cycleSphere, size, size/2, size);
	var setTotal = cycler.run(vec);
	

	return;
	
	var cycleSphere = function(x, y, z, d) {
		var pos = new Vector(x,y,z);

		if (blackList.indexOf(getBlock(pos).id) == -1) return;
		if (blackList.indexOf(getBlock(pos.add(0,1,0)).id) == -1) return;
		if (whiteList.indexOf(getBlock(pos.add(0,-1,0)).id) == -1) return;
		if (density > Math.random())	{
			setBlock(pos, getListBlock(blocks["plants"].list));
		}		
		
	};
	
	var cycler = new ShapeCycler(cycleSphere, size);
	var setTotal = cycler.run(vec);	
	
	return;
}

function BuildStickPatch(vec, session)	{

	var size = checkFlag("s") ? parseInt(checkFlag("s")) : 15;
	var density = checkFlag("d") ? parseFloat(checkFlag("d")) : .25;
	var block = checkFlag("b") ? parseBlock(checkFlag("b")) :  trees['stick'].woodBlock;
	size = gSize != -1 ? gSize + (gSize * Math.random()*.2) : size;
	var mat = (gMat == airMat) ? new BlockPattern(block) : gMat;
		
	if (checkFlag("l"))	{
		var minSize = parseBlockExtra(checkFlag("l")).block.getType();
		var maxChg = parseBlockExtra(checkFlag("l")).extra;
	}
	else	{
		var minSize = trees['stick'].minSize;
		var maxChg = trees['stick'].maxChg;
	}
	
	var blackList = [0,6,31,32,37,38,39,40,81,106];		//don't attach to these blocks
	//var whiteList = [2,3,88];
	
	for (var x = 0; x <= size; x++) {
		for (var z = 0; z <= size; z++) {
			for (var y = size; y >= 0; y--) {					
				pos = vec.add(x - size/2 + .5, y - size/2 + .5, z - size/2 + .5);
				distance = getDistance(vec, pos);

				if (distance > size/2)	{continue;}
				if (blackList.indexOf(session.getBlock(pos).getType()) == -1)	{continue;}
				if (blackList.indexOf(session.getBlock(pos.add(0,1*invert,0)).getType()) == -1)	{continue;}
				if (blackList.indexOf(session.getBlock(pos.add(0,-1*invert,0)).getType()) != -1)	{continue;}		
				
				if (density > Math.random())	{
					var height = (Math.random() * maxChg) + minSize;
					
					for (var inc = 0; inc < height; inc++)	{
						setBlock(pos.add(0,inc*invert,0), mat);
					}

				}
			}
		}
	}
}

function BuildOverlayPatch(vec, session){

	var block = [];
	var depth = [];
	var size = checkFlag("s") ? parseInt(checkFlag("s")) : 15;
	size = gSize != -1 ? gSize : size;
	
	
	if (checkFlag("t"))	{
		block[0] = parseBlockExtra(checkFlag("t")).block; 
		depth[0] = parseBlockExtra(checkFlag("t")).extra;
	}
	else	{
		block[0] = new BaseBlock(2, 0);
		depth[0] = 0;
	}
	
	if (checkFlag("m"))	{
		block[1] = parseBlockExtra(checkFlag("m")).block;
		depth[1] = parseBlockExtra(checkFlag("m")).extra;
	}
	else	{
		block[1] = new BaseBlock(3, 0);
		depth[1] = 0;
	}
	
	if (checkFlag("e"))	{
		block[2] = parseBlockExtra(checkFlag("e")).block;
		depth[2] = parseBlockExtra(checkFlag("e")).extra;
	}
	else	{
		block[2] = new BaseBlock(1, 0);
		depth[2] = 0;
	}
	
	block[0] = (gMat == airMat) ? new BlockPattern(block[0]) : gMat;
	
	if (depth[0] < 1)	{
		depth[0] = 1;
		depth[1] = 2;
		depth[2] = 3;
	}
	
	var whiteList = [0,6,17,18,31,32,37,38,39,40,78,81,83,86,106];				//The blocks allowed to be over the natural block
	var greenList = [1,2,3,12,13,14,15,16,21,24,56,73,82,87,88,110,121,129];	//List of natural blocks that should be changed
	
	var cycleSphere = function(x, y, z, d) {
		var pos = new Vector(x,y,z);
		
		if(!checkFlag("a"))	{
			if (greenList.indexOf(getBlock(pos).id) == -1) return;
			if (whiteList.indexOf(getBlock(pos.add(0,1*invert,0)).id) == -1) return;
		}
		else	{
			if (getBlock(pos).id == 0) return;
			if (getBlock(pos.add(0,1*invert,0)).id != 0) return;
		}
		
		var totalDepth = depth[0] + depth[1] + depth[2];
		for (var inc = 0; inc < totalDepth; inc++)	{
			if (!checkFlag("a"))
				if (greenList.indexOf(getBlock(pos.add(0,(0-inc)*invert,0)).id) == -1)	{break;}
			if (inc < depth[0])	{
				if ((block[0].apply(new Vector(0,0,0)).id == 0) && (block[0].apply(new Vector(0,0,0)).data != 0))	{continue;}		//If air is used, and has a non zero data value skip it
				setBlock(pos.add(0,(0-inc)*invert,0), block[0]);
			}
			else if (inc >= depth[0] && inc < (depth[0] + depth[1])) 	{
				if ((block[1].getType() == 0) && (block[1].getData() != 0))	{continue;}
				setBlock(pos.add(0,(0-inc)*invert,0), block[1]);
			}
			else {
				if ((block[2].getType() == 0) && (block[2].getData() != 0))	{continue;}
				setBlock(pos.add(0,(0-inc)*invert,0), block[2]);
			}
		}
	};
	
	var cycler = new ShapeCycler(cycleSphere, size);
	var setTotal = cycler.run(vec);

	return;
}

function BuildFlat(vec, session)	{

	var size = checkFlag("s") ? parseInt(checkFlag("s")) : 15;
	var block = checkFlag("b") ? parseBlock(checkFlag("b")) : new BaseBlock(2, 0);
	var depth = checkFlag("d") ? parseFloat(checkFlag("d")) : 62;
	var mat = (gMat == airMat) ? new BlockPattern(block) : gMat;
	size = gSize != -1 ? gSize : size;

	
	var fillList = [0,8,9,10,11];	//fill these blocks if they are in the path

	for (var x = 0; x <= size; x++) {
		for (var y = 0; y <= size; y++)	{
			for (var z = 0; z <= size; z++) {
							
				pos = vec.add(x - size/2 + .5, parseInt(y - size/2 + .5), z - size/2 + .5);
				distance = getDistance(vec, pos);
				totalDepth = pos.getY() - depth;
				
				if (distance > size/2)	{continue;}
				if ((session.getBlock(pos).getType() == 0) && (totalDepth != 0))	{continue;}
				
				if (totalDepth > 0)	{			//Clearing Down
					for (var inc = 0; inc <= totalDepth; inc++)	{

						if (mat.apply(new Vector(0,0,0)).getType() == 0)	{totalDepth-10;}
						if (inc == totalDepth)	{
							if (mat.apply(new Vector(0,0,0)).getType() == 0)	{continue;}		//Skip if air is used
							setBlock(pos.add(0,(0-inc),0), mat);
						}
						else	{
							setBlock(pos.add(0,(0-inc),0), new BaseBlock(0));
						}
					}
				}
				else if (totalDepth < 0)	{		//Filling Up
					for (var inc = 0; inc >= totalDepth; inc--)	{
						if (session.getBlock(pos.add(0,(0-inc),0)).getType() == 0)	{
							setBlock(pos.add(0,(0-inc),0), mat);
						}

					}
				}
				
				
				else if (totalDepth == 0)	{
					setBlock(pos, mat)
					for (inc = 1; inc < 256; inc++)	{
						if (fillList.indexOf(session.getBlock(pos.add(0,(0-inc),0)).getType()) == -1)	{break;}
						setBlock(pos.add(0,(0-inc),0), mat);
						
					}
				}
			}
		}
	}
}

function BuildSpike(vec, session)	{

	var size = checkFlag("s") ? parseInt(checkFlag("s")) : 8;
	var block = checkFlag("b") ? parseBlock(checkFlag("b")) : new BaseBlock(1, 0);
	var mat = (gMat == airMat) ? new BlockPattern(block) : gMat;
	size = gSize != -1 ? gSize : size;
	
	if (checkFlag("l"))	{
		var minSize = parseBlockExtra(checkFlag("l")).block.getType();
		var maxChg = parseBlockExtra(checkFlag("l")).extra;
	}
	else	{
		var minSize = 50;
		var maxChg = 15;
	}

	var length = (Math.random() * maxChg) + minSize;
	var end = getDistanceVec(vec, player.getBlockIn(), length);

	CreateSpike(vec, end, mat, session, size);
	
}

function BuildVines(vec, session)	{

	var size = checkFlag("s") ? parseInt(checkFlag("s")) : 11;
	var density = checkFlag("d") ? parseFloat(checkFlag("d")) : .25;
	var block = checkFlag("b") ? parseBlock(checkFlag("b")) :  new BaseBlock(BlockID.VINE, 0);
	var length = checkFlag("l") ? parseInt(checkFlag("l")) : 12;
	var mat = (gMat == airMat) ? new BlockPattern(block) : gMat;
	size = gSize != -1 ? gSize : size;
	
	var rand = new java.util.Random();

	var blackList = [0,6,8,9,31,32,37,38,39,40,78,81,83,86,106];		//Do not place vines on these blocks

	var cycleSphere = function(x, y, z, d) {
		var pos = new Vector(x,y,z);
		var curBlock = getBlock(pos);

		if (Math.random() > density) return;
		if (curBlock.id != 0) return;
		
		var vines = new Array();
		vines[1] = new BaseBlock(BlockID.VINE, 8);  
		vines[2] = new BaseBlock(BlockID.VINE, 2);  
		vines[3] = new BaseBlock(BlockID.VINE, 1);  
		vines[4] = new BaseBlock(BlockID.VINE, 4); 

		var blockFaces = new Array();
		blockFaces[1] = getBlock(pos.add(1,0,0)).id;
		blockFaces[2] = getBlock(pos.add(-1,0,0)).id;
		blockFaces[3] = getBlock(pos.add(0,0,1)).id;
		blockFaces[4] = getBlock(pos.add(0,0,-1)).id;

		var solidSide = new Array();
		for (var inc = 1; inc <= 4; inc++) {
			if ((blackList.indexOf(blockFaces[inc]) != -1) || (blockFaces[inc] == mat.apply(new Vector(0,0,0)).id)) continue;
			if (blockFaces[inc] != 0) {
				solidSide.push(inc)
			}												
		}
		if ((solidSide.length >= 1)){
			randomSide = solidSide[(rand.nextInt(solidSide.length))];
			randomLength = rand.nextInt(length);
			var newVine = vines[randomSide];
			for (var extendVine = 0; extendVine <= randomLength; extendVine++) {
				if (getBlock(pos.add(0,-(extendVine),0)).id == 0) {
					if (mat.apply(new Vector(0,0,0)).id == BlockID.VINE) {
						setBlock(pos.add(0,-(extendVine),0), newVine);
					}
					else {
						setBlock(pos.add(0,-(extendVine),0), mat);
					}
					continue;
				}
				break;
			}
		}

	};
	
	var cycler = new ShapeCycler(cycleSphere, size);
	var setTotal = cycler.run(vec);	
	
	return;	
}

function BuildLine(vec, session)	{

	var lineMode = checkFlag("m") ? parseInt(checkFlag("m")) : 1;
	var size = checkFlag("s") ? parseInt(checkFlag("s")) : 1;
	var block = checkFlag("b") ? parseBlock(checkFlag("b")) :  new BaseBlock(1);
	var extendCnt = checkFlag("e") ? parseInt(checkFlag("e")) :  0;
	var mat = (gMat == airMat) ? new BlockPattern(block) : gMat;
	size = gSize != -1 ? gSize : size;	
	
	var baseVec = zVec;

	if (stage == 0) {
		player.print(text.White + text.Italics + "Origin set!");
		gVec = vec;
		stage++;
		return;
	}
	
	switch(lineMode)	{	//lineMode - 0 = Single Line; 1 = Continous; 2 = Fixed Origin.

	case 0:
		
		if (stage == 1) {
			baseVec = gVec;
			stage++;
		}
		else	{
			gVec = vec;
			player.print(text.White + text.Italics + "Origin set!");
			stage--;
		}
		break;
	case 1:
		baseVec = gVec;
		gVec = vec;
		break;
	case 2:
		baseVec = gVec;
		break;					
	}

	if((lineMode == 1) || (lineMode == 2) || (stage == 2))	{
	
		var distance = getDistance(baseVec, vec);
		var step = .9/distance;
		var extendBase = (extendCnt * step);
		
		for(var i = 0; i <= (1 + extendBase); i += step) {
				
			var xi = vec.getX() + ((baseVec.getX() - vec.getX()) * i);
			var yi = vec.getY() + ((baseVec.getY() - vec.getY()) * i);
			var zi = vec.getZ() + ((baseVec.getZ() - vec.getZ()) * i);
			var pos = new Vector(xi, yi, zi);

			if (size == 0)	{
				setBlock(pos, mat );
			}
			else	{
				CreateSphere(size, 1, pos, mat, session);
			}
		}
	}
	
}

function BuildPlatform(vec, session){
	
	var size = checkFlag("s") ? parseInt(checkFlag("s")) : 3;
	var block = checkFlag("b") ? parseBlock(checkFlag("b")) :  new BaseBlock(20);
	var mat = (gMat == airMat) ? new BlockPattern(block) : gMat;
	size = gSize != -1 ? gSize : size;	
	
	vec = player.getBlockIn();
	vec = vec.add(0,-1,0);
	
	for (var x = 0; x <= size; x++) {
		for (var z = 0; z <= size; z++) {
			
			pos = vec.add(x - size/2 + .5, 0, z - size/2 + .5);
			distance = getDistance(vec, pos);
			
			if (distance > size/2)	{continue;}
			setBlock(pos, mat);
		}
	}
}

function BuildBiome(vec, session)	{
	
	
	player.print(text.Red + "Error: " + text.White + "This brush is currently not working in this version.");	
	return;
	
	if (argv.length < 3) 	{
		player.print (text.Red + "Error:" + text.White + " You need to specify a biome type to use.");
		return false;
	}
	
	var we = getWorldEdit();
	if (we == false)	{return false;}
	
	var biome = String(argv[2]).toUpperCase();
	var size = checkFlag("#") ? parseInt(checkFlag("#")) : 7;
	size = gSize != -1 ? gSize : size;

	var biomeRegistry = player.getWorld().getWorldData().getBiomeRegistry();
	var biomes = biomeRegistry.getBiomes();
	
	try{
		target = Biomes.findBiomeByName(biome);
	}
	catch (e)	{
		$err.handle(e);
		player.print("\n" + text.Red + "Error: " + text.White + "Biome type " + text.Red + biome.toLowerCase() + text.White + " not found.");
		player.print(text.Gold + text.Italics + "Available Biome Types: \n" + text.White + biomeList);
		return false;
	}
	
	if (vecList.length < 1)	{
		player.print(text.Gold + biome + text.White + " biome found.");
		return;
	}
		
	for (var x = 0; x <= size; x++) {
		for (var z = 0; z <= size; z++) {
			
			pos = vec.add(x - size/2 + .5, 0, z - size/2 + .5);
			distance = getDistance(vec, pos);
			
			if (distance > size/2)	{continue;}
			
			player.getWorld().setBiome(Vector2D(pos.getX(),pos.getZ()), target);
			var yMax = session.getHighestTerrainBlock(pos.getX(),pos.getZ(), 0, 256, false);
		}
	}
	session.simulateSnow(vec, size/2);
}

function BuildMirror(vec, session)	{
	
	var world = context.getSession().getSelectionWorld();
	var region = context.getSession().getWorldSelection(world);
	
	var pos = region.getMinimumPoint();
	var width = region.getWidth();
	var length = region.getLength();
	var height = region.getHeight();
	var vec2 =  player.getBlockIn();
	var dirInfo = getDirection();	

	if ((dirInfo.rightAngle == 0) || (dirInfo.rightAngle == 180))	{
		var offDir = pos.getX()-vec.getX();

		for (x = 0; x < width; x++)		{
			for (y = 0; y < height; y++)		{
				for (z = 0; z < length; z++)		{

					var tmpVec = pos.add(x, y, z);
					var offLen = (offDir + x);
					var newVec = tmpVec.add(-(offLen*2),0,0);
					var tmpBlock = session.getBlock(tmpVec);
					tmpBlock.flip(CuboidClipboard.FlipDirection.NORTH_SOUTH);
					
					if (checkFlag("d"))	{
						setBlock(tmpVec, airMat);
					}	
					setBlock(newVec, tmpBlock);
					
					if (checkFlag("s"))	{
						if((x == 0) && (y == 0) && (z == 0))	{
							var selector = context.getSession().getRegionSelector(player.getWorld());
							if (selector.selectPrimary(newVec)) {
								context.getSession().dispatchCUISelection(player);
							}
						}
						if((x == (width-1)) && (y == (height-1)) && (z == (length-1)))	{
							var selector = context.getSession().getRegionSelector(player.getWorld());
							if (selector.selectSecondary(newVec)) {
								context.getSession().dispatchCUISelection(player);
							}
						}
					}
				}
			}
		}
	}
	
	if ((dirInfo.rightAngle == 90) || (dirInfo.rightAngle == 270))	{
		var offDir = pos.getZ()-vec.getZ();

		for (x = 0; x < width; x++)		{
			for (y = 0; y < height; y++)		{
				for (z = 0; z < length; z++)		{
	
					var tmpVec = pos.add(x, y, z);
					var offLen = (offDir + z);
					var newVec = tmpVec.add(0,0,-(offLen*2));
					var tmpBlock = session.getBlock(tmpVec);
					
					tmpBlock.flip(CuboidClipboard.FlipDirection.WEST_EAST);
					
					if (checkFlag("d"))	{
						setBlock(tmpVec, airMat);
					}
					setBlock(newVec, tmpBlock);
	
					if (checkFlag("s"))	{
						if((x == 0) && (y == 0) & (z == 0))	{
							var selector = context.getSession().getRegionSelector(player.getWorld());
							if (selector.selectPrimary(newVec)) {
								context.getSession().dispatchCUISelection(player);
							}
						}
						if((x == (width-1)) && (y == (height-1)) && (z == (length-1)))	{
							var selector = context.getSession().getRegionSelector(player.getWorld());
							if (selector.selectSecondary(newVec)) {
								context.getSession().dispatchCUISelection(player);
							}
						}
					}
				}
			}
		}
	}
	

}

function BuildLaser(vec, session)	{

	var size = checkFlag("s") ? parseInt(checkFlag("s")) : 1;
	var depth = checkFlag("d") ? parseInt(checkFlag("d")) :  0;
	var blockA = checkFlag("a") ? parseBlock(checkFlag("a")) :  new BaseBlock(1);
	var matB = checkFlag("b") ? parseBlock(checkFlag("b")) :  new BaseBlock(1);
	var matA = (gMat == airMat) ? new BlockPattern(blockA) : gMat;
	size = gSize != -1 ? gSize : size;

	var origin = player.getBlockIn().add(0,1,0);
	var distance = getDistance(origin, vec);
	var step = .9/distance;
	var extendBeam = 1 + (depth*step);
	
	for( var i = 0; i <= extendBeam; i += step) {
		
		if (i < ((size*step) + step*2)) {continue;}
		
		var xi = origin.getX() + ((vec.getX() - origin.getX()) * i);
		var yi = origin.getY() + ((vec.getY() - origin.getY()) * i);
		var zi = origin.getZ() + ((vec.getZ() - origin.getZ()) * i);
		var pos = new Vector(xi, yi, zi);
		
		if (i <= 1)	{
			if (size == 1)	{
				setBlock(pos, matA);
			}
			else	{
				CreateSphere(size, 1, pos, matA, session);
			}		
		}
		else if (i > 1)	{
			if (size == 1)	{
				setBlock(pos, matB);
			}
			else	{
				CreateSphere(size, 1, pos, matB, session);
			}
		}

	}
}
	
function BuildRevolve(vec, session)	{

	var pointOver = checkFlag("c") ? parseInt(checkFlag("c")) : 0;
	var bTypeB = checkFlag("b") ? parseBlock(checkFlag("b")) :  new BaseBlock(0);

	var world = context.getSession().getSelectionWorld();
	var region = context.getSession().getWorldSelection(world);

	var regionMin = new Vector(region.getMinimumPoint().getX(), region.getMinimumPoint().getY(), region.getMinimumPoint().getZ());
	var bTypeA = new BaseBlock(0);

	var pointRes = 16;

	for (var x = 0; x < region.getWidth(); x++ ) {
		for (var y = 0; y < region.getHeight(); y++ ) {
			for (var z = 0; z < region.getLength(); z++) {
				
				var pos = regionMin.add(x, y, z);
				var id = session.getBlock(pos);
				var bCheck = 0;	
				if (bTypeB.getType() != 0) {bCheck = id.getType() != bTypeB.getType() ? 1 : 0};		
																									
				if (((id.getType()) != (bTypeA.getType())) && (bCheck == 0))  		
				{			
					var radZ = Math.abs(vec.getZ()-pos.getZ());	
					var radX = Math.abs(vec.getX()-pos.getX());
					var radius = radX > radZ ? radX : radZ;	
					
					var points = pointOver != 0 ? pointOver : (pointRes * radius);
					var slice = 2 * Math.PI / points;
					
					for (var i = 0; i < (points); i++)
					{
						var angle = (slice * i);
						var newX = (radius * Math.cos(angle));
						var newY = (radius * Math.sin(angle));
						var newZ = (pos.getY() - vec.getY());
						var pt = vec.add(newX, newZ, newY);	

						setBlock(pt, id);
					}
				}			
			}
		}
	}
}

function BuildRotate(vec, session)	{
	
	var angleArg = checkFlag("i") ? parseInt(checkFlag("i")) : 8;
	var resolution = checkFlag("r") ? parseInt(checkFlag("r")) : 4;
	var singleMode = checkFlag("s") ? true : false;

	var world = context.getSession().getSelectionWorld();
	var region = context.getSession().getWorldSelection(world);

	angleArg = angleArg == 0 ? 8 : angleArg;
	angleStep = angleArg < 0 ? Math.abs(angleArg) : (360/angleArg);

	var step = 1 / resolution;
	
	for (var x = 0; x < region.getWidth(); x += step) {
		for (var z = 0; z < region.getLength(); z += step) {
			for (var y = 0; y < region.getHeight(); y += 1) {
				
				var tmpVec = region.getMinimumPoint().add(x, y, z);
				
				var block = session.getBlock(tmpVec);
				if (block.getType() == BlockID.AIR)	{continue;}
				
				var angle = angleStep;				
				while (angle < 360)	{
					
					var newVec = Vector(rotateVec(vec, tmpVec, angle));
					var oldVec = Vector(rotateVec(vec, newVec, -angle));
					
					if (session.getBlock(oldVec).getType() == block.getType() && session.getBlock(newVec).getType() != block.getType())	{

						setBlock(newVec, block);
					}
					
					if (singleMode) {angle = 360;}
					angle += angleStep;
				}	
			}
		}
	}
}

function BuildErode(vec, session)	{

	var size = checkFlag("s") ? parseInt(checkFlag("s")) : 7;
	var maxFaces = checkFlag("f") ? parseInt(checkFlag("f")) :  4;
	var strength = checkFlag("i") ? parseInt(checkFlag("i")) :  1;
	size = gSize != -1 ? gSize : size;	
	//maxFaces = (gMat == airMat) ? maxFaces : gMat.next(zVec).getType();
	
	if (size == 0)	{size = 5;}
	var blocks = [];

	var blocks = new Array();
	var blackList = [0,8,9,10,11];
	
	for (iteration = 1; iteration <= strength; iteration++) {

		var blockTotal = 0;
		var blockCnt = 0;
		var blockFaces = new Array(6);

		var cycleSphere = function(x, y, z, d) {
			
			var curBlockId =  getBlock(new Vector(x,y,z)).id;

			if (blackList.indexOf(curBlockId) != -1) return;

			var blockCnt = 0;
			var blockFaces = [];	//check around the six sides of the current loop block position
			blockFaces[0] = getBlock(new Vector(x+1,y,z)).id;
			blockFaces[1] = getBlock(new Vector(x-1,y,z)).id;
			blockFaces[2] = getBlock(new Vector(x,y,z+1)).id;
			blockFaces[3] = getBlock(new Vector(x,y,z-1)).id;
			blockFaces[4] = getBlock(new Vector(x,y+1,z)).id;
			blockFaces[5] = getBlock(new Vector(x,y-1,z)).id;

			sideBlock = 0;		//Search our blockFaces list for water or lava
			for (var inc in blockFaces) {
				if (blackList.indexOf(blockFaces[inc]) != -1) {

					blockCnt++;
					if (inc < 4) {		//If water/lava is found in one of the side positions then make the new block the same
						if(blockFaces[inc] == 8 || blockFaces[inc] == 9) {
							sideBlock = 9;
						}
						else if(blockFaces[inc] == 10 || blockFaces[inc] == 11) {
							sideBlock = 11;
						}
					}
				}
			}

			if (blockCnt >= maxFaces) {
				blocks.push(x, y, z);
				if (sideBlock > 0)  blocks.push(sideBlock);
				else blocks.push(0);
			}

		};				
		
		var cycler = new ShapeCycler(cycleSphere, size);
		var setTotal = cycler.run(vec);
		
		for (var inc = 0; inc < blocks.length; inc+=4) {
			setBlock(new Vector(blocks[inc], blocks[inc+1], blocks[inc+2]), new BaseBlock(blocks[inc+3]));
		}
	}

}

function BuildFill(vec, session)	{

	try {

		var size = checkFlag("s") ? parseInt(checkFlag("s")) : 8;
		var maxFaces = checkFlag("f") ? parseInt(checkFlag("f")) :  3;
		var strength = checkFlag("i") ? parseInt(checkFlag("i")) :  1;
		size = gSize != -1 ? gSize : size;	
		//maxFaces = (gMat == airMat) ? maxFaces : gMat.next(zVec).getType();
		
		if (size == 0)	{size = 4;}
		var blocks = [];	

		var blackList = [0,6,8,9,10,11,30,31,32,37,38,39,40,83,106,111,127,175];
		
		var blockCnt = 0;			
		var blockFaces = [];

		for (iteration = 1; iteration <= strength; iteration++) {
		
			var cycleSphere = function(x, y, z, d) {
				
				if (blackList.indexOf(getBlock(new Vector(x,y,z)).id) == -1) return;
				
				var blockCnt = 0;
				var blockFaces = new Array(6);
				var maxFace = {id:0, data: 0, cnt:0};
				
				blockFaces[0] = getBlock(new Vector(x+1,y,z));
				blockFaces[1] = getBlock(new Vector(x-1,y,z));
				blockFaces[2] = getBlock(new Vector(x,y,z+1));
				blockFaces[3] = getBlock(new Vector(x,y,z-1));
				blockFaces[4] = getBlock(new Vector(x,y+1,z));
				blockFaces[5] = getBlock(new Vector(x,y-1,z));
				
				var faces = new Object();
				for (var inc in blockFaces) {

					if (blackList.indexOf(blockFaces[inc].id) === -1) {
						if (typeof faces[blockFaces[inc].id] === 'undefined') {
							faces[blockFaces[inc].id] = {};
							faces[blockFaces[inc].id].cnt = 1;
						}
						else {
							faces[blockFaces[inc].id].cnt++;
						}
						if (faces[blockFaces[inc].id].cnt > maxFace.cnt) {
							maxFace.id = blockFaces[inc].id;
							maxFace.data =  blockFaces[inc].data;
							maxFace.cnt = faces[blockFaces[inc].id].cnt;
						}
						blockCnt++;
					}
				}
				
				if (blockCnt >= maxFaces) {
					blocks.push(x, y, z, maxFace.id, maxFace.data);
				}
				return;
			};
			
			var cycler = new ShapeCycler(cycleSphere, size);
			var setTotal = cycler.run(vec);
			
			for (var inc = 0; inc < blocks.length; inc+=5) {
				setBlockRaw(blocks[inc], blocks[inc+1], blocks[inc+2], blocks[inc+3], blocks[inc+4]);				
			}
			
		}
		
	} 
	catch(e) { 
		$err.handle(e); 
	}

}

function BuildWand(vec, session)	{

	var wandTool = new DoubleActionTraceTool({
		canUse : function(player) {
			return player.hasPermission("worldedit.tool.wand");
		},
		actPrimary : function rightClick(server,config,player,session) {
			try {
				var vec = player.getBlockIn();
				if (vec == null) { return; }
				
				if (!session.getRegionSelector(player.getWorld()).selectSecondary(vec, ActorSelectorLimits.forActor(player))) {
					player.printError("Position already set.");
					return;
				}

				session.getRegionSelector(player.getWorld()).explainSecondarySelection(player, session, vec);				
			}
			catch(e) {
				$err.handle(e);
			}
		},
		actSecondary : function leftClick(server,config,player,session) {
			try {
				var vec = checkFlag("~") ? player.getBlockTrace(parseInt(checkFlag("~")), true) : player.getBlockTrace(200, false);
				if (vec == null) { return; }

				var selector = session.getRegionSelector(player.getWorld());
				if (!selector.selectPrimary(vec, ActorSelectorLimits.forActor(player))) {
					selector.clear();
					session.dispatchCUISelection(player);
					player.print(text.White + text.Italics + "Selection cleared.");
					return;					
				}

				selector.explainPrimarySelection(player, session, vec);
				return;
			}
			catch(e) {
				$err.handle(e);
			}

		},	
	});

	context.getSession().setTool(player.getItemInHand(), wandTool);
	
}

function BuildOre(vec, session)		{

	var size = checkFlag("s") ? parseInt(checkFlag("s")) : 20;
	var density = checkFlag("d") ? parseInt(checkFlag("d")) : 100;
	var overBlockID = checkFlag("b") ? parseBlock(checkFlag("b")).getType() :  BlockID.STONE;
	var origin = vec.add(0 - size/2 + .5, 0 - size/2 + .5, 0 - size/2 + .5);

	var width = size;
	var height = size;
	var length = size;
	var area = width * height * length;
	
	if(checkFlag("r"))	{
		var world = context.getSession().getSelectionWorld();
		var region = context.getSession().getWorldSelection(world);
	
		var width = Math.abs(region.getMaximumPoint().getX() - region.getMinimumPoint().getX());
		var height = Math.abs(region.getMinimumPoint().getY() - region.getMaximumPoint().getY());
		var length = Math.abs(region.getMinimumPoint().getZ() - region.getMaximumPoint().getZ());
		var area = width * height * length;
		var origin = new Vector(
				region.getMinimumPoint().getX(),
				region.getMinimumPoint().getY(),
				region.getMinimumPoint().getZ()
				);
		
	}
	
	var oreTotal = 0;
	for (var oInc in oreList)	{
		oreTotal++;
	}
	
	var rand = new java.util.Random(); 	
	var densityStep = 300;
	var maxVeinSize = 12;
	var veinCount = 0;
	var oreCount = 0;

	var maxPoints = (area / densityStep) * (density / 100);

	for ( var pointStep = 0; pointStep < maxPoints; pointStep++) {
			
		randPnt = origin.add(rand.nextInt(width), rand.nextInt(height), rand.nextInt(length));
		randPnt2 = randPnt.add(rand.nextInt(maxVeinSize)*2-maxVeinSize, rand.nextInt(maxVeinSize)*2-maxVeinSize, rand.nextInt(maxVeinSize)*2-maxVeinSize);

		if (session.getBlock(randPnt).getType() != overBlockID)	{continue;}
		var distance = getDistance(randPnt, randPnt2);
		
		var testOre = [];
		var maxOreID = 0;
		var maxOreChance = 0;
		var chanceMax = 0;

		for (var findOre = 1; findOre <= oreTotal; findOre++)	{
			
			if (randPnt.getY() <= 0)	{ continue; }
			
			if ((oreList[findOre].minY <= randPnt.getY()) && (oreList[findOre].maxY >= randPnt.getY())) {
				
				var tmpOre = new Object();
				tmpOre.myOreID = findOre;
				
				tmpOre.minChance = chanceMax;
				tmpOre.maxChance = chanceMax + oreList[findOre].chance;
				testOre.push(tmpOre);
				chanceMax += oreList[findOre].chance;
			}
		}
		
		if(testOre.length <= 0)	{ continue; }
		randomProb = Math.random() * chanceMax;

		for (var getOre = 0; getOre < testOre.length; getOre++)	{
			if ((randomProb >= testOre[getOre].minChance) && (randomProb <= testOre[getOre].maxChance))	{
				maxOreID = testOre[getOre].myOreID;
			}
		}
		
		var bType = new BaseBlock(oreList[maxOreID].BlockID);
		
		var step = .9/distance;
		var newLength = (rand.nextInt(oreList[maxOreID].maxSize - oreList[maxOreID].minSize) + oreList[maxOreID].minSize);
		var chgCount = 0;
		
		for( var i = 0; i <= 1; i += step ) {
			
			if (chgCount >= newLength)	{break;}
			
			var distance = getDistance(randPnt, randPnt2);
			var step = .9/distance;

			for( var i = 0; i <= 1; i += step) {
					
				var xi = randPnt.getX() + ((randPnt2.getX() - randPnt.getX()) * i);
				var yi = randPnt.getY() + ((randPnt2.getY() - randPnt.getY()) * i);
				var zi = randPnt.getZ() + ((randPnt2.getZ() - randPnt.getZ()) * i);
								
				var vecA = new Vector(xi, yi, zi);
				if(vecA.getY() <= 0)	{ continue; }
				
				if (session.getBlock(vecA).getType() == overBlockID)	{
					setBlock(vecA, bType);	
					chgCount++;
					oreCount++;	
				}
			}
			
			
		}
		veinCount++;
		
	}
}

function BuildFragment(vec, session)	{
	
	var size = checkFlag("s") ? parseInt(checkFlag("s")) : 7;
	var block = checkFlag("b") ? parseBlock(checkFlag("b")) : new BaseBlock(1);
	var density = checkFlag("d") ? parseFloat(checkFlag("d")) : .75;
	var hollow = checkFlag("h") ? parseInt(checkFlag("h")) : 0;

	size = gSize != -1 ? gSize + (gSize * Math.random()*.2) : size;
	var mat = (gMat == airMat) ? new BlockPattern(block) : gMat;	
	
	CreateLeafSphere(size, size, density, hollow, vec.add(0,-(size/2),0), mat, session);

}

function BuildSpawner(vec, session)	{

	player.print(text.Red + "Error: " + text.White + "This brush is currently not working in this version.");	
	return;

	var entityList = [
		"bat", "chicken", "cow", "pig", "sheep", "squid", "villager", "enderman", "pigzombie", "blaze",
		"creeper", "ghast", "silverfish", "wither", "slime", "lavaslime", "spider", "cavespider", "witch",
		"zombie", "ozelot", "wolf", "villagergolem", "snowman", "enderdragon", "witherboss", "giant", "boat",
		"minecart", "mushroomcow", "endercrystal", "item", "xporb", "arrow", "snowball", "fireball", "smallfireball"
	]

	var type = argv.length > 2 ? String(argv[2]).toLowerCase() : "-";
	entityList.sort();
	
	for (inc in entityList)	{
		
		if(type == "all")
			setBlock(vec.add(0,parseInt(inc)+1,0), MobSpawnerBlock(entityList[inc].toLowerCase()));
		
		if(entityList[inc].toLowerCase() == type)	{
			setBlock(vec.add(0,1,0), MobSpawnerBlock(entityList[inc].toLowerCase()));
			return;
		}
	}
	
	if (type != "all")	{
		player.print("\n" + text.Red + "Error: " + text.White + "Entity type " + text.Gold + type + text.White + " not found.");
		player.print(text.Gold + text.Italics + "Available Entity Types: \n" + text.White + "[" + entityList + "]");
	}	

}

function BuildKiller(vec, session)	{

	player.print(text.Red + "Error: " + text.White + "This brush is currently not working in this version.");	
	return;

	var entityType = argv.length > 2 ? String(argv[2]).toLowerCase() : false;
	var size = checkFlag("s") ? parseInt(checkFlag("s")) : 7;
	size = gSize != -1 ? gSize : size;
	
	var pos1 = Vector(vec.getX()-size/2, vec.getY()-size/2, vec.getZ()-size/2);
	var pos2 = Vector(vec.getX()+size/2, vec.getY()+size/2, vec.getZ()+size/2);
	var region = new CuboidRegion(pos1, pos2);
		
	/* Entity killing - unstable
	
	var entities = player.getWorld().getEntities(region);
	for (var entity in entities) {
		var tmp2 = entities[entity].getPosition().position;
		var tmp3 = entities[entity].getClass().getType();
		player.print("Entity Killed @ " + String(tmp2) + String(tmp3));
		
		for (sube in  entities[entity])	
			//player.print(sube);

	}
	player.getWorld().killEntities(entities);
	*/
	
	/* Entity Spawning
	    public LocalEntity[] pasteEntities(Vector pos) {
        LocalEntity[] entities = new LocalEntity[this.entities.size()];
        for (int i = 0; i < this.entities.size(); ++i) {
            CopiedEntity copied = this.entities.get(i);
            if (copied.entity.spawn(copied.entity.getPosition().setPosition(copied.relativePosition.add(pos)))) {
                entities[i] = copied.entity;
            }
        }
        return entities;
    }
	
	
	*/
	
	/* Alt killing method - unstable
	
	var entities = player.getWorld().getWorld().getLivingEntities();
	
	var cnt = 0;
	for (var inc = 0; inc < entities.size(); inc++) {
		var entity = entities.get(inc);
		var type = String(entity.getType()).toLowerCase();
		var loc = entity.getLocation();
		var pos = new Vector(parseInt(loc.getX()), parseInt(loc.getY()), parseInt(loc.getZ()));
		
		//player.print("what the hell?!" + entity + type + pos);
		if (region.contains(pos))	{
			player.print("inside");
			if (!(entityType) || (type == entityType))	{
				entity.remove();
			}
		}
		//player.print("any luck?");
		
	}
	*/

}

function BuildPattern(vec, session)	{

	if (argv.length < 3) 	{
		player.print (text.Red + "Error:" + text.White + " You need to specify a pattern type to use.");
		return false;
	}

	var blockList = String(argv[2]).toLowerCase();
	var size = checkFlag("s") ? parseInt(checkFlag("s")) : 10;
	blockList = blockList == "-" ? "ruin" : blockList;
	size = gSize != -1 ? gSize : size;
	
	if (blocks[blockList] == undefined)	{
		player.print(text.Red + "Error:" + text.White + " Pattern type " + text.Gold + blockList + text.White + " not found.");
		return;
	}
	
	var blackList = [0,6,31,32,37,38,39,40,81,106];
	
	for (var x = 0; x <= size; x++) {
		for (var y = 0; y <= size; y++) {
			for (var z = 0; z <= size; z++) {					
				pos = vec.add(x - size/2 + .5, y - size/2 + .5, z - size/2 + .5);
				distance = getDistance(vec, pos);

				if (distance > size/2)	{continue;}
				
				if (blackList.indexOf(session.getBlock(pos).getType()) != -1)	{continue;}
					
				setBlock(pos, getListBlock(blocks[blockList].list));
				//setBlock(pos, getListBlock(blocks["Plants"].list));


			}
		}
	}

}

function BuildArray(vec, session)	{

	var world = context.getSession().getSelectionWorld();
	var region = context.getSession().getWorldSelection(world);

	var cnt1 = checkFlag("a") ? parseInt(checkFlag("a")) : 0;
	var cnt2 = checkFlag("b") ? parseInt(checkFlag("b")) : 0;
	var cnt3 = checkFlag("c") ? parseInt(checkFlag("c")) : 0;

	var copyAir = false;

	switch(stage)	{

		case 0:
		case 1:
			offsetVec[0] = vec;
			offsetVec[1] = vec;	
			offsetVec[2] = vec;	
			offsetVec[3] = vec;	
			player.print(text.White + "Origin point #1 set to [" + vec.getX() + ", " + vec.getY() + ", " + vec.getZ() + "]");
			player.print(text.Gold + text.Italics + "Ready for offset point #1.");
			stage = 2;
			break;
			
		case 2:
			offsetVec[1] = vec.add(-(offsetVec[0].getX()), -(offsetVec[0].getY()), -(offsetVec[0].getZ()));
			var pStr1 = (text.White + "Offset point #1 set to [" + vec.getX() + ", " + vec.getY() + ", " + vec.getZ() + "]\n")
			var pStr2 = (text.White + "Point #1 Offset Total: [" + offsetVec[1].getX() + ", " + offsetVec[1].getY() + ", " + offsetVec[1].getZ() + "]")
			player.print(pStr1 + pStr2);
			if (cnt2 == 0)	{
				stage = 7;
				break;
			}
			player.print(text.Gold + text.Italics + "Ready for origin point #2.");
			stage++;
			break;				
		case 3:
			offsetVec[0] = vec;
			player.print(text.White + "Origin point #2 set to [" + vec.getX() + ", " + vec.getY() + ", " + vec.getZ() + "]");
			player.print(text.Gold + text.Italics + "Ready for offset point #2.");
			stage++;
			break;		

		case 4:
			offsetVec[2] = vec.add(-(offsetVec[0].getX()), -(offsetVec[0].getY()), -(offsetVec[0].getZ()));
			var pStr1 = (text.White + "Offset point #2 set to [" + vec.getX() + ", " + vec.getY() + ", " + vec.getZ() + "]\n")
			var pStr2 = (text.White + "Point #2 Offset Total: [" + offsetVec[2].getX() + ", " + offsetVec[2].getY() + ", " + offsetVec[2].getZ() + "]")
			player.print(pStr1 + pStr2);
			if (cnt3 == 0)	{
				stage = 7;
				break;
			}
			player.print(text.Gold + text.Italics + "Ready for origin point #3.");
			stage++;
			break;				
		case 5:
			offsetVec[0] = vec;
			player.print(text.White + "Origin point #3 set to [" + vec.getX() + ", " + vec.getY() + ", " + vec.getZ() + "]");
			player.print(text.Gold + text.Italics + "Ready for offset point #3.");
			stage++;
			break;	

		case 6:
			offsetVec[3] = vec.add(-(offsetVec[0].getX()), -(offsetVec[0].getY()), -(offsetVec[0].getZ()));
			var pStr1 = (text.White + "Offset point #3 set to [" + vec.getX() + ", " + vec.getY() + ", " + vec.getZ() + "]\n")
			var pStr2 = (text.White + "Point #3 Offset Total: [" + offsetVec[3].getX() + ", " + offsetVec[3].getY() + ", " + offsetVec[3].getZ() + "]")
			player.print(pStr1 + pStr2);
			stage++;
			break;
	}

	if (stage == 10)	{
	
		var min = region.getMinimumPoint();
		var max = region.getMaximumPoint();

		var minX = min.getBlockX();
		var minY = min.getBlockY();
		var minZ = min.getBlockZ();
		var maxX = max.getBlockX();
		var maxY = max.getBlockY();
		var maxZ = max.getBlockZ();
		
		var setPos = new Vector;
		var setPos2 = new Vector;
		
		for (var x = minX; x <= maxX; ++x) {
			for (var z = minZ; z <= maxZ; ++z) {
				for (var y = minY; y <= maxY; ++y) {
				
					var block = session.getBlock(new Vector(x, y, z));
					if (!block.isAir() || copyAir) {
						for (var i = 0; i <= cnt1; ++i) {
							setPos = Vector(x + offsetVec[1].getX() * i, y + offsetVec[1].getY() * i, z + offsetVec[1].getZ() * i);

							for (var j = 0; j <= cnt2; ++j) {
								setPos2 = Vector(setPos.add(offsetVec[2].getX() * j, offsetVec[2].getY() * j, offsetVec[2].getZ() * j));
								for (var k = 0; k <= cnt3; ++k) {
									setPos3 = Vector(setPos2.add(offsetVec[3].getX() * k, offsetVec[3].getY() * k, offsetVec[3].getZ() * k));
								
									setBlock(setPos3, block);
								}
								setBlock(setPos2, block);
							}
						}
					}
				}
			}
		}
		player.print(text.White + "Array complete!");
		stage = 0;
	}
	
	if (stage == 7)	{
		player.print(text.Gold + text.Italics + "Everything is set!" + text.White + text.Italics + " Click once more to perform the array stack!");
		stage = 10;
	}

}

function BuildMap(vec, session)	{

 	if (argv.length > 2)	{
		var fileStr = String(argv[2]).toLowerCase();
	}
	else {		//no file specified
		player.print(text.Red + "Error: " + text.White + "You must specify a filename to save to.");
		return false;
	} 

	var size = checkFlag("s", 3) ? parseInt(checkFlag("s")) : 256;
	var img = new BufferedImage(size, size, BufferedImage.TYPE_INT_RGB);
	var file = context.getSafeFile("shapes", String(fileStr) + '.png');

	if(!file.exists()){
		file.createNewFile();
	}
	
	vec = player.getBlockIn();
	
	var vecA = vec.add(-size/2, 0, -size/2);
	var vecB = vec.add(size/2, 0, size/2);
	player.print(vecA);
	player.print(vecB);
	var imgB = generateSurfaceImage(vecA, vecB, true, false);
	
	ImageIO.write(imgB, "png", file);
	player.print(text.White + "Map image successfully saved to:\n" + text.Gold + file);
	return;
	
	for (var x = 0; x < size; x++) {
		for (var z = 0; z < size; z++) {
		
			pos = vec.add(x - size/2 + .5, 0, z - size/2 + .5);
			var yMax = session.getHighestTerrainBlock(pos.getX(),pos.getZ(), 0, 256, false);

			for (var y = yMax; y < 256; y++) {
				
				var topVec = Vector(pos.getX(), y, pos.getZ());
				if(session.getBlockType(topVec.add(0,1,0)) == 0)	{
					var topID = session.getBlockType(topVec);
					break;
				}
			}
			
			
			clr = getColor(0,0,0);
			if (checkFlag("h", 3) == false)	{
				for(inc in blockColors)	{
					if(inc == topID)	{
						clr = getColor(blockColors[inc].getX(), blockColors[inc].getY(), blockColors[inc].getZ());
						break
					}
				}
			}
			else	{
				var modb = 1;
				for(inc in blockColors)	{
					if(inc == topID)	{
						r = blockColors[inc].getX()-(y/modb) < 0 ? 0 : blockColors[inc].getX()-(y/modb);
						g = blockColors[inc].getY()-(y/modb) < 0 ? 0 : blockColors[inc].getY()-(y/modb);
						b = blockColors[inc].getZ()-(y/modb) < 0 ? 0 : blockColors[inc].getZ()-(y/modb);
						clr = getColor(r, g, b);
						break
					}
				}
				//clr = getColor(y,y,y);
			}
			
			
			
			img.setRGB(x, z, clr);
		}		
	}
	
	ImageIO.write(img, "png", file);
	player.print(text.White + "Map image successfully saved to:\n" + text.Gold + file);

}

function BuildFlip(vec, session)	{

	var world = context.getSession().getSelectionWorld();
	var region = context.getSession().getWorldSelection(world);
	
	var pos = region.getMinimumPoint();
	var width = region.getWidth();
	var length = region.getLength();
	var height = region.getHeight();
	var vec2 =  player.getBlockIn();
	var dirInfo = getDirection();	

	if ((dirInfo.rightAngle == 0) || (dirInfo.rightAngle == 180))	{
		var offDir = pos.getX()-vec.getX();
		for (x = 0; x < width; x++)		{
			for (y = 0; y < height; y++)		{
				for (z = 0; z < length; z++)		{
					
					var tmpVec = pos.add(x,y,z);
					var tmpBlock = session.getBlock(tmpVec);
					var offLen = Math.abs(offDir + x);
					
					if ((tmpVec.getX()+width/2) <= vec.getX())
						var newVec = Vector(vec.getX()+y,vec.getY()+offLen,pos.getZ()+z);
					if ((tmpVec.getX()+width/2) > vec.getX())
						var newVec = Vector(vec.getX()-y,vec.getY()+offLen,pos.getZ()+z);
									
					if (checkFlag("d"))	{
						setBlock(tmpVec, airMat);
					}					
					setBlock(newVec, tmpBlock);
					
					if (checkFlag("s"))	{
						if((x == 0) && (y == 0) & (z == 0))	{
							var selector = context.getSession().getRegionSelector(player.getWorld());
							if (selector.selectPrimary(newVec)) {
								context.getSession().dispatchCUISelection(player);
							}
						}
						if((x == (width-1)) && (y == (height-1)) && (z == (length-1)))	{
							var selector = context.getSession().getRegionSelector(player.getWorld());
							if (selector.selectSecondary(newVec)) {
								context.getSession().dispatchCUISelection(player);
							}
						}
					}
				}
			}
		}
		return true;
	}
	
	if ((dirInfo.rightAngle == 90) || (dirInfo.rightAngle == 270))	{
		var offDir = pos.getZ()-vec.getZ();
		for (x = 0; x < width; x++)		{
			for (y = 0; y < height; y++)		{
				for (z = 0; z < length; z++)		{
				
					var tmpVec = pos.add(x,y,z);
					var tmpBlock = session.getBlock(tmpVec);
					var offLen = Math.abs(offDir + z);
					
					if ((pos.getZ()+length/2) <= vec.getZ())
						var newVec = Vector(pos.getX()+x,vec.getY()+offLen,vec.getZ()+y);
					if ((pos.getZ()+length/2) > vec.getZ())
						var newVec = Vector(pos.getX()+x,vec.getY()+offLen,vec.getZ()-y);
					
					
					//if(tmpBlock.getType() == BlockID.AIR)	{continue}	
					if (checkFlag("d"))	{
						setBlock(tmpVec, airMat);
					}					
					setBlock(newVec, tmpBlock);

					if (checkFlag("s"))	{
						if((x == 0) && (y == 0) & (z == 0))	{
							var selector = context.getSession().getRegionSelector(player.getWorld());
							if (selector.selectPrimary(newVec)) {
								context.getSession().dispatchCUISelection(player);
							}
						}
						if((x == (width-1)) && (y == (height-1)) && (z == (length-1)))	{
							var selector = context.getSession().getRegionSelector(player.getWorld());
							if (selector.selectSecondary(newVec)) {
								context.getSession().dispatchCUISelection(player);
							}
						}
					}
				}
			}
		}
		return true;	
	}




}

function BuildBox(vec, session)	{

	var xSize = checkFlag("x") ? parseInt(checkFlag("x")) : 20;
	var ySize = checkFlag("y") ? parseInt(checkFlag("y")) : 10;
	var zSize = checkFlag("z") ? parseInt(checkFlag("z")) : 5;
	var block = checkFlag("b") ? parseBlock(checkFlag("b")) :  new BaseBlock(20);
	var insideBlock = checkFlag("i") ? parseBlock(checkFlag("i")) :  false;
	var hollow = checkFlag("h") ? parseInt(checkFlag("h")) : false;
	var angled = checkFlag("a") ? true : false;	
	
	var mat = (gMat == airMat) ? new BlockPattern(block) : gMat;

	var dirInfo = getDirection();	

	if (!angled)	{
		if ((dirInfo.rightAngle == 0) || (dirInfo.rightAngle == 180))	{
			var tmpSize = xSize;
			xSize = zSize;
			zSize = tmpSize;
		}
	}
	
	var step = angled ? .7 : 1;
	for (var x = 0; x < xSize; x += step) {
		for (var y = 0; y < ySize; y += step) {
			for (var z = 0; z < zSize; z += step) {
				
				 if (hollow)	{
					if (((x >= hollow) && (x < xSize-hollow)) && ((y >= hollow) && (y < ySize-hollow)) && ((z >= hollow) && (z < zSize-hollow)))	{
						if(!insideBlock) {continue;}
						
						var pt = vec.add((x-xSize/2), (y*invert+invert), (z-zSize/2));
						if (angled) {pt = rotateVec(vec, pt, dirInfo.yaw);}
						
						setBlock(pt, insideBlock);
						continue;
						
					}
				 }
		
				var pt = vec.add((x-xSize/2), (y*invert+invert), (z-zSize/2));
				if (angled) {pt = rotateVec(vec, pt, dirInfo.yaw);}
		
				setBlock(pt, mat);
			}
		}
	}
}

function BuildEllipse(vec, session)	{

	var xSize = checkFlag("x") ? parseInt(checkFlag("x")) : 16;
	var ySize = checkFlag("y") ? parseInt(checkFlag("y")) : 8;
	var zSize = checkFlag("z") ? parseInt(checkFlag("z")) : 48;
	var block = checkFlag("b") ? parseBlock(checkFlag("b")) :  new BaseBlock(20);
	var insideBlock = checkFlag("i") ? parseBlock(checkFlag("i")) :  false;
	var hollow = checkFlag("h") ? true : false;
	var angled = checkFlag("a") ? true : false;
	
	var mat = (gMat == airMat) ? new BlockPattern(block) : gMat;
	var dirInfo = getDirection();

	function lengthSq(x, y, z) {return (x * x) + (y * y) + (z * z);}
	
	var xOff = ['1', '-1', '1', '1', '-1', '1', '-1', '-1'];
	var yOff = ['1', '1', '-1', '1', '-1', '-1', '1', '-1'];
	var zOff = ['1', '1', '1', '-1', '1', '-1', '-1', '-1'];

	radiusX = xSize/2 + 0.5;
	radiusY = ySize/2 + 0.5;
	radiusZ = zSize/2 + 0.5;

	var invRadiusX = 1 / radiusX;
	var invRadiusY = 1 / radiusY;
	var invRadiusZ = 1 / radiusZ;

	var ceilRadiusX = Math.ceil(radiusX);
	var ceilRadiusY = Math.ceil(radiusY);
	var ceilRadiusZ = Math.ceil(radiusZ);
	
	var step = angled ? .7 : 1;
	var nextXn = 0;
	forX: for (var x = 0; x <= ceilRadiusX; x += step) {
		var xn = nextXn;
		nextXn = (x + 1) * invRadiusX;
		var nextYn = 0;
		forY: for (var y = 0; y <= ceilRadiusY; y += step) {
			var yn = nextYn;
			nextYn = (y + 1) * invRadiusY;
			var nextZn = 0;
			forZ: for (var z = 0; z <= ceilRadiusZ; z += step) {
				var zn = nextZn;
				nextZn = (z + 1) * invRadiusZ;

				var distanceSq = lengthSq(xn, yn, zn);
				if (distanceSq > 1) {
					if (z == 0) {
						if (y == 0) {
							break forX;
						}
						break forY;
					}
					break forZ;
				}

				if (hollow) {
					if (lengthSq(nextXn, yn, zn) <= 1 && lengthSq(xn, nextYn, zn) <= 1 && lengthSq(xn, yn, nextZn) <= 1) {
						if (insideBlock)	{
							for (var dirLoop = 0; dirLoop <= 7 ; dirLoop++)	{
							
								var setPnt = vec.add(x * xOff[dirLoop], y * yOff[dirLoop], z * zOff[dirLoop]);
								if (angled) {setPnt = rotateVec(vec, setPnt, dirInfo.yaw);}
								setBlock(setPnt, insideBlock);
							}
							
						}
						continue;
					}
				}
				
				
				for (var dirLoop = 0; dirLoop <= 7 ; dirLoop++)	{

					var setPnt = vec.add(x * xOff[dirLoop], y * yOff[dirLoop], z * zOff[dirLoop]);
					if (angled) {setPnt = rotateVec(vec, setPnt, dirInfo.yaw);}
					setBlock(setPnt, mat);
					
				}
			}
		}
	}




}

function BuildSpiral(vec, session)	{

	var radius = checkFlag("r") ? parseInt(checkFlag("r")) : 10;
	var compress = checkFlag("s") ? parseInt(checkFlag("s")) : 8;
	var coilCnt = checkFlag("c") ? parseInt(checkFlag("c")) : 3;
	var dFlag = checkFlag("d") ? true : false;
	var hFlag = checkFlag("f") ? true : false;

	//var mat = (gMat == airMat) ? new BlockPattern(block) : gMat;
	radius = gSize != -1 ? gSize : radius;
	compress = compress == 0 ? 1 : compress;

	var origin = vec;
	//var cb = context.getSession().getClipboard();
	//cb.copy(session);
	
	
	
	
	var holder = context.getSession().getClipboard();
	var clipboard = holder.getClipboard();
	var region = clipboard.getRegion();
	var operation = holder.createPaste(session, session.getWorld().getWorldData()).build();

	if(radius <= 0)	{
		
		radius = radius * .1;
		var increment = .01;
		var maxAngle = Math.PI * 2 * coilCnt;
		var gap = Math.abs(radius);

		for (var angle = 0; angle <= maxAngle; angle = angle + increment)
		{
			var newX = (angle * gap * Math.cos(angle));
			var newY = (angle * gap * Math.sin(angle));
			var newZ = (angle/(compress/10))
			
			if (hFlag) {
				var pt = origin.add(newX, newY*invert, newZ);
				if (dFlag)  {
					var pt2 = origin.add((-newX), (-newY*invert), newZ);
				}
			}
			else {
				var pt = origin.add(newX, newZ*invert, newY);
				if (dFlag)  {
					var pt2 = origin.add((-newX), (newZ*invert), (-newY));
				}
			}
			operation = holder.createPaste(session, session.getWorld().getWorldData()).to(pt).build();
			Operations.completeLegacy(operation);
			
			if (dFlag)  {
				operation = holder.createPaste(session, session.getWorld().getWorldData()).to(pt2).build();
				Operations.completeLegacy(operation);
			}
		}
	}
	else	{
	
		var points = 256;
		var slice = 2 * Math.PI / points;
		var pt;
		var loopCnt = 0;
		for (var i = 0; i < (points * coilCnt); i++)	{

			var angle = slice * i;

			var newX = (radius * Math.cos(angle));
			var newY = (radius * Math.sin(angle));
			var newZ = (i/(compress*2));
			
			if (hFlag) {
				var pt = origin.add(newX, newY*invert, newZ);
				if (dFlag)  {
					var pt2 = origin.add(-newX, (-newY*invert), newZ);
				}
			}
			else	{
				var pt = origin.add(newX, newZ*invert, newY);
				if (dFlag)  {
					var pt2 = origin.add(-newX, newZ*invert, -newY);
				}
			}
			operation = holder.createPaste(session, session.getWorld().getWorldData()).to(pt).build();
			Operations.completeLegacy(operation);
			
			if (dFlag)  {
				operation = holder.createPaste(session, session.getWorld().getWorldData()).to(pt2).build();
				Operations.completeLegacy(operation);
			}
		}	
	}
	
}

function BuildMineSweeper(vec, session)	{

	var xSize = checkFlag("x") ? parseInt(checkFlag("x")) : 24;
	var zSize = checkFlag("y") ? parseInt(checkFlag("y")) : 12;
	var mineTotal = checkFlag("m") ? parseInt(checkFlag("m")) : 40;
	
	if (checkFlag("b"))	{
		xSize = 9;
		zSize = 9;
		mineTotal = 10;
	}
	if (checkFlag("i"))	{
		xSize = 16;
		zSize = 16;
		mineTotal = 40;
	}
	if (checkFlag("e"))	{
		xSize = 16;
		zSize = 30;
		mineTotal = 99;
	}
	
//		-x+y|0x+y|+x+y			Offset reference
//		-x0y|####|+x0y
//		-x-y|0x-y|+x-y

	offsetList = {			//Helpful when checking around a block
		1: Vector(-1,0,1),
		2: Vector(-1,0,0),
		3: Vector(-1,0,-1),
		4: Vector(0,0,1),
		5: Vector(0,0,-1),
		6: Vector(1,0,1),
		7: Vector(1,0,0),
		8: Vector(1,0,-1)
	};
		
	mineBlocks = {			//Block set for # of mines in the area
		0: new BaseBlock(BlockID.STONE, 0),			//No mines
		1: new BaseBlock(BlockID.COAL_ORE, 0),		//One mine	
		2: new BaseBlock(BlockID.IRON_ORE, 0),		//Two mines...
		3: new BaseBlock(BlockID.GOLD_ORE, 0),
		4: new BaseBlock(BlockID.LAPIS_LAZULI_ORE, 0),	
		5: new BaseBlock(BlockID.REDSTONE_ORE, 0),
		6: new BaseBlock(BlockID.DIAMOND_ORE, 0),
		7: new BaseBlock(BlockID.EMERALD_ORE, 0),
		8: new BaseBlock(BlockID.OBSIDIAN, 0),
		9: new BaseBlock(46, 0),				//Mine Block
		10: new BaseBlock(42, 0),				//Surface Block
		11: new BaseBlock(98, 0),				//Wall Base Block
		12: new BaseBlock(139, 0),				//Wall Block
		13: new BaseBlock(123, 0)				//Flag Marker
	};
	
	if (checkFlag("w"))	{
		mineBlocks = {			//Alt Wool block set for # of mines in the area
			0: new BaseBlock(35, 0),
			1: new BaseBlock(35, 3),
			2: new BaseBlock(35, 5),
			3: new BaseBlock(35, 6),
			4: new BaseBlock(35, 11),	
			5: new BaseBlock(35, 14),
			6: new BaseBlock(35, 9),
			7: new BaseBlock(35, 13),
			8: new BaseBlock(35, 7),
			9: new BaseBlock(35, 15),
			10: new BaseBlock(42, 0),
			11: new BaseBlock(98, 0),
			12: new BaseBlock(139, 0),	
			13: new BaseBlock(19, 0)	
		};
	}
	var fieldMin = vec.add(-xSize/2, 0, -zSize/2);
	var startTime = new Date();

	if (checkFlag("c"))
		mineBlocks[10] = new BaseBlock(20, 0);
	
	var mines = [];
	
	var arrayWidth = xSize;
	var arrayHeight = zSize;
	
	var mines = new Array(xSize)				//array to hold mine positions
	for (var x = 0; x < xSize; x++) {
		mines[x] = new Array(zSize);
		for (var z = 0; z < zSize; z++) {
			mines[x][z] = 0;
		}
	}
	
	var legendPos = vec.add(xSize/2+4, 1, -4);
	for(var inc = 0; inc < 9; inc++)	{
		setBlock(legendPos.add(0,0,inc), mineBlocks[inc]);
	}
	setBlock(legendPos.add(0,0,-1), mineBlocks[13]);
	setBlock(legendPos.add(0,0,9), mineBlocks[9]);
	
	for (x = -1; x < xSize+1; x++)	{					//Creating the base minefield
		for (z = -1; z < zSize+1; z++)	{
			var pos = vec.add(x - xSize/2, 0, z - zSize/2);
			setBlock(pos.add(0,-2,0), mineBlocks[11]);
			for(var y = 1; y < 11; y++)	{ setBlock(pos.add(0,y,0), new BaseBlock(0)); }		//clear some space above
			
			if((x == -1) || (x == xSize) || (z == -1) || (z == zSize))	{		//Walls and perimeter
				setBlock(pos, mineBlocks[11]);							//Underground stone brick layers
				setBlock(pos.add(0,-1,0), mineBlocks[11]);
				
				if((x == parseInt(xSize/2)) || (z == parseInt(zSize/2))) { continue; }
				
				if ((xSize%2) == 1)	{
					if (x == xSize/2) { continue; }
				}
				else	{
					if (x == xSize/2) { continue; }
					if (x+1 == xSize/2) { continue; }
				}
				
				if ((zSize%2) == 1)	{
					if (z == zSize/2) { continue; }
				}
				else	{
					if (z == zSize/2) { continue; }
					if (z+1 == zSize/2) { continue; }
				}
				
				
				
				setBlock(pos.add(0,1,0), mineBlocks[12]);
			}	
			else	{															//Center Area
				setBlock(pos, mineBlocks[10]);
			}
			
		}
	}
	
	var missCnt = 0;
	for (m = 0; m < mineTotal; m += 0)	{			//Setting the mines
	
		var x = parseInt(Math.random()*xSize);
		var z = parseInt(Math.random()*zSize);
		
		//player.print("x@" + x + "| z@" + z);
		
		var pos = fieldMin.add(x, 0, z);
		//var pos = vec.add(parseInt(x - size/2), 0, parseInt(z - size/2));
		//player.print("pos@" + pos);
		
		
		missCnt++;
		if (mines[x][z] == 0)	{			
			setBlock(pos.add(0,-1,0), mineBlocks[9]);
			//player.print("mine set @" + pos + mineBlocks[9]);
			mines[x][z] = 1;
			m++;
			missCnt = 0;
		}
		
		if(missCnt > 1000)	{
			player.print("I couldn't find anymore spots to put mines!");
			player.print("I found room for a total of " + m + " mines.");
			m = mineTotal;
			missCnt = 0;
		}
	}

	player.print(text.Gold + "Finished creating minefield!");
	player.print(text.Gold + mineTotal + text.White + " mines set in a " + text.Gold + xSize + " x " + zSize + text.White + " area - " + text.Gold + (m/(xSize*zSize)*100).toFixed(1) + text.White + "% density.");
	
	for (x = 0; x < xSize; x++)	{					//Setting color blocks
		for (z = 0; z < zSize; z++)	{
			
			pos = vec.add(x - xSize/2, -1, z - zSize/2);
			
			// if (session.getBlock(pos) == mineBlocks[10])	{
			
			if (mines[x][z] == 0)	{
			
				var areaMines = 0;
				
				for (px = -1; px <= 1; px++)	{					//Looping thru neighbor blocks
					for (pz = -1; pz <= 1; pz++)	{
						posX = x + px;
						posZ = z + pz;
						
						if((posX < 0) || (posX >= xSize) || (posZ < 0) || (posZ >= zSize)	)	{continue;}
						
						if (mines[posX][posZ] == 1)
							areaMines++;
					
					
					}
				}
				
				setBlock(pos, mineBlocks[areaMines]);
		
			}
		
		}
	}

	var sweeperTool = new DoubleActionTraceTool({			//Creating the sweeper tool
		canUse : function(player) {
			return player.hasPermission("worldedit.tool.wand");
		},
		actSecondary : function(server,config,player,session) {			// ###### Left Click - Clear Block
		
			try {
				var vec = player.getBlockTrace(200, false);
				if (vec == null) { return; }
				
				var es = session.createEditSession(player);
				
				if (es.getBlock(vec).equals(mineBlocks[10]))	{			//check if the surface block was clicked
					var es = session.createEditSession(player);
					var testBlock = es.getBlock(vec.add(0,-1,0));
					es.setBlock(vec.add(0,0,0), testBlock);				
					
					if (testBlock.equals(mineBlocks[0]))	{			//if mine count is zero attempt to expand area
						
						var expandList = [];
						var expandSide = [];
						
						expandList.push(vec.add(0,-1,0)); 
						
						for (var inc = 0;  inc < expandList.length; inc++)	{
							
							for(var side in offsetList)	{		//check all the sides for more open areas, if found push them to be checked also
								if (es.getBlock(expandList[inc].add(offsetList[side])).equals(mineBlocks[0]) && es.getBlock(expandList[inc].add(offsetList[side].add(0,1,0))).equals(mineBlocks[10]))	{
									if (String(expandList).indexOf(String(expandList[inc].add(offsetList[side]))) == -1)	{
										expandList.push(expandList[inc].add(offsetList[side])); 
									}								
								}
							}
							
							if(inc > 500000)	{			//check to see if the expanding gets too far out of control
								player.print("inc over 500,000!");
								player.print("length=" + expandList.length);
								session.remember(es);
								return;
							}
							
							es.setBlock(expandList[inc].add(0,1,0), mineBlocks[0]);
							
							for(var side in offsetList)	{		//open up all the blocks around clear area
								if (es.getBlock(expandList[inc].add(offsetList[side].add(0,1,0))).equals(mineBlocks[10]))
									expandSide.push(expandList[inc].add(offsetList[side].add(0,1,0)));
							}
						}
						
						for (var inc in expandSide) {
							es.setBlock(expandSide[inc], es.getBlock(expandSide[inc].add(0,-1,0)));
						}
					}
				}
				
				else{													//check if a numbered block was clicked
					var tCnt = 0;
					for (var tInc = 1; tInc < 10; tInc++)	{
						if (es.getBlock(vec).equals(mineBlocks[tInc]))		
							tCnt = tInc;
					
					}
				}
				
				if (tCnt > 0)	{				//if a numbered block was found
					
					var flagCnt = 0;
					
					for (var side in offsetList)	{		//open up all the blocks around clear area
						if (es.getBlock(vec.add(offsetList[side])).equals(mineBlocks[13]))
							flagCnt++;
					
					}
					
					if(flagCnt >= tCnt)	{
						for(var side in offsetList)	{		//open up all the blocks around clear area
							
							if (!es.getBlock(vec.add(offsetList[side])).equals(mineBlocks[13]))		{
								es.setBlock(vec.add(offsetList[side]), es.getBlock(vec.add(offsetList[side].add(0,-1,0))));
							}
							
							var testVec = vec.add(offsetList[side].add(0,-1,0));
							var testBlock = es.getBlock(testVec);			
							
							if (testBlock.equals(mineBlocks[0]))	{			//if mine count is zero attempt to expand area
								
								var expandList = [];
								var expandSide = [];
								
								expandList.push(testVec); 
								
								for (var inc = 0;  inc < expandList.length; inc++)	{									
									
									for(var side in offsetList)	{		//check all the sides for more open areas, if found push them to be checked also
										if (es.getBlock(expandList[inc].add(offsetList[side])).equals(mineBlocks[0]) && es.getBlock(expandList[inc].add(offsetList[side].add(0,1,0))).equals(mineBlocks[10]))	{
											if (String(expandList).indexOf(String(expandList[inc].add(offsetList[side]))) == -1)	{
												expandList.push(expandList[inc].add(offsetList[side])); 
											}								
										}
									}
									
									if(inc > 500000)	{			//check to see if the expanding gets too far out of control
										player.print("inc over 500,000!");
										player.print("length=" + expandList.length);
										return;
									}
									
									for(var side in offsetList)	{		//open up all the blocks around clear area
										if (es.getBlock(expandList[inc].add(offsetList[side].add(0,1,0))).equals(mineBlocks[10]))
											expandSide.push(expandList[inc].add(offsetList[side].add(0,1,0)));
									}

								}
								
								for (var inc in expandSide) {
									es.setBlock(expandSide[inc], es.getBlock(expandSide[inc].add(0,-1,0)));
								
								}
							}							
						}
					}
				}
				
				var tntList = [];
				var leftCnt = 0;	//surface block count
				//var fCnt = 0;	//flag count
				for (var x = 0; x < xSize; x++)	{					//Checking for TNT or game win
					for (var z = 0; z < zSize; z++)	{
						var pos = fieldMin.add(x, 0, z);
						
						if (es.getBlock(pos).equals(mineBlocks[10]))	{ leftCnt++; }
						if (es.getBlock(pos).equals(mineBlocks[13]))	{ leftCnt++; }
						
						if (es.getBlock(pos).equals(mineBlocks[9]))	{					//TNT was hit
							for (var xT = 0; xT < xSize; xT++)	{					
								for (var zT = 0; zT < zSize; zT++)	{
									var posT = fieldMin.add(xT, -1, zT);
									if (es.getBlock(posT).equals(mineBlocks[9]))	{
										es.setBlock(posT.add(0,1,0), mineBlocks[9]);
										if (checkFlag("h"))	
											es.setBlock(posT.add(0,0,0), new BaseBlock(76));
									}
									
								}
							}
							
							player.print("\n" + text.Red + text.Bold + "BOOOOOOM!!!!" + text.White + " You hit TNT, and are now dead. Better luck next time!");
							session.setTool(player.getItemInHand(), null)
							return;
						}
					}
				}	
				
				if(leftCnt == mineTotal)	{
				
					var totalTime = (new Date() - startTime)/1000;
					player.print("\n" + text.Gold + text.Bold + "-------- You Win!! --------");
					player.print(text.White + "You cleared " + text.Gold + mineTotal + text.White + " mines from a " + text.Gold + xSize + " x " + zSize + text.White + " area in " + text.Gold + totalTime.toFixed(1) + text.White + " secs!");
					
					var diamonds = new BaseItemStack(264, 1);
					for (var xT = 0; xT < xSize; xT++)	{					
						for (var zT = 0; zT < zSize; zT++)	{
							var posT = fieldMin.add(xT, -1, zT);
							if (es.getBlock(posT).equals(mineBlocks[9]))	{
								es.setBlock(posT.add(0,1,0), mineBlocks[9]);
								player.getWorld().dropItem(posT.add(0,30,0), diamonds, 1);
							}
							
						}
					}
					
					session.setTool(player.getItemInHand(), null)
					return;

				}
				
			}
			catch (e)	{
				player.print("error=" + e);
			}
			
			return;
		},
		
		actPrimary : function(server,config,player,session) {			// ###### Right Click - Set Marker
			
			try {
				var vec = player.getBlockTrace(200, false);
				if (vec == null) { return; }
				var es = session.createEditSession(player);
				
				if (es.getBlock(vec).equals(mineBlocks[10]))	{			//Set Flag
					es.setBlock(vec.add(0,0,0), mineBlocks[13]);
				}
				else if (es.getBlock(vec).equals(mineBlocks[13]))	{		//Remove Flag
					es.setBlock(vec.add(0,0,0), mineBlocks[10]);
				}
				else	{
					
					var flagCnt = 0;
					for (var x = 0; x < xSize; x++)	{					//Checking for flags
						for (var z = 0; z < zSize; z++)	{
							var pos = fieldMin.add(x, 0, z);
							
							if (es.getBlock(pos).equals(mineBlocks[13]))	{ flagCnt++; }
							
						}
					}
					var totalTime = (new Date() - startTime)/1000;
					player.print(text.White + "Mines Left: " + text.Gold + (mineTotal-flagCnt) + text.White + "  Current Time: " + text.Gold + totalTime.toFixed(1) + text.White + " secs.");
				
				}
				
			}
			catch (e)	{
				player.print("error=" + e);
			}				
				
			return;

		},	
	});
	
	context.getSession().setTool(player.getItemInHand(), sweeperTool);
	
}

function BuildFlood(vec, session) {
	try {
		var arg = {};
		arg.size = checkFlag("s") ? parseInt(checkFlag("s")) : 50;
		arg.gap = checkFlag("g") ? parseInt(checkFlag("g")) : 0;
		arg.material = checkFlag("b") ? parseBlock(checkFlag("b")) :  new BaseBlock(22);

		var offsetList = [];
		var expandList = [];


		var findBlock = session.getBlock(vec);				
		if (typeof this.blockMask !== 'undefined') {
			if (findBlock.id != this.blockMask.id || findBlock.data != this.blockMask.data) return;
		}
		
		if (findBlock.id < 1) { return; }
		if (findBlock.id === arg.material.id) {
			$print("Block to fill can't be the same as the replacement.");
			return;
		}

		if (arg.gap != 0) {		//generate point list around center block;
			for (var x = -arg.gap; x <= arg.gap; x++) {
				for (var y = -arg.gap; y <= arg.gap; y++) {
					for (var z = -arg.gap; z <= arg.gap; z++) {
						offsetList.push($mc.vector(x, y, z));
					}
				}
			}
		}
		else {
			offsetList = {	//check only on the faces of the center block
				0: Vector(1,0,0),
				1: Vector(-1,0,0),
				2: Vector(0,0,1),
				3: Vector(0,0,-1),
				4: Vector(0,1,0),
				5: Vector(0,-1,0)
			};
		}

		expandList.push(vec);
		setBlock(vec, arg.material);

		//maskSet = (this.brushTool.getMask() === null && $mc.local().getMask() === null) ? false : true;
		var lastFrontDistance = 0;

		for (var inc = 0;  inc < expandList.length; inc++) {

			for(var side in offsetList) {		//check all the sides for more open areas, if found push them to be checked also

				distance = getDistance(vec, expandList[inc].add(offsetList[side]));
				if ( distance > arg.size/2) { continue; }

				//check all the sides for more open areas, if found push them to be checked also
				if (session.getBlock(expandList[inc].add(offsetList[side])).id === findBlock.id) {
					expandList.push(expandList[inc].add(offsetList[side])); 
					//setBlock(expandList[inc].add(offsetList[side]), arg.material);
					setBlock(
						new Vector(
							expandList[inc].x + offsetList[side].x,
							expandList[inc].y + offsetList[side].y,
							expandList[inc].z + offsetList[side].z
						),
						arg.material
					);
					
				}
			}

			if(inc > 15000) break;
			if(inc > 15000 && distance < 7) {
				player.print("Infinite loop detected!");
				player.print("Stopping after " + expandList.length);
				break;
			}

			if(inc > 1500000) {			//check to see if the expanding gets too far out of control
				player.print("Inc past max limit!");
				player.print("Length = " + expandList.length);
				break;
			}
		}
	} 
	catch(e) { 
		$err.handle(e); 
	}

};

function BuildBump(vec, session) {
	// This tool was inspired, and converted from the craftscript brush by the user Blockhead on the worldedit craftscript forums.
	// http://forum.enginehub.org/threads/raise-and-lower-terrain-brush-script.1500/
	var maxY = player.getWorld().getMaxY();
	
	var size = checkFlag("s") ? parseInt(checkFlag("s")) : 8;
	var strength = checkFlag("t") ? parseInt(checkFlag("t")) : 1;
	
	var pos = vec;

	function maybeSetBlock(pos, block) {
		if (BlockType.canPassThrough(getBlock(pos).id)) {
			setBlock(pos, block);
			return true;
		}
		return false;
	}

	//es.getHighestTerrainBlock(pos.x,pos.z, 0, 256, false);	
	
	function moveColumn(z, x, limit) {

		var blockH = es.getHighestTerrainBlock(
			pos.getBlockX() + x,
			pos.getBlockZ() + z,
			Math.max(0, pos.y - size - 1),
			Math.min(maxY, pos.y + size + 1),
			false
		);		
		
		var bpos = new Vector(Math.floor(pos.x) + x, blockH, Math.floor(pos.z) + z);
		var btype = getBlock(bpos);
		if (btype.id  > 7 && btype.id < 12) return;
		var target = blockH;

		/* skip this coordinate if the highest block isn't in our range or
		is air */
		if(blockH >= (Math.floor(pos.y) - size) && blockH <= (Math.floor(pos.y) + size) && btype.id != 0) {
			// a parabolic curve

			var xb = x/size;
			var zb = z/size;
			var s = Math.abs(strength);
			var move = Math.max(0,Math.round(-(s-0.5) * (xb*xb + zb*zb) + s));

			if(strength > 0) {
				// don't push past the top
				target = Math.min(blockH + move,limit !== null ? limit : maxY);
				
				if(target > blockH) {
					var cap = getBlock(bpos.setY(blockH + 1));
					if(maybeSetBlock(bpos.setY(target), btype)) {

						/* if there is something on top of the block other
						than water, lift it too (since
						getHighestTerrainBlock was used, we know it's a
						non-solid block) */
						if(target < maxY) {
							if(cap.id != 0 && cap.id != 8 && cap.id != 9) {
								maybeSetBlock(bpos.setY(target + 1), cap);
							}
						}
					}

					/* fill the remainder with whatever was underneath the
					block */
					var filler = blockH > 0 ? getBlock(bpos.setY(blockH - 1)) : new BaseBlock(0);
					for(var y = blockH; y < target; ++y) {
						setBlock(bpos.setY(y), filler);
					}
				}
				else target = blockH;
			}
			else {
				// don't push past the bottom
				target = Math.max(blockH - move, limit !== null ? limit : 0);

				if(target < blockH) {
					setBlock(bpos.setY(target),btype);

					if(blockH < maxY) {
						var cap = getBlock(bpos.setY(blockH + 1));
						setBlock(bpos.setY(target + 1), cap);

						var filler = (cap.id == 8 || cap.id == 9) ?  cap : new BaseBlock(0);

						for(var y=target+2; y<=blockH; ++y) {
							setBlock(bpos.setY(y), filler);
						}
					}
				} 
				else target = blockH;
			}
		}

		return target;
	}

	/* blocks are not moved past where the middle block is moved, otherwise
	using the brush multiple times makes things very bumpy */
	var limit = moveColumn(0, 0, null);
	
	for(var z = -size; z <= size; ++z) {
		for(var x = -size; x <= size; ++x) {
			if(z || x) moveColumn(z, x, limit);
		}
	}

};

function BuildShoreline(vec, session){
	
	var size = checkFlag("s") ? parseInt(checkFlag("s")) : 7;
	var multi = checkFlag("m") ? parseFloat(checkFlag("m")) : 1;
	var depth = checkFlag("d") ? parseFloat(checkFlag("d")) : 10;
	var block = checkFlag("b") ? parseBlock(checkFlag("b")) :  new BaseBlock(3);
	var mat = (gMat == airMat) ? new BlockPattern(block) : gMat;
	size = gSize != -1 ? gSize : size;	
	
	
	var beach = false;
	var beachSize = 8;
	var beachMat = new BaseBlock(12);
	var beachBase = new BaseBlock(24);
	
	var overwrite = true;
	var edgeHighlight = false;
	var edgeBlock = new BaseBlock(89);
	
	var blacklist = [0,8,9,10,11];
	
	var sideVecs = [new Vector(1,0,0), new Vector(-1,0,0), new Vector(0,0,1), new Vector(0,0,-1)];
	
	var sides = [];
	var shoreHeight = 0;
	var rescan = false;
	
	var depthExt = [3,2,2,1,1,1,2,3,4,5,5,6,6,7];
	
	for (var y = size; y >= 0; y--) {
		for (var x = 0; x <= size; x++) {
			for (var z = 0; z <= size; z++) {
			
				pos = vec.add(x - size/2, y - size/2, z - size/2);
				var curBlock = getBlock(pos);
				
				if (curBlock.id == 8 || curBlock.id == 9) {
					shoreHeight = pos.y;
					break;
				}
			}
			if (shoreHeight > 0) break;			
		}
		if (shoreHeight > 0) break;
	}
	
	if (shoreHeight <= 0) return;

	var cycleSphere = function(x, y, z, d) {
		for (var b = 0; y-b > 0; b++) {
			var bv = new Vector(x,y-b,z);
			var bb = getBlock(bv);
			if (blacklist.indexOf(bb.id) != -1 ) {
				setBlock(bv, mat);
			}
			else {
				break;
			}
		}
	};
	
	var beachSphere = function(x, y, z, d) {
		for (var b = 0; b < 3; b++) {
			var bv = new Vector(x,y+b,z);
			var bb = getBlock(bv);
			if (blacklist.indexOf(bb.id) == -1 ) {
				setBlock(bv, beachMat);
				setBlock(bv.add(0,-1,0), beachBase);
			}
			else {
				break;
			}
		}
	};	
	
	var yd = 0;
	for (var y = shoreHeight; y > shoreHeight - depth; y--) {
		for (var x = 0; x <= size; x++) {
			for (var z = 0; z <= size; z++) {
				
				var pos = vec.add(x - size/2, 0, z - size/2).setY(y);				
				var curBlock = getBlock(pos);
				
				if (blacklist.indexOf(curBlock.id) == -1) {
					
					if (overwrite) {
						var overBlock = getBlock(pos.add(new Vector(0,1,0)));
						if (overBlock.id == 8 || overBlock.id == 9) setBlock(pos, mat);
					}

					for (var i = 0; i < sideVecs.length; i++) sides[i] = getBlock(pos.add(sideVecs[i]));
					
					if (sides[0].id == 8 || sides[0].id == 9 || sides[1].id == 8 || sides[1].id == 9 ||
						sides[2].id == 8 || sides[2].id == 9 || sides[3].id == 8 || sides[3].id == 9)
					{
					
						if (y == shoreHeight && beach == true) {
							var bs = beachSize * 2;
							var cycler = new ShapeCycler(beachSphere, bs, 0, bs);
							cycler.run(pos.add(-.5,0,-.5));
						}
					
						var md = typeof (depthExt[yd]) != 'undefined' ? (depthExt[yd])*2 : Math.floor(yd/2);
						md  = Math.round(md * multi);
						
						var cycler = new ShapeCycler(cycleSphere, md, 0, md);
						cycler.run(pos.add(-.5,-1, -.5));
						
						if (edgeHighlight) setBlock(pos, edgeBlock);
					}
				}
			}
		}
		yd++;
	}
}

function BuildLand(vec, session) {

	var size = checkFlag("s") ? parseInt(checkFlag("s")) : 7;
	var multi = checkFlag("m") ? parseFloat(checkFlag("m")) : 1;
	var block = checkFlag("b") ? parseBlock(checkFlag("b")) :  new BaseBlock(3);
	var mat = (gMat == airMat) ? new BlockPattern(block) : gMat;
	size = gSize != -1 ? gSize : size;
	
	var shoreHeight = 0;
	var sideVecs = [new Vector(1,0,0), new Vector(-1,0,0), new Vector(0,0,1), new Vector(0,0,-1)];
	var sides = [];
	
	var blacklist = [0,8,9,10,11];
	var maxDepth = 14;
	
	var buffer = 5;
	var waterSrc;
	
	var hoo = [];	//water edge vectors	
	
	if (vec.x == 0 && vec.y == 0 && vec.z == 0) {
			
		if (!checkFlag("p")) return;
		
		player.print("Preloading water vectors...");
		var world = context.getSession().getSelectionWorld();
		var region = context.getSession().getWorldSelection(world);
		
		var baseVec = region.getMinimumPoint();
		var width = region.getWidth();
		var length = region.getLength();
		var height = region.getHeight();

		var shoreHeight = 0;
		
		for (var x = 0; x < width; x++)		{
			for (var y = 0; y < height; y++)		{
				for (var z = 0; z < length; z++)		{

					var pos = baseVec.add(x, y, z);
					var curBlock = session.getBlock(pos);
					
					if (curBlock.id == 8 || curBlock.id == 9) {
						shoreHeight = pos.y;
						waterSrc = pos;
						break;
					}
				}
				if (shoreHeight > 0) break;			
			}
			if (shoreHeight > 0) break;
		}
		
		if (shoreHeight <= 0) {
			player.print("No water edge found in selection, preload failed.");
			return;
		}
		
		global.shoreHeight = shoreHeight;
		global.hoo = [];
		
		for (x = 0; x < width; x++)		{
			for (y = 0; y < height; y++)		{
				for (z = 0; z < length; z++)		{

					var pos = baseVec.add(x, y, z);
					var curBlock = session.getBlock(pos);
					
					if (curBlock.id == 8 || curBlock.id == 9) {	//cur block water
						
						for (var i = 0; i < sideVecs.length; i++) sides[i] = session.getBlock(pos.add(sideVecs[i]));
						
						if (blacklist.indexOf(sides[0].id) == -1 || blacklist.indexOf(sides[1].id) == -1 ||
							blacklist.indexOf(sides[2].id) == -1 || blacklist.indexOf(sides[3].id) == -1)
						{
							global.hoo.push(pos);
						}
					}
				}
			}
		}
		
		player.print(this.hoo.length + " water edges found!");
		return;
	}
	
	if (typeof global.shoreHeight != 'undefined') {
		shoreHeight = global.shoreHeight;
		hoo = global.hoo;
	}
	else {	
		for (var y = size; y >= 0; y--) {
			for (var x = 0; x <= size; x++) {
				for (var z = 0; z <= size; z++) {
				
					pos = vec.add(x - size/2, y - size/2, z - size/2);
					var curBlock = getBlock(pos);
					
					if (curBlock.id == 8 || curBlock.id == 9) {
						shoreHeight = pos.y;
						waterSrc = pos;
						break;
					}
				}
				if (shoreHeight > 0) break;			
			}
			if (shoreHeight > 0) break;
		}
		
		if (shoreHeight <= 0) return;

		//locate all the water edges we can take distances from
		for (var x = 0; x <= size*4; x++) {
			for (var z = 0; z <= size*4; z++) {
				
				var pos = waterSrc.add(x - size*2, 0, z - size*2);				
				var curBlock = getBlock(pos);
				
				if (curBlock.id == 8 || curBlock.id == 9) {	//cur block water
					
					for (var i = 0; i < sideVecs.length; i++) sides[i] = getBlock(pos.add(sideVecs[i]));
					
					if (blacklist.indexOf(sides[0].id) == -1 || blacklist.indexOf(sides[1].id) == -1 ||
						blacklist.indexOf(sides[2].id) == -1 || blacklist.indexOf(sides[3].id) == -1)
					{
						hoo.push(pos);
					}
				}
			}
		}	
	
	}

	
	var heightList = [0,0,0,1,2,3,4,5,6,5,4,3,2,1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];
	
	for (var x = 0; x <= size; x++) {
		for (var z = 0; z <= size; z++) {
			
			var pos = vec.add(x - size/2, 0, z - size/2).setY(shoreHeight);				
			var curBlock = getBlock(pos);
			
			if (blacklist.indexOf(curBlock.id) == -1) {	//cur block not water or air, should be solid edge
				
				var minDist = -1;
				for (var inc = 0; inc < hoo.length; inc++) {
					var waterDist = getDistance(pos, hoo[inc]);
					if (waterDist < minDist || minDist == -1) {
						minDist = waterDist;
					}
				}
				
				minDist *= (1/multi);
				
				var top = heightList[Math.floor(minDist/2)];
				
				for (var yInc = 0; yInc <= top + buffer; yInc++) {
					var yv = pos.add(0,yInc,0);
					if(yInc == top) setBlock(yv, new BaseBlock(2));
					else if(yInc > top) setBlock(yv, new BaseBlock(0));
					else setBlock(yv, new BaseBlock(3));
				}
			}
		}
	}	

}





