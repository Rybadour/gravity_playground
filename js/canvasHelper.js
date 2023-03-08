function penMoveTo(v)
{
	pen.moveTo(v.x, v.y);
}

function penLineTo(v)
{
	pen.lineTo(v.x, v.y);
}

if (typeof CanvasRenderingContext2D != "undefined")
{
	CanvasRenderingContext2D.prototype.roundedRect = function(x, y, width, height, radius, isFill)
	{
		if (typeof isFill == "undefined" )
			isFill = false;
		if (typeof radius == "undefined")
			radius = 5;

		this.beginPath();
		this.moveTo(x + radius, y);
		this.lineTo(x + width - radius, y);
		this.quadraticCurveTo(x + width, y, x + width, y + radius);
		this.lineTo(x + width, y + height - radius);
		this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
		this.lineTo(x + radius, y + height);
		this.quadraticCurveTo(x, y + height, x, y + height - radius);
		this.lineTo(x, y + radius);
		this.quadraticCurveTo(x, y, x + radius, y);
		this.closePath();

		if (isFill) 
			this.fill();
		else
			this.stroke();
	}
}
