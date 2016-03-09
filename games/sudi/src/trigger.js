define("games/sudi/src/trigger", [
function() {
function Trigger(state, group) {
  this.state = state;
  this.group = group;
  this.sprite = this.state.add.sprite(0,0, "");
  if (this.group) {
    this.group.add(this.sprite);
  }
  this.sprite.entity = this;
  this.sprite.scale.set(1);

  this.state.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
  this.sprite.body.immovable = true;
  this.sprite.body.collideWorldBounds = true;
  // this.sprite.body.gravity.y = 300;
  // this.sprite.body.bounce.set(1);

  this.x = 0;
  this.y = 0;

  this.interactions = {};
};

Trigger.prototype.interact = function (entity) {
  if (!this.interactions.hasOwnProperty(entity))
    this.beginInteraction(entity);
  this.interactions[entity] = 1;
};

Trigger.prototype.set = function (property, value) {
  this.properties = this.properties||{};
  this.properties[property]=value;
};

Trigger.prototype.get = function (property, value) {
  this.properties = this.properties||{};
  return this.properties[property]||0;
};

Trigger.prototype.setPosition = function(x,y) {
  this.x = this.sprite.x = x;
  this.y = this.sprite.y = y;
};

Trigger.prototype.setSize = function(width,height) {
  this.sprite.body.setSize(width,height);
};

Trigger.prototype.update = function(dt) {
  var interactions_ending = [];
  for (var i in this.interactions) {
    this.interactions[i]-=1;
    if (this.interactions[i] < 0)
      interactions_ending.push(i);
  }
  for (var i in interactions_ending) {
    this.endInteraction(interactions_ending[i]);
    delete this.interactions[interactions_ending[i]];
  }
};

Trigger.prototype.beginInteraction = function(entity) {
  // console.log("Begin touch")
  var target = this.manager.getById(parseInt(this.get("target")));
  // crash like hell here otherwise we dont know whats wrong
  if (target) target.trigger(this, entity);
};

Trigger.prototype.endInteraction = function(entity) {
  // console.log("End touch")
  var target = this.manager.getById(parseInt(this.get("target")));
  // crash like hell here otherwise we dont know whats wrong
  if (target) target.trigger_end(this, entity);
};

return Trigger;
}]);
