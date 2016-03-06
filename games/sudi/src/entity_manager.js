define("games/sudi/src/entity_manager", [
  "games/sudi/src/player",
  "games/sudi/src/coin",
  "games/sudi/src/flag",
function(Player, Coin, Flag) {
function EntityManager(state) {
  this.state = state;
  // this.entities = [];
  this.groups = {
    "player": createGroup(state),
    "collectable": createGroup(state),
    "interactable": createGroup(state),
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

EntityManager.prototype.create_from_properties = function(element) {
  if (element.properties["class"]) {
    try {
      var constructor = eval(element.properties["class"]);
      var entity = new constructor(this.state, this.getGroup(element.properties["type"]));
      entity.setPosition(element.x, element.y);
      Object.keys(element.properties).forEach(function(key){
        entity.set(key, element.properties[key]);
      });
      // this.entities.push(entity);
    } catch(e) {
      console.warn(e);
    }
  }
  // this.map.findObjectsByType("coin", "entities", function(map, element) {
  //   var coin = new Coin(self, self.coins);
  //   coin.setPosition(element.x, element.y);
  //   Object.keys(element.properties).forEach(function(key){
  //     coin.set(key, element.properties[key]);
  //   });
  // });
  //
  // this.map.findObjectsByType("player", "entities", function(map, element) {
  //   self.player.setPosition(element.x, element.y);
  // });

  // this.coins = this.game.add.group();
  // this.coins.enableBody = true;
  // this.coins.physicsBodyType = Phaser.Physics.ARCADE;

}

EntityManager.prototype.update = function(dt) {
  this.state.physics.arcade.collide(this.groups["player"], this.worldGeometry, function(player, folliage) {
    // player.entity.update_touching(player.body.touching);
  }, null, this);
  this.state.game.physics.arcade.collide(this.groups["player"], this.groups["collectable"], function(player, collectable) {
    // player.entity.update_touching(player.body.touching);
    collectable.entity.collect(player.entity);
    return true;
  }, null, this);
  this.state.game.physics.arcade.collide(this.groups["player"], this.groups["interactable"], function(player, interactable) {
    interactable.entity.interact(player.entity);
    return true;
  }, function(player, interactable) {

  }, this);
  // this.game.physics.arcade.collide(this.coins, this.map.collisionLayer);
  // for (var i in this.entities) {
  //   this.entities[i].update(dt);
  // }
  this.groups["player"].forEachAlive(function(member) {
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
