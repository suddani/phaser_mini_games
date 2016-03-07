define("games/sudi/src/game", [
  "games/sudi/src/physics",
  "games/sudi/src/map",
  "games/sudi/src/entity_manager",
  "games/sudi/src/sound_system",
function(Physics, Map, EntityManager, SoundSystem) {
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
    this.load.spritesheet("jack", "jack.png",             32*1,32*1,  8);
    this.load.spritesheet("enemy", "enemy.png",           32*1,32*1,  5);
    this.load.spritesheet("coin", "coin.png",         32*0.5,32*0.5,  7);
    this.load.spritesheet("tourtle", "tourtle.png",       32*1,32*1,  5);
    this.load.spritesheet("mole", "mole.png",             32*1,32*1,  9);
    this.load.spritesheet("wormbullet", "wormbullet.png", 32*1,32*1,  9);
    this.load.spritesheet("flag", "flag.png");
    this.load.spritesheet("ground2", "ground2.png");
    this.load.spritesheet("ground", "ground2.png");
    this.load.spritesheet("leader", "leader.png");
    this.load.spritesheet("bridge", "bridge.png");

    //Maps
    this.load.tilemap('level1', 'maps/level1.json', null, Phaser.Tilemap.TILED_JSON);
    // this.load.atlas("mygame");

    //SoundSystem
    console.log(SoundSystem)
    SoundSystem.preload(this.game);
  }
  Main.prototype.create = function() {
    var self = this;
    Pad.init(this.game);
    removeLoadingScreen();

    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

    Physics.init(this.game);
    SoundSystem.init(this.game);
    this.entity_manager = new EntityManager(this);

    this.map = new Map(this, this.entity_manager);
    this.map.load("level1");

    this.game.stage.backgroundColor = "#4488AA";
  }
  Main.prototype.update = function() {
    var dt = this.time.physicsElapsedMS * 0.001;
    this.entity_manager.update(dt);
  }
  Main.prototype.render = function() {
    game.debug.text(game.time.suggestedFps, 32, 32);
    this.entity_manager.render();
  }
  return Main;
}]);
