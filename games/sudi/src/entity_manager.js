define("games/sudi/src/entity_manager", [
  "games/sudi/src/player",
  "games/sudi/src/coin",
  "games/sudi/src/flag",
  "games/sudi/src/tourtle",
  "games/sudi/src/mole",
  "games/sudi/src/worm",
  "games/sudi/src/bullet",
function(Player, Coin, Flag, Tourtle, Mole, Worm, Bullet) {
function EntityManager(state) {
  this.state = state;
  // this.entities = [];
  this.groups = {
    "player": createGroup(state),
    "collectable": createGroup(state),
    "interactable": createGroup(state),
    "bullet": createGroup(state)
  };
  function createGroup(state) {
    var group = state.add.group();
    group.enableBody = true;
    group.physicsBodyType = Phaser.Physics.ARCADE;
    return group;
  }
  this.worldGeometry = null;
}

EntityManager.prototype.getGroup = function(type) {
  if (type in this.groups) return this.groups[type];
  return null;
}

EntityManager.prototype.setWorldGeometry = function(worldGeometry) {
  this.worldGeometry = worldGeometry;
}

EntityManager.prototype.fireBullet = function(owner, target) {
  var bullet = new Bullet(this.state, this.getGroup("bullet"));
  bullet.owner = owner;
  bullet.setPosition(owner.sprite.x+10*owner.sprite.scale.x, owner.sprite.y-(owner.duck ? 0 : 8));
  if (target) {
    bullet.sprite.body.velocity.x = target.x-bullet.sprite.x;
    bullet.sprite.body.velocity.y = target.y-bullet.sprite.y;
  }
  else
    bullet.sprite.body.velocity.x = 150*owner.sprite.scale.x;
}

EntityManager.prototype.create_trigger_from_element = function(element) {
}

EntityManager.prototype.create_entity_from_element = function(element) {
  if (element.properties["class"]) {
    try {
      var constructor = eval(element.properties["class"]);
      var entity = new constructor(this.state, this.getGroup(element.properties["type"]));
      entity.manager = this;
      entity.setPosition(element.x+16, element.y);
      Object.keys(element.properties).forEach(function(key){
        entity.set(key, element.properties[key]);
      });
      // this.entities.push(entity);
    } catch(e) {
      console.warn(e);
    }
  }
}

EntityManager.prototype.update = function(dt) {
  this.state.game.physics.arcade.collide(this.groups["player"], this.worldGeometry, function(player, folliage) {
  }, null, this);
  this.state.game.physics.arcade.collide(this.groups["player"], this.groups["collectable"], function(player, collectable) {
    collectable.entity.interact(player.entity);
    return true;
  }, null, this);
  this.state.game.physics.arcade.collide(this.groups["player"], this.groups["interactable"], function(player, interactable) {
    interactable.entity.interact(player.entity);
    return true;
  }, function(player, interactable) {
    //this is for ladders...
    return interactable.entity.dead_timer == null;
  }, this);
  this.state.game.physics.arcade.collide(this.groups["bullet"], this.worldGeometry, function(bullet, folliage) {
    bullet.entity.kill();
  }, null, this);
  this.state.game.physics.arcade.collide(this.groups["bullet"], this.groups["interactable"], function(bullet, interactable) {
    bullet.entity.interact(interactable.entity);
  }, function(bullet, interactable) {
    return bullet.entity.owner != interactable.entity;
  }, this);
  this.state.game.physics.arcade.collide(this.groups["bullet"], this.groups["player"], function(bullet, player) {
    bullet.entity.interact(player.entity);
  }, function(bullet, player) {
    return bullet.entity.owner != player.entity;
  }, this);

  this.groups["player"].forEachAlive(function(member) {
    member.entity.update(dt);
  }, this);
  this.groups["interactable"].forEachAlive(function(member) {
    member.entity.update(dt);
  }, this);
  this.groups["bullet"].forEachAlive(function(member) {
    member.entity.update(dt);
  }, this);
}

EntityManager.prototype.render = function() {
  if (this.debug) {
    for (var g in this.groups) {
      this.groups[g].forEachAlive(function(member) {
        this.state.game.debug.body(member);
      }, this);
    }
    this.worldGeometry.forEachAlive(function(member) {
      this.state.game.debug.body(member);
    }, this);
  }
}

return EntityManager;
}
])
