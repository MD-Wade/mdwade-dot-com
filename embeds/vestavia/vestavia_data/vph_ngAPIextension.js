/*
	Newgrounds API Extension for Game Maker Studio (v1.4)
	by Feudal Crest Game Studios

** The API was not tested in GMS 2. It is recommended to have a manual backup of the project before using the extension.
** The API integration is incomplete. Only medal and scoreboard functionalities are implemented.

Version 1.0.3, August 17th, 2017
*/

var ngio,ngio_scoreboards,ngio_medals,ngio_block,ngio_console;
var ngio_api=false;

function ngInit(argument0,argument1,argument2,argument3)
{
// Initiates the NG API. arg0=app_id, arg1=encryption key, arg2=host block action., arg3=console enable/disable
// Returns false if error occurred, true if worked.
ngio_console=argument3;
if (argument3) ngConsole("NG.io FCR GMS Console enabled!",0);
try	{ngio = new Newgrounds.io.core(argument0,argument1);}
catch (errx)
	{
	ngConsole("ngInit ERROR="+errx,2);
	ngio=-1;
	ngio_api=false;
	return false;
	}
ngConsole("NG.io initiated without errors thrown...",0);
// Host block event. If arg2==0 then does nothing, ==1 then deactivates API (ngio_api=false), ==2 redirects (also deactivating ngio_api).
ngio_block=argument2;
ngio_api=true;
ngio.addEventListener("movieConnected",function()
	{
	switch (ngio_block)
		{
		default: ngConsole("NG.io initialised in blacklisted host...",1);
		case 0: break;
		case 2: ngio.loadOfficialUrl(); ngConsole("Redirecting to official URL...",1);
		case 1: ngio_api=false; ngConsole("NG.io API disabled.",1); break;
		}
	});
if (!ngio_api) return false;
// Forces an actual initialization.
ngio.getSessionLoader();
ngio.getValidSession();
ngConsole("NG.io API initiated successfully.",0);
return true;
}

function ngAPI()
{
// Checks if the NG API is running (true or false).
return ngio_api;
}

// USER FUNCTIONS AND SESSION

function ngUser()
{
// Returns whether a NG user is playing the game.
return ngio.user;
}

function ngUserName()
{
// Returns the current user.
if (!ngUser()) return "";
else return ngio.user.name;
}

function ngSession()
{
// Returns the current session.
return ngio.getSession();
}

function ngLoginError()
{
// Returns the last login error.
return ngio.getLoginError();
}

// DEBUGGING

function ngGetDebug()
{
// Returns whether the API is in debug mode or not.
return ngio.debug;
}

function ngSetDebug(argument0)
{
// Sets the API to debug mode or not.
ngio.debug=argument0;
}

// SCORE/MEDAL FUNCTIONS

function ngLoad(argument0,argument1)
{
// Loads all scoreboards and/or medals from the server. arg0=boolean to load scores, arg1=medals.
if (argument0==true)
	{
	ngConsole("Attempting to queue scoreboards...",0);
	ngio.queueComponent("ScoreBoard.getBoards",{},function(result) 
		{
		if (result.success) ngio_scoreboards=result.scoreboards;
		ngLoadResult(result,"scoreboards");
		});
	}
if (argument1==true)
	{
	ngConsole("Attempting to queue medals...",0);
	ngio.queueComponent("Medal.getList",{},function(result)
		{
		if (result.success) ngio_medals=result.medals;
		ngLoadResult(result,"medals");
		});
	}
ngConsole("Execute queue!",0);
ngio.executeQueue();
}

function ngMedalUnlock(argument0)
{
// Unlocks the medal with the defined ID.
var stt=false;
var slen=ngio_medals.length;
var stlen=slen.toString();
var medal,idstr;
for (var i=0; i<slen; i++)
	{
	medal=ngio_medals[i];
	idstr=medal.id.toString();
	ngConsole("Iterating ngio_medals, i="+i.toString()+" length="+stlen+" name="+medal.name+" id="+idstr,0);
	if (medal.unlocked) 
		{
		ngConsole("Medal already unlocked.",0);
		continue;
		}
	else if (medal.id!=argument0) 
		{
		ngConsole("Medal ID different from input.",0);
		continue;
		}
	ngConsole("Attempting to unlock medal, name="+medal.name+" id="+idstr,0);
	ngio.callComponent('Medal.unlock',{id:argument0},ngPostResult);
	break;
	}
return stt;
}

function ngScorePost(argument0,argument1)
{
// Sets score argument1 to the board argument0. Returns false if error occurred.
var score;
var stt=false;
var slen=ngio_scoreboards.length;
var stlen=slen.toString();
for (var i=0; i<slen; i++)
	{
	score=ngio_scoreboards[i];
	ngConsole("Iterating ngio_scoreboards, i="+i.toString()+" length="+stlen,0);
	if (score.id!=argument0) continue;
	ngio.callComponent('ScoreBoard.postScore',{id:argument0,value:argument1},ngPostResult);
	break;
	}
return stt;
}

// INTERNAL FUNCTIONS

function ngLoadResult(result,name)
{
if (result.success) ngConsole("Data queued successfully. Queue="+name,0);
else ngConsole("DATA QUEUE ERROR Queue="+name+" Error="+result.error.message,2);
}

function ngPostResult(result)
{
// Returns whether the post has been successful or not.
if (result.success)
	{
	ngConsole("Data successfully posted.",0);
	stt=true;
	}
else
	{
	ngConsole("POST ERROR="+result.error.message,2);
	stt=false;
	}
}

function ngConsole(txt,type)
{
// Outputs console if enabled. type0=log, 1=warn, 2=error.
if (!ngio_console) return;
switch (type)
	{
	case 0: console.log(txt); break;
	case 1: console.warn(txt); break;
	case 2: console.error(txt); break;
	}
}