define("games/sudi/src/lava", function() {
function Lava(state, group) {
  this.state = state;
  this.group = group;
  this.sprite = this.state.add.tileSprite(0,0,32,64, "atlas", "lavaanim_0000");
  if (this.group) {
    this.group.add(this.sprite);
  }
  this.sprite.entity = this;
  this.sprite.anchor.set(0.04, 0.97);
  this.sprite.scale.set(1);
  this.sprite.angle = 0;
  this.sprite.exists = false

  this.sparks = this.state.add.emitter(100, 450, 50);
  this.sparks.makeParticles("jack", [0]);
  this.sparks.maxParticleScale = 1;
  this.sparks.minParticleScale = 1;
  this.sparks.setYSpeed(-50, -150);
  this.sparks.gravity = 0;
  this.sparks.width = 32;
  this.sparks.minRotation = 0;
  this.sparks.maxRotation = 40;
  // this.sprite.animations.add("walk", [0,1,2,3,2,1], 5);
  // this.sprite.animations.add("dead", [4], 5);
  // this.sprite.play("walk", 5, true);

  this.state.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
  this.sprite.body.setSize(32, 64, 0, 0);
  this.sprite.body.immovable = true;
  this.sprite.body.collideWorldBounds = true;
  // this.sprite.exists = false
};

Lava.prototype.set = function (property, value) {
  if (property == "width") {
    this.sparks.width = value*32;
    this.sprite.width = value*32;
    this.sprite.body.setSize(value*32, 64, 0, 0);
  }
  this.properties = this.properties||{};
  this.properties[property]=value;
};

Lava.prototype.get = function (property, value) {
  this.properties = this.properties||{};
  return this.properties[property]||0;
};

Lava.prototype.setPosition = function(x,y) {
  // this.sparks.x = 
  this.x = this.sprite.x = x;
  // this.sparks.y =
  this.y = this.sprite.y = y;
};

Lava.prototype.damage = function(ammount) {
  // this.kill();
};

Lava.prototype.update = function(dt) {
  this.sprite.tilePosition.x+=13*dt;
};

Lava.prototype.interact = function(entity) {
  entity.damage();
};

Lava.prototype.trigger = function (t, player) {
};

Lava.prototype.trigger_end = function (t, player) {
};

return Lava;
});
