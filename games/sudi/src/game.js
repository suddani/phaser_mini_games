define("games/sudi/src/game", [
  "games/sudi/src/physics",
  "games/sudi/src/player",
  "games/sudi/src/coin",
  "games/sudi/src/enemy",
function(Physics, Player, Coin, Enemy) {
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
    this.load.spritesheet("jack", "jack.png",   32*3,32*3,  8);
    this.load.spritesheet("enemy", "enemy.png", 32*3,32*3,  5);
    this.load.spritesheet("coin", "coin.png",   32*2,32*2,  7);
    // this.load.atlas("mygame");
  }
  Main.prototype.create = function() {
    Pad.init(this.game);
    removeLoadingScreen();

    Physics.init(this.game);

    this.coin = new Coin(this);
    this.player = new Player(this);
    this.enemy = new Enemy(this);

    this.coin.set(400, 300);

    this.game.stage.backgroundColor = "#4488AA";
  }
  Main.prototype.update = function() {
    var dt = this.time.physicsElapsedMS * 0.001;
    this.player.update(dt);
    this.coin.update(dt);

    this.game.physics.arcade.collide(this.player.sprite, this.coin.sprite, function() {
      this.player.update_touching(this.player.sprite.body.touching);
      // return true;
    }, null, this);

  }
  Main.prototype.render = function() {
    game.debug.text(game.time.suggestedFps, 32, 32);
    this.game.debug.body(this.player.sprite);
    this.game.debug.body(this.coin.sprite);
  }
  return Main;
}]);
