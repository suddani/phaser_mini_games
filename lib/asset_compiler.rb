class AssetCompiler
  attr_reader :game
  def initialize(game)
    @game = game
  end

  def compile
    assets = Pathname.new(game.join("rawassets"))
    return unless assets.directory?
    compile_piskel_files(assets)
  end

  def compile_piskel_files(assets)
    files = []
    assets.children.each_with_index.map do |asset, idx|
      next unless /.piskel$/.match(asset.to_s)
      piskel = PiskelFile.load_file(asset)
      files << {
        :piskel => piskel,
        :export => piskel.export(game.join("rawassets").join("tmp"))
      }
    end
    assets.children.each_with_index.map do |asset, idx|
      next unless /.png$/.match(asset.to_s)
      piskel = PiskelFile.make_piskel(asset)
      files << {
        :piskel => piskel,
        :export => piskel.export(game.join("rawassets").join("tmp"))
      }
    end
    atlas = createAtlas(game.join("assets").join("atlas.png"), files)
    atlas.save(game.join("assets").join("atlas.json"))
  end

  def createAtlas(target, layers)
    atlas = Atlas.new
    MiniMagick::Tool::Convert.new do |convert|
      offset = 0
      if layers.length > 1 || layers[0][:export].length > 1
        layers.each_with_index do |layer,idx|
          layer[:export].each_with_index do |image, image_index|
            path = image.to_s
            # puts "Add Spritesheet: #{path}"
            convert << "-page" << "+0+#{offset}" << "#{path}"
            frame_height = layer[:piskel].height*layer[:piskel].scale(image_index)
            frame_width = layer[:piskel].width*layer[:piskel].scale(image_index)
            frame_name = layer[:piskel].name(image_index)
            frameCount = layer[:piskel].layers[0].frameCount
            atlas.addFrames(0,offset, frame_width, frame_height, frameCount, frame_name)
            offset+=frame_height
          end
        end
        convert.background "none"
        convert.layers "merge"
        convert.repage.+
      else
        convert << layers[0][:export][0].to_s
      end
      convert << target
    end
    puts "Compiled atlas image: #{target}"
    atlas
  end
end
