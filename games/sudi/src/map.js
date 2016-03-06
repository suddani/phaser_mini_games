define("games/sudi/src/map", function() {
function Map(state) {
  this.state = state;

}

Map.prototype.load = function(level_name) {
  this.map = this.state.game.add.tilemap(level_name);
  console.log(this.map)
  this.map.addTilesetImage('ground2', 'ground2');
  this.map.addTilesetImage('jack', 'jack');
  this.map.addTilesetImage('coin', 'coin');
  this.map.addTilesetImage('leader', 'leader');

  this.groundlayer = this.map.createLayer('groundlayer');
  this.map.setCollisionBetween(1, 100000, true, 'groundlayer');
  this.groundlayer.resizeWorld();
}

//find objects in a Tiled layer that containt a property called "type" equal to a certain value
Map.prototype.findObjectsByType: function(type, layer="entities") {
    var result = new Array();
    this.map.objects[layer].forEach(function(element){
      if(element.properties.type === type) {
        //Phaser uses top left, Tiled bottom left so we have to adjust the y position
        //also keep in mind that the cup images are a bit smaller than the tile which is 16x16
        //so they might not be placed in the exact pixel position as in Tiled
        element.y -= this.map.tileHeight;
        result.push(element);
      }
    });
    return result;
  }

return Map;
});
