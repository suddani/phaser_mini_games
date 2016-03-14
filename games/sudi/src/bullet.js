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

Bullet.prototype.shouldCollide = function(entity) {
  return this.dead_timer== null;
}

Bullet.prototype.kill = function () {
  this.dead_timer = 0.5;
  this.sprite.play("die", 10);
  this.sprite.body.immovable = true;
  this.sprite.body.velocity.set(0);
  this.sprite.alive = false;
};

Bullet.prototype.interact = function (entity) {
  if (!this.sprite.alive) return;
  if (this.sprite.body.touching.up) {
    if (Math.random()*100<30)
    this.manager.create_entity_from_element({
      x: this.sprite.x+16,
      y: this.sprite.y,
      properties : {
        type: "collectable",
        class: "Collectable",
        amount: "1",
        anchor: "0.5,1",
        animation: "wormbullet_0000,wormbullet_0001,wormbullet_0002,wormbullet_0001,5",
        bounce: "1",
        gravity: "100",
        name: "worms",
        size: "22,8,0,-10",
        sound: "pickup",
        sprite: "atlas,wormbullet_0000"
      }
    });
  } else {
    if (entity.damage) entity.damage(1);
  }
  this.kill();
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
