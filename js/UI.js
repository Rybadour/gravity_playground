function UI ()
{
	
}
// Static Variables
UI.middleButton = false;
UI.upKey = false;
UI.downKey = false;
UI.leftKey = false;
UI.rightKey = false;
UI.ctrlKey = false;

UI.initialPoint;
UI.lastPoint;
UI.lastDragPoint;

UI.isSpawning = false;
UI.isSelectOne = false;
UI.isSelecting = false;
UI.selectingObject;
UI.selectedObjects = Array();
UI.centeredIndex = -1;
UI.htmlHighlightedIndex = -1;
UI.highlightedIndex = -1;
UI.highlightedIndexes = new Array();

UI.onDialog = false;
UI.isShowGrid = true;
UI.isShowEntityNames = true;
UI.isShowVelocityVectors = false;

UI.pushLineLength = 20;
UI.gridSpacing = 100;
UI.currGridSpacing = UI.gridSpacing;
UI.dragRate = 1;
UI.scrollSpeed = 10;
UI.minZoomLevel = 1.0;
UI.maxZoomLevel = 50.0;
UI.numZoomSteps = 300;
UI.zoomLevel = 5.0;
UI.zoomPerStep = (UI.minZoomLevel - UI.maxZoomLevel) / UI.numZoomSteps;
UI.gridZoomRate = 2;

UI.isCompatible = false;

// Main working functions
// ------------------------------------------------------------------------------
UI.initialize = function(isCompatible)
{
	UI.initialPoint = new Vector2(0, 0);
	UI.lastPoint = new Vector2(0, 0);
	UI.lastDragPoint = new Vector2(0, 0);
	
	/*
	$("#controlsPanel").dialog({
		autoOpen: true, title: "Controls and Settings",
		closeOnEscape: false, open: function(event, ui) { $(".ui-dialog-titlebar-close").hide(); },
		position: "top", width: 240, height: 500, minWidth: 240, minHeight: 500, maxWidth: 240, resizable: true
	});
	$(".ui-dialog").mouseenter(function ()
	{
		onDialog = true;
	});
	$(".ui-dialog").mouseleave(function ()
	{
		onDialog = false;
	});
	*/

	/* */
	var userAgent = navigator.userAgent.toLowerCase();
	var unsupportedBrowsers = ['trident/4'];
	for (var i = 0; i < unsupportedBrowsers.length; ++i)
	{
		if (userAgent.indexOf(unsupportedBrowsers[i]) > -1)
		{
			isCompatible = false;
			break;
		}
	}
	/* */

	UI.isCompatible = isCompatible;
	$("#compatWarn").dialog({
		autoOpen: !isCompatible,
		title: "Compatibility Warning",
		position: "center", modal: true, resizable: false
	});
	
	$("#tabs").tabs({ fx: {opacity: "toggle"} });
	
	// Volume Slider
	$("#volume").slider({ 
		animate: true,
		step: 5,
		value: Sounds.volume * 100,
		max: 100,
		slide: function(event, ui)
		{
			Sounds.changeVolume(ui.value/100);
			$("#volumePercent").html(Sounds.formatVolumeHTML());
		}
	});
	$("#volumePercent").html(Sounds.formatVolumeHTML());
	
	UI.displayZoomLevel();
	
	$("#gravityApp").bind("contextmenu", function ()
	{
		return false;
	});
	
	$("#gridSpacing").val(UI.gridSpacing);
	
	$("#mapWidth").val(mapMax.x - mapMin.x);
	$("#mapHeight").val(mapMax.y - mapMin.y);

	UI.updateEntityButtons();
}

UI.getVectorToScreen = function(vector)
{
    var newVector = vector.getExtend(1/UI.zoomLevel);
    return newVector.add(screenOffset);
}

UI.getVectorFromScreen = function(vector)
{
    var newVector = vector.minus(screenOffset);
    newVector.extend(UI.zoomLevel);
    return newVector;
}

UI.drawUnder = function()
{
    var mapEdgeTop = UI.getVectorToScreen(mapMin); 
    mapEdgeTop.x = max(mapEdgeTop.x, 0);
    mapEdgeTop.y = max(mapEdgeTop.y, 0);
    var mapEdgeBottom = UI.getVectorToScreen(mapMax);
    mapEdgeBottom.x = min(mapEdgeBottom.x, canvas.width);
    mapEdgeBottom.y = min(mapEdgeBottom.y, canvas.height);

	// Draw the grid
	// ===========================================================================
	if (UI.isShowGrid)
	{
		pen.strokeStyle = "rgb(150, 150, 150)";
		pen.fillStyle = "rgb(100, 100, 100)";
		pen.font = "10px sans-serif";
		pen.lineWidth = 1;
		
		pen.beginPath();

        var currGridZoom = (UI.zoomLevel%UI.gridZoomRate) + 1;
        UI.currGridSpacing = UI.gridSpacing * (1/currGridZoom);
		
		var cols = canvas.width / UI.currGridSpacing;
		var colOffset = screenOffset.x % UI.currGridSpacing;
		
		var rows = canvas.height/UI.currGridSpacing;
		var rowOffset = screenOffset.y % UI.currGridSpacing;
		
		var valOffset = 5;
		
		// Columns
		for (var c = 0; c < cols + 1; ++c)
		{
			var x = c*UI.currGridSpacing + colOffset;
		
			var cVal = parseInt(x - screenOffset.x);
			cVal = Math.round(cVal/UI.currGridSpacing)*UI.currGridSpacing;
            cVal = parseInt(cVal *UI.zoomLevel);
			
			// Only draw the grid lines if they are inside the map
			if (cVal > mapMin.x && cVal < mapMax.x)
			{
				pen.fillText(cVal, x + valOffset, mapEdgeTop.y + valOffset + 5);
				
				pen.moveTo(x, mapEdgeTop.y);
				pen.lineTo(x, mapEdgeBottom.y);
			}
		}
		
		// Rows
		for (var r = 0; r < rows + 1; ++r)
		{
			var y = r*UI.currGridSpacing + rowOffset;
			
			var rVal = parseInt(y - screenOffset.y);
			rVal = Math.round(rVal/UI.currGridSpacing)*UI.currGridSpacing;
            rVal = parseInt(rVal *UI.zoomLevel);
			
			// Only draw the grid lines if they are inside the map
			if (rVal > mapMin.y && rVal < mapMax.y)
			{
				pen.fillText(-rVal, mapEdgeTop.x + valOffset, y + valOffset + 5);
				
				pen.moveTo(mapEdgeTop.x, y);
				pen.lineTo(mapEdgeBottom.x, y);
			}
		}
		
		pen.stroke();
		pen.closePath();
		
		// Draw the 0 lines darker
		pen.beginPath();
		pen.lineWidth = 2;
		pen.strokeStyle = "rgb(0, 0, 0)";
		
		if (screenOffset.x > 0 && screenOffset.x < canvas.width)
		{
			pen.moveTo(screenOffset.x, mapEdgeTop.y);
			pen.lineTo(screenOffset.x, mapEdgeBottom.y);
		}
		if (screenOffset.y > 0 && screenOffset.y < canvas.height)
		{
			pen.moveTo(mapEdgeTop.x, screenOffset.y);
			pen.lineTo(mapEdgeBottom.x, screenOffset.y);
		}
		
		pen.stroke();
		pen.closePath();
	}	
}

UI.drawOver = function()
{
	// Draw the edge of the map
	// ===========================================================================
    var mapEdgeTop = UI.getVectorToScreen(mapMin); 
    mapEdgeTop.x = max(mapEdgeTop.x, 0);
    mapEdgeTop.y = max(mapEdgeTop.y, 0);
    var mapEdgeBottom = UI.getVectorToScreen(mapMax);
    mapEdgeBottom.x = min(mapEdgeBottom.x, canvas.width);
    mapEdgeBottom.y = min(mapEdgeBottom.y, canvas.height);

	pen.beginPath();
	pen.lineWidth = 3;
	pen.strokeStyle = "rgb(0, 0, 0)";
	// Left edge
	if (mapEdgeTop.x > 0)
	{
		pen.moveTo(mapEdgeTop.x, mapEdgeTop.y);
		pen.lineTo(mapEdgeTop.x, mapEdgeBottom.y);
	}
	// Right edge
	if (mapEdgeBottom.x < canvas.width)
	{
		pen.moveTo(mapEdgeBottom.x, mapEdgeTop.y);
		pen.lineTo(mapEdgeBottom.x, mapEdgeBottom.y);
	}
	// Top edge
	if (mapEdgeTop.y > 0)
	{
		pen.moveTo(mapEdgeTop.x, mapEdgeTop.y);
		pen.lineTo(mapEdgeBottom.x, mapEdgeTop.y);
	}
	// Bottom edge
	if (mapEdgeBottom.y < canvas.height)
	{
		pen.moveTo(mapEdgeTop.x, mapEdgeBottom.y);
		pen.lineTo(mapEdgeBottom.x, mapEdgeBottom.y);
	}
	pen.stroke();
	pen.closePath();

    // And Draw the white just outside of the map boundry to cover entities just skimming the edge
    pen.fillStyle = "white";
    // Left
    if (mapEdgeTop.x > 0)
    {
        pen.fillRect(0, 0, mapEdgeTop.x-1, canvas.height - mapEdgeTop.y);
    }
    // Right
    if (mapEdgeBottom.x < canvas.width)
    {
        pen.fillRect(mapEdgeBottom.x+1, mapEdgeTop.y, canvas.width - mapEdgeBottom.x, canvas.height - mapEdgeTop.y);
    }
    // Top
    if (mapEdgeTop.y > 0)
    {
        pen.fillRect(0, 0, canvas.width, mapEdgeTop.y-1);
    }
    // Bottom
    if (mapEdgeBottom.y < canvas.height)
    {
        pen.fillRect(0, mapEdgeBottom.y+1, canvas.width, canvas.height - mapEdgeBottom.y);
    }

	// Draw the selection box and selection boxes around entities inside
	if (UI.isSelecting)
	{
		pen.beginPath();
		pen.lineWidth = 2;
		pen.strokeStyle = "rgb(160, 160, 160)";
		pen.fillStyle = "rgba(0, 0, 0, 0.1)";
		penMoveTo(UI.initialPoint);
		pen.lineTo(UI.initialPoint.x, UI.lastPoint.y);
		penLineTo(UI.lastPoint);
		pen.lineTo(UI.lastPoint.x, UI.initialPoint.y);
		penLineTo(UI.initialPoint);
		pen.stroke();
		pen.fill();
		pen.closePath();
		
		// Draw blue boxes around entities inside the selection box
		for (var i in UI.highlightedIndexes)
		{
			var ind = UI.highlightedIndexes[i];
			if ( !UI.ctrlKey || $.inArray(ind, UI.selectedObjects) == -1 )
			{
				var pos = ObjectManager.objects[ind].getPosition();
				pen.strokeStyle = "rgb(51, 102, 255)";
				var boxSize = ObjectManager.objects[ind].getSelectionRadius();
				UI.drawSelectionBox(pos, boxSize);
			}
		}
	}
	// Draw next spawning entity
	else if (UI.isSpawning)
	{
        var entityPos = UI.getVectorFromScreen(UI.initialPoint);
		var e = new Entity(entityPos.x, entityPos.y, parseInt($("#entityMass").val()), 0, 0, $("#entityMovable:checked").length == 1);
		e.draw();
		
		var oppPoint = UI.initialPoint.minus(UI.lastPoint);
		
		if (oppPoint.getMag() != 0)
		{
			var arrowSize = 10; //px
			var arrowPoint = oppPoint.getExtend(0.9);
			var arrowSide = oppPoint.getNormalized();
			arrowSide.extend(arrowSize);
			arrowSide.reverse();
			var side1 = arrowSide.getRotate(Math.PI/4);
			var side2 = arrowSide.getRotate(-Math.PI/4);
			side1 = oppPoint.add(side1);
			side2 = oppPoint.add(side2);
			
			oppPoint = UI.initialPoint.add(oppPoint);
			side1 = UI.initialPoint.add(side1);
			side2 = UI.initialPoint.add(side2);
		
			pen.beginPath();
			pen.strokeStyle = "rgb(0, 0, 0)";
			pen.lineWidth = 1;
			penMoveTo(UI.initialPoint);
			penLineTo(oppPoint);
			penLineTo(side1);
			penMoveTo(oppPoint);
			penLineTo(side2);
			pen.stroke();
			pen.closePath();
		}
	}
	
	// Draw Selection boxes around selected Entities
	for (var i = 0; i != UI.selectedObjects.length; ++i)
	{
		var ind = UI.selectedObjects[i];
		if ( $.inArray(ind, UI.highlightedIndexes) != -1 )
			continue;	
	
		var obj = ObjectManager.objects[ind];
		if (UI.htmlHighlightedIndex == ind)
		{
			pen.strokeStyle = "rgb(51, 102, 255)";
			pen.fillStyle = "rgb(51, 102, 255)";
		}
		else
		{
			pen.strokeStyle = "rgb(0, 0, 0)";
			pen.fillStyle = "rgb(0, 0, 0)";
		}
		
		var pos = obj.getPosition();
		var boxSize = obj.getSelectionRadius();
		UI.drawSelectionBox(pos, boxSize);
		//pen.fillText(ind, pos.x + boxSize/2 + 3, pos.y - boxSize/2 - 3);
	}
	
	// Draw the index/name of the entity if that option is enabled
	if (UI.isShowEntityNames)
	{
		var textOffset;
		for (var i = 0; i != ObjectManager.objects.length; ++i)
		{	
			var obj = ObjectManager.objects[i];
			var pos = obj.getPosition();
			var radius = obj.getRadius();
			
			pen.font = "10px sans-serif";
			pen.fillStyle = "rgb(0, 0, 0)";
		
			if (radius < 1 && !obj.selected)
				textOffset = 9 - (1 - radius)*8;
			else
				textOffset = radius + 8;

			pen.fillText(i, pos.x + textOffset, pos.y - textOffset);
		}
	}
	
	// Draw a blue selection box around the one entity being moused over
	if (UI.highlightedIndex != -1)
	{
		var object = ObjectManager.objects[UI.highlightedIndex];
		pen.strokeStyle = "rgb(51, 102, 255)";
		var boxSize = object.getSelectionRadius();
		UI.drawSelectionBox(object.getPosition(), boxSize);
	}
	
	// Draw Arrow on centered entity
	if (UI.centeredIndex != -1)
	{
		var aPos = ObjectManager.objects[UI.centeredIndex].getPosition();
		aPos.y -= ObjectManager.objects[UI.centeredIndex].getRadius() + 10;
			
		pen.beginPath();
		pen.fillStyle = "rgb(0, 0, 0)";
		pen.moveTo(aPos.x, aPos.y);
		pen.lineTo(aPos.x + 8, aPos.y - 8);
		pen.lineTo(aPos.x + 2, aPos.y - 8);
		pen.lineTo(aPos.x + 2, aPos.y - 20);
		pen.lineTo(aPos.x - 2, aPos.y - 20);
		pen.lineTo(aPos.x - 2, aPos.y - 8);
		pen.lineTo(aPos.x - 8, aPos.y - 8);
		pen.moveTo(aPos.x, aPos.y);
		pen.fill();
		pen.closePath();
	}
	
	// Draw Pause box when sim is paused
	if (isPaused)
	{
		var width = 90;
		var height = 30;
		var pos = new Vector2(canvas.width/2 - width/2, 50);
		
		pen.fillStyle = "rgba(255, 50, 50, 0.2)";
		pen.roundedRect(pos.x - 2, pos.y - 2, width + 4, height + 4, 8, true);
		pen.fillStyle = "rgba(255, 50, 50, 0.85)";
		pen.roundedRect(pos.x, pos.y, width, height, 8, true);
		
		pen.fillStyle = "rgba(255, 255, 255, 0.9)";
		pen.font = "bold 20px serif";
		pen.fillText("Paused", pos.x + 15, pos.y + 21);
	}

	// Draw lines from entities representing their current velocity
	if (UI.isShowVelocityVectors)
	{
		var obj;
		var pos, end, dir;
		var arrowSize = 10; //px
		var arrowPoint, arrowSide, side1, side2;
		for (var i in ObjectManager.objects)
		{
			obj = ObjectManager.objects[i];

			pos = obj.getPosition();
			dir = UI.getVectorToScreen(obj.pos.add(obj.velo)).minus(pos);
			dir.extend(1/pushConst);
			dir.extend(0.5);

			arrowPoint = dir.getExtend(0.9);
			arrowSide = dir.getNormalized();
			arrowSide.extend(arrowSize);
			arrowSide.reverse();

			side1 = arrowSide.getRotate(Math.PI/4).add(dir);
			side2 = arrowSide.getRotate(-Math.PI/4).add(dir);
			
			dir.addTo(pos);
			side1.addTo(pos);
			side2.addTo(pos);
		
			pen.beginPath();
			pen.strokeStyle = "rgb(0, 0, 0)";
			pen.lineWidth = 1;
			penMoveTo(pos);
			penLineTo(dir);
			penLineTo(side1);
			penMoveTo(dir);
			penLineTo(side2);
			pen.stroke();
			pen.closePath();
		}
	}
}

UI.update = function()
{
	// Set num of entities
	$("#numEntities").html(ObjectManager.objects.length);

	// Move the map based on the arrow keys pressed
	if (UI.upKey)
		screenOffset.y += UI.scrollSpeed;
	if (UI.downKey)
		screenOffset.y -= UI.scrollSpeed;
	if (UI.leftKey)
		screenOffset.x += UI.scrollSpeed;
	if (UI.rightKey)
		screenOffset.x -= UI.scrollSpeed;
		
	// Enable highlighting of entities inside the selection box
	UI.highlightedIndexes = new Array();
	var nextIndex = 0;
	if (UI.isSelecting)
	{
		for (var i = 0; i != ObjectManager.objects.length; ++i)
		{
			var pos = ObjectManager.objects[i].getPosition();

			if ( min(UI.initialPoint.x, UI.lastPoint.x) < pos.x && max(UI.initialPoint.x, UI.lastPoint.x) > pos.x )
			{
				// AND
				if ( min(UI.initialPoint.y, UI.lastPoint.y) < pos.y && max(UI.initialPoint.y, UI.lastPoint.y) > pos.y )
				{
					UI.highlightedIndexes[nextIndex] = i;
					++nextIndex;
				}
			}
		}
	}
	
	// Enable highlight of a single entity on mouse over
	if (!UI.isSpawning)
	{
		var closestObject = -1;
		var closestDist = 0;
		for (var i in ObjectManager.objects)
		{
			var object = ObjectManager.objects[i];
			var cPos = object.getPosition();
			cPos = cPos.minus(UI.lastPoint);
			if (cPos.getMag() <= object.getSelectionRadius())
			{
				if (closestObject == -1 || closestDist > cPos.getMag())
				{
					closestDist = cPos.getMag();
					closestObject = i;
				}
			}
		}
		if (closestObject == -1)
			UI.highlightedIndex = -1;
		else
			UI.highlightedIndex = closestObject;
	}
	
	// Recenter the screen on the centered entity
	if (UI.centeredIndex != -1)
	{
		var pos = ObjectManager.objects[UI.centeredIndex].pos;
		screenOffset.x = canvas.width/2 - pos.x * (1/UI.zoomLevel);
		screenOffset.y = canvas.height/2 - pos.y * (1/UI.zoomLevel);
	}
}

// Some helper functions
// ------------------------------------------------------------------------------
UI.drawSelectionBox = function (pos, boxSize)
{
	pen.beginPath();
	pen.lineJoin = "round";
	var cornerSize = boxSize * 0.2;
		
	pen.lineWidth = (parseInt(boxSize / 4) > 2 ? 2 : parseInt(boxSize / 4));
	
	var a = pos.minus(new Vector2(boxSize/2, boxSize/2))
	var b = a.add(new Vector2(boxSize, 0));
	var c = a.add(new Vector2(boxSize, boxSize));
	var d = a.add(new Vector2(0, boxSize));

	pen.moveTo(a.x, a.y + cornerSize);
	penLineTo(a);
	pen.lineTo(a.x + cornerSize, a.y);
	
	pen.moveTo(b.x - cornerSize, b.y);
	penLineTo(b);
	pen.lineTo(b.x, b.y + cornerSize);
	
	pen.moveTo(c.x, c.y - cornerSize);
	penLineTo(c);
	pen.lineTo(c.x - cornerSize, c.y);
	
	pen.moveTo(d.x + cornerSize, c.y);
	penLineTo(d);
	pen.lineTo(d.x, d.y - cornerSize);
	
	pen.stroke();
	pen.closePath();
}

// Operations on Selected Entities
// ------------------------------------------------------------------------------
UI.deleteSelected = function()
{
	while (UI.selectedObjects.length != 0)
		ObjectManager.removeEntity(UI.selectedObjects[0]);
	UI.clearEntityList();
}

UI.toggleSelectedMovability = function()
{
	for (var i in UI.selectedObjects)
	{
		var ind = UI.selectedObjects[i];
		ObjectManager.objects[ind].movable = !(ObjectManager.objects[ind].movable);
		ObjectManager.objects[ind].velo = new Vector2(0, 0);
	}
}

UI.centerOnSelected = function()
{
	if (UI.selectedObjects.length == 1)
		UI.centeredIndex = UI.selectedObjects[0];
}

UI.viewSelected = function()
{
	if (UI.selectedObjects.length == 1)
	{
		screenOffset = new Vector2(canvas.width/2, canvas.height/2);
		screenOffset = screenOffset.minus( ObjectManager.objects[UI.selectedObjects[0]].pos.getExtend(1/UI.zoomLevel) );

        UI.centeredIndex = -1;
	}
}

// Managing Lists Functions
// ------------------------------------------------------------------------------
UI.removeEntity = function(i)
{
	var notAlready = true;
	var length = UI.selectedObjects.length;
	for (var s = 0; s < length; ++s)
	{
		if (UI.selectedObjects[s] == i && notAlready)
		{
			UI.selectedObjects.splice(s, 1);
			--s;
			notAlready = false;
		}
		else if (UI.selectedObjects[s] > i)
		{
			--UI.selectedObjects[s];
		}
	}
	
	if (UI.centeredIndex == i)
		UI.centeredIndex = -1;
	else if (UI.centeredIndex > i)	
		--UI.centeredIndex;

	if (UI.selectingObject == i)
		UI.selectingObject = -1;
	else if (UI.selectingObject > i)	
		--UI.selectingObject;

    UI.reformSelectedList();
}

UI.clearEntityList = function()
{
	$("#selectedList tr.entity").remove();
	
	UI.updateEntityButtons();
}

UI.reformSelectedList = function()
{
	UI.clearEntityList();
	for (var i = 0; i < UI.selectedObjects.length; ++i)
		UI.addEntityToList(UI.selectedObjects[i]);
}

UI.clearSelectedList = function()
{
	for (var i = 0; i < UI.selectedObjects.length; ++i)
		ObjectManager.objects[UI.selectedObjects[i]].selected = false;
	UI.selectedObjects.splice(0, UI.selectedObjects.length);
}

UI.updateEntityButtons = function()
{
	$(".entityButton").attr("disabled", "disabled");

	if (UI.selectedObjects.length == 1)
	{
		$(".singleAction").removeAttr("disabled");
	}

	if (UI.selectedObjects.length > 0)
	{
		$(".manyAction").removeAttr("disabled");
	}
}


// Direct HTML events
// --------------------------------------------------------------------------------
UI.massChange = function(input)
{
	var entity = ObjectManager.objects[$(input).parent().siblings(".index").html()];
	entity.mass = parseInt($(input).val());
}

UI.movableChange = function(input)
{
	var entity = ObjectManager.objects[$(input).parent().siblings(".index").html()];
	entity.movable = input.checked;
}

UI.highlightEntity = function(row)
{
	UI.htmlHighlightedIndex = parseInt($(row).children("td.index").html());
}

UI.unhighlightEntity = function(row)
{
	UI.htmlHighlightedIndex = -1;
}

UI.showGrid = function(checkbox)
{
	UI.isShowGrid = checkbox.checked;
}

UI.showEntityNames = function(checkbox)
{
	UI.isShowEntityNames = checkbox.checked;
}

UI.showEffects = function(checkbox)
{
	EffectManager.isShowEffects = checkbox.checked;
}

UI.showVelocityVectors = function(checkbox)
{
	UI.isShowVelocityVectors = checkbox.checked;
}

UI.useHighSpeedCollision = function(checkbox)
{
	Entity.isHighSpeedCollisionChecking = checkbox.checked;
}

UI.changeGridSpacing = function()
{
	UI.gridSpacing = parseInt($("#gridSpacing").val());
}

UI.changeMapWidth = function()
{
	mapMin.x = -parseInt($("#mapWidth").val())/2;
	mapMax.x = -mapMin.x;
}

UI.changeMapHeight = function()
{
	mapMin.y = -parseInt($("#mapHeight").val())/2;
	mapMax.y = -mapMin.y;
}


// Working direction with the DOM
// --------------------------------------------------------------------------------
$(window).resize(function ()		
{
	if (!UI.isCompatible)
		return;

	var center = screenOffset.minus(new Vector2(canvas.width/2, canvas.height/2));

	canvas.width  = window.innerWidth - 40 - 20*2 - 270;
	canvas.height = window.innerHeight - 66 - 20*2;

	frontCanvas.width = canvas.width;
	frontCanvas.height = canvas.height;
	
	screenOffset.x = canvas.width/2 - center.x;
	screenOffset.y = canvas.height/2 - center.y;
});

UI.addEntityToList = function(i)
{
	$("#selectedList").append("<tr class=\"entity\" onmouseover=\"UI.highlightEntity(this)\" onmouseout=\"UI.unhighlightEntity(this)\">"+
								 "<td class=\"index\">"+i+"</td>"+
								 "<td><input type=\"text\" value=\""+ObjectManager.objects[i].mass+"\" onchange=\"UI.massChange(this)\" /></td>"+
								 "<td><input type=\"checkbox\" "+(ObjectManager.objects[i].movable ? "checked=\"checked\"" : "")+" onclick=\"UI.movableChange(this)\" /></td></tr>");
								 
	UI.updateEntityButtons();
}

// Key Events
// --------------------------------------------------------------------------------
$(document).keydown(function(event)
{
	if (!UI.isCompatible)
		return;

	var keyCode; 
	if (event == null)
		keyCode = window.event.keyCode; 
	else
		keyCode = event.keyCode;
	keyDown( getKeyFromCode(keyCode) );
});

$(document).keyup(function(event)
{
	if (!UI.isCompatible)
		return;

	var keyCode; 
	if (event == null)
		keyCode = window.event.keyCode;
	else
		keyCode = event.keyCode;
	keyUp( getKeyFromCode(keyCode) );
});

function getKeyFromCode(keyCode)
{
	if (keyCode == 17)
		return "CTRL";
	var key = String.fromCharCode(keyCode);
	if (key == "&")
		key = "UP";
	if (key == "(")
		key = "DOWN";
	if (key == "%")
		key = "LEFT";
	if (key == "'")
		key = "RIGHT";
	
	return key;
}

function keyDown(key)
{
	switch (key)
	{
		case 'UP':
			UI.upKey = true;
			break;
			
		case 'DOWN':
			UI.downKey = true;
			break;
			
		case 'LEFT':
			UI.leftKey = true;
			break;
			
		case 'RIGHT':
			UI.rightKey = true;
			break;
			
		case 'CTRL':
			UI.ctrlKey = true;
			break;
	}
}

function keyUp(key)
{
	switch (key)
	{
		case 'D':
			UI.deleteSelected();
			break;
			
		case 'M':
			UI.toggleSelectedMovability();
			break;
			
		case 'L':
			UI.centerOnSelected();
			break;

		case 'V':
			UI.viewSelected();
			break;
			
		case ' ':
			togglePause();
			break;
			
		case 'UP':
			UI.upKey = false;
			break;
			
		case 'DOWN':
			UI.downKey = false;
			break;
			
		case 'LEFT':
			UI.leftKey = false;
			break;
			
		case 'RIGHT':
			UI.rightKey = false;
			break;
			
		case 'CTRL':
			UI.ctrlKey = false;
			break;
	}
}


// Mouse Events
// --------------------------------------------------------------------------------
$(document).mousedown(function (e)
{
	if (!UI.isCompatible)
		return;

	filterMouse(e.clientX, e.clientY, e, mouseDown, true);
});

$(document).mouseup(function (e)
{
	if (!UI.isCompatible)
		return;

	filterMouse(e.clientX, e.clientY, e, mouseUp, false);
});

$(document).mousemove(function (e)
{
	if (!UI.isCompatible)
		return;

	filterMouse(e.clientX, e.clientY, e, mouseMove, false);
});

function filterMouse(x, y, e, func, insideCheck)
{
	var nx = x - canvas.offsetLeft;
	var ny = y - canvas.offsetTop;
	
	if (insideCheck && (nx < 0 || nx > canvas.width || ny < 0 || ny > canvas.height))
		return;
	
	func(nx, ny, e);
}

function mouseDown(x, y, e)
{
    // If any mouse actions are already being used, don't start another
    if (UI.isSelectOne || UI.isSelecting || UI.isSpawning || UI.middleButton)
        return;

	if (UI.onDialog)
	{
		// Skip the rest of the actions
	}
	// If the right mouse button is held
	else if (e.which == 3)
	{
		UI.isSpawning = true;
	
		UI.initialPoint.x = x;
		UI.initialPoint.y = y;

		UI.lastPoint.x = x;
		UI.lastPoint.y = y;
	}
	else if (e.which == 2)
	{
		UI.centeredIndex = -1;
		
		UI.lastDragPoint.x = x;
		UI.lastDragPoint.y = y;
		
		UI.middleButton = true;
	}
	else if (e.which == 1)
	{
		// Check if the mouse is near enough to an entity
		var found = false;
		var mousePos = new Vector2(x, y);
		for (var i = 0; i != ObjectManager.objects.length; ++i)
		{
			var object = ObjectManager.objects[i];
			
			var cPos = object.getPosition();
			cPos = cPos.minus(mousePos);
			if (cPos.getMag() <= object.getSelectionRadius())
			{
				found = true;
				UI.selectingObject = i;
				break;
			}
		}
		
		if (found)
			UI.isSelectOne = true;
        else
		    UI.isSelecting = true;

		UI.initialPoint.x = x;
		UI.initialPoint.y = y;

        $("#gravityApp").click();
	}
}

function mouseUp(x, y, e)
{
	var mousePos = new Vector2(x, y);
	
	if (UI.onDialog)
	{
		// Skip the rest of the actions
	}
    // Select the one closest entity
	else if (UI.isSelectOne && e.which == 1)
	{
		var object = ObjectManager.objects[UI.selectingObject];
		var cPos = object.getPosition();
		cPos = cPos.minus(mousePos);
		if (cPos.getMag() <= object.getSelectionRadius())
		{
			// Empty the list of selected objects and add this one if ctrl is not clicked
			if (!e.ctrlKey)
			{
				UI.clearSelectedList();
				UI.clearEntityList();
			}
			
			if (object.selected)
			{
				if (e.ctrlKey)
				{
					object.selected = false;
					UI.selectedObjects.splice($.inArray(UI.selectingObject, UI.selectedObjects), 1);
					UI.reformSelectedList();
				}
			}
			else
			{
				UI.selectedObjects.push(UI.selectingObject);
                object.selected = true;
				UI.addEntityToList(UI.selectingObject);
			}
		}

	    UI.selectingObject = null;
	    UI.isSelectOne = false;
	}
    // Select all the entities inside the selection box now drawn
	else if (UI.isSelecting && e.which == 1)
	{
		if (!e.ctrlKey)
		{
			UI.clearSelectedList();
			UI.clearEntityList();
		}
		
		for (var i = 0; i != ObjectManager.objects.length; ++i)
		{
			var pos = ObjectManager.objects[i].getPosition();

			if ( min(UI.initialPoint.x, x) < pos.x && max(UI.initialPoint.x, x) > pos.x )
			{
				// AND
				if ( min(UI.initialPoint.y, y) < pos.y && max(UI.initialPoint.y, y) > pos.y )
				{
					if (ObjectManager.objects[i].selected)
					{
						if (e.ctrlKey)
						{
							ObjectManager.objects[i].selected = false;
							UI.selectedObjects.splice($.inArray(i, UI.selectedObjects), 1);
							UI.reformSelectedList();
						}
					}
					else
					{
						UI.selectedObjects.push(i);
						ObjectManager.objects[i].selected = true;
						UI.addEntityToList(i);
					}
				}
			}
		}

	    UI.isSelecting = false;
	}
	// Add new entity
	else if (UI.isSpawning && e.which == 3)
	{
		var diffV = new Vector2(0, 0);
		if ($("#entityMovable:checked").length == 1)
		{
			diffV = UI.initialPoint.minus(new Vector2(x, y));
			diffV.extend(pushConst);
            diffV.extend(UI.zoomLevel);
			if (UI.centeredIndex != -1)
				diffV = diffV.add(ObjectManager.objects[UI.centeredIndex].velo);
		}
		
        var initialOffset = UI.getVectorFromScreen(UI.initialPoint);
		
		ObjectManager.objects.push(
			new Entity(initialOffset.x, initialOffset.y, 
					   parseInt($("#entityMass").val()), diffV.x, diffV.y,
					   $("#entityMovable:checked").length == 1)
		);

	    UI.isSpawning = false;
	}
	
	if (e.which == 2)
		UI.middleButton = false;
}

function mouseMove(x, y, e)
{
	var mousePos = new Vector2(x, y);

	if (UI.lastPoint == null)
	{
		UI.lastPoint = new Vector2(x, y);
	}
	else
	{
		UI.lastPoint.x = x;
		UI.lastPoint.y = y;
	}

    if (UI.isSelectOne)
    {
		var object = ObjectManager.objects[UI.selectingObject];
		var cPos = object.getPosition();
		cPos = cPos.minus(mousePos);
		if (cPos.getMag() > object.getSelectionRadius())
        {
            UI.isSelectOne = false;
            UI.isSelecting = true;
        }
    }

    if (UI.isSelectOne || UI.isSelecting || UI.isSpawning)
        return;

	// UI.middleButtton is used to fix onmousemove problems in Firefox and IE
	if (e.which == 2 || UI.middleButton)
	{
		var diff = UI.lastPoint.minus(UI.lastDragPoint);
		diff.extend(UI.dragRate);
		screenOffset = screenOffset.add(diff);

		// Ensure you cannot drag the view outside the map
        var zoomedMapMin = mapMin.getExtend(1/UI.zoomLevel);
        var zoomedMapMax = mapMax.getExtend(1/UI.zoomLevel);
		var mapEdgeTop = screenOffset.add(zoomedMapMin);
		var mapEdgeBottom = screenOffset.add(zoomedMapMax);
		mapEdgeTop = mapEdgeTop.minus(new Vector2(canvas.width/2, canvas.height/2));
		mapEdgeBottom = mapEdgeBottom.add(new Vector2(canvas.width/2, canvas.height/2));

        // If the screen is found to be outside the bounds, move it back to the edge
		if (mapEdgeTop.x > 0)
			screenOffset.x = -(zoomedMapMin.x - canvas.width/2);
		if (mapEdgeTop.y > 0)
			screenOffset.y = -(zoomedMapMin.y - canvas.height/2);
		if (mapEdgeBottom.x < canvas.width)
			screenOffset.x = -(zoomedMapMax.x - canvas.width/2);
		if (mapEdgeBottom.y < canvas.height)
			screenOffset.y = -(zoomedMapMax.y - canvas.height/2);
			
		UI.lastDragPoint = UI.lastPoint.getValue();
	}
}

document.onmousewheel = function (e)
{
	mouseScroll(e.wheelDelta/60);
	return false;
}

if (document.addEventListener)
{
	document.addEventListener("DOMMouseScroll", function (e)
	{
		mouseScroll(e.detail);	
	}, false);
}

function mouseScroll(value)
{
	UI.changeZoomBy(value);
}

// Zooming Functions
// --------------------------------------------------------------------------------
UI.changeZoomBy = function(zoomSteps)
{
    var zoomChange = zoomSteps * UI.zoomPerStep;
	var oldZoom = UI.zoomLevel;
	UI.zoomLevel += zoomChange;
	if (zoomChange > 0)
		UI.zoomLevel = min(UI.zoomLevel, UI.maxZoomLevel);
	else
		UI.zoomLevel = max(UI.zoomLevel, UI.minZoomLevel);
	UI.displayZoomLevel();
	
	var screenRadius = new Vector2(canvas.width/2, canvas.height/2);
	var newScreenPos = screenOffset.minus(screenRadius);
	newScreenPos.extend( 1 / (UI.zoomLevel/oldZoom) );
	screenOffset = newScreenPos.add(screenRadius);
}

UI.getVectorAppliedZoom = function(vector)
{
    return vector.getExtend(1/UI.zoomLevel);
}

UI.displayZoomLevel = function()
{
	$("#zoomLevel").html(UI.zoomLevel.toPrecision(4) + " m/pixel");
}
