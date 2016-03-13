define("games/sudi/src/hud", [
function() {
function HUD() {
  this.coins = 0;
  this.worms = 0;
  this.cinematic = false;
  this.hud_elements = null;
};
HUD.prototype.init = function(state) {
  this.state = state;

  this.cinematic = false;

  this.hud_elements = this.state.add.group();
  this.hud_elements.fixedToCamera = true;

  this.generateBars();
  this.generateSpeechBox();

  this.speech_box = this.hud_elements.create(32*4,272, "speech_box");
  this.speech_box_name = this.state.add.bitmapText(32*5, 272, "testfont", "GESCHAFFT", 20, this.hud_elements);
  this.speech_box_text = this.state.add.bitmapText(32*5, 294, "testfont", "GESCHAFFT", 20, this.hud_elements);
  this.speech_box_text.maxWidth = 15*32;
  this.speech_box.exists = false;
  this.speech_box_name.exists = false;
  this.speech_box_text.exists = false;

  this.coin = this.hud_elements.create(5,0, "atlas", "coin_hud_0000");
  this.coin.animations.add("idle", Phaser.Animation.generateFrameNames('coin_hud_', 0, 5, '', 4), 5);
  this.coin.play("idle", 5, true);
  // this.coin.fixedToCamera = true;

  this.worm = this.hud_elements.create(5,40, "atlas", "wormbullet");
  this.worm.animations.add("idle", Phaser.Animation.generateFrameNames('wormbullet_', 0, 2, '', 4), 5);
  this.worm.play("idle", 5, true);
  // this.worm.fixedToCamera = true;

  this.coinText = this.state.add.bitmapText(40, 10, "testfont", "GESCHAFFT", 20, this.hud_elements);
  // this.coinText.fixedToCamera = true;
  this.wormText = this.state.add.bitmapText(40, 40, "testfont", "GESCHAFFT", 20, this.hud_elements);
  // this.wormText.fixedToCamera = true;

};

HUD.prototype.showBars = function() {
  this.state.add.tween(this.topbar).to( { y: 0 }, 1000, Phaser.Easing.Bounce.Out, true);
  this.state.add.tween(this.bottombar).to( { y: 430 }, 1000, Phaser.Easing.Bounce.Out, true);
  this.cinematic = true;
};

HUD.prototype.hideBars = function() {
  this.state.add.tween(this.topbar).to( { y: -20 }, 1000, Phaser.Easing.Bounce.Out, true);
  this.state.add.tween(this.bottombar).to( { y: 450 }, 1000, Phaser.Easing.Bounce.Out, true);
  this.cinematic = false;
};

HUD.prototype.update = function() {
  this.coinText.text = "Coins     "+this.coins;
  this.wormText.text = "Worms  "+this.worms;
  this.state.game.world.bringToTop(this.hud_elements);
  // this.state.game.world.bringToTop(this.wormText);
};

HUD.prototype.speech = function(conversation) {
  this.speech_box.exists = true;
  this.speech_box_name.exists = true;
  this.speech_box_text.exists = true;

  this.speech_box_name.text = conversation.name;
  this.speech_box_text.text = conversation.text;
};

HUD.prototype.hideSpeech = function(conversation) {
  this.speech_box.exists = false;
  this.speech_box_name.exists = false;
  this.speech_box_text.exists = false;
};


HUD.prototype.generateSpeechBox = function() {
  var width = 17;
  var height = 5;
  var bmd = this.state.add.bitmapData(32*width, 32*height);
  var left_up = this.state.make.sprite(0, 0, "atlas", "speech_0000");
  var up = this.state.make.sprite(0, 0, "atlas", "speech_0001");
  var right_up = this.state.make.sprite(0, 0, "atlas", "speech_0002");
  var left = this.state.make.sprite(0, 0, "atlas", "speech_0003");
  var center = this.state.make.sprite(0, 0, "atlas", "speech_0004");
  var right = this.state.make.sprite(0, 0, "atlas", "speech_0005");
  var left_down = this.state.make.sprite(0, 0, "atlas", "speech_0006");
  var down = this.state.make.sprite(0, 0, "atlas", "speech_0007");
  var right_down = this.state.make.sprite(0, 0, "atlas", "speech_0008");
  for (var w =0;w<width;w++) {
    for (var h=0;h<height;h++) {
      if (w==0 && h==0) bmd.draw(left_up, 32*w, 32*h);
      else if (w==width-1 && h==0) bmd.draw(right_up, 32*w, 32*h);
      else if (w==0 && h!=height-1 && h!=0) bmd.draw(left, 32*w, 32*h);
      else if (w==0 && h==height-1) bmd.draw(left_down, 32*w, 32*h);
      else if (w==width-1 && h!=height-1 && h!=0) bmd.draw(right, 32*w, 32*h);
      else if (w==width-1 && h==height-1) bmd.draw(right_down, 32*w, 32*h);
      else if (w!=width-1 && w!=0 && h==height-1) bmd.draw(down, 32*w, 32*h);
      else if (w!=width-1 && w!=0 && h==0) bmd.draw(up, 32*w, 32*h);
      else bmd.draw(center, 32*w, 32*h);
    }
  }
  this.state.cache.addImage("speech_box", '', bmd.canvas);
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
};

return new HUD();
}]);
