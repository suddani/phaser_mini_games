class TemplateRenderer
  class << self
    def render(template_file_name, object_bind)
      renderer = ERB.new(File.read(template_file_name))
      renderer.result(object_bind)
    end
    def render_to_file(target, template_file_name, object_bind)
      File.write(
        target,
        TemplateRenderer.render(template_file_name, object_bind)
      )
    end
  end
end
