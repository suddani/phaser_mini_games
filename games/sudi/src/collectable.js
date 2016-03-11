define("games/sudi/src/collectable", ["games/sudi/src/sound_system",
function(SoundSystem) {

Collectable.count = {};

function Collectable(state, group) {
  this.state = state;
  this.group = group;
  this.sprite = this.state.add.sprite()
  if (this.group) {
    this.group.add(this.sprite);
  }
  this.sprite.entity = this;

  this.anim = null;
  this.frames = null;

  this.state.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
  this.sprite.body.immovable = false;
  this.sprite.body.collideWorldBounds = true;
};


Collectable.prototype.startAnimation = function () {
  if (!this.frames) return;
  this.anim = this.sprite.animations.add("idle", this.frames, this.fps);
  this.anim.play(this.fps, true);
}

Collectable.prototype.set = function (property, value) {
  //anchor
  //size
  //scale
  //animation
  //sprite
  //gravity
  //name
  //sound
  //bounce
  if (property=="anchor") {
    values = value.split(",");
    this.sprite.anchor.set(parseFloat(values[0]), parseFloat(values[1]));
  }
  if (property=="size") {
    values = value.split(",");
    while(values.length < 4) {
      values.push(0)
    }
    this.sprite.body.setSize( parseFloat(values[0]), parseFloat(values[1]),
                              parseFloat(values[2]), parseFloat(values[3]));
  }
  if (property=="scale") {
    values = value.split(",");
    this.sprite.scale.set(parseFloat(values[0]), parseFloat(values[1]));
  }
  if (property=="animation") {
    values = value.split(",");
    this.frames = values;
    this.fps = 12;
    if (parseInt(values[values.length-1])) {
      this.frames = values.slice(0,values.length-1);
      this.fps = values[values.length-1];
    }
  }
  if (property=="sprite") {
    values = value.split(",");
    if (values.length > 1)
      this.sprite.loadTexture(values[0], values[1]);
    else
      this.sprite.loadTexture(values[0]);
    this.startAnimation();
  }
  if (property=="gravity") {
    this.sprite.body.gravity.y = parseFloat(value);
  }
  if (property=="name") {
    Collectable.count[value] = Collectable.count[value]||0;
    Collectable.count[value] += 1;
  }
  if (property=="bounce") {
    values = value.split(",");
    if (values.length > 1)
      this.sprite.body.bounce.set(values[0], values[1])
    else
      this.sprite.body.bounce.set(values[0])
  }
  this.properties = this.properties||{};
  this.properties[property]=value;
};

Collectable.prototype.get = function (property, value) {
  this.properties = this.properties||{};
  return this.properties[property]||0;
};

Collectable.prototype.setPosition = function(x,y) {
  this.x = this.sprite.x = x-8;
  this.y = this.sprite.y = y;
};

Collectable.prototype.damage = function(ammount) {
};

Collectable.prototype.update = function(dt) {
};

Collectable.prototype.interact = function(entity) {
  entity.set(this.get("name"), entity.get(this.get("name"))+1);
  SoundSystem.play(this.get("sound"));
  this.owner = null;
  this.manager = null;
  this.sprite.entity = null;
  this.sprite.destroy();
};

Collectable.prototype.trigger = function (t, player) {
};

Collectable.prototype.trigger_end = function (t, player) {
};

return Collectable;
}]);
