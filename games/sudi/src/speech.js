define("games/sudi/src/speech", function() {
function Speech(state, group) {
  this.state = state;
  this.group = group;
};

Speech.prototype.set = function (property, value) {
  this.properties = this.properties||{};
  this.properties[property]=value;
};

Speech.prototype.get = function (property, value) {
  this.properties = this.properties||{};
  return this.properties[property]||0;
};

Speech.prototype.setPosition = function(x,y) {
  this.x = x;
  this.y = y;
};

Speech.prototype.damage = function(ammount) {
  // this.kill();
};

Speech.prototype.update = function(dt) {
};

Speech.prototype.interact = function(entity) {
};

Speech.prototype.trigger = function (t, player) {
};

Speech.prototype.trigger_end = function (t, player) {
};
return Speech;
});
