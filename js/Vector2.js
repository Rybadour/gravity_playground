function Vector2(x, y)
{
	this.x = x;
	this.y = y;
	
	this.getValue = function ()
	{
		return new Vector2(this.x, this.y);
	}
	
	this.getMag = function ()
	{
		return Math.sqrt(this.x*this.x + this.y*this.y);
	}
	
	this.getExtend = function (n)
	{
		return new Vector2(this.x * n, this.y * n);
	}
	
	this.extend = function (n)
	{
		this.x *= n;
		this.y *= n;
	}
	
	this.getNormalized = function ()
	{
		var mag = this.getMag();
		if (mag == 0)
			return new Vector2(0, 0);
		return new Vector2(this.x/mag, this.y/mag);
	}
	
	this.normalize = function ()
	{
		var mag = this.getMag();
		if (mag != 0)
		{
			this.x /= mag;
			this.y /= mag;
		}
	}
	
	this.getReverse = function ()
	{
		return new Vector2(-this.x, -this.y);
	}
	
	this.reverse = function ()
	{
		this.x = -this.x;
		this.y = -this.y;
	}
	
	this.getRotate = function (r)
	{
		var sin = Math.sin(r);
		var cos = Math.cos(r);
		return new Vector2(this.x * cos - this.y * sin,
		                   this.x * sin + this.y * cos);
	}
	
	this.rotate = function (r)
	{
		var sin = Math.sin(r);
		var cos = Math.cos(r);
		var newX = this.x * cos - this.y * sin;
		this.y = this.x * sin + this.y * cos;
		this.x = newX;
	}
	
	this.add = function (b)
	{
		return new Vector2(this.x + b.x, this.y + b.y);
	}

	this.addTo = function (b)
	{
		this.x += b.x;
		this.y += b.y;
	}
	
	this.minus = function (b)
	{
		return new Vector2(this.x - b.x, this.y - b.y);
	}

	this.minusTo = function (b)
	{
		this.x -= b.x;
		this.y -= b.y;
	}
	
	this.equal = function (b)
	{
		return this.x == b.x && this.y == b.y;
	}
}
