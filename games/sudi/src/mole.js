define("games/sudi/src/mole", [
  "games/sudi/src/sound_system",
  "games/sudi/src/hud",
function(SoundSystem, HUD) {
function Mole(state, group) {
  window.mole = this;
  this.state = state;
  this.group = group;
  this.sprite = this.state.add.sprite(0,0, "mole");
  if (this.group) {
    this.group.add(this.sprite);
  }
  this.sprite.entity = this;
  this.sprite.anchor.set(0.5, 1);
  this.sprite.animations.add("idle", [0,1,2,1], 5);
  this.attackAnimation = this.sprite.animations.add("attack", [3,4,5,6,7], 5);
  this.sprite.animations.add("hidden", [8], 1);
  this.hiddenAnim = this.sprite.play("hidden", 5, true);

  this.state.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
  this.sprite.body.setSize(28, 20, 0, 0);
  this.sprite.body.immovable = true;
  this.sprite.body.collideWorldBounds = true;

  this.shootTimer = 0;
}

Mole.prototype.trigger = function (t, player) {
  this.sprite.play("idle", 5, true);
  this.target = player;
  this.shootTimer = 0.5;
};

Mole.prototype.trigger_end = function (t, player) {
  this.target_x = this.target.sprite.x;
  this.target_y = this.target.sprite.y;
  this.target = null;
};

Mole.prototype.set = function (property, value) {
  this.properties = this.properties||{};
  this.properties[property]=value;
};

Mole.prototype.get = function (property, value) {
  this.properties = this.properties||{};
  return this.properties[property]||0;
};

Mole.prototype.setPosition = function(x,y) {
  this.x = this.sprite.x = x;
  this.y = this.sprite.y = y;
}

Mole.prototype.damage = function(ammount) {
  this.kill();
}

Mole.prototype.update = function(dt) {
  if (this.dead_timer!= null) {
    this.dead_timer-=dt;
    if (this.dead_timer <= 0) {
      this.owner = null;
      this.manager = null;
      this.sprite.entity = null;
      this.sprite.destroy();
    }
    return;
  }

  if (this.shootTimer>0) {
    this.shootTimer-=dt;
  }

  if (this.target) {
    if (!this.attackAnimation.isPlaying) {
      this.sprite.play("idle", 5, true);
    }
    this.sprite.scale.x = this.target.sprite.x-this.sprite.x < 0 ? 1 : -1;
    if (this.target && this.shootTimer<=0 && !this.attackAnimation.isPlaying) {
      this.shootTimer=5;
      this.sprite.play("attack", 5, false).onComplete.addOnce(this.shoot, this);
    }
  } else if (!this.shooting && this.shootTimer <= 0) {
    this.sprite.play("hidden", 5, true);
  }
}

Mole.prototype.shoot = function() {
  this.manager.fireBullet(this, this.target, this.target_x, this.target_y);
  this.shootTimer=2;
  this.sprite.play("idle", 5, true)
}

Mole.prototype.kill = function() {
  // you cant touch this
  if (this.hiddenAnim.isPlaying) return;
  this.dead_timer = 1;
  this.sprite.play("hidden", 5, true);
  SoundSystem.play("loss");
}

Mole.prototype.interact = function(entity) {
  if (this.sprite.body.touching.up){
    this.kill();
    // HUD.hideBars();
  }
  // else {
  //   this.sprite.play("hidden");
  //   // HUD.showBars();
  // }
    // onLose();
}

return Mole;
}]);
