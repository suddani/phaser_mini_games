define("games/sudi/src/sound_system", function(){
function SoundSystem() {
}

SoundSystem.prototype.init = function(game) {
  this.game = game;
  this.sounds = {
    "jump"   : game.add.audio('jump'),
    "loss"   : game.add.audio('loss'),
    "pickup" : game.add.audio('pickup')
  };
}

SoundSystem.prototype.preload = function(game) {
  this.game = game;
  game.load.audio('jump', 'audio/jump.wav');
  game.load.audio('loss', 'audio/loss.wav');
  game.load.audio('pickup', 'audio/pickup.wav');
}

SoundSystem.prototype.play = function(name) {
  this.sounds[name].play();
}

return new SoundSystem();
}
);
