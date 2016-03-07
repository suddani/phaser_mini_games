class Atlas

  def addFrames(x, y, frame_height, frameCount, frame_name)
    frameCount.times do |id|
      frames[expand_name(frame_name, id)] = {
        :frame => {
          :x => x+id*frame_height,
          :y => y,
          :w => frame_height,
          :h => frame_height
        },
        :rotated => false,
        :trimmed => false,
        :spriteSourceSize =>  {
          :x => 0,
          :y => 0,
          :w => frame_height,
          :h => 32
        },
        :sourceSize =>  {
          :w => frame_height,
          :h => frame_height
        }
      }
    end
  end

  def save(path)
    path.write(to_json.to_s)
  end

  def to_json
    {
      :frames => frames
    }.to_json
  end

  def expand_name(frame_name, id)
    id_str = "#{id}"
    while id_str.length < 4 do
      id_str = "0#{id_str}"
    end
    "#{frame_name}_#{id_str}"
  end

  def frames
    @frames||={}
  end
end
