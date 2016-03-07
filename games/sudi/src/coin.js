define("games/sudi/src/coin", ["games/sudi/src/sound_system",
function(SoundSystem) {

Coin.totalCount = 0;
function Coin(state, group) {
  this.state = state;
  this.group = group;
  this.sprite = this.state.add.sprite(0,0, "coin");
  if (this.group) {
    this.group.add(this.sprite);
  }
  this.sprite.entity = this;
  this.sprite.anchor.set(0.5, 1);
  this.sprite.animations.add("idle", [0,1,2,3,4,5], 5);
  this.sprite.play("idle", 5, true);

  this.state.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
  this.sprite.body.setSize(16, 16, 0, 0);
  this.sprite.body.immovable = false;
  this.sprite.body.collideWorldBounds = true;
  // this.sprite.body.gravity.y = 300;
  this.sprite.body.bounce.set(1);

  this.x = 0;
  this.y = 0;
  this.up = true;

  Coin.totalCount+=1;
}

Coin.prototype.interact = function (entity) {
  entity.set("coins", entity.get("coins")+1);
  SoundSystem.play("pickup");
  this.sprite.kill();
};

Coin.prototype.set = function (property, value) {
  this.properties = this.properties||{};
  this.properties[property]=value;
};

Coin.prototype.get = function (property, value) {
  this.properties = this.properties||{};
  return this.properties[property]||0;
};

Coin.prototype.setPosition = function(x,y) {
  this.x = this.sprite.x = x;
  this.y = this.sprite.y = y;
}

Coin.prototype.update = function(dt) {
}

return Coin;
}]);
