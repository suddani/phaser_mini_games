class JsCompiler
  # src: ['templates/require.js',
  #       'games/sudi/lib/*.js',
  #       'games/sudi/src/*.js',
  #       'games/sudi/helper/loader.js'],
  # dest: 'games/sudi/<%= pkg.name %>.concat.js',

  class FileCollector
    attr_reader :files, :name

    def initialize(files, name)
      @files = files.map(&:read)
      @name = name
    end

    def date
      Date.today.to_s
    end

    def get_binding
      binding()
    end
  end


  def compile
    Pathname.new("games").children.each do |game_dir|
      # wtf is a file doing here
      next unless game_dir.directory?

      files = gen_file(game_dir)

      #well this game shouldnt be compiled
      next if files.empty?
      puts "Render file: #{game_dir.join("jackdanger-minigame.concat.js").to_s}"
      concat = TemplateRenderer.render(
        "templates/jackdanger-minigame.concat.js.erb",
        FileCollector.new(files, game_dir.basename).get_binding
      )
      game_dir.join("jackdanger-minigame.concat.js").write(concat)
      ugly = Uglifier.compile(concat)
      puts "Render file: #{game_dir.join("jackdanger-minigame.min.js").to_s}"
      game_dir.join("jackdanger-minigame.min.js").write(ugly)
    end
  end

  private
  def gen_file(game_dir)
    # lets asume that if a game has a loader its a module game
    return [] unless game_dir.join("helper/loader.js").file?
    _files = [Pathname.new('templates/require.js')]
    game_dir.join("lib").children.each do |file|
      puts "Add #{file}"
      _files << file
    end
    game_dir.join("src").children.each do |file|
      puts "Add #{file}"
      _files << file
    end
    _files << game_dir.join("helper/loader.js")
    _files
  end
end
