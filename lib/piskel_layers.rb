class PiskelLayers
  class << self
    def load_file(path)
      PiskelLayers.load_json(File.read(path))
    end
    def load_json(json)
      PiskelLayers.new JSON.parse(json)
    end
    def load_array_json(array_json)
      PiskelLayers.new array_json.map{|layer| PiskelLayer.load_json(layer)}
    end
  end
  attr_reader :layers
  def initialize(_json)
    @layers = _json
  end

  def [](name_or_id)
    name_or_id.is_a?(String) ? find_layer(name_or_id) : layers[name_or_id]
  end

  def []=(name_or_id, value)
  end

  def to_json
    to_ary.to_json
  end

  def to_ary
    layers
  end

  def find_layer(name)
    layers.each do |layer|
      return layer if layer.name == name
    end
    nil
  end

  # Used to access piskel file data
  def method_missing(m, *args, &block)
    if layers.respond_to?(m)
      layers.send(m, *args, &block)
    else
      super(m, *args, &block)
    end
  end
end
