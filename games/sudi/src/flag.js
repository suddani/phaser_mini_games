define("games/sudi/src/flag", ["games/sudi/src/collectable",
function(Collectable) {
function Flag(state, group) {
  this.state = state;
  this.group = group;
  this.sprite = this.state.add.sprite(0,0, "flag");
  if (this.group) {
    this.group.add(this.sprite);
  }
  this.sprite.entity = this;
  this.sprite.anchor.set(0.5, 1);
  // this.sprite.animations.add("idle", [0,1,2,3,4,5], 5);
  // this.sprite.play("idle", 5, true);

  this.state.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
  this.sprite.body.setSize(16, 32, 0, 0);
  this.sprite.body.immovable = true;
};

Flag.prototype.set = function (property, value) {
  this.properties = this.properties||{};
  this.properties[property]=value;
};

Flag.prototype.get = function (property, value) {
  this.properties = this.properties||{};
  return this.properties[property]||0;
};

Flag.prototype.setPosition = function(x,y) {
  this.x = this.sprite.x = x;
  this.y = this.sprite.y = y;
};

Flag.prototype.update = function(dt) {
};

Flag.prototype.interact = function(entity) {
  var coinsMissing = Collectable.totalCount["coins"]-entity.get("coins");
  if (coinsMissing<=0)
    onVictory();
  else {
    console.log("You missed "+coinsMissing+" coins!");
    onLose();
  }
};

return Flag;
}]);
