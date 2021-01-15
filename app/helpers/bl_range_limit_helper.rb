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
end
