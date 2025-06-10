module LoadYamlHelper

  ##
  # Load static yaml data from config directory
  #
  # @param [String] file - The name of the file to load
  # @return [Hash] The data from the yaml file
  def load_yaml_data(file)
    YAML.load_file(
      Rails.root.join('config', 'static_data', "#{file}.yml"),
      permitted_classes: [Time]
    )
  end
end
