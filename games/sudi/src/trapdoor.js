define("games/sudi/src/trapdoor", function() {
function TrapDoor(state, group) {
  this.state = state;
  this.group = group;
  this.sprite = this.state.add.sprite(0,0, "trapdoor");
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
  this.sprite.body.setSize(64, 10, 0, 0);
  this.sprite.body.immovable = true;
  this.sprite.body.collideWorldBounds = true;

  this.opened = false;
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
  if (this.opened && this.sprite.angle < 90)  {
    this.sprite.angle += 45*dt;
  } else if (!this.opened && this.sprite.angle>=0) {
    this.sprite.angle -= 45*dt;
  }
};

TrapDoor.prototype.open = function() {
  this.opened = true;
}

TrapDoor.prototype.close = function() {

}

TrapDoor.prototype.interact = function(entity) {
  if (this.opened && this.sprite.angle >= 90)
    this.opened = false;
  else if (!this.opened && this.sprite.angle<=0)
    this.opened = true;
};

TrapDoor.prototype.trigger = function (t, player) {
};

TrapDoor.prototype.trigger_end = function (t, player) {
};

return TrapDoor;
});
