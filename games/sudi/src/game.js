define("games/sudi/src/game", [
  "games/sudi/src/physics",
  "games/sudi/src/player",
  "games/sudi/src/coin",
  "games/sudi/src/map",
function(Physics, Player, Coin, Map) {
  console.log("Load sudi game")
  function Main() {
  }
  Main.prototype.init = function() {
    //make the currently running instance accessible
    // Main.state = this;
    console.log("init sudi game")
    addLoadingScreen(this);
  }
  Main.prototype.preload = function() {
    this.load.path = 'games/' + currentGameData.id + '/assets/';

    //füge hie rein was du alles laden musst.
    this.load.spritesheet("jack", "jack.png",   32*1,32*1,  8);
    this.load.spritesheet("enemy", "enemy.png", 32*1,32*1,  5);
    this.load.spritesheet("coin", "coin.png",   32*0.5,32*0.5,  7);
    this.load.spritesheet("coin", "coin.png",   32*0.5,32*0.5,  7);
    this.load.spritesheet("ground2", "ground2.png");
    this.load.spritesheet("ground", "ground2.png");
    this.load.spritesheet("leader", "leader.png");

    //Maps
    this.load.tilemap('level1', 'maps/level1.json', null, Phaser.Tilemap.TILED_JSON);
    // this.load.atlas("mygame");
  }
  Main.prototype.create = function() {
    var self = this;
    Pad.init(this.game);
    removeLoadingScreen();

    Physics.init(this.game);
    this.player = new Player(this);

    this.coins = this.game.add.group();
    this.coins.enableBody = true;
    this.coins.physicsBodyType = Phaser.Physics.ARCADE;

    this.map = new Map(this);
    this.map.load("level1");
    this.map.findObjectsByType("coin", "entities", function(map, element) {
      var coin = new Coin(self, self.coins);
      coin.setPosition(element.x, element.y);
      Object.keys(element.properties).forEach(function(key){
        coin.set(key, element.properties[key]);
      });
    });

    this.map.findObjectsByType("player", "entities", function(map, element) {
      self.player.setPosition(element.x, element.y);
    });

    this.game.stage.backgroundColor = "#4488AA";
  }
  Main.prototype.update = function() {
    var dt = this.time.physicsElapsedMS * 0.001;
    this.player.update(dt);
    // this.coin.update(dt);

    this.game.physics.arcade.collide(this.player.sprite, this.map.groundlayer);
    this.game.physics.arcade.collide(this.player.sprite, this.coins, function() {
      this.player.update_touching(this.player.sprite.body.touching);
      // return true;
    }, null, this);

  }
  Main.prototype.render = function() {
    game.debug.text(game.time.suggestedFps, 32, 32);
    this.game.debug.body(this.player.sprite);
    this.game.debug.body(this.coins);
  }
  return Main;
}]);
