define("games/sudi/src/map", [
  "games/sudi/src/spritesheet_generator",
function(SpritesheetGenerator) {
function Map(state, entity_manager) {
  this.state = state;
  this.entity_manager = entity_manager;
};

Map.prototype.load = function(level_name, atlas) {
  this.map = this.state.game.add.tilemap(level_name);
  // console.log(this.map);

  for (var idx in this.map.tilesets) {
    SpritesheetGenerator.createSpriteSheet(atlas, this.map.tilesets[idx].name);
    this.map.addTilesetImage(this.map.tilesets[idx].name, this.map.tilesets[idx].name);
  }

  this.groundlayer = this.map.createLayer('groundlayer');
  // this.groundlayer.collisionHeight = "16";
  // this.groundlayer.debug = true;
  // this.map.setCollisionBetween(1, 100, true, 'groundlayer');
  // this.map.setCollisionBetween(15, 1000, true, 'groundlayer');
  // this.map.setCollision(1, true, 'groundlayer');
  // this.map.setCollisionByExclusion([14,1], true, 'groundlayer')
  // this.map.calculateFaces("groundlayer");
  this.groundlayer.resizeWorld();
  this.createCollsionLayer();
  this.createTrigger();
  this.entity_manager.setWorldGeometry(this.collisionLayer);
  this.spawnEntities();
};

Map.prototype.createTrigger = function() {
  this.findObjectsByType(null, "trigger", function(element) {
    this.entity_manager.create_trigger_from_element(element);
  }, this);
};

Map.prototype.createCollsionLayer = function() {
  this.collisionLayer = this.state.game.add.group();
  this.collisionLayer.enableBody = true;
  this.collisionLayer.physicsBodyType = Phaser.Physics.ARCADE;
  this.collisionLayer.debug = true;

  this.findObjectsByType(null, "collision", function(element) {
    var collision = this.collisionLayer.create(element.x, element.y);
    collision.body.setSize(element.width,element.height);
    collision.body.immovable = true;
  }, this);
};

Map.prototype.spawnEntities = function() {
  var entities = this.findObjectsByType(null, "entities");
  for (var i in entities) {
    this.entity_manager.create_entity_from_element(entities[i]);
  }
};

//find objects in a Tiled layer that containt a property called "type" equal to a certain value
Map.prototype.findObjectsByType = function(type, layer, callback, context) {
  var result = new Array();
  this.map.objects[layer].forEach(function(element){
    if(!type || element.properties.type === type) {
      if (callback) callback.call(context, element);
      result.push(element);
    }
  });
  return result;
};

return Map;
}]);
