# gppcc8 Entry

## Try it
[Demo](http://suddani.github.io/phaser_mini_games/)

## Install
```
npm install
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
Running the release version
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
