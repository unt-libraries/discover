# Would prefer to override BlacklightRangeLimit::RangeLimitHelper, but the way it is
# implemented does not allow to do that easily.
module BlRangeLimitHelper
  include BlacklightRangeLimit::RangeLimitHelper

  # type is 'min' or 'max'
  # Returns smallest and largest value in current result set, if available
  # from stats component response.
  # Overrides BLRL 7.9.1 to use assumed_boundaries from catalog controller
  def range_results_endpoint(solr_field, type)
    stats = stats_for_field(solr_field)

    return nil unless stats
    # StatsComponent returns weird min/max when there are in
    # fact no values
    return nil if @response.total == stats["missing"]

    if blacklight_config[:facet_fields][solr_field][:range][:assumed_boundaries].present?
      range_min, range_max = blacklight_config[:facet_fields][solr_field][:range][:assumed_boundaries]

      stats['min'] = range_min.to_s if stats['min'].to_i < range_min
      stats['max'] = range_max.to_s if stats['max'].to_i > range_max
    end

    return stats[type].to_s.gsub(/\.0+/, '')
  end

  # Overrides BLRL 7.9.1 to modify input fields
  def render_range_input(solr_field, type, input_label = nil, maxlength=4)
    type = type.to_s

    default = params["range"][solr_field][type] if params["range"] && params["range"][solr_field] && params["range"][solr_field][type]

    options = {
      :maxlength => maxlength,
      :placeholder => "YYYY",
      :pattern => '\d{4}',
      :class => "form-control text-center range_#{type}",
    }
    html = text_field_tag("range[#{solr_field}][#{type}]", default, options)
    html += label_tag("range[#{solr_field}][#{type}]", input_label, class: 'sr-only') if input_label.present?
    html
  end
end
