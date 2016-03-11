define("games/sudi/src/music", ["games/sudi/src/sound_system", function(SoundSystem) {
function Music(state, group) {
  this.sprite = state.add.sprite();
  this.group = group;
  this.sprite.entity = this;
  if (group)
    group.addChild(this.sprite);
};

Music.prototype.set = function (property, value) {
  //music
  this.properties = this.properties||{};
  this.properties[property]=value;
};

Music.prototype.get = function (property, value) {
  this.properties = this.properties||{};
  return this.properties[property]||0;
};

Music.prototype.setPosition = function(x,y) {
};

Music.prototype.damage = function(ammount) {
  // this.kill();
};

Music.prototype.update = function(dt) {
};

Music.prototype.interact = function(entity) {
  // entity.damage();
};

Music.prototype.trigger = function (t, player) {
  SoundSystem.theme(this.get("music"));
};

Music.prototype.trigger_end = function (t, player) {
};

return Music;
}]);
