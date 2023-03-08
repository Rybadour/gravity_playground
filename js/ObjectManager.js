function ObjectManager ()
{

}
ObjectManager.objects = Array();

ObjectManager.removeEntity = function (i)
{
	ObjectManager.objects.splice(i, 1);

    UI.removeEntity(i);
}

ObjectManager.deleteAll = function()
{
	while (ObjectManager.objects.length != 0)
		ObjectManager.removeEntity(0);
	UI.clearEntityList();
}

ObjectManager.draw = function()
{
	for (var i = 0; i < ObjectManager.objects.length; ++i)
	{
		ObjectManager.objects[i].draw(screenOffset);
	}
}

ObjectManager.update = function()
{
	var force;
	var cPos;
	var collisionSpot;
	var effectMass;
	for (var i = 0; i < ObjectManager.objects.length; ++i)
	{
		// Update the object
		var obj = ObjectManager.objects[i];
		obj.update();

		// Check if the entity falls off the map
		if ( obj.pos.x < mapMin.x || obj.pos.x > mapMax.x ||
				obj.pos.y < mapMin.y || obj.pos.y > mapMax.y)
		{
			ObjectManager.removeEntity(i);
		}
	}

	var collisionSpot;
	var effectMass;
	for (var i = 0; i < ObjectManager.objects.length; ++i)
	{
		var obj = ObjectManager.objects[i];

		for (var j = i+1; j < ObjectManager.objects.length; ++j)
		{
			var objB = ObjectManager.objects[j];

			// Gravity
			cPos = obj.pos.minus(objB.pos);
			force = gConst * (obj.mass * objB.mass)/(cPos.getMag()*cPos.getMag());
			cPos.normalize();
			cPos.extend(force);
			obj.applyForce(cPos.getReverse());
			objB.applyForce(cPos);

			// Collision Checks
			collisionSpot = Entity.isCollide(obj, objB);
			if (collisionSpot != null)
			{
				if (obj.mass > objB.mass)
				{
					obj.mass += objB.mass;
					obj.applyForce(objB.velo.getExtend(objB.mass));

					effectMass = objB.mass;
					ObjectManager.removeEntity(j);
				}
				else
				{
					objB.mass += obj.mass;
					objB.applyForce(obj.velo.getExtend(obj.mass));

					effectMass = obj.mass;
					ObjectManager.removeEntity(i);
				}

				EffectManager.generateEffect(collisionSpot.x, collisionSpot.y, effectMass);
				Sounds.playSound("collide");
				break;
			}
		}
	}
}
