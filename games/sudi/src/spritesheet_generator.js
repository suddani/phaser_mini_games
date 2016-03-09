define("games/sudi/src/spritesheet_generator", function() {
function SpritesheetGenerator() {
  this.standard_width = 32;
  this.standard_height = 32;
}

SpritesheetGenerator.prototype.init = function(game) {
  this.game = game;
}

SpritesheetGenerator.prototype.getFrames = function(atlas_key) {
  if (!this.game) console.error("SpritesheetGenerator not initialized");
  var frames = [];
  for (var i in this.game.cache.getFrameData(atlas_key)._frames) {
    var frame = this.game.cache.getFrameData(atlas_key)._frames[i];
    // only collect frames that have no animation keys
    if (!frame.name.match(/_\d+/)) frames.push(frame);
  }
  return frames;
}

SpritesheetGenerator.prototype.createSpriteSheet = function(atlas_key, frame_name) {
  if (!this.game) console.error("SpritesheetGenerator not initialized");
  if (this.game.cache.checkImageKey(frame_name)) {
    //image already loaded
    console.log("Dont create Spritesheet for: "+frame_name);
    return;
  }
  var frame = this.game.cache.getFrameData(atlas_key).getFrameByName(frame_name);
  var orb = this.game.make.sprite(0, 0, atlas_key, frame.name);
  var bmd = this.game.add.bitmapData(frame.width, frame.height);
  bmd.draw(orb, 0, 0);
  this.game.cache.addImage(frame.name, '', bmd.canvas);
  // Check if there is actually more than one frame. then use the first frames info
  // to create the sprite sheet. Otherwise assume standard tile size
  var first_frame = this.game.cache.getFrameData(atlas_key).getFrameByName(frame_name+"_0000")
  if (first_frame) {
    console.log(first_frame)
    this.game.cache.addSpriteSheet(frame.name, '', bmd.canvas, first_frame.width, first_frame.height);//, frame.width/frame.height, 0, 0);
  } else {
    this.game.cache.addSpriteSheet(frame.name, '', bmd.canvas, this.standard_width, this.standard_height);
    // We could also just add an image but spritesheets are more convinient
    // this.game.cache.addImage(frame.name, '', bmd.canvas);
  }
}

return new SpritesheetGenerator();
});
