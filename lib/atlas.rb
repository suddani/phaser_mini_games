class Atlas

  def addFrames(x, y, frame_width, frame_height, frameCount, frame_name)
    puts "Add image frame to atlas: #{frame_name}"
    frames[frame_name] = {
      :frame => {
        :x => x,
        :y => y,
        :w => frame_width*frameCount,
        :h => frame_height
      },
      :rotated => false,
      :trimmed => false,
      :spriteSourceSize =>  {
        :x => 0,
        :y => 0,
        :w => frame_width*frameCount,
        :h => frame_height
      },
      :sourceSize =>  {
        :w => frame_width*frameCount,
        :h => frame_height
      }
    }
    frameCount.times do |id|
      puts "Add sprite frame to atlas: #{expand_name(frame_name, id)}"
      frames[expand_name(frame_name, id)] = {
        :frame => {
          :x => x+id*frame_width,
          :y => y,
          :w => frame_width,
          :h => frame_height
        },
        :rotated => false,
        :trimmed => false,
        :spriteSourceSize =>  {
          :x => 0,
          :y => 0,
          :w => frame_width,
          :h => frame_height
        },
        :sourceSize =>  {
          :w => frame_width,
          :h => frame_height
        }
      }
    end if frameCount > 1
  end

  def save(path)
    path.write(to_json.to_s)
    puts "Saved atlas json: #{path}"
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
