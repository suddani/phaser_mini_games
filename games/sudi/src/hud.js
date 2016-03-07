define("games/sudi/src/hud", [
       "games/sudi/src/player",
function(Player) {
function HUD() {

}
HUD.prototype.init = function(state) {
  this.state = state;

  this.coin = this.state.add.sprite(5,0, "coin_hud");
  this.coin.animations.add("idle", [0,1,2,3,4,5], 5);
  this.coin.play("idle", 5, true);
  this.coin.fixedToCamera = true;

  this.worm = this.state.add.sprite(5,40, "wormbullet");
  this.worm.animations.add("idle", [0,1,2,1], 5);
  this.worm.play("idle", 5, true);
  this.worm.fixedToCamera = true;

  this.coinText = this.state.add.bitmapText(40, 10, "testfont", "GESCHAFFT", 20);
  this.coinText.fixedToCamera = true;
  this.wormText = this.state.add.bitmapText(40, 40, "testfont", "GESCHAFFT", 20);
  this.wormText.fixedToCamera = true;
}

HUD.prototype.update = function() {
  this.coinText.text = "Coins     "+Player.instance.get("coins");
  this.wormText.text = "Worms  "+Player.instance.get("worms");
  this.state.game.world.bringToTop(this.coinText);
  this.state.game.world.bringToTop(this.wormText);
}

return new HUD();
}]);
