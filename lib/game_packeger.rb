class GamePackeger
  attr_reader :game_id, :path
  def initialize(game_id)
    @game_id = game_id
  end

  def run
    @path = Pathname.new "./dev"
    begin
      generate_framework
      generate_require
      generate_index
      link_games
      run_server
    ensure
      clean_up
    end
  end

  def release
    clean_release
    create_dir_struture "./release/"
    @path = Pathname.new "./release/jack_danger"
    generate_framework
    copy_games
    generate_index("release")
  end

  def clean_release
    @path = Pathname.new "./release"
    clean_up
  end

  def release_run
    release
    run_server
  end

  def create_dir_struture(path)
    FileUtils.mkdir_p path
  end

  def generate_framework
    FileUtils.cp_r "framework", path
  end

  def generate_require
    FileUtils.cp "templates/require.js", path
  end

  def generate_index(env="development")
    TemplateRenderer.render_to_file(
      "#{path}/index.html",
      "templates/framework/index.html.erb",
        GameLoader.new(game_id, env).get_binding
      )
  end

  def copy_games
    game_dirs = Pathname.new("games")
    [path.to_s.gsub("/jack_danger", ""), "#{path}/games"] .each do |target|
      game_dirs.children.each do |game|
        next unless game.directory?
        FileUtils.mkdir_p "#{target}/#{game.basename}"
        FileUtils.cp_r game.join("assets"), "#{target}/#{game.basename}"
        game.children.each do |file|
          next unless /.js$/.match(file.to_s)
          FileUtils.cp_r file, "#{target}/#{game.basename}/"
        end
      end
    end
  end

  def link_games
    game_dirs = Pathname.new("games")
    target = "dev/games"
    game_dirs.children.each do |game|
      next unless game.directory?
      puts "Link Game: ln -s ../#{game.to_s} dev/games/#{game.basename}"
      `ln -s ../../#{game.to_s} dev/games/#{game.basename}`
    end
  end

  def unlink_games
    `ln -s ../games dev/games`
  end

  def run_server
    `cd #{path} && python -m SimpleHTTPServer 8080`
  end

  def clean_up
    FileUtils.rm_r path if path.directory?
  end
end
