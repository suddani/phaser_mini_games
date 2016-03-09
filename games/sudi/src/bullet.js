define("games/sudi/src/bullet", function() {
function Bullet(state, group) {
  this.state = state;
  this.group = group;
  this.sprite = this.state.add.sprite(0,0, "wormbullet");
  if (this.group) {
    this.group.add(this.sprite);
  }
  this.sprite.entity = this;
  this.sprite.anchor.set(0.5,1);
  this.sprite.animations.add("idle", [0,1,2,1], 5);
  this.sprite.animations.add("die", [3,4,5,6,7,8], 5);
  this.sprite.play("idle", 10, true);
  this.sprite.scale.set(0.8);

  this.state.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
  this.sprite.body.setSize(22, 8, 0, -10);
  this.sprite.body.immovable = false;
  this.sprite.body.collideWorldBounds = true;
  this.sprite.body.bounce.set(0);
};

Bullet.prototype.kill = function () {
  this.dead_timer = 0.5;
  this.sprite.play("die", 10);
  this.sprite.body.immovable = true;
  this.sprite.body.velocity.set(0);
  this.sprite.alive = false;
};

Bullet.prototype.interact = function (entity) {
  if (!this.sprite.alive) return;
  this.kill();
  if (entity.damage) entity.damage(1);
};

Bullet.prototype.set = function (property, value) {
  this.properties = this.properties||{};
  this.properties[property]=value;
};

Bullet.prototype.get = function (property, value) {
  this.properties = this.properties||{};
  return this.properties[property]||0;
};

Bullet.prototype.setPosition = function(x,y) {
  this.x = this.sprite.x = x;
  this.y = this.sprite.y = y;
};

Bullet.prototype.update = function(dt) {
  if (this.dead_timer!= null) {
    this.dead_timer-=dt;
    if (this.dead_timer <= 0) {
      this.owner = null;
      this.manager = null;
      this.sprite.entity = null;
      this.sprite.destroy();
    }
    return;
  }
};
return Bullet;
});
