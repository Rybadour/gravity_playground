function PathLayer()
{
}

PathLayer.pathWidth = 2;

PathLayer.drawSegment = function (v1, v2) 
{
	frontPen.save();
	frontPen.beginPath();

	frontPen.strokeStyle = "rgb(0, 0, 0)";
	frontPen.lineWidth = PathLayer.pathWidth;

	frontPen.moveTo(v1.x, v1.y);
	frontPen.lineTo(v2.x, v2.y);
	frontPen.stroke();

	frontPen.restore();
}

PathLayer.clear = function()
{
	frontPen.clearRect(0, 0, frontPen.width, frontPen.height);
}
