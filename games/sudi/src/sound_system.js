define("games/sudi/src/sound_system", function(){
function SoundSystem() {
  this.volume = 0.05
};

SoundSystem.prototype.init = function(game) {
  this.game = game;
  this.sounds = {
    "jump"   : this.game.add.audio('jump'),
    "loss"   : this.game.add.audio('loss'),
    "pickup" : this.game.add.audio('pickup')
  };
  this.music = {
    "standard": this.game.add.audio("Netherplace_Looping", 1, true, true),
    "boss": this.game.add.audio("Goblin-Loop", 1, true, true),
    "cave": this.game.add.audio("Secret-Journey_Looping", 1, true, true),
    "win": this.game.add.audio("Dont-Mess-with-the-8-Bit-Knight", 1, true, true)
  }
};

SoundSystem.prototype.shutdown = function() {
  for (var i in this.music) {
    this.music[i].stop();
  }
};

SoundSystem.prototype.preload = function(game) {
  this.game = game;
  this.game.load.audio('jump', 'audio/jump.wav');
  this.game.load.audio('loss', 'audio/loss.wav');
  this.game.load.audio('pickup', 'audio/pickup.wav');
  this.game.load.audio('Netherplace_Looping', 'audio/Netherplace_Looping.mp3');
  this.game.load.audio('Goblin-Loop', 'audio/Goblin-Loop.mp3');
  this.game.load.audio('Secret-Journey_Looping', 'audio/Secret-Journey_Looping.mp3');
  this.game.load.audio('Dont-Mess-with-the-8-Bit-Knight', 'audio/Dont-Mess-with-the-8-Bit-Knight.mp3');
};

SoundSystem.prototype.play = function(name) {
  this.sounds[name].play('', 0, this.volume);
};

SoundSystem.prototype.theme = function(name) {
  for (var i in this.music) {
    this.music[i].stop();
  }
  this.music[name].restart('', 0, this.volume, true);
};

return new SoundSystem();
}
);
