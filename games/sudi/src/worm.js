define("games/sudi/src/worm", ["games/sudi/src/sound_system",
function(SoundSystem) {
function Worm(state, group) {
  this.state = state;
  this.group = group;
  this.sprite = this.state.add.sprite(0,0, "wormbullet");
  if (this.group) {
    this.group.add(this.sprite);
  }
  this.sprite.entity = this;
  this.sprite.anchor.set(0.5,1);
  this.sprite.animations.add("idle", [0,1,2,1], 5);
  this.sprite.play("idle", 10, true);
  this.sprite.scale.set(0.8);

  this.state.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
  this.sprite.body.setSize(22, 8, 0, -10);
  this.sprite.body.immovable = false;
  this.sprite.body.collideWorldBounds = true;
  // this.sprite.body.gravity.y = 300;
  this.sprite.body.bounce.set(1);

  this.x = 0;
  this.y = 0;
  this.up = true;
};

Worm.prototype.interact = function (entity) {
  entity.set("worms", entity.get("worms")+2);
  SoundSystem.play("pickup");
  this.owner = null;
  this.manager = null;
  this.sprite.entity = null;
  this.sprite.destroy();
};

Worm.prototype.set = function (property, value) {
  this.properties = this.properties||{};
  this.properties[property]=value;
};

Worm.prototype.get = function (property, value) {
  this.properties = this.properties||{};
  return this.properties[property]||0;
};

Worm.prototype.setPosition = function(x,y) {
  this.x = this.sprite.x = x;
  this.y = this.sprite.y = y;
};

Worm.prototype.update = function(dt) {
};

return Worm;
}]);
