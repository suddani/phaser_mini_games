define("games/sudi/src/game", [
  "games/sudi/src/physics",
  "games/sudi/src/map",
  "games/sudi/src/entity_manager",
  "games/sudi/src/collectable",
  "games/sudi/src/sound_system",
  "games/sudi/src/hud",
  "games/sudi/src/spritesheet_generator",
function(Physics, Map, EntityManager, Collectable, SoundSystem, HUD, SpritesheetGenerator) {
  // console.log("Load sudi game")
  function Main() {
  };
  Main.prototype.init = function() {
    console.log("init sudi game");
    addLoadingScreen(this);
  };
  Main.prototype.preload = function() {
    this.load.path = 'games/' + currentGameData.id + '/assets/';

    //füge hie rein was du alles laden musst.
    // this.load.spritesheet("jack", "jack.png",             32*1,32*1,  8);

    //Maps
    this.load.tilemap('level1', 'maps/level1.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.atlasJSONHash("atlas");

    //SoundSystem
    SoundSystem.preload(this);
  };
  Main.prototype.create = function() {
    this.game.time.advancedTiming = true;
    var self = this;
    Pad.init(this.game);
    removeLoadingScreen();

    SpritesheetGenerator.init(this.game);

    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

    Physics.init(this.game);
    SoundSystem.init(this);
    HUD.init(this);
    Collectable.totalCount = {};

    SoundSystem.theme("standard");

    this.entity_manager = new EntityManager(this);

    this.map = new Map(this, this.entity_manager);
    this.map.load("level1", "atlas");

    this.game.stage.backgroundColor = "#4488AA";
  };
  Main.prototype.shutdown = function() {
    SoundSystem.shutdown();
  };
  Main.prototype.update = function() {
    var dt = this.time.physicsElapsedMS * 0.001;
    this.entity_manager.update(dt);
    HUD.update();
  };
  Main.prototype.render = function() {
    // game.debug.text(game.time.suggestedFps, 32, 32);
    this.game.debug.text(game.time.fps, 2, 14, "#00ff00");
    this.entity_manager.render();
  };
  return Main;
}]);
