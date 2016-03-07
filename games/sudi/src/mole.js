define("games/sudi/src/mole", [
  "games/sudi/src/sound_system",
  "games/sudi/src/hud",
function(SoundSystem, HUD) {
function Mole(state, group) {
  this.state = state;
  this.group = group;
  this.sprite = this.state.add.sprite(0,0, "mole");
  if (this.group) {
    this.group.add(this.sprite);
  }
  this.sprite.entity = this;
  this.sprite.anchor.set(0, 1);
  this.sprite.animations.add("idle", [0,1,2,1], 5);
  this.sprite.animations.add("attack", [3,4,5,6,7], 5);
  this.sprite.animations.add("hidden", [8], 1);
  this.sprite.play("idle", 5, true);

  this.state.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
  this.sprite.body.setSize(32, 32, 0, 0);
  this.sprite.body.immovable = true;
  this.sprite.body.collideWorldBounds = true;
}

Mole.prototype.set = function (property, value) {
  this.properties = this.properties||{};
  this.properties[property]=value;
};

Mole.prototype.get = function (property, value) {
  this.properties = this.properties||{};
  return this.properties[property]||0;
};

Mole.prototype.setPosition = function(x,y) {
  this.x = this.sprite.x = x;
  this.y = this.sprite.y = y;
}

Mole.prototype.update = function(dt) {
  if (this.dead_timer!= null) {
    this.dead_timer-=dt;
    if (this.dead_timer <= 0) {
      this.sprite.kill();
    }
    return;
  }
}

Mole.prototype.interact = function(entity) {
  if (this.sprite.body.touching.up){
    this.dead_timer = 1;
    this.sprite.play("hidden");
    SoundSystem.play("loss");
    // HUD.hideBars();
  }
  else {
    this.sprite.play("hidden");
    // HUD.showBars();
  }
    // onLose();
}

return Mole;
}]);
