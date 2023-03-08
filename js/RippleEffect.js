function RippleEffect(x, y, mass)
{
    this.pos = new Vector2(x, y);
    this.radius = 1.0;
    this.maxRadius = Math.sqrt(mass) * (2 + 40/mass);

    this.getPosition = function()
    {
        return UI.getVectorToScreen(this.pos);
    }

    this.update = function()
    {
        this.radius += RippleEffect.radiusExpandRate * Math.sqrt(this.radius);
    }

    this.draw = function()
    {    
        var pos = this.getPosition();

		pen.beginPath();
		pen.shadowBlur = 0;
        pen.lineWidth = 1;
	
        var colour = max( parseInt((this.radius/this.maxRadius)*255 - 100), 0);

		pen.strokeStyle = "rgb("+colour+","+colour+","+colour+")";
		pen.arc(pos.x, pos.y, this.radius*(1/UI.zoomLevel), Math.PI*2, 0, false);
		pen.stroke();
		pen.closePath();
    }
}

RippleEffect.radiusExpandRate = 0.75;
