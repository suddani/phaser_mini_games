define("games/sudi/src/coin", [function() {
function Coin(state) {
  this.state = state;
  this.sprite = this.state.add.sprite(0,0, "coin");
  this.sprite.anchor.set(0.5, 1);
  this.sprite.animations.add("idle", [0,1,2,3,4,5], 5);
  this.sprite.play("idle", 5, true);
  this.x = 0;
  this.y = 0;
  this.up = true;
}

Coin.prototype.set = function(x,y) {
  this.x = this.sprite.x = x;
  this.y = this.sprite.y = y;
}

Coin.prototype.update = function(dt) {
  if (this.y - this.sprite.y >= 16 || this.y - this.sprite.y < 0) {
    this.up = !this.up;
  }
  this.sprite.y += (this.up ? -1 : 1 )*15*dt;
}

Coin.prototype.collide = function(player) {
  return this.sprite.overlap(player.sprite);
  // var difX = player.sprite.x - this.sprite.x;
  // var difY = player.sprite.y - this.sprite.y;
  // if (Math.sqrt(difX * difX + difY * difY) < this.sprite.width * 0.9) {
  //     return true;
  // } else {
  //   return false;
  // }
}

return Coin;
}]);
