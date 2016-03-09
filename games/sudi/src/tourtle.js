define("games/sudi/src/tourtle", ["games/sudi/src/sound_system",
function(SoundSystem) {
function Tourtle(state, group) {
  this.state = state;
  this.group = group;
  this.sprite = this.state.add.sprite(0,0, "tourtle");
  if (this.group) {
    this.group.add(this.sprite);
  }
  this.sprite.entity = this;
  this.sprite.anchor.set(0.5, 1);
  this.sprite.animations.add("walk", [0,1,2,3,2,1], 5);
  this.sprite.animations.add("dead", [4], 5);
  this.sprite.play("walk", 5, true);

  this.state.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
  this.sprite.body.setSize(32, 13, 0, 0);
  this.sprite.body.immovable = true;
  this.sprite.body.collideWorldBounds = true;
  // this.sprite.body.gravity.y = 300;
  // this.sprite.body.bounce.set(1);

  // this.sprite.body.velocity.x = 20;
}

Tourtle.prototype.set = function (property, value) {
  this.properties = this.properties||{};
  this.properties[property]=value;
};

Tourtle.prototype.get = function (property, value) {
  this.properties = this.properties||{};
  return this.properties[property]||0;
};

Tourtle.prototype.setPosition = function(x,y) {
  this.x = this.sprite.x = x;
  this.y = this.sprite.y = y;
}

Tourtle.prototype.damage = function(ammount) {
  this.kill();
}

Tourtle.prototype.update = function(dt) {
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
  if (this.sprite.x > this.x+parseInt(this.get("move"))) {
    this.sprite.body.velocity.x = -(parseInt(this.get("speed"))||20);
  }
  else if(this.sprite.x < this.x-parseInt(this.get("move"))) {
    this.sprite.body.velocity.x = parseInt(this.get("speed"))||20;
  }
  else if (this.sprite.body.velocity.x == 0) {
    this.sprite.body.velocity.x = (!!parseInt(Math.random()*2) ? 1 : -1)*(parseInt(this.get("speed"))||20);
  }
  if (this.sprite.body.velocity.x > 0)
    this.sprite.scale.x = -1;
  else
    this.sprite.scale.x = 1;
}
Tourtle.prototype.kill = function() {
  this.dead_timer = 0.8;
  this.sprite.play("dead");
  SoundSystem.play("loss");
  this.sprite.body.velocity.x = (!!parseInt(Math.random()*2) ? 1 : -1)*(parseInt(this.get("speed"))||20);
  this.sprite.body.velocity.y = -60;
  this.sprite.body.gravity.y = 300;
}

Tourtle.prototype.interact = function(entity) {
  if (this.sprite.body.touching.up){
    this.kill();
  }
  else
    entity.kill();//onLose();
}

return Tourtle;
}]);
