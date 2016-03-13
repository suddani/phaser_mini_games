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

  this.active = false;

  this.texts = [];
  this.current = 0;
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
  if (!this.active) return;
  if (Pad.justDown(Pad.SHOOT)) {
        this.current += 1;
        if (this.current < this.texts.length) {
          HUD.speech(this.texts[this.current]);
        } else {
          this.current = 0;
          this.active = false;
          HUD.hideBars();
          HUD.hideSpeech();
          if (this.get("target"))
            this.manager.triggerById(parseInt(this.get("target")), this, this.entity, true);
          this.entity = null;
        }
      }
};

Speech.prototype.interact = function(entity) {
};

Speech.prototype.trigger = function (t, player) {
  this.active = true;
  this.current = 0;
  this.entity = player;
  HUD.showBars();
  HUD.speech(this.texts[this.current]);
};

Speech.prototype.trigger_end = function (t, player) {
};
return Speech;
}]);
