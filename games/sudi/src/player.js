define("games/sudi/src/player", [function() {
function Player(state) {
  this.state = state;
  this.speed = 200;
  this.speedY = 0;

  this.duck = false;

  this.ground = 450;

  this.sprite = this.state.add.sprite(16,this.ground, "jack");
  this.sprite.anchor.set(0.5, 1);
  this.sprite.animations.add("idle", [0,1,2,1], 5);
  this.sprite.animations.add("walk", [0,3,4,3], 14);
  this.sprite.animations.add("jump", [2], 7);
  this.sprite.animations.add("duck", [5], 7);
  this.sprite.animations.add("duck_walk", [5,6,7,6], 7);
  this.sprite.play("idle", 7, true);
}

Player.prototype.update = function(dt) {
  var isMoved = false;

  if (Pad.isDown(Pad.LEFT) && this.sprite.x > 0+16) {
      this.sprite.x -= this.speed * dt * (this.duck ? 0.5:1);
      isMoved = true;
      this.duck ? this.sprite.play("duck_walk") : this.sprite.play("walk");
      this.sprite.scale.x = -1;
  }

  if (Pad.isDown(Pad.RIGHT) && this.sprite.x < 800-16) {
      this.sprite.x += this.speed * dt * (this.duck ? 0.5:1);
      isMoved = true;
      this.duck ? this.sprite.play("duck_walk") : this.sprite.play("walk");
      this.sprite.scale.x = 1;
  }

  if (Pad.isDown(Pad.UP) && this.sprite.y == this.ground) {
    console.log("Start jumping")
    this.speedY = -250;
    isMoved = true;
  }

  if (Pad.isDown(Pad.DOWN) && this.sprite.y == this.ground) {
    this.duck = true;
  } else {
    this.duck = false;
  }
  if (!isMoved) {
    this.duck ? this.sprite.play("duck") : this.sprite.play("idle");
  }

  this.sprite.y += this.speedY * dt;

  if (this.sprite.y < this.ground) {
    this.sprite.play("jump");
    this.speedY += 600 * dt;
  }
  if (this.speedY > 0 && this.sprite.y >= this.ground) {
    this.speedY = 0;
    this.sprite.y = this.ground;
  }
}

return Player;
}]);
