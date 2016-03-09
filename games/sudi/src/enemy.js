define("games/sudi/src/enemy", function() {
function Enemy(state) {
  this.state = state;

  this.ground = 450;
  this.sprite = this.state.add.sprite(16,this.ground, "enemy");
  this.sprite.anchor.set(0.35, 1);
  this.sprite.animations.add("idle", [0,1,2,1], 7);
  this.sprite.animations.add("walk", [0,3,4,3], 7);
  this.sprite.play("idle", 7, true)
};

return Enemy;
});
