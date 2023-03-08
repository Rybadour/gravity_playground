// Globals
var canvas;
var pen;

var frontCanvas;
var frontPen;

var gConst = 6.6;
var pushConst = 0.01;
var loopRate = 25;

var screenOffset = new Vector2(0, 0);
var mapMin = new Vector2(-8000, -8000);
var mapMax = new Vector2(8000, 8000);
var isPaused = false;

var drawPaths = true;

var soundPath = "sounds/";

$(document).ready(function()
{
	var isCompatible = true;
	canvas = $("#gravityApp").get(0);
	if (canvas.getContext)
	{
		pen = canvas.getContext('2d');
		frontCanvas = document.createElement("canvas");
		frontPen = frontCanvas.getContext('2d');

		canvas.width  = window.innerWidth - 40 - 20*2 - 270;
		canvas.height = window.innerHeight - 66 - 20*2;

		frontCanvas.width = canvas.width;
		frontCanvas.height = canvas.height;
		
		screenOffset.x = canvas.width/2;
		screenOffset.y = canvas.height/2;
		
		Sounds.initialize();
	}
	else
		isCompatible = false;

	UI.initialize(isCompatible);

	if (isCompatible)
		setInterval(loop, loopRate);
});

function loop()
{
	draw();
	
	if (!isPaused)
		update();
	UI.update();
}

function draw()
{
	pen.clearRect(0, 0, pen.canvas.width, pen.canvas.height);
	
	UI.drawUnder();

	ObjectManager.draw();
    EffectManager.draw();

	UI.drawOver();
}

function update()
{
	ObjectManager.update();

    EffectManager.update();
}

function togglePause()
{
	isPaused = !isPaused;
	$("#pause").val(isPaused ? "Unpause" : "Pause");
	Sounds.playSound("pause");
}

function toggleMute()
{
	Sounds.isMuted = !Sounds.isMuted;
	$("#mute").val(Sounds.isMuted ? "UnMute" : "Mute");
	
	if (Sounds.isMuted)
		$("#volume").slider("disable");
	else
		$("#volume").slider("enable");
}
