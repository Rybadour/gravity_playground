function Sounds()
{

}
Sounds.maxSoundChannels = 20;
Sounds.volume = 0.15;
Sounds.isMuted = false;

Sounds.channels = new Array();
Sounds.lastChannel = -1;
Sounds.files = {collide: 'collide.ogg', pause: 'pause.ogg'};

Sounds.initialize = function()
{
	for (var i in Sounds.files)
	{
		var file = Sounds.files[i];
		$("#gravityApp").append($('<audio id="sound_'+file+'" src="sounds/'+file+'" preload="auto">'));
	}
	
	for (var i = 0; i != Sounds.maxSoundChannels; ++i)
	{
		Sounds.channels[i] = new Audio();
		Sounds.channels[i].volume = Sounds.volume;
	}
}

Sounds.playSound = function(soundName)
{
	if (Sounds.isMuted)
		return;

	var file = Sounds.files[soundName];
	var aElement = document.getElementById("sound_"+file);
	
	Sounds.lastChannel = Sounds.lastChannel == Sounds.channels.length-1 ? 0 : Sounds.lastChannel + 1;
	var i = Sounds.lastChannel;
	
	Sounds.channels[i].src = aElement.src;
	Sounds.channels[i].load();
	Sounds.channels[i].play();
}

Sounds.changeVolume = function(volume)
{
	Sounds.volume = volume;
	for (var i = 0; i != Sounds.channels.length; ++i)
		Sounds.channels[i].volume = volume;
}

Sounds.formatVolumeHTML = function()
{
	return (Sounds.volume < 0.1 ? "00" : Sounds.volume < 1 ? "0" : "")+parseInt(Sounds.volume*100)+"%";
}