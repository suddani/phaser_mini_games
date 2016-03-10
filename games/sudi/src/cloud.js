define("games/sudi/src/cloud", function() {
function Cloud(state, group) {
  this.state = state;
  this.group = group;
  this.sprite = this.state.add.sprite(0,0,"atlas", "cloud")
  if (this.group) {
    this.group.add(this.sprite);
  }
  this.sprite.entity = this;
  this.sprite.anchor.set(0.04, 0.97);
  this.sprite.scale.set(1);
  this.sprite.angle = 0;

  // this.sprite.animations.add("walk", [0,1,2,3,2,1], 5);
  // this.sprite.animations.add("dead", [4], 5);
  // this.sprite.play("walk", 5, true);

  this.state.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
  this.sprite.body.setSize(32, 32, 0, 0);
  this.sprite.body.immovable = true;
  this.sprite.body.collideWorldBounds = true;
  // this.sprite.exists = false
};

Cloud.prototype.set = function (property, value) {
  this.properties = this.properties||{};
  this.properties[property]=value;
};

Cloud.prototype.get = function (property, value) {
  this.properties = this.properties||{};
  return this.properties[property]||0;
};

Cloud.prototype.setPosition = function(x,y) {
  // this.sparks.x =
  this.x = this.sprite.x = x;
  // this.sparks.y =
  this.y = this.sprite.y = y;
};

Cloud.prototype.damage = function(ammount) {
  // this.kill();
};

Cloud.prototype.update = function(dt) {
  this.sprite.tilePosition.x+=13*dt;
};

Cloud.prototype.interact = function(entity) {
  entity.damage();
};

Cloud.prototype.trigger = function (t, player) {
};

Cloud.prototype.trigger_end = function (t, player) {
};

return Cloud;
});
