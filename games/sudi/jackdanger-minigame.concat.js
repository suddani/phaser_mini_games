/*! sudi 2016-03-15 */
(function() {

var RequireRuntime = (function() {
  "use strict";
  RequireRuntime.later = function() {
    this.callbacks = [];
    this.errors = [];
    this.cerror = null;
    this.cdata = null;
    this.then = function(callback, errorCallback) {
      if (this.cdata) {
        this.cdata = callback(this.cdata);
      } else if (this.cerror && errorCallback) {
        errorCallback(this.ccerror)
      } else {
        if (this.callbacks && callback)    this.callbacks.push(callback);
        if (this.errors && errorCallback)  this.errors.push(errorCallback);
        if (this.cdata) {
          this.cdata = callback(this.cdata);
        } else if (this.cerror && errorCallback) {
          errorCallback(this.ccerror)
        }
      }
      return this;
    }
    this.call = function(data, array, target) {
      this[target] = data;
      for (var i in this[array]) {
        var return_value = this[array][i](this[target]);
        if (return_value) this[target] = return_value;
      }
      this.callbacks = null;
      this.errors = null;
    }
    this.resolve = function(data) {
      if (this.cdata || this.cerror) return;
      this.call(data, "callbacks", "cdata");
    }
    this.reject = function(data) {
      if (this.cdata || this.cerror) return;
      console.warn("Defer was rejected: "+data)
      this.call(data, "errors", "cerror");
    }
  }

  function RequireRuntime(){}
  RequireRuntime.module_defines = {};
  RequireRuntime.modules = {};
  RequireRuntime.file_registry = {};

  RequireRuntime.dependencies_resolved = function(dependencies) {
    for (var i in dependencies) {
      if (RequireRuntime.modules[dependencies[i]] == undefined || RequireRuntime.modules[dependencies[i]].then){
        return false;
      }
    }
    return true;
  }
  RequireRuntime.instantiateBlock = function(block, dependencies) {
    if (RequireRuntime.dependencies_resolved(dependencies)) {
      block.apply(0, RequireRuntime.mapDependencies(dependencies));
    }
  }
  RequireRuntime.instantiateModule = function(name, dependencies, defer) {
    if (RequireRuntime.dependencies_resolved(dependencies)) {
      RequireRuntime.modules[name] = RequireRuntime.module_defines[name].module.apply(0, RequireRuntime.mapDependencies(dependencies)) || {};
      defer.resolve(RequireRuntime.modules[name]);
    }
  }
  RequireRuntime.mapDependencies = function(dependencies) {
    return dependencies.map(function(dependency) {
      return RequireRuntime.modules[dependency];
    });
  }
  RequireRuntime.createModule = function(name) {
    var defer = new RequireRuntime.later();
    if (!RequireRuntime.module_defines[name]) {
      RequireRuntime.modules[name] = {};
      defer.resolve({});
      return defer;
    }
    RequireRuntime.modules[name] = defer;
    if (RequireRuntime.module_defines[name].dependencies.length > 0) {
      for (var d in RequireRuntime.module_defines[name].dependencies) {
        var dependency = RequireRuntime.module_defines[name].dependencies[d];
        RequireRuntime.resolve(dependency).then(function(module) {
          RequireRuntime.instantiateModule(name, RequireRuntime.module_defines[name].dependencies, defer);
        });
      }
    } else {
      RequireRuntime.instantiateModule(name, [], defer);
    }
    return defer;
  }
  RequireRuntime.resolve = function(module_name) {
    var defer = new RequireRuntime.later();
    if (RequireRuntime.modules[module_name]) {
      if (RequireRuntime.modules[module_name] instanceof RequireRuntime.later) {
        RequireRuntime.modules[module_name].then(function(mod) {
          defer.resolve(mod);
        });
      } else
        defer.resolve(RequireRuntime.modules[module_name]);
    } else if(RequireRuntime.module_defines[module_name]) {
      RequireRuntime.createModule(module_name).then(function(module) {
        defer.resolve(module);
      });
    } else if (RequireRuntime.file_registry[module_name+".js"]) {
      return RequireRuntime.file_registry[module_name+".js"];
    } else {
      RequireRuntime.file_registry[module_name+".js"] = defer;
      var head = document.getElementsByTagName('head')[0];
      var script = document.createElement('script');
      script.src = module_name+".js";
      script.addEventListener("load", function() {
        console.log("loaded file ("+module_name+")");
        RequireRuntime.createModule(module_name).then(function(module) {
          defer.resolve(module);
        });
      });
      script.addEventListener("error", function() {
        console.log("loaded file ("+module_name+")");
        defer.resolve(module_name);
      });
      head.appendChild(script);
    }
    return defer;
  }
  RequireRuntime.require = function(dependencies, block) {
    if (dependencies instanceof Array) {
      for (var i in dependencies){
        RequireRuntime.resolve(dependencies[i]).then(function() {
          RequireRuntime.instantiateBlock(block, dependencies)
        });
      }
    } else
      RequireRuntime.resolve(dependencies).then(block);
  }
  RequireRuntime.define = function(module_name, module) {
    var dependencies = [];
    var new_module = null;
    if (module instanceof Array) {
      for (var i in module) {
        if (i < module.length-1)
          dependencies.push(module[i]);
        else
          new_module = module[i];
      }
    } else {
      new_module = module;
    }
    RequireRuntime.module_defines[module_name] = {
      dependencies: dependencies,
      module: new_module
    };
  }
  return RequireRuntime;
})();
var require = RequireRuntime.require;
var define = RequireRuntime.define;

//==================================================================

define("lib/html", [function() {
  function Html() {
    this.parse = function(html_text) {
      var parser = new DOMParser();
      var doc = parser.parseFromString(html_text, "text/html");
      return doc;

      var doctype = document.implementation.createDocumentType(
        'html',
        '-//W3C//DTD XHTML 1.0 Strict//EN',
        'http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd'
      );

      var dom = document.implementation.createDocument(
        'http://www.w3.org/1999/xhtml',
        'html',
        doctype
      );

      dom.documentElement.innerHTML = html_text;
      return dom;
    }
  }
  return new Html();
}]);

//==================================================================

define("lib/dependency_loader", ["lib/http", "lib/html", function(http, html) {
  function DependencyLoader() {
  }
  DependencyLoader.prototype.load = function(path) {
    var defer = new RequireRuntime.later();
    http.get(path).then(function(data) {
      var links = [];
      for (var i = 0;i<html.parse(data).body.getElementsByTagName('a').length;i++) {
        var a = html.parse(data).body.getElementsByTagName('a')[i];
        var link = a.getAttribute("href");
        if (result = link.match(/(\w+).js$/)) links.push(path+"/"+result[1]);
      }
      return links;
    }).then(function(links) {
      RequireRuntime.require(links, function() {
        console.log("All dependencies loaded");
        defer.resolve(links);
      })
    });
    return defer;
  }
  return new DependencyLoader();
}]);

//==================================================================

define("lib/http", [function() {
  function Http() {
    console.warn("create Http class");
    this.get = function(url) {
      var defer = new RequireRuntime.later();
      var myRequest = new XMLHttpRequest();
      myRequest.onreadystatechange = function(event) {
        if (myRequest.readyState == 4) {
          defer.resolve(myRequest.response);
        }
      }
      myRequest.open("GET", url);
      myRequest.send();
      return defer;
    }
  }
  return new Http();
}]);

//==================================================================

define("games/sudi/src/map", [
  "games/sudi/src/spritesheet_generator",
function(SpritesheetGenerator) {
function Map(state, entity_manager) {
  this.state = state;
  this.entity_manager = entity_manager;
};

Map.prototype.load = function(level_name, atlas) {
  this.map = this.state.game.add.tilemap(level_name);
  // console.log(this.map);

  for (var idx in this.map.tilesets) {
    SpritesheetGenerator.createSpriteSheet(atlas, this.map.tilesets[idx].name);
    this.map.addTilesetImage(this.map.tilesets[idx].name, this.map.tilesets[idx].name);
  }

  this.groundlayer = this.map.createLayer('groundlayer');
  // this.groundlayer.collisionHeight = "16";
  // this.groundlayer.debug = true;
  // this.map.setCollisionBetween(1, 100, true, 'groundlayer');
  // this.map.setCollisionBetween(15, 1000, true, 'groundlayer');
  // this.map.setCollision(1, true, 'groundlayer');
  // this.map.setCollisionByExclusion([14,1], true, 'groundlayer')
  // this.map.calculateFaces("groundlayer");
  this.groundlayer.resizeWorld();
  this.createCollsionLayer();
  this.createTrigger();
  this.entity_manager.setWorldGeometry(this.collisionLayer);
  this.spawnEntities();
};

Map.prototype.createTrigger = function() {
  this.findObjectsByType(null, "trigger", function(element) {
    this.entity_manager.create_trigger_from_element(element);
  }, this);
};

Map.prototype.createCollsionLayer = function() {
  this.collisionLayer = this.state.game.add.group();
  this.collisionLayer.enableBody = true;
  this.collisionLayer.physicsBodyType = Phaser.Physics.ARCADE;
  this.collisionLayer.debug = true;

  this.findObjectsByType(null, "collision", function(element) {
    var collision = this.collisionLayer.create(element.x, element.y);
    collision.body.setSize(element.width,element.height);
    collision.body.immovable = true;
  }, this);
};

Map.prototype.spawnEntities = function() {
  var entities = this.findObjectsByType(null, "entities");
  for (var i in entities) {
    this.entity_manager.create_entity_from_element(entities[i]);
  }
};

//find objects in a Tiled layer that containt a property called "type" equal to a certain value
Map.prototype.findObjectsByType = function(type, layer, callback, context) {
  var result = new Array();
  this.map.objects[layer].forEach(function(element){
    if(!type || element.properties.type === type) {
      if (callback) callback.call(context, element);
      result.push(element);
    }
  });
  return result;
};

return Map;
}]);

//==================================================================

define("games/sudi/src/player", [
  "games/sudi/src/sound_system",
  "games/sudi/src/hud",
function(SoundSystem, HUD) {

Player.instance = {};

function Player(state, group) {
  this.state = state;
  this.group = group;

  this.duck = false;
  this.speed = 100;
  this.shoot = 0;

  this.sprite = this.state.add.sprite(0,0, "jack");
  if (this.group) {
    this.group.add(this.sprite);
  }
  this.sprite.entity = this;
  this.sprite.anchor.set(0.5, 1);
  this.sprite.animations.add("idle", [0,1,2,1], 5);
  this.sprite.animations.add("walk", [0,3,4,3], 14);
  this.sprite.animations.add("jump", [2], 7);
  this.sprite.animations.add("duck", [5], 7);
  this.sprite.animations.add("duck_walk", [5,6,7,6], 7);
  this.sprite.play("idle", 7, true);

  this.state.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
  this.reset_body_size();
  this.sprite.body.gravity.y = 600;
  this.sprite.body.immovable = false;
  // this.sprite.body.bounce.set(0.3);
  this.sprite.body.collideWorldBounds = true;

  this.state.camera.follow(this.sprite, Phaser.Camera.FOLLOW_PLATFORMER);

  // this.touching = {};
}

Player.prototype.set = function (property, value) {
  this.properties = this.properties||{};
  this.properties[property]=value;
};

Player.prototype.get = function (property, value) {
  this.properties = this.properties||{};
  return this.properties[property]||0;
};

Player.prototype.setPosition = function(x,y) {
  this.x = this.sprite.x = x;
  this.y = this.sprite.y = y;
}

Player.prototype.damage = function(ammount) {
  if (!HUD.cinematic) this.kill();
}

Player.prototype.reset_body_size = function() {
  if (this.duck) {
    this.sprite.body.setSize(10,16);
  }
  else
    this.sprite.body.setSize(10,30);
}

// Player.prototype.update_touching = function(touching) {
//   this.touching = JSON.parse(JSON.stringify(touching));
// }

Player.prototype.update = function(dt) {
  this.on_floor = (this.sprite.body.onFloor() || this.sprite.body.touching.down);
  if (!HUD.cinematic) {
    var isMoved = this.controls(dt);
  } else {
    // stop moving...
    this.sprite.body.velocity.x = 0;
  }
  if (this.shoot > 0) {
    this.shoot-=dt;
  }
  // this.touching = {};
  HUD.coins = this.get("coins");
  HUD.worms = this.get("worms");
}

Player.prototype.onFloor = function() {
  return this.on_floor;
}

Player.prototype.kill = function() {
  onLose();
}

Player.prototype.controls = function() {
  var isMoved = false;

  if (Pad.isDown(Pad.LEFT)) {
      this.sprite.body.velocity.x = -this.speed*(this.duck ? 0.5:1);
      isMoved = true;
      this.duck ? this.sprite.play("duck_walk") : this.sprite.play("walk");
      this.sprite.scale.x = -1;
  }
  if (Pad.isDown(Pad.RIGHT)) {
      this.sprite.body.velocity.x = this.speed*(this.duck ? 0.5:1);
      isMoved = true;
      this.duck ? this.sprite.play("duck_walk") : this.sprite.play("walk");
      this.sprite.scale.x = 1;
  }
  if ((Pad.isDown(Pad.UP) || Pad.isDown(Pad.JUMP)) && this.onFloor()) {
    // console.log("Start jumping")
    // this.sprite.body.position.y -= 1;
    this.sprite.body.velocity.y = -200;
    isMoved = true;
    SoundSystem.play("jump")
  }
  if (Pad.justDown(Pad.SHOOT) && this.get("worms") > 0 && this.shoot <= 0) {
    this.manager.fireBullet(this);
    this.set("worms", this.get("worms")-1);
    this.shoot = 0.5;
  }
  if (Pad.isDown(Pad.DOWN)) {
    this.duck = true;
  } else {
    this.duck = false;
  }
  this.reset_body_size();
  if (!isMoved) {
    this.duck ? this.sprite.play("duck") : this.sprite.play("idle");
    if (this.onFloor()) this.sprite.body.velocity.x = 0;
  }
  if (!this.onFloor()) {
    this.sprite.play("jump");
  }
  return isMoved;
}

return Player;
}]);

//==================================================================

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

//==================================================================

define("games/sudi/src/speech", [
  "games/sudi/src/hud",
function(HUD) {

Speech.shown = {};
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
  if (JSON.parse(this.get("show_once")) && Speech.shown[this.id]) {
    return;
  }
  Speech.shown[this.id] = true;
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

//==================================================================

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

//==================================================================

define("games/sudi/src/cloud", function() {
function Cloud(state, group) {
  this.state = state;
  this.group = group;
  this.sprite = this.state.add.sprite(0,0,"atlas", "cloud_0000")
  if (this.group) {
    this.group.add(this.sprite);
  }
  this.sprite.entity = this;
  this.sprite.anchor.set(0.5, 0.5);
  this.sprite.scale.set(1);
  this.sprite.angle = 0;

  this.sprite.animations.add("die", Phaser.Animation.generateFrameNames('cloud_', 0, 7, '', 4), 12);
  this.sprite.animations.add("spawn", Phaser.Animation.generateFrameNames('cloud_', 0, 7, '', 4).reverse(), 12);
  // this.sprite.animations.add("dead", [4], 5);
  // this.sprite.play("walk", 5, true);

  this.state.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
  this.sprite.body.setSize(32, 10, 0, 8);
  this.sprite.body.immovable = true;
  this.sprite.body.collideWorldBounds = true;

  this.dead = false;
  this.respawn = 1;
  this.respawn_timer = 0;
};

Cloud.prototype.set = function (property, value) {
  if (property=="despawn" && JSON.parse(value)) this.sprite.exists = false;
  this.properties = this.properties||{};
  this.properties[property]=value;
};

Cloud.prototype.get = function (property, value) {
  this.properties = this.properties||{};
  if (property == "respawn") {
    return this.properties["respawn"] ? parseFloat(this.properties["respawn"]) : 5;
  }
  return this.properties[property]||0;
};

Cloud.prototype.setPosition = function(x,y) {
  // this.sparks.x =
  this.x = this.sprite.x = x;
  // this.sparks.y =
  this.y = this.sprite.y = y;
};

Cloud.prototype.damage = function(ammount) {
};

Cloud.prototype.shouldCollide = function(entity) {
  return (entity.sprite.body.velocity.y > 0 &&
      ((entity.sprite.body.position.y+entity.sprite.body.height-10) < this.sprite.body.position.y));
}

Cloud.prototype.update = function(dt) {
  if (!this.sprite.exists) return;

  if (this.dead) {
    // console.log("check for respawn: "+this.respawn_timer)
    if (this.respawn_timer > 0)
      this.respawn_timer -= dt;
    else {
      this.dead = false;
      this.sprite.body.enable = true;
      this.sprite.play("spawn");
    }
  }
};

Cloud.prototype.interact = function(entity) {
  if (!this.dead && this.sprite.body.touching.up) {
    this.respawn_timer = this.get("respawn");
    this.dead = true;
    this.sprite.body.enable = false;
    this.sprite.play("die");
  }
};

Cloud.prototype.trigger = function (t, player) {
  if (!this.sprite.exists) {
    this.sprite.exists = true;
    this.dead = false;
    this.sprite.body.enable = true;
    this.sprite.play("spawn");
  }
};

Cloud.prototype.trigger_end = function (t, player) {
};

return Cloud;
});

//==================================================================

define("games/sudi/src/collectable", ["games/sudi/src/sound_system",
function(SoundSystem) {

Collectable.totalCount = {};

function Collectable(state, group) {
  this.state = state;
  this.group = group;
  this.sprite = this.state.add.sprite()
  if (this.group) {
    this.group.add(this.sprite);
  }
  this.sprite.entity = this;

  this.anim = null;
  this.frames = null;

  this.state.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
  this.sprite.body.immovable = false;
  this.sprite.body.collideWorldBounds = true;
};


Collectable.prototype.startAnimation = function () {
  if (!this.frames) return;
  this.anim = this.sprite.animations.add("idle", this.frames, this.fps);
  this.anim.play(this.fps, true);
}

Collectable.prototype.set = function (property, value) {
  //anchor
  //size
  //scale
  //animation
  //sprite
  //gravity
  //name
  //sound
  //bounce
  if (property=="anchor") {
    values = value.split(",");
    this.sprite.anchor.set(parseFloat(values[0]), parseFloat(values[1]));
  }
  if (property=="size") {
    values = value.split(",");
    while(values.length < 4) {
      values.push(0)
    }
    this.sprite.body.setSize( parseFloat(values[0]), parseFloat(values[1]),
                              parseFloat(values[2]), parseFloat(values[3]));
  }
  if (property=="scale") {
    values = value.split(",");
    this.sprite.scale.set(parseFloat(values[0]), parseFloat(values[1]));
  }
  if (property=="animation") {
    values = value.split(",");
    this.frames = values;
    this.fps = 12;
    if (parseInt(values[values.length-1])) {
      this.frames = values.slice(0,values.length-1);
      this.fps = values[values.length-1];
    }
  }
  if (property=="sprite") {
    values = value.split(",");
    if (values.length > 1)
      this.sprite.loadTexture(values[0], values[1]);
    else
      this.sprite.loadTexture(values[0]);
    this.startAnimation();
  }
  if (property=="gravity") {
    this.sprite.body.gravity.y = parseFloat(value);
  }
  if (property=="name") {
    Collectable.totalCount[value] = Collectable.totalCount[value]||0;
    Collectable.totalCount[value] += 1;
  }
  if (property=="bounce") {
    values = value.split(",");
    if (values.length > 1)
      this.sprite.body.bounce.set(values[0], values[1])
    else
      this.sprite.body.bounce.set(values[0])
  }
  this.properties = this.properties||{};
  this.properties[property]=value;
};

Collectable.prototype.get = function (property, value) {
  this.properties = this.properties||{};
  if (property=="amount") return parseInt(this.properties[property])||1;
  return this.properties[property]||0;
};

Collectable.prototype.setPosition = function(x,y) {
  this.x = this.sprite.x = x-8;
  this.y = this.sprite.y = y;
};

Collectable.prototype.damage = function(ammount) {
};

Collectable.prototype.update = function(dt) {
};

Collectable.prototype.interact = function(entity) {
  entity.set(this.get("name"), entity.get(this.get("name"))+this.get("amount"));
  SoundSystem.play(this.get("sound"));
  this.owner = null;
  this.manager = null;
  this.sprite.entity = null;
  this.sprite.destroy();
};

Collectable.prototype.trigger = function (t, player) {
};

Collectable.prototype.trigger_end = function (t, player) {
};

return Collectable;
}]);

//==================================================================

define("games/sudi/src/trapdoor", function() {
function TrapDoor(state, group) {
  this.state = state;
  this.group = group;
  this.sprite = this.state.add.sprite(0,0, "trapdoor");
  if (this.group) {
    this.group.add(this.sprite);
  }
  this.sprite.entity = this;
  this.sprite.anchor.set(0.04, 0.97);
  this.sprite.scale.set(1);
  this.sprite.angle = 0;
  // this.sprite.animations.add("walk", [0,1,2,3,2,1], 5);
  // this.sprite.animations.add("dead", [4], 5);
  // this.sprite.play("walk", 5, true);

  this.state.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
  this.sprite.body.setSize(64, 10, 0, 0);
  this.sprite.body.immovable = true;
  this.sprite.body.collideWorldBounds = true;
  // this.sprite.exists = false

  this.opened = false;
};

TrapDoor.prototype.set = function (property, value) {
  this.properties = this.properties||{};
  this.properties[property]=value;
};

TrapDoor.prototype.get = function (property, value) {
  this.properties = this.properties||{};
  return this.properties[property]||0;
};

TrapDoor.prototype.setPosition = function(x,y) {
  this.x = this.sprite.x = x;
  this.y = this.sprite.y = y;
};

TrapDoor.prototype.damage = function(ammount) {
  // this.kill();
};

TrapDoor.prototype.update = function(dt) {
  if (this.opened && this.sprite.angle > -90)  {
    this.sprite.angle -= 45*dt;
  } else if (!this.opened && this.sprite.angle < 0) {
    this.sprite.angle += 45*dt;
  } else if (this.sprite.angle>0)
    this.sprite.angle = 0;
  else if (this.sprite.angle<-90)
    this.sprite.angle = -90;
};

TrapDoor.prototype.open = function() {
  this.opened = true;
}

TrapDoor.prototype.close = function() {

}

TrapDoor.prototype.interact = function(entity) {

};

TrapDoor.prototype.trigger = function (t, player) {
  if (this.opened && this.sprite.angle <= -90) {
    this.sprite.body.setSize(64, 10, 0, 0);
    this.opened = false;
  } else if (!this.opened && this.sprite.angle>=0) {
    this.sprite.body.setSize(10, 64, 0, 0);
    this.opened = true;
  }
};

TrapDoor.prototype.trigger_end = function (t, player) {
};

return TrapDoor;
});

//==================================================================

define("games/sudi/src/flag", ["games/sudi/src/collectable",
function(Collectable) {
function Flag(state, group) {
  this.state = state;
  this.group = group;
  this.sprite = this.state.add.sprite(0,0, "flag");
  if (this.group) {
    this.group.add(this.sprite);
  }
  this.sprite.entity = this;
  this.sprite.anchor.set(0.5, 1);
  // this.sprite.animations.add("idle", [0,1,2,3,4,5], 5);
  // this.sprite.play("idle", 5, true);

  this.state.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
  this.sprite.body.setSize(16, 32, 0, 0);
  this.sprite.body.immovable = true;
};

Flag.prototype.set = function (property, value) {
  this.properties = this.properties||{};
  this.properties[property]=value;
};

Flag.prototype.get = function (property, value) {
  this.properties = this.properties||{};
  return this.properties[property]||0;
};

Flag.prototype.setPosition = function(x,y) {
  this.x = this.sprite.x = x;
  this.y = this.sprite.y = y;
};

Flag.prototype.update = function(dt) {
};

Flag.prototype.interact = function(entity) {
  // Collecting all coins is really hard so let the player win even if he didnt
  onVictory();
  // var coinsMissing = Collectable.totalCount["coins"]-entity.get("coins");
  // if (coinsMissing<=0)
  //   onVictory();
  // else {
  //   console.log("You missed "+coinsMissing+" coins!");
  //   onLose();
  // }
};

return Flag;
}]);

//==================================================================

define("games/sudi/src/tourtle", ["games/sudi/src/sound_system",
function(SoundSystem) {
function Tourtle(state, group) {
  this.state = state;
  this.group = group;
  this.sprite = this.state.add.sprite(0,0, "tourtle");
  if (this.group) {
    this.group.add(this.sprite);
  }
  this.sprite.entity = this;
  this.sprite.anchor.set(0.5, 1);
  this.sprite.animations.add("walk", [0,1,2,3,2,1], 5);
  this.sprite.animations.add("dead", [4], 5);
  this.sprite.play("walk", 5, true);

  this.state.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
  this.sprite.body.setSize(32, 13, 0, 0);
  this.sprite.body.immovable = true;
  this.sprite.body.collideWorldBounds = true;
  // this.sprite.body.gravity.y = 300;
  // this.sprite.body.bounce.set(1);

  // this.sprite.body.velocity.x = 20;
}

Tourtle.prototype.set = function (property, value) {
  this.properties = this.properties||{};
  this.properties[property]=value;
};

Tourtle.prototype.get = function (property, value) {
  this.properties = this.properties||{};
  return this.properties[property]||0;
};

Tourtle.prototype.setPosition = function(x,y) {
  this.x = this.sprite.x = x;
  this.y = this.sprite.y = y;
}

Tourtle.prototype.damage = function(ammount) {
  this.kill();
}

Tourtle.prototype.update = function(dt) {
  if (this.dead_timer!= null) {
    this.dead_timer-=dt;
    if (this.dead_timer <= 0) {
      this.owner = null;
      this.manager = null;
      this.sprite.entity = null;
      this.sprite.destroy();
    }
    return;
  }
  if (this.sprite.x > this.x+parseInt(this.get("move"))) {
    this.sprite.body.velocity.x = -(parseInt(this.get("speed"))||20);
  }
  else if(this.sprite.x < this.x-parseInt(this.get("move"))) {
    this.sprite.body.velocity.x = parseInt(this.get("speed"))||20;
  }
  else if (this.sprite.body.velocity.x == 0) {
    this.sprite.body.velocity.x = (!!parseInt(Math.random()*2) ? 1 : -1)*(parseInt(this.get("speed"))||20);
  }
  if (this.sprite.body.velocity.x > 0)
    this.sprite.scale.x = -1;
  else
    this.sprite.scale.x = 1;
}
Tourtle.prototype.kill = function() {
  this.dead_timer = 0.8;
  this.sprite.play("dead");
  SoundSystem.play("loss");
  this.sprite.body.velocity.x = (!!parseInt(Math.random()*2) ? 1 : -1)*(parseInt(this.get("speed"))||20);
  this.sprite.body.velocity.y = -60;
  this.sprite.body.gravity.y = 300;
}

Tourtle.prototype.interact = function(entity) {
  if (this.sprite.body.touching.up){
    this.kill();
  }
  else if (entity.damage)
    entity.damage();//onLose();
}

return Tourtle;
}]);

//==================================================================

define("games/sudi/src/npc", ["games/sudi/src/collectable",
function(Collectable) {
function NPC(state, group) {
  this.group = group;
  this.state = state;
  this.sprite = this.state.add.sprite(16,this.ground, "enemy");
  if (this.group) {
    this.group.add(this.sprite);
  }
  this.sprite.entity = this;
  this.sprite.anchor.set(0.35, 1);
  this.sprite.animations.add("idle", [0,1,2,1], 7);
  this.sprite.animations.add("walk", [0,3,4,3], 7);
  this.sprite.play("idle", 7, true);

  this.state.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
  this.sprite.body.setSize(16, 32, 0, 0);
  this.sprite.body.immovable = true;
  this.sprite.body.collideWorldBounds = true;

  this.quest_done = false;
};

NPC.prototype.shouldCollide = function(entity) {
  return !this.quest_done;

}

NPC.prototype.set = function (property, value) {
  this.properties = this.properties||{};
  this.properties[property]=value;
};

NPC.prototype.get = function (property, value) {
  this.properties = this.properties||{};
  return this.properties[property]||0;
};

NPC.prototype.setPosition = function(x,y) {
  this.x = this.sprite.x = x;
  this.y = this.sprite.y = y;
};

NPC.prototype.damage = function(ammount) {
  // this.kill();
};

NPC.prototype.update = function(dt) {
};

NPC.prototype.interact = function(entity) {
  var coinsMissing = Collectable.totalCount["coins"]-entity.get("coins");
  if (coinsMissing<=0) {
    this.manager.triggerById(parseInt(this.get("has_coins")), this, entity, true);
    this.quest_done = true;
  }
  else {
    console.log("You missed "+coinsMissing+" coins!");
    console.log("Tell it to: "+this.get("has_nocoins"));
    this.manager.triggerById(parseInt(this.get("has_nocoins")), this, entity, true);
  }
};

NPC.prototype.trigger = function (t, player) {
};

NPC.prototype.trigger_end = function (t, player) {
};

return NPC;
}]);

//==================================================================

define("games/sudi/src/mole", [
  "games/sudi/src/sound_system",
  "games/sudi/src/hud",
function(SoundSystem, HUD) {
function Mole(state, group) {
  window.mole = this;
  this.state = state;
  this.group = group;
  this.sprite = this.state.add.sprite(0,0, "mole");
  if (this.group) {
    this.group.add(this.sprite);
  }
  this.sprite.entity = this;
  this.sprite.anchor.set(0.5, 1);
  this.sprite.animations.add("idle", [0,1,2,1], 5);
  this.attackAnimation = this.sprite.animations.add("attack", [3,4,5,6,7], 5);
  this.sprite.animations.add("hidden", [8], 1);
  this.hiddenAnim = this.sprite.play("hidden", 5, true);

  this.state.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
  this.sprite.body.setSize(28, 20, 0, 0);
  this.sprite.body.immovable = true;
  this.sprite.body.collideWorldBounds = true;

  this.shootTimer = 0;
};

Mole.prototype.trigger = function (t, player) {
  this.sprite.play("idle", 5, true);
  this.target = player;
  this.shootTimer = 0.2;
};

Mole.prototype.trigger_end = function (t, player) {
  this.target_x = this.target.sprite.x;
  this.target_y = this.target.sprite.y;
  this.target = null;
};

Mole.prototype.set = function (property, value) {
  this.properties = this.properties||{};
  this.properties[property]=value;
};

Mole.prototype.get = function (property, value) {
  this.properties = this.properties||{};
  return this.properties[property]||0;
};

Mole.prototype.setPosition = function(x,y) {
  this.x = this.sprite.x = x;
  this.y = this.sprite.y = y;
};

Mole.prototype.damage = function(ammount) {
  this.kill();
};

Mole.prototype.update = function(dt) {
  if (this.dead_timer!= null) {
    this.dead_timer-=dt;
    if (this.dead_timer <= 0) {
      this.owner = null;
      this.manager = null;
      this.sprite.entity = null;
      this.sprite.destroy();
    }
    return;
  }

  if (this.shootTimer>0) {
    this.shootTimer-=dt;
  }

  if (this.target) {
    if (!this.attackAnimation.isPlaying) {
      this.sprite.play("idle", 5, true);
    }
    this.sprite.scale.x = this.target.sprite.x-this.sprite.x < 0 ? 1 : -1;
    if (this.target && this.shootTimer<=0 && !this.attackAnimation.isPlaying) {
      this.shootTimer=5;
      this.sprite.play("attack", 5, false).onComplete.addOnce(this.shoot, this);
    }
  } else if (!this.shooting && this.shootTimer <= 0) {
    this.sprite.play("hidden", 5, true);
  }
};

Mole.prototype.shoot = function() {
  this.manager.fireBullet(this, this.target, this.target_x, this.target_y);
  this.shootTimer=1;
  this.sprite.play("idle", 5, true)
};

Mole.prototype.kill = function() {
  // you cant touch this
  if (this.hiddenAnim.isPlaying) return;
  this.dead_timer = 1;
  this.sprite.play("hidden", 5, true);
  SoundSystem.play("loss");
};

Mole.prototype.interact = function(entity) {
  if (this.sprite.body.touching.up){
    this.kill();
    // HUD.hideBars();
  }
  // else {
  //   this.sprite.play("hidden");
  //   // HUD.showBars();
  // }
    // onLose();
};

return Mole;
}]);

//==================================================================

define("games/sudi/src/game", [
  "games/sudi/src/physics",
  "games/sudi/src/map",
  "games/sudi/src/entity_manager",
  "games/sudi/src/collectable",
  "games/sudi/src/sound_system",
  "games/sudi/src/hud",
  "games/sudi/src/spritesheet_generator",
function(Physics, Map, EntityManager, Collectable, SoundSystem, HUD, SpritesheetGenerator) {
  // console.log("Load sudi game")
  function Main() {
  };
  Main.prototype.init = function() {
    console.log("init sudi game");
    addLoadingScreen(this, false);
  };
  Main.prototype.preload = function() {
    this.load.path = 'games/' + currentGameData.id + '/assets/';

    //füge hie rein was du alles laden musst.
    // this.load.spritesheet("jack", "jack.png",             32*1,32*1,  8);

    //Maps
    this.load.tilemap('level1', 'maps/level1.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.atlasJSONHash("atlas");

    //SoundSystem
    SoundSystem.preload(this);
  };
  Main.prototype.create = function() {
    Pad.init(this.game);


  }
  Main.prototype.mycreate = function() {
    this.game.time.advancedTiming = true;

    SpritesheetGenerator.init(this.game);

    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

    Physics.init(this.game);
    SoundSystem.init(this);
    HUD.init(this);
    Collectable.totalCount = {};

    SoundSystem.theme("standard");

    this.entity_manager = new EntityManager(this);

    this.map = new Map(this, this.entity_manager);
    this.map.load("level1", "atlas");

    this.game.stage.backgroundColor = "#4488AA";
  };
  Main.prototype.shutdown = function() {
    SoundSystem.shutdown();
  };
  Main.prototype.update = function() {
    var dt = this.time.physicsElapsedMS * 0.001;
    if (this.entity_manager) {
      this.entity_manager.update(dt);
      HUD.update();
    }
  };
  Main.prototype.render = function() {
    // game.debug.text(game.time.suggestedFps, 32, 32);
    this.game.debug.text(game.time.fps, 2, 14, "#00ff00");
    if (this.entity_manager) this.entity_manager.render();
  };
  return Main;
}]);

//==================================================================

define("games/sudi/src/entity_manager", [
  "games/sudi/src/trigger",
  "games/sudi/src/player",
  "games/sudi/src/flag",
  "games/sudi/src/tourtle",
  "games/sudi/src/mole",
  "games/sudi/src/bullet",
  "games/sudi/src/trapdoor",
  "games/sudi/src/lava",
  "games/sudi/src/lever",
  "games/sudi/src/cloud",
  "games/sudi/src/music",
  "games/sudi/src/collectable",
  "games/sudi/src/speech",
  "games/sudi/src/npc",
function(Trigger, Player,
         Flag, Tourtle, Mole,
         Bullet, TrapDoor,
         Lava, Lever, Cloud,
         Music, Collectable, Speech,
         NPC) {
function EntityManager(state) {
  this.state = state;
  // this.entities = [];
  this.groups = {
    "player": createGroup(state),
    "collectable": createGroup(state),
    "interactable": createGroup(state),
    "bullet": createGroup(state),
    "trigger": createGroup(state),
    "none": createGroup(state)
  };
  function createGroup(state) {
    var group = state.add.group();
    group.enableBody = true;
    group.physicsBodyType = Phaser.Physics.ARCADE;
    return group;
  }
  this.worldGeometry = null;
}

EntityManager.prototype.getGroup = function(type) {
  if (type in this.groups) return this.groups[type];
  return null;
}

EntityManager.prototype.setWorldGeometry = function(worldGeometry) {
  this.worldGeometry = worldGeometry;
}

EntityManager.prototype.fireBullet = function(owner, target, x, y) {
  var bullet = new Bullet(this.state, this.getGroup("bullet"));
  bullet.owner = owner;
  bullet.manager = this;
  bullet.setPosition(owner.sprite.x+10*owner.sprite.scale.x, owner.sprite.y-(owner.duck ? 0 : 8));
  if (target) {
    bullet.sprite.body.velocity.x = target.sprite.x-bullet.sprite.x;
    bullet.sprite.body.velocity.y = target.sprite.y-bullet.sprite.y;
  }
  else if (x && y) {
    bullet.sprite.body.velocity.x = x-bullet.sprite.x;
    bullet.sprite.body.velocity.y = y-bullet.sprite.y;
  }
  else
    bullet.sprite.body.velocity.x = owner.sprite.scale.x;

  bullet.sprite.body.velocity.setMagnitude(150);
}

EntityManager.prototype.create_trigger_from_element = function(element) {
  var trigger = new Trigger(this.state, this.getGroup("trigger"));
  trigger.manager = this;
  trigger.id = element.properties.id;
  trigger.setPosition(element.x, element.y);
  trigger.setSize(element.width,element.height);
  Object.keys(element.properties).forEach(function(key){
    trigger.set(key, element.properties[key]);
  });
}

EntityManager.prototype.create_entity_from_element = function(element) {
  if (element.properties["class"]) {
    try {
      var constructor = eval(element.properties["class"]);
      var entity = new constructor(this.state, this.getGroup(element.properties["type"]));
      entity.manager = this;
      entity.id = element.properties.id;
      entity.setPosition(element.x+16, element.y);
      Object.keys(element.properties).forEach(function(key){
        entity.set(key, element.properties[key]);
      });
      // this.entities.push(entity);
    } catch(e) {
      console.warn(e);
    }
  }
}

EntityManager.prototype.triggerById = function(id, trigger, trigger_entity, starting) {
  for (var g in this.groups) {
    this.groups[g].forEachAlive(function(member) {
      if (member.entity && member.entity.id == id){
        var target = member.entity;
        if (target && starting) target.trigger(trigger, trigger_entity);
        else if (target && !starting) target.trigger_end(trigger, trigger_entity);
      }
    }, this);
  }
}

EntityManager.prototype.getById = function(id) {
  // console.log("Find entity: "+id)
  var entity = null;
  for (var g in this.groups) {
    this.groups[g].forEachAlive(function(member) {
      if (!entity && member.entity && member.entity.id == id) entity = member.entity;
    }, this);
    if (entity) break;
  }
  return entity;
}

EntityManager.prototype.update = function(dt) {
  this.state.game.physics.arcade.collide(this.groups["player"], this.worldGeometry, function(player, folliage) {
  }, null, this);
  this.state.game.physics.arcade.collide(this.groups["collectable"], this.worldGeometry, function(collectable, folliage) {
  }, null, this);
  this.state.game.physics.arcade.collide(this.groups["player"], this.groups["collectable"], function(player, collectable) {
    collectable.entity.interact(player.entity);
    return true;
  }, null, this);
  this.state.game.physics.arcade.collide(this.groups["player"], this.groups["interactable"], function(player, interactable) {
    interactable.entity.interact(player.entity);
    return true;
  }, function(player, interactable) {
    //this is for ladders...
    var check = interactable.entity.dead_timer == null && (interactable.entity.shouldCollide ? interactable.entity.shouldCollide(player.entity) : true);
    // console.log("Shoudl check collision between player and interactable: "+check);
    return check;
  }, this);
  this.state.game.physics.arcade.collide(this.groups["bullet"], this.worldGeometry, function(bullet, folliage) {
    bullet.entity.kill();
  }, null, this);
  this.state.game.physics.arcade.collide(this.groups["bullet"], this.groups["interactable"], function(bullet, interactable) {
    bullet.entity.interact(interactable.entity);
  }, function(bullet, interactable) {
    return bullet.entity.owner.group != interactable.entity.group;
  }, this);
  this.state.game.physics.arcade.collide(this.groups["bullet"], this.groups["player"], function(bullet, player) {
    bullet.entity.interact(player.entity);
  }, function(bullet, player) {
    return bullet.entity.owner != player.entity && (bullet.entity.shouldCollide ? bullet.entity.shouldCollide(player.entity) : true);
  }, this);
  this.state.game.physics.arcade.overlap(this.groups["player"], this.groups["trigger"], function(player, trigger) {

  }, function(player, trigger) {
    trigger.entity.interact(player.entity);
    return false;
  }, this);

  this.groups["player"].forEach(function(member) {
    member.entity.update(dt);
  }, this);
  this.groups["interactable"].forEach(function(member) {
    member.entity.update(dt);
  }, this);
  this.groups["bullet"].forEach(function(member) {
    member.entity.update(dt);
  }, this);
  this.groups["trigger"].forEach(function(member) {
    member.entity.update(dt);
  }, this);
  this.groups["none"].forEach(function(member) {
    member.entity.update(dt);
  }, this);
}

EntityManager.prototype.render = function() {
  if (this.debug) {
    for (var g in this.groups) {
      this.groups[g].forEach(function(member) {
        this.state.game.debug.body(member);
      }, this);
    }
    this.worldGeometry.forEach(function(member) {
      this.state.game.debug.body(member);
    }, this);
  }
}

return EntityManager;
}
])

//==================================================================

define("games/sudi/src/physics", function() {
function Physics() {

};

Physics.prototype.init = function(game) {
  this.game = game;
  this.game.physics.startSystem(Phaser.Physics.ARCADE);
  this.game.time.desiredFps = 60;
  // this.game.physics.arcade.gravity.y = 600;
};

return new Physics();
});

//==================================================================

define("games/sudi/src/sound_system", function(){
function SoundSystem() {
  this.volume = 0.05
};

SoundSystem.prototype.init = function(game) {
  this.game = game;
  this.sounds = {
    "jump"   : this.game.add.audio('jump'),
    "loss"   : this.game.add.audio('loss'),
    "pickup" : this.game.add.audio('pickup')
  };
  this.music = {
    "standard": this.game.add.audio("Netherplace_Looping", 1, true, true),
    "boss": this.game.add.audio("Goblin-Loop", 1, true, true),
    "cave": this.game.add.audio("Secret-Journey_Looping", 1, true, true),
    "win": this.game.add.audio("Dont-Mess-with-the-8-Bit-Knight", 1, true, true)
  }
};

SoundSystem.prototype.shutdown = function() {
  for (var i in this.music) {
    this.music[i].stop();
  }
};

SoundSystem.prototype.preload = function(game) {
  this.game = game;
  this.game.load.audio('jump', 'audio/jump.wav');
  this.game.load.audio('loss', 'audio/loss.wav');
  this.game.load.audio('pickup', 'audio/pickup.wav');
  this.game.load.audio('Netherplace_Looping', 'audio/Netherplace_Looping.mp3');
  this.game.load.audio('Goblin-Loop', 'audio/Goblin-Loop.mp3');
  this.game.load.audio('Secret-Journey_Looping', 'audio/Secret-Journey_Looping.mp3');
  this.game.load.audio('Dont-Mess-with-the-8-Bit-Knight', 'audio/Dont-Mess-with-the-8-Bit-Knight.mp3');
};

SoundSystem.prototype.play = function(name) {
  this.sounds[name].play('', 0, this.volume);
};

SoundSystem.prototype.theme = function(name) {
  for (var i in this.music) {
    this.music[i].stop();
  }
  this.music[name].restart('', 0, this.volume, true);
};

return new SoundSystem();
}
);

//==================================================================

define("games/sudi/src/bullet", function() {
function Bullet(state, group) {
  this.state = state;
  this.group = group;
  this.sprite = this.state.add.sprite(0,0, "wormbullet");
  if (this.group) {
    this.group.add(this.sprite);
  }
  this.sprite.entity = this;
  this.sprite.anchor.set(0.5,1);
  this.sprite.animations.add("idle", [0,1,2,1], 5);
  this.sprite.animations.add("die", [3,4,5,6,7,8], 5);
  this.sprite.play("idle", 10, true);
  this.sprite.scale.set(0.8);

  this.state.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
  this.sprite.body.setSize(22, 8, 0, -10);
  this.sprite.body.immovable = false;
  this.sprite.body.collideWorldBounds = true;
  this.sprite.body.bounce.set(0);
};

Bullet.prototype.shouldCollide = function(entity) {
  return this.dead_timer== null;
}

Bullet.prototype.kill = function () {
  this.dead_timer = 0.5;
  this.sprite.play("die", 10);
  this.sprite.body.immovable = true;
  this.sprite.body.velocity.set(0);
  this.sprite.alive = false;
};

Bullet.prototype.interact = function (entity) {
  if (!this.sprite.alive) return;
  if (this.sprite.body.touching.up) {
    if (Math.random()*100<30)
    this.manager.create_entity_from_element({
      x: this.sprite.x+16,
      y: this.sprite.y,
      properties : {
        type: "collectable",
        class: "Collectable",
        amount: "1",
        anchor: "0.5,1",
        animation: "wormbullet_0000,wormbullet_0001,wormbullet_0002,wormbullet_0001,5",
        bounce: "1",
        gravity: "100",
        name: "worms",
        size: "22,8,0,-10",
        sound: "pickup",
        sprite: "atlas,wormbullet_0000"
      }
    });
  } else {
    if (entity.damage) entity.damage(1);
  }
  this.kill();
};

Bullet.prototype.set = function (property, value) {
  this.properties = this.properties||{};
  this.properties[property]=value;
};

Bullet.prototype.get = function (property, value) {
  this.properties = this.properties||{};
  return this.properties[property]||0;
};

Bullet.prototype.setPosition = function(x,y) {
  this.x = this.sprite.x = x;
  this.y = this.sprite.y = y;
};

Bullet.prototype.update = function(dt) {
  if (this.dead_timer!= null) {
    this.dead_timer-=dt;
    if (this.dead_timer <= 0) {
      this.owner = null;
      this.manager = null;
      this.sprite.entity = null;
      this.sprite.destroy();
    }
    return;
  }
};
return Bullet;
});

//==================================================================

define("games/sudi/src/spritesheet_generator", function() {
function SpritesheetGenerator() {
  this.standard_width = 32;
  this.standard_height = 32;
};

SpritesheetGenerator.prototype.init = function(game) {
  this.game = game;
};

SpritesheetGenerator.prototype.getFrames = function(atlas_key) {
  if (!this.game) console.error("SpritesheetGenerator not initialized");
  var frames = [];
  for (var i in this.game.cache.getFrameData(atlas_key)._frames) {
    var frame = this.game.cache.getFrameData(atlas_key)._frames[i];
    // only collect frames that have no animation keys
    if (!frame.name.match(/_\d+/)) frames.push(frame);
  }
  return frames;
};

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
  orb.destroy();
  this.game.cache.addImage(frame.name, '', bmd.canvas);
  // Check if there is actually more than one frame. then use the first frames info
  // to create the sprite sheet. Otherwise assume standard tile size
  var first_frame = this.game.cache.getFrameData(atlas_key).getFrameByName(frame_name+"_0000")
  if (first_frame) {
    // console.log(first_frame)
    this.game.cache.addSpriteSheet(frame.name, '', bmd.canvas, first_frame.width, first_frame.height);//, frame.width/frame.height, 0, 0);
  } else {
    this.game.cache.addSpriteSheet(frame.name, '', bmd.canvas, this.standard_width, this.standard_height);
    // We could also just add an image but spritesheets are more convinient
    // this.game.cache.addImage(frame.name, '', bmd.canvas);
  }
};

return new SpritesheetGenerator();
});

//==================================================================

define("games/sudi/src/lava", function() {
function Lava(state, group) {
  this.state = state;
  this.group = group;
  this.sprite = this.state.add.tileSprite(0,0,32,64, "atlas", "lavaanim_0000");
  if (this.group) {
    this.group.add(this.sprite);
  }
  this.sprite.entity = this;
  this.sprite.anchor.set(0.04, 0.97);
  this.sprite.scale.set(1);
  this.sprite.angle = 0;
  // this.sprite.exists = false

  this.sparks = this.state.add.emitter(0, 0, 50);
  this.sprite.addChild(this.sparks);
  this.sparks.makeParticles(["atlas"], ["smoke_0000", "smoke_0001", "smoke_0002"]);
  this.sparks.maxParticleScale = 1;
  this.sparks.minParticleScale = 1;
  this.sparks.setYSpeed(-10, -30);
  this.sparks.setXSpeed(0,0);
  this.sparks.gravity = 0;
  this.sparks.width = 32;
  this.sparks.minRotation = 0;
  this.sparks.maxRotation = 0;
  this.sparks.start(false, 800, 100);
  this.sparks.y = -64;
  // this.sprite.animations.add("walk", [0,1,2,3,2,1], 5);
  // this.sprite.animations.add("dead", [4], 5);
  // this.sprite.play("walk", 5, true);

  this.state.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
  this.sprite.body.setSize(32, 64, 0, 0);
  this.sprite.body.immovable = true;
  this.sprite.body.collideWorldBounds = true;
  // this.sprite.exists = false
};

Lava.prototype.set = function (property, value) {
  if (property == "width") {
    this.sparks.width = value*28;
    this.sprite.width = value*32;
    this.sparks.x = this.sprite.width/2-this.sprite.width*0.04;
    console.log("SparksY: "+this.sparks.y);
    this.sprite.body.setSize(value*32, 64, 0, 0);
  }
  this.properties = this.properties||{};
  this.properties[property]=value;
};

Lava.prototype.get = function (property, value) {
  this.properties = this.properties||{};
  return this.properties[property]||0;
};

Lava.prototype.setPosition = function(x,y) {
  // this.sparks.x = x+this.sparks.width/2;
  // this.sparks.y = y-64;
  // console.log("SparksY: "+this.sparks.y);
  this.x = this.sprite.x = x;
  this.y = this.sprite.y = y;
};

Lava.prototype.damage = function(ammount) {
  // this.kill();
};

Lava.prototype.update = function(dt) {
  this.sprite.tilePosition.x+=13*dt;
  this.sparks.forEachAlive(function(p) {
    p.alpha= p.lifespan / this.sparks.lifespan;
  }, this);
};

Lava.prototype.interact = function(entity) {
  entity.damage();
};

Lava.prototype.trigger = function (t, player) {
};

Lava.prototype.trigger_end = function (t, player) {
};

return Lava;
});

//==================================================================

define("games/sudi/src/trigger", [
function() {
function Trigger(state, group) {
  this.state = state;
  this.group = group;
  this.sprite = this.state.add.sprite(0,0, "");
  if (this.group) {
    this.group.add(this.sprite);
  }
  this.sprite.entity = this;
  this.sprite.scale.set(1);

  this.state.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
  this.sprite.body.immovable = true;
  this.sprite.body.collideWorldBounds = true;
  // this.sprite.body.gravity.y = 300;
  // this.sprite.body.bounce.set(1);

  this.x = 0;
  this.y = 0;

  this.already_triggered = false;

  this.interactions = {};
};

Trigger.prototype.interact = function (entity) {
  if (!this.interactions.hasOwnProperty(entity))
    this.beginInteraction(entity);
  this.interactions[entity] = 1;
};

Trigger.prototype.set = function (property, value) {
  this.properties = this.properties||{};
  this.properties[property]=value;
};

Trigger.prototype.get = function (property, value) {
  this.properties = this.properties||{};
  return this.properties[property]||0;
};

Trigger.prototype.setPosition = function(x,y) {
  this.x = this.sprite.x = x;
  this.y = this.sprite.y = y;
};

Trigger.prototype.setSize = function(width,height) {
  this.sprite.body.setSize(width,height);
};

Trigger.prototype.update = function(dt) {
  var interactions_ending = [];
  for (var i in this.interactions) {
    this.interactions[i]-=1;
    if (this.interactions[i] < 0)
      interactions_ending.push(i);
  }
  for (var i in interactions_ending) {
    this.endInteraction(interactions_ending[i]);
    delete this.interactions[interactions_ending[i]];
  }
};

Trigger.prototype.beginInteraction = function(entity) {
  if (JSON.parse(this.get("trigger_once")) && this.already_triggered)
    return;
  this.manager.triggerById(parseInt(this.get("target")), this, entity, true);
};

Trigger.prototype.endInteraction = function(entity) {
  if (JSON.parse(this.get("trigger_once")) && this.already_triggered)
    return;
  this.manager.triggerById(parseInt(this.get("target")), this, entity, false);
  this.already_triggered = true;
};

return Trigger;
}]);

//==================================================================

define("games/sudi/src/lever", function() {
function Lever(state, group) {
  this.state = state;
  this.group = group;
  this.sprite = this.state.add.sprite(0,0,"atlas", "lever_0000")
  if (this.group) {
    this.group.add(this.sprite);
  }
  this.sprite.entity = this;
  this.sprite.anchor.set(0.5, 1);
  this.sprite.scale.set(1);
  this.sprite.angle = 0;

  this.sprite.animations.add("open", Phaser.Animation.generateFrameNames('lever_', 0, 4, '', 4), 12);
  this.sprite.animations.add("close", Phaser.Animation.generateFrameNames('lever_', 0, 4, '', 4).reverse(), 12);
  // this.sprite.animations.add("dead", [4], 5);
  // this.sprite.play("walk", 5, true);

  this.state.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
  this.sprite.body.setSize(32, 32, 0, 0);
  this.sprite.body.immovable = true;
  this.sprite.body.collideWorldBounds = true;

  this.open = false;
};
Lever.prototype.set = function (property, value) {
  this.properties = this.properties||{};
  this.properties[property]=value;
};

Lever.prototype.get = function (property, value) {
  this.properties = this.properties||{};
  return this.properties[property]||0;
};

Lever.prototype.setPosition = function(x,y) {
  this.x = this.sprite.x = x;
  this.y = this.sprite.y = y;
};

Lever.prototype.damage = function(ammount) {
  // this.kill();
};

Lever.prototype.update = function(dt) {
};

Lever.prototype.switch = function(entity) {
  if (this.open) {
    this.sprite.play("close", 12).onComplete.addOnce(function() {
      this.open=false;
      this.manager.triggerById(parseInt(this.get("target")), this, entity, false);
    }, this);
  } else {
    this.sprite.play("open", 12).onComplete.addOnce(function() {
      this.open=true;
      this.manager.triggerById(parseInt(this.get("target")), this, entity, true);
    }, this);
  }
}

Lever.prototype.interact = function(entity) {
  if (JSON.parse(this.get("interact")))
    this.switch(entity);
};

Lever.prototype.trigger = function (t, player) {
  this.switch(player);
};

Lever.prototype.trigger_end = function (t, player) {
};
return Lever;
});

//==================================================================

//THIS LOADS MY GAME
require("games/sudi/src/game", function(Game) {
  addMyGame("sudi", "Wegfinder", "SudDani", "Finde den Ausgang","Bewegen", "Springen", "Schiessen und weiter", Game);
});

//==================================================================

})();
