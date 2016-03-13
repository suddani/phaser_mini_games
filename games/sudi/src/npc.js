define("games/sudi/src/npc", ["games/sudi/src/collectable",
function(Collectable) {
function NPC(state, group) {
  this.group = group;
  this.state = state;
  this.sprite = this.state.add.sprite(16,this.ground, "enemy");
  if (this.group) {
    this.group.add(this.sprite);
  }
  this.sprite.entity = this;
  this.sprite.anchor.set(0.35, 1);
  this.sprite.animations.add("idle", [0,1,2,1], 7);
  this.sprite.animations.add("walk", [0,3,4,3], 7);
  this.sprite.play("idle", 7, true);

  this.state.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
  this.sprite.body.setSize(16, 32, 0, 0);
  this.sprite.body.immovable = true;
  this.sprite.body.collideWorldBounds = true;

  this.quest_done = false;
};

NPC.prototype.shouldCollide = function(entity) {
  return !this.quest_done;

}

NPC.prototype.set = function (property, value) {
  this.properties = this.properties||{};
  this.properties[property]=value;
};

NPC.prototype.get = function (property, value) {
  this.properties = this.properties||{};
  return this.properties[property]||0;
};

NPC.prototype.setPosition = function(x,y) {
  this.x = this.sprite.x = x;
  this.y = this.sprite.y = y;
};

NPC.prototype.damage = function(ammount) {
  // this.kill();
};

NPC.prototype.update = function(dt) {
};

NPC.prototype.interact = function(entity) {
  var coinsMissing = Collectable.totalCount["coins"]-entity.get("coins");
  if (coinsMissing<=0) {
    this.manager.triggerById(parseInt(this.get("has_coins")), this, entity, true);
    this.quest_done = true;
  }
  else {
    console.log("You missed "+coinsMissing+" coins!");
    console.log("Tell it to: "+this.get("has_nocoins"));
    this.manager.triggerById(parseInt(this.get("has_nocoins")), this, entity, true);
  }
};

NPC.prototype.trigger = function (t, player) {
};

NPC.prototype.trigger_end = function (t, player) {
};

return NPC;
}]);
