function EffectManager()
{
}

// Static variables
EffectManager.effects = new Array();

EffectManager.isShowEffects = true;


// Static functions

EffectManager.update = function()
{
    for (var i in EffectManager.effects)
    {
        EffectManager.effects[i].update();
        
        if (EffectManager.effects[i].radius > EffectManager.effects[i].maxRadius)
           EffectManager.removeEffect(i);             
    }
}

EffectManager.draw = function()
{
    if (!EffectManager.isShowEffects)
        return;

    for (var i in EffectManager.effects)
        EffectManager.effects[i].draw();
}

EffectManager.generateEffect = function(x, y, mass)
{
    var newEffect = new RippleEffect(x, y, mass);
    EffectManager.effects.push(newEffect);
}

EffectManager.removeEffect = function(i)
{
	EffectManager.effects.splice(i, 1);
}
