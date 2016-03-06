require "mini_magick"
require "json"
require "base64"
require "tempfile"
require "fileutils"
require "pathname"
require "erb"
require "date"
require "uglifier"
# require 'opal'

# piksel file handling
require "./lib/piskel_layer"
require "./lib/piskel_layers"
require "./lib/piskel_file"

# util
require "./lib/template_renderer.rb"
require "./lib/js_compiler.rb"

# game loader
require "./lib/game_loader"

# packeger
require "./lib/game_packeger"

# game template generator
require "./lib/game_generator"

desc "Compile your piskel resources"
task :image do
  game_dirs = Pathname.new("games")
  game_dirs.children.each do |game|
    next unless game.directory?
    assets = Pathname.new(game.join("rawassets"))
    next unless assets.directory?
    assets.children.each do |asset|
      next unless /.piskel$/.match(asset.to_s)
      piskel = PiskelFile.load_file(asset)
      piskel.export(game.join("assets/#{piskel.name}.png"))
    end
  end
end

desc "Build your game"
task :build do
  # `grunt`
  JsCompiler.new.compile
end

desc "Create a release"
task :release => [:image, :build] do
  package = GamePackeger.new(nil)
  package.release
end

desc "Create a release"
task :release_push => [:image, :build] do
  package = GamePackeger.new(nil)
  package.release
  repo_target = `git config --get remote.origin.url`
  `cd release/jack_danger && git init .  && git checkout -b gh-pages`
  `cd release/jack_danger && git add . && git commit -m "release"`
  `cd release/jack_danger && git commit`
  `cd release/jack_danger && git remote add origin #{repo_target}`
  `cd release/jack_danger && git push -f origin gh-pages`
end

desc "Clean release data"
task :clean do
  package = GamePackeger.new(nil)
  package.clean_release
end

desc "Create a release and run it"
task :release_run => [:image, :build] do
  package = GamePackeger.new(nil)
  package.release_run
end

task :generate, :game_id do |t,args|
  if !args.game_id || args.game_id == ""
    puts "You need to give your game an id like:\nrake generate[\"myawesomegame\"]"
    next
  end
  puts "Generating #{args.game_id}"
  generator = GameGenerator.new(args.game_id)
  generator.generate
end

desc "Run the test server"
task :run, [:game_id] => :image do |t, args|
  runner = GamePackeger.new(args.game_id)
  runner.run
end

desc "Star browser"
task :start do
  `xdg-open http://localhost:8080/`
end

desc "Build our app to build.js"
task :opal do
  Opal.append_path "games/sudi/app"
  File.binwrite "games/sudi/app/build.js", Opal::Builder.build("app").to_s
end

task :default => :run
