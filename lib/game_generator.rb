class GameGenerator
  attr_reader :game_id

  def initialize(game_id_)
    @game_id = game_id_
  end

  def generate
    create_dir_struture
    generate_helpers
    generate_lib
    generate_game
  end

  def create_dir_struture
    FileUtils.mkdir_p "games/#{game_id}/helper"
    FileUtils.mkdir_p "games/#{game_id}/src"
    FileUtils.mkdir_p "games/#{game_id}/rawassets"
    FileUtils.mkdir_p "games/#{game_id}/assets"
  end

  def generate_helpers
    # FileUtils.cp "templates/require.js", "games/#{game_id}/helper/"
    write_erb("games/#{game_id}/helper/loader.js", "templates/loader.js.erb")
  end

  def generate_lib
    FileUtils.cp_r "templates/lib", "games/#{game_id}"
  end

  def generate_game
    write_erb("games/#{game_id}/src/game.js", "templates/game.js.erb")
  end

  def get_binding
    binding()
  end
private
  def write_erb(target, template)
    TemplateRenderer.render_to_file(target, template, binding())
  end
end
