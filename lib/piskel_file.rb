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

  DEFAULT_PISKEL_CONFIG = {
    "scale" => 1
  }

  def initialize(_json)
    @json = _json
    @layers = nil
  end

  def layers
    @layers ||= PiskelLayers.load_array_json(json["piskel"]["layers"])
  end

  def export(target, custom_scale=nil)
    use_scale = custom_scale ? custom_scale : (scale ? scale : 1)

    MiniMagick::Tool::Convert.new do |convert|
      if layers.length > 1
        layers.each_with_index do |layer,idx|
          path = layer.image_tempfile.path
          convert << "-page" << "+0+0" << "#{path}"
        end
        convert.background "none"
        convert.layers "merge"
        convert.repage.+
      else
        convert << layers[0].image_tempfile.path
      end
      convert.scale "#{use_scale*100}%"
      convert << target
    end
  end

  def load_config(path)
    @config = Pathname.new(path).file? ? JSON.parse(File.read(path)) : DEFAULT_PISKEL_CONFIG
  end

  # Used to access piskel file data
  def method_missing(m, *args, &block)
    method_name = m.to_s
    if json && json.has_key?(method_name)
      return json[method_name]
    elsif json["piskel"] && json["piskel"].has_key?(method_name)
      return json["piskel"][method_name]
    elsif config && config.has_key?(method_name)
      return config[method_name]
    end
    super(m, *args, &block)
  end
end
