define("games/sudi/src/lever", function() {
function Lever(state, group) {
  this.state = state;
  this.group = group;
  this.sprite = this.state.add.sprite(0,0,"atlas", "lever_0000")
  if (this.group) {
    this.group.add(this.sprite);
  }
  this.sprite.entity = this;
  this.sprite.anchor.set(0.5, 1);
  this.sprite.scale.set(1);
  this.sprite.angle = 0;

  this.sprite.animations.add("open", Phaser.Animation.generateFrameNames('lever_', 0, 4, '', 4), 12);
  this.sprite.animations.add("close", Phaser.Animation.generateFrameNames('lever_', 0, 4, '', 4).reverse(), 12);
  // this.sprite.animations.add("dead", [4], 5);
  // this.sprite.play("walk", 5, true);

  this.state.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
  this.sprite.body.setSize(32, 32, 0, 0);
  this.sprite.body.immovable = true;
  this.sprite.body.collideWorldBounds = true;

  this.open = false;
};
Lever.prototype.set = function (property, value) {
  this.properties = this.properties||{};
  this.properties[property]=value;
};

Lever.prototype.get = function (property, value) {
  this.properties = this.properties||{};
  return this.properties[property]||0;
};

Lever.prototype.setPosition = function(x,y) {
  this.x = this.sprite.x = x;
  this.y = this.sprite.y = y;
};

Lever.prototype.damage = function(ammount) {
  // this.kill();
};

Lever.prototype.update = function(dt) {
};

Lever.prototype.switch = function(entity) {
  if (this.open) {
    this.sprite.play("close", 12).onComplete.addOnce(function() {
      this.open=false;
      this.manager.triggerById(parseInt(this.get("target")), this, entity, false);
    }, this);
  } else {
    this.sprite.play("open", 12).onComplete.addOnce(function() {
      this.open=true;
      this.manager.triggerById(parseInt(this.get("target")), this, entity, true);
    }, this);
  }
}

Lever.prototype.interact = function(entity) {
  if (JSON.parse(this.get("interact")))
    this.switch(entity);
};

Lever.prototype.trigger = function (t, player) {
  this.switch(player);
};

Lever.prototype.trigger_end = function (t, player) {
};
return Lever;
});
