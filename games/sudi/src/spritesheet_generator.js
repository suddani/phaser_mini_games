define("games/sudi/src/spritesheet_generator", function() {
function SpritesheetGenerator() {

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
  //Check if there is actually more than one frame. otherwise just create this one image
  if (this.game.cache.getFrameData(atlas_key).getFrameByName(frame_name+"_0000"))
    this.game.cache.addSpriteSheet(frame.name, '', bmd.canvas, frame.height, frame.height, frame.width/frame.height, 0, 0);
  else
    this.game.cache.addImage(frame.name, '', bmd.canvas);
}

return new SpritesheetGenerator();
});
