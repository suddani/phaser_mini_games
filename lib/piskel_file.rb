class PiskelFile
  class << self
    def load_file(path)
      piskel = PiskelFile.load_json(File.read(path))
      piskel.load_config("#{path}.config")
      piskel
    end
    def load_json(json)
      PiskelFile.new JSON.parse(json)
    end
  end
  attr_reader :json, :layers, :config

  DEFAULT_PISKEL_CONFIG = [
    {
    "scale" => 1
    }
  ]

  def initialize(_json)
    @json = _json
    @layers = nil
  end

  def layers
    @layers ||= PiskelLayers.load_array_json(json["piskel"]["layers"])
  end

  def export(target, custom_scale=nil)
    config.each_with_index.map do |cfg,idx|
      save(target.join("#{name(idx)}.png"), custom_scale||(scale(idx)||1))
    end
  end

  def config
    @config ||= DEFAULT_PISKEL_CONFIG
  end

  def load_config(path)
    @config = Pathname.new(path).file? ? JSON.parse(File.read(path)) : DEFAULT_PISKEL_CONFIG
  end

  # Used to access piskel file data
  def method_missing(m, *args, &block)
    method_name = m.to_s
    if json && json.has_key?(method_name)
      return json[method_name]
    elsif config && config[args.flatten[0]||0].has_key?(method_name)
        return config[args.flatten[0]||0][method_name]
    elsif json["piskel"] && json["piskel"].has_key?(method_name)
      return json["piskel"][method_name]
    end
    super(m, *args, &block)
  end
private
  def file_name(idx)

  end

  def save(target, use_scale)
    MiniMagick::Tool::Convert.new do |convert|
      if layers.length > 1
        layers.each_with_index do |layer,idx|
          path = layer.image_tempfile.path
          convert << "-page" << "+0+0" << "#{path}"
        end
        # convert.background ((rand*2).to_i == 1 ? "red" : "green")
        convert.background "none"
        convert.layers "merge"
        convert.repage.+
      else
        convert << layers[0].image_tempfile.path
        # convert.background ((rand*2).to_i == 1 ? "red" : "green")
        # convert.layers "merge"
        # convert.repage.+
      end
      convert.scale "#{use_scale*100}%"
      convert << target
    end
    puts "Rendered Piskel to: #{target}"
    target
  end
end
