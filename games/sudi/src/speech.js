define("games/sudi/src/speech", [
  "games/sudi/src/hud",
function(HUD) {
function Conversation(name, text) {
  this.name = name;
  this.text = text;
}
function Speech(state, group) {
  this.state = state;
  this.group = group;

  this.sprite = this.state.add.sprite();
  this.sprite.entity = this;
  if (this.group) {
    this.group.add(this.sprite);
  }

  this.texts = [];
};

Speech.prototype.set = function (property, value) {
  if (property == "texts") {
    var values = value.split(";");
    for (var i in values) {
      var input = values[i].split("|");
      this.texts.push(new Conversation(input[0], input[1]));
    }
  }
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
  // HUD.showBars();
  console.log("SPEECH")
};

Speech.prototype.trigger_end = function (t, player) {
};
return Speech;
}]);
