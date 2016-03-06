class GameLoader
  attr_reader :game_id, :env

  class Game
    attr_reader :dir, :env
    def initialize(dir, env="development")
      @dir = dir
      @env = env
    end

    def game_file
      file = find_js(dir.join("helper"), /loader.js$/) if env == "development"
      file = find_js(dir) unless file
      file
    end

    def to_s
      game_file
    end
  private
    def find_js(search_dir, matcher=/\.js$/)
      return nil unless search_dir.directory?
      file = search_dir.children.detect do |entry|
        matcher.match(entry.to_s)
      end
      file.to_s if file
    end
  end

  def initialize(game_id, env="development")
    @env = env
    @game_id = game_id
  end

  def libraries
    if env=="development"
      ["require.js"]
    else
      []
    end
  end

  def games
    @games ||= game_dirs
  end

  def get_binding
    binding()
  end

private
  def game_dirs
    dirs = []
    Pathname.new("games").children.each do |game_dir|
      if !game_id || game_dir.basename.to_s == game_id
        dirs << Game.new(game_dir, env)
      end
    end
    dirs
  end

  def to_s
    "Games: #{games.map(&:to_s)}"
  end
end
