# gppcc8 Entry

## Try it
[Demo](http://suddani.github.io/phaser_mini_games/)

## Install
```
bundle install
```
Make sure you have python installed because we will be using the SimpleHTTPServer module in development

## Run

If there is only one game in the games folder or if you want to run all games
```
bundle exec rake run
```

If you want to run a specific game
```
bundle exec rake run[sudi]
```

Now open your browser at http://localhost:8080/

## Build
Building concatinated and minified versions of the source code
```
bundle exec rake build
```

## Piskel integration
Since [Piskel](http://www.piskelapp.com/) is real cool pixel editor i wrote a little assets compiler for it so you dont have keep your project and game ready assets in your git repo.

The generator expects your piskel files in **games/YOURGAME/rawassets/*.piskel**

To compile those into images run. This is done automatically on all other commands that expect the assets to be compiled.
```
bundle exec rake image
```
You can add a piskel config file with same name and just adding **.config** with the following content
```
{
  "scale": 3
}
```
This scales the asset during compilation in case you need that.

## Release
Builiding the release versions
```
bundle exec rake release
```
Running the release version, this also runs at http://localhost:8080/ so make sure your dev version is not running
```
bundle exec rake release_run
```
And actually releasing the game as a gihub page after testing that it actually runs
```
bundle exec rake release_push
```

## Generate a new game
If you want to use the framework yourself you are more than welcome. To generate an empty template game just run:
```
bundle exec rake generate[myawesomenewgame]
```

## Dependency System
The game uses a dependency injection scheme similar to that of angularjs. This allows you to write your code in small modules and inject the parts you need in other modules.

The generator creates a loader and a game module when used. The Game module is supposed to export your phaser game state as a function constructor.

```
define("games/test/src/game",
function() {
  console.log("Load test game")
  function Main() {}
  Main.prototype.init = function() {}
  Main.prototype.preload = function() {}
  Main.prototype.create = function() {}
  Main.prototype.update = function() {}
  return Main;
});
```
As you can see in the end the function returns the Main function.

The *define* function takes 2 parameters. The first one is the module identifier and has to be the relative file path of the script without the *.js* extension. The second parameter can be either a function like in the example above or an array to define the dependencies like in the next example
```
define("games/test/src/game", ["games/test/src/player",
function(Player) {
  //we can now use the player module
  console.log("Load test game")
  function Main() {}
  Main.prototype.init = function() {}
  Main.prototype.preload = function() {}
  Main.prototype.create = function() {
    //create a new player instance
    this.player = new Player();
  }
  Main.prototype.update = function() {}
  return Main;
}]);
```
The player has to be defined just like the game module and should be placed in *games/test/src/player.js*
```
define("games/test/src/player",
function() {
  function Player() {}
  return Player;
});
```
Now you can not only define modules that export functions but also objects
```
define("games/test/src/config",
function() {
  return {
    name: "this is my name"
  }
});
```
Which could be used by the player
```
define("games/test/src/player",["games/test/src/config",
function(Config) {
  function Player() {}
  Player.prototype.say_name = function() {
    console.log("Hey my name is "+Config.name);
  }
  return Player;
});
```
You can also inject more than one dependency
```
define("games/test/src/player",["games/test/src/config", "games/test/src/weapon",
function(Config, Weapon) {
  function Player() {
    this.gun = new Weapon();
  }
  Player.prototype.say_name = function() {
    console.log("Hey my name is "+Config.name);
  }
  Player.prototype.shoot = function() {
    this.gun.shoot();
  }
  return Player;
});
```
As you can see all dependencies before the function are injected as the parameters of the function. You can also randomly name them. It does not matter at all since those names are just local.

I hope this explains the system enough. Have fun coding


# Sound
- http://www.leshylabs.com/apps/sfMaker/
- http://www.bfxr.net/
- http://audiojungle.net/
- http://www.freesound.org/search/
