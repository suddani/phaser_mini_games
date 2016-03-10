define("games/sudi/src/entity_manager", [
  "games/sudi/src/trigger",
  "games/sudi/src/player",
  "games/sudi/src/coin",
  "games/sudi/src/flag",
  "games/sudi/src/tourtle",
  "games/sudi/src/mole",
  "games/sudi/src/worm",
  "games/sudi/src/bullet",
  "games/sudi/src/trapdoor",
function(Trigger, Player, Coin, Flag, Tourtle, Mole, Worm, Bullet, TrapDoor) {
function EntityManager(state) {
  this.state = state;
  // this.entities = [];
  this.groups = {
    "player": createGroup(state),
    "collectable": createGroup(state),
    "interactable": createGroup(state),
    "bullet": createGroup(state),
    "trigger": createGroup(state)
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

EntityManager.prototype.fireBullet = function(owner, target, x, y) {
  var bullet = new Bullet(this.state, this.getGroup("bullet"));
  bullet.owner = owner;
  bullet.setPosition(owner.sprite.x+10*owner.sprite.scale.x, owner.sprite.y-(owner.duck ? 0 : 8));
  if (target) {
    bullet.sprite.body.velocity.x = target.sprite.x-bullet.sprite.x;
    bullet.sprite.body.velocity.y = target.sprite.y-bullet.sprite.y;
  }
  else if (x && y) {
    bullet.sprite.body.velocity.x = x-bullet.sprite.x;
    bullet.sprite.body.velocity.y = y-bullet.sprite.y;
  }
  else
    bullet.sprite.body.velocity.x = owner.sprite.scale.x;

  bullet.sprite.body.velocity.setMagnitude(150);
}

EntityManager.prototype.create_trigger_from_element = function(element) {
  var trigger = new Trigger(this.state, this.getGroup("trigger"));
  trigger.manager = this;
  trigger.id = element.properties.id;
  trigger.setPosition(element.x, element.y);
  trigger.setSize(element.width,element.height);
  Object.keys(element.properties).forEach(function(key){
    trigger.set(key, element.properties[key]);
  });
}

EntityManager.prototype.create_entity_from_element = function(element) {
  if (element.properties["class"]) {
    try {
      var constructor = eval(element.properties["class"]);
      var entity = new constructor(this.state, this.getGroup(element.properties["type"]));
      entity.manager = this;
      entity.id = element.properties.id;
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

EntityManager.prototype.getById = function(id) {
  // console.log("Find entity: "+id)
  var entity = null;
  for (var g in this.groups) {
    this.groups[g].forEachAlive(function(member) {
      if (!entity && member.entity && member.entity.id == id) entity = member.entity;
    }, this);
    if (entity) break;
  }
  return entity;
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
    return bullet.entity.owner.group != interactable.entity.group;
  }, this);
  this.state.game.physics.arcade.collide(this.groups["bullet"], this.groups["player"], function(bullet, player) {
    bullet.entity.interact(player.entity);
  }, function(bullet, player) {
    return bullet.entity.owner != player.entity;
  }, this);
  this.state.game.physics.arcade.overlap(this.groups["player"], this.groups["trigger"], function(player, trigger) {

  }, function(player, trigger) {
    trigger.entity.interact(player.entity);
    return false;
  }, this);

  this.groups["player"].forEach(function(member) {
    member.entity.update(dt);
  }, this);
  this.groups["interactable"].forEach(function(member) {
    member.entity.update(dt);
  }, this);
  this.groups["bullet"].forEach(function(member) {
    member.entity.update(dt);
  }, this);
  this.groups["trigger"].forEach(function(member) {
    member.entity.update(dt);
  }, this);
}

EntityManager.prototype.render = function() {
  if (this.debug) {
    for (var g in this.groups) {
      this.groups[g].forEach(function(member) {
        this.state.game.debug.body(member);
      }, this);
    }
    this.worldGeometry.forEach(function(member) {
      this.state.game.debug.body(member);
    }, this);
  }
}

return EntityManager;
}
])
