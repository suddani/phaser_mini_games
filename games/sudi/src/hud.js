define("games/sudi/src/hud", [
function() {
function HUD() {
  this.coins = 0;
  this.worms = 0;
  this.cinematic = false;
  this.hud_elements = null;
}
HUD.prototype.init = function(state) {
  this.state = state;

  this.cinematic = false;

  this.hud_elements = this.state.add.group();
  this.hud_elements.fixedToCamera = true;

  this.generateBars();

  this.coin = this.hud_elements.create(5,0, "coin_hud");
  this.coin.animations.add("idle", [0,1,2,3,4,5], 5);
  this.coin.play("idle", 5, true);
  // this.coin.fixedToCamera = true;

  this.worm = this.hud_elements.create(5,40, "wormbullet");
  this.worm.animations.add("idle", [0,1,2,1], 5);
  this.worm.play("idle", 5, true);
  // this.worm.fixedToCamera = true;

  this.coinText = this.state.add.bitmapText(40, 10, "testfont", "GESCHAFFT", 20, this.hud_elements);
  // this.coinText.fixedToCamera = true;
  this.wormText = this.state.add.bitmapText(40, 40, "testfont", "GESCHAFFT", 20, this.hud_elements);
  // this.wormText.fixedToCamera = true;

}

HUD.prototype.showBars = function() {
  game.add.tween(this.topbar).to( { y: 0 }, 1000, Phaser.Easing.Bounce.Out, true);
  game.add.tween(this.bottombar).to( { y: 430 }, 1000, Phaser.Easing.Bounce.Out, true);
  this.cinematic = true;
}

HUD.prototype.hideBars = function() {
  game.add.tween(this.topbar).to( { y: -20 }, 1000, Phaser.Easing.Bounce.Out, true);
  game.add.tween(this.bottombar).to( { y: 450 }, 1000, Phaser.Easing.Bounce.Out, true);
  this.cinematic = false;
}

HUD.prototype.update = function() {
  this.coinText.text = "Coins     "+this.coins;
  this.wormText.text = "Worms  "+this.worms;
  this.state.game.world.bringToTop(this.hud_elements);
  // this.state.game.world.bringToTop(this.wormText);
}

HUD.prototype.generateBars = function() {
  var graphics = this.state.add.graphics(0, 0);
  graphics.lineStyle(0);//3, 0x0000FF, 1);
  graphics.beginFill(0x000000, 1.0);
  graphics.drawRect(0, 0, 800, 20);

  var texture = graphics.generateTexture();
  this.topbar = this.hud_elements.create(0, -20, texture);
  // this.topbar.fixedToCamera = true;
  this.bottombar = this.hud_elements.create(0, 450, texture);
  // this.bottombar.fixedToCamera = true;
  graphics.destroy();
}

return new HUD();
}]);
