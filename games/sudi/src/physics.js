define("games/sudi/src/physics", function() {
  function Physics() {

  }

  Physics.prototype.init = function(game) {
    this.game = game;
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.game.time.desiredFps = 60;
    // this.game.physics.arcade.gravity.y = 600;
  }

  return new Physics();
})
