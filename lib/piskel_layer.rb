class PiskelLayer
  class << self
    def load_file(path)
      PiskelLayer.load_json(File.read(path))
    end
    def load_json(json)
      PiskelLayer.new JSON.parse(json)
    end
  end
  attr_reader :json
  def initialize(_json)
    @json = _json
  end

  def to_s
    "Layer: #{name} at #{frameCount}"
  end

  def to_json
    {
      name: name,
      frameCount: frameCount,
      base64PNG: base64PNG
    }
  end

  def export(file_name, scale=1)
    image_tempfile do |file|
      image = MiniMagick::Image.new(file.path)
      image.scale "#{scale*100}%"
      image.write file_name
    end
  end

  def base64
    base64PNG['data:image/png;base64,'.length .. -1]
  end

  def image_tempfile
    file = Tempfile.new(name.gsub(" ", "_"))
    file.write(raw_image)
    file.rewind
    if block_given?
      yield file
      file.close
      file.unlink
    end
    file
  end

  def raw_image
    Base64.decode64(base64)
  end

  # Used to access piskel file data
  def method_missing(m, *args, &block)
    method_name = m.to_s
    if json && json.has_key?(method_name)
      return json[method_name]
    end
    super(m, *args, &block)
  end
end
