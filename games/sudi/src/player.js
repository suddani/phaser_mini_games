define("games/sudi/src/player", [
  "games/sudi/src/sound_system",
  "games/sudi/src/hud",
function(SoundSystem, HUD) {

Player.instance = {};

function Player(state, group) {
  this.state = state;
  this.group = group;

  this.duck = false;
  this.speed = 100;
  this.shoot = 0;

  this.sprite = this.state.add.sprite(0,0, "jack");
  if (this.group) {
    this.group.add(this.sprite);
  }
  this.sprite.entity = this;
  this.sprite.anchor.set(0.5, 1);
  this.sprite.animations.add("idle", [0,1,2,1], 5);
  this.sprite.animations.add("walk", [0,3,4,3], 14);
  this.sprite.animations.add("jump", [2], 7);
  this.sprite.animations.add("duck", [5], 7);
  this.sprite.animations.add("duck_walk", [5,6,7,6], 7);
  this.sprite.play("idle", 7, true);

  this.state.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
  this.reset_body_size();
  this.sprite.body.gravity.y = 600;
  this.sprite.body.immovable = false;
  // this.sprite.body.bounce.set(0.3);
  this.sprite.body.collideWorldBounds = true;

  this.state.camera.follow(this.sprite);

  // this.touching = {};
}

Player.prototype.set = function (property, value) {
  this.properties = this.properties||{};
  this.properties[property]=value;
};

Player.prototype.get = function (property, value) {
  this.properties = this.properties||{};
  return this.properties[property]||0;
};

Player.prototype.setPosition = function(x,y) {
  this.x = this.sprite.x = x;
  this.y = this.sprite.y = y;
}

Player.prototype.reset_body_size = function() {
  if (this.duck) {
    this.sprite.body.setSize(10,16);
  }
  else
    this.sprite.body.setSize(10,30);
}

// Player.prototype.update_touching = function(touching) {
//   this.touching = JSON.parse(JSON.stringify(touching));
// }

Player.prototype.update = function(dt) {
  this.on_floor = (this.sprite.body.onFloor() || this.sprite.body.touching.down);
  if (!HUD.cinematic) {
    var isMoved = this.controls(dt);
  }
  if (this.shoot > 0) {
    this.shoot-=dt;
  }
  // this.touching = {};
  HUD.coins = this.get("coins");
  HUD.worms = this.get("worms");
}

Player.prototype.onFloor = function() {
  return this.on_floor;
}

Player.prototype.controls = function() {
  var isMoved = false;

  if (Pad.isDown(Pad.LEFT)) {
      this.sprite.body.velocity.x = -this.speed*(this.duck ? 0.5:1);
      isMoved = true;
      this.duck ? this.sprite.play("duck_walk") : this.sprite.play("walk");
      this.sprite.scale.x = -1;
  }
  if (Pad.isDown(Pad.RIGHT)) {
      this.sprite.body.velocity.x = this.speed*(this.duck ? 0.5:1);
      isMoved = true;
      this.duck ? this.sprite.play("duck_walk") : this.sprite.play("walk");
      this.sprite.scale.x = 1;
  }
  if ((Pad.isDown(Pad.UP) || Pad.isDown(Pad.JUMP)) && this.onFloor()) {
    // console.log("Start jumping")
    // this.sprite.body.position.y -= 1;
    this.sprite.body.velocity.y = -200;
    isMoved = true;
    SoundSystem.play("jump")
  }
  if (Pad.isDown(Pad.SHOOT) && this.get("worms") > 0 && this.shoot <= 0) {
    this.manager.fireBullet(this);
    this.set("worms", this.get("worms")-1);
    this.shoot = 0.5;
  }
  if (Pad.isDown(Pad.DOWN)) {
    this.duck = true;
  } else {
    this.duck = false;
  }
  this.reset_body_size();
  if (!isMoved) {
    this.duck ? this.sprite.play("duck") : this.sprite.play("idle");
    if (this.onFloor()) this.sprite.body.velocity.x = 0;
  }
  if (!this.onFloor()) {
    this.sprite.play("jump");
  }
  return isMoved;
}

return Player;
}]);
