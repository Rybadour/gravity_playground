function LineSegment(v1, v2)
{
	this.v1 = v1.getValue();
	this.v2 = v2.getValue();
	
	this.getLength = function()
	{
		var diff = v2.minus(v1);
		return diff.getMag();
	}
}

LineSegment.intersect = function(l1, l2)
{
	var p1 = l1.v1;
	var p2 = l1.v2;
	var p3 = l2.v1;
	var p4 = l2.v2;
	
	var denom = (p4.y - p3.y)*(p2.x - p1.x) - (p4.x - p3.x)*(p2.y - p1.y);

	// Lines are parallel
	if (denom == 0)
		return null;
	
	var Ua = ((p4.x - p3.x)*(p1.y - p3.y) - (p4.y - p3.y)*(p1.x - p3.x)) / denom;
	var Ub = ((p2.x - p1.x)*(p1.y - p3.y) - (p2.y - p1.y)*(p1.x - p3.x)) / denom;
	
	if (Ua < 0 || Ua > 1 || Ub < 0 || Ub > 1)
	{
		return null;
	}
	else
	{
		var length = l1.getLength();
		var intersect = l1.v2.minus(l1.v1);
		intersect.extend(Ua);
		return l1.v1.add(intersect);
	}
}

LineSegment.isIntersect = function(l1, l2)
{
	var p1 = l1.v1;
	var p2 = l1.v2;
	var p3 = l2.v1;
	var p4 = l2.v2;
	
	var denom = (p4.y - p3.y)*(p2.x - p1.x) - (p4.x - p3.x)*(p2.y - p1.y);

	var Ua = ((p4.x - p3.x)*(p1.y - p3.y) - (p4.y - p3.y)*(p1.x - p3.x)) / denom;	
	var Ub = ((p2.x - p1.x)*(p1.y - p3.y) - (p2.y - p1.y)*(p1.x - p3.x)) / denom;
	
	return (Ua >= 0 && Ua <= 1 && Ub >= 0 && Ub <= 1);	
}
