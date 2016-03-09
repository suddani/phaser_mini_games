define("games/sudi/src/trapdoor", function() {
function TrapDoor(state, group) {
  this.state = state;
  this.group = group;
  this.sprite = this.state.add.sprite(0,0, "trapdoor");
  if (this.group) {
    this.group.add(this.sprite);
  }
  this.sprite.entity = this;
  this.sprite.anchor.set(0.5, 1);
  this.sprite.scale.set(1);
  // this.sprite.animations.add("walk", [0,1,2,3,2,1], 5);
  // this.sprite.animations.add("dead", [4], 5);
  // this.sprite.play("walk", 5, true);

  this.state.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
  this.sprite.body.setSize(32, 8, 0, 0);
  this.sprite.body.immovable = true;
  this.sprite.body.collideWorldBounds = true;
};

TrapDoor.prototype.set = function (property, value) {
  this.properties = this.properties||{};
  this.properties[property]=value;
};

TrapDoor.prototype.get = function (property, value) {
  this.properties = this.properties||{};
  return this.properties[property]||0;
};

TrapDoor.prototype.setPosition = function(x,y) {
  this.x = this.sprite.x = x;
  this.y = this.sprite.y = y;
};

TrapDoor.prototype.damage = function(ammount) {
  // this.kill();
};

TrapDoor.prototype.update = function(dt) {
};

TrapDoor.prototype.interact = function(entity) {
};

TrapDoor.prototype.trigger = function (t, player) {
};

TrapDoor.prototype.trigger_end = function (t, player) {
};

return TrapDoor;
});
