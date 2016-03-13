define("games/sudi/src/cloud", function() {
function Cloud(state, group) {
  this.state = state;
  this.group = group;
  this.sprite = this.state.add.sprite(0,0,"atlas", "cloud_0000")
  if (this.group) {
    this.group.add(this.sprite);
  }
  this.sprite.entity = this;
  this.sprite.anchor.set(0.5, 0.5);
  this.sprite.scale.set(1);
  this.sprite.angle = 0;

  this.sprite.animations.add("die", Phaser.Animation.generateFrameNames('cloud_', 0, 7, '', 4), 12);
  this.sprite.animations.add("spawn", Phaser.Animation.generateFrameNames('cloud_', 0, 7, '', 4).reverse(), 12);
  // this.sprite.animations.add("dead", [4], 5);
  // this.sprite.play("walk", 5, true);

  this.state.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
  this.sprite.body.setSize(32, 10, 0, 8);
  this.sprite.body.immovable = true;
  this.sprite.body.collideWorldBounds = true;

  this.dead = false;
  this.respawn = 1;
  this.respawn_timer = 0;
};

Cloud.prototype.set = function (property, value) {
  if (property=="despawn" && JSON.parse(value)) this.sprite.exists = false;
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
};

Cloud.prototype.shouldCollide = function(entity) {
  return entity.sprite.body.velocity.y >= 0;
}

Cloud.prototype.update = function(dt) {
  if (!this.sprite.exists) return;

  if (this.dead) {
    // console.log("check for respawn: "+this.respawn_timer)
    if (this.respawn_timer > 0)
      this.respawn_timer -= dt;
    else {
      this.dead = false;
      this.sprite.body.enable = true;
      this.sprite.play("spawn");
    }
  }
};

Cloud.prototype.interact = function(entity) {
  if (!this.dead && this.sprite.body.touching.up) {
    this.respawn_timer = this.respawn;
    this.dead = true;
    this.sprite.body.enable = false;
    this.sprite.play("die");
  }
};

Cloud.prototype.trigger = function (t, player) {
  if (!this.sprite.exists) {
    this.sprite.exists = true;
    this.dead = false;
    this.sprite.body.enable = true;
    this.sprite.play("spawn");
  }
};

Cloud.prototype.trigger_end = function (t, player) {
};

return Cloud;
});
