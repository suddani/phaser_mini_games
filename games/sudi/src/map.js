define("games/sudi/src/map", function() {
function Map(state) {
  this.state = state;

}

Map.prototype.load = function(level_name) {
  this.map = this.state.game.add.tilemap(level_name);
  // this.map.debug = true;
  this.map.addTilesetImage('ground2', 'ground2');
  this.map.addTilesetImage('jack', 'jack');
  this.map.addTilesetImage('coin', 'coin');
  this.map.addTilesetImage('leader', 'leader');

  this.groundlayer = this.map.createLayer('groundlayer');
  // this.groundlayer.collisionHeight = "16";
  // this.groundlayer.debug = true;
  // this.map.setCollisionBetween(1, 100, true, 'groundlayer');
  // this.map.setCollisionBetween(15, 1000, true, 'groundlayer');
  // this.map.setCollision(1, true, 'groundlayer');
  // this.map.setCollisionByExclusion([14,1], true, 'groundlayer')
  // this.map.calculateFaces("groundlayer");
  this.groundlayer.resizeWorld();
  this.create_collsion();
}

Map.prototype.create_collsion = function() {
  var collisionLayer = this.collisionLayer = this.state.game.add.group();
  this.collisionLayer.enableBody = true;
  this.collisionLayer.physicsBodyType = Phaser.Physics.ARCADE;
  this.collisionLayer.debug = true;

  this.findObjectsByType(null, "collision", function(map, element) {
    var collision = collisionLayer.create(element.x, element.y);
    collision.body.setSize(element.width,element.height);
    // collision.exists = false;
    collision.body.immovable = true;
    // console.log(element)
  });
}

//find objects in a Tiled layer that containt a property called "type" equal to a certain value
Map.prototype.findObjectsByType = function(type, layer, callback) {
  var result = new Array();
  var self = this;
  this.map.objects[layer].forEach(function(element){
    if(!type || element.properties.type === type) {
      if (callback) callback(self, element);
      result.push(element);
    }
  });
  return result;
}

return Map;
});
