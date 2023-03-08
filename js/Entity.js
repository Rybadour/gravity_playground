function Entity(x, y, mass, vx, vy, movable)
{
	this.pos = new Vector2(x, y);
	this.mass = mass;
	this.velo = new Vector2(vx, vy);
	this.movable = movable;
	this.selected = false;
	
    this.getRealRadius = function()
    {
		//return max(Math.sqrt(this.mass), 1);
        return max(Math.log(this.mass), 1);
    }

	this.getRadius = function ()
	{
		return this.getRealRadius()/UI.zoomLevel;
	}
	
	this.getPosition = function ()
	{
        return UI.getVectorToScreen(this.pos);
	}
	
	this.getSelectionRadius = function ()
	{
        return this.getRadius()*2 + 10;
	}
	
	this.draw = function ()
	{
		var position = this.getPosition();
		var rad = this.getRadius();
		if (position.x < -rad || position.x > canvas.width + rad ||
		    position.y < -rad || position.y > canvas.height + rad)
		{
			return;
		}
		
		pen.beginPath();
		pen.shadowBlur = 5;
		pen.shadowColor = "rgb("+(this.mass > 255 ? 255 : this.mass)+", 0, 0)";
		
		pen.fillStyle = "rgb("+(this.mass > 255 ? 255 : this.mass)+", 0, 0)";
		pen.arc(position.x, position.y, rad, Math.PI*2, 0, false);
		pen.fill();
		pen.closePath();
		
		if (!this.movable)
		{
			pen.globalCompositeOperation = "destination-out";
			
			pen.beginPath();
			pen.arc(position.x, position.y, rad * 0.6, Math.PI*2, 0, false);
			pen.fill();
			pen.closePath();
			
			pen.globalCompositeOperation = "source-over";
		}

		pen.shadowBlur = 0;
		pen.shadowColour = "rgb(0, 0, 0)";
	}
	
	this.update = function ()
	{
		if (this.movable)
		{
			PathLayer.drawSegment(this.pos, this.pos.add(this.velo));

			this.pos.x += this.velo.x;
			this.pos.y += this.velo.y;
		}
	}
	
	this.applyForce = function (f)
	{
		if (this.movable)
		{
			this.velo.x += (f.x/this.mass);
			this.velo.y += (f.y/this.mass);
		}
	}
}

Entity.isHighSpeedCollisionChecking = false;

Entity.isCollide = function (a, b)
{
	var aPos = a.pos.getValue();
	var bPos = b.pos.getValue();

    var cPos = aPos.minus(bPos);
	var aRad = a.getRealRadius();
	var bRad = b.getRealRadius();

	// If the two Entities are touching right now
	// They are colliding, and ignore the more accurate check
	if (cPos.getMag() > aRad + bRad)
	{
		// High Speed Collision checking
		// Equation from: http://individual.utoronto.ca/michael_lucarz/circle_collision_tutorial/eqtn3.png
		// Or if that link is broken: http://compsci.ca/v3/viewtopic.php?t=14897

		// First check if the two entities are even near each other
		if (cPos.getMag() > aRad + bRad + a.velo.getMag() + b.velo.getMag() || !Entity.isHighSpeedCollisionChecking)
			return null;

		// Then do the expensive checks
		//var A = 2 * (-aPos.x * a.velo.x - aPos.y * a.velo.y + a.velo.x * bPos.x + a.velo.y * bPos.y + aPos.x * b.velo.x - bPos.x * b.velo.x + aPos.y * b.velo.y - bPos.y * b.velo.y);
		//var B = 2 * ((a.velo.x*a.velo.x) + (a.velo.y*a.velo.y) - 2 * a.velo.x * b.velo.x + (b.velo.x*b.velo.x) - 2 * a.velo.y * b.velo.y + (b.velo.y*b.velo.y));
		//var C = (aPos.x*aPos.x) + (aPos.y*aPos.y) - (aRad*aRad) - 2 * aPos.x * bPos.x + (bPos.x*bPos.x) - 2 * aPos.y * bPos.y + (bPos.y*bPos.y) - 2 * aRad * bRad - (bRad*bRad);
		var cVelo = b.velo.minus(a.velo);
		var A = 2 * (cPos.x * (cVelo.x) + cPos.y * (cVelo.y));
		var B = 2 * (cVelo.x*cVelo.x) + (cVelo.y*cVelo.y); 
		var C = cPos.x*cPos.x + cPos.y*cPos.y - Math.pow(aRad - bRad, 2); 

		var inside = (A*A) - 2 * B * C;
		if (inside < 0 || B == 0) 
			return null;

		t1 = A + Math.sqrt(inside);
		t1 /= B;
		t2 = A - Math.sqrt(inside);
		t2 /= B;

		// If both solutions lie outside of our expected range return a null collision point
		if (t1 < 0 || t1 > 1 && t2 < 0 || t2 > 1)
			return null;

		// Setup a and b for the collision point logic below
		// Only use the lowest valid time
		if (t1 >= 0 && t1 <= 1)
		{
			if (t2 >= 0 && t2 <= 1)
				t1 = min(t1, t2);
		}
		else
			t1 = t2;

		aPos = a.pos.add( a.velo.getExtend(t1) );
		bPos = b.pos.add( b.velo.getExtend(t1) );
	}

	// Find the collision point
	// Use b as the point of reference if it's biggest
	if (b.mass > a.mass)
	{
		var swap = aPos;
		aPos = bPos;
		bPos = swap;

		aRad = bRad;
	}

	cPos = bPos.minus(aPos);
	cPos.normalize();
	cPos.extend(aRad);

	return aPos.add(cPos);
}
