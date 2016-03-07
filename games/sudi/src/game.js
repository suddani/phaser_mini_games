define("games/sudi/src/game", [
  "games/sudi/src/physics",
  "games/sudi/src/map",
  "games/sudi/src/entity_manager",
  "games/sudi/src/sound_system",
  "games/sudi/src/hud",
function(Physics, Map, EntityManager, SoundSystem, HUD) {
  console.log("Load sudi game")
  function Main() {
  }
  Main.prototype.init = function() {
    console.log("init sudi game")
    addLoadingScreen(this);
  }
  Main.prototype.preload = function() {
    this.load.path = 'games/' + currentGameData.id + '/assets/';

    //füge hie rein was du alles laden musst.
    this.load.spritesheet("jack", "jack.png",             32*1,32*1,  8);
    this.load.spritesheet("enemy", "enemy.png",           32*1,32*1,  5);
    this.load.spritesheet("coin", "coin.png",         32*0.5,32*0.5,  7);
    this.load.spritesheet("coin_hud", "coin_hud.png",     32*1,32*1,  7);
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
    // this.load.atlasJSONHash("atlas");

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
    HUD.init(this);

    this.entity_manager = new EntityManager(this);

    this.map = new Map(this, this.entity_manager);
    this.map.load("level1");

    // octopus = this.game.add.sprite(100,100, "atlas");
    // octopus.animations.add('walk', Phaser.Animation.generateFrameNames('capguy/walk/', 1, 8, '', 4), 10, true, false);
    // octopus.animations.play("walk")

    this.game.stage.backgroundColor = "#4488AA";
  }
  Main.prototype.update = function() {
    var dt = this.time.physicsElapsedMS * 0.001;
    this.entity_manager.update(dt);
    HUD.update();
  }
  Main.prototype.render = function() {
    // game.debug.text(game.time.suggestedFps, 32, 32);
    this.entity_manager.render();
  }
  return Main;
}]);
