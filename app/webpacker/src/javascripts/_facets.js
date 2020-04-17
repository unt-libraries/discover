function bindAccordians() {
  $('#facetsExpandCollapse').on('click', function () {
    const $target = $(this);
    const $facetElements = $('.panel-collapse.facet-content');
    const buttonAction = $target.attr('data-button-action');
    if (buttonAction === 'expand') {
      $facetElements.collapse('show');
      $target.attr('data-button-action', 'collapse')
        .tooltip('hide')
        .attr('data-original-title', 'Collapse all')
        .tooltip('show');
    } else if (buttonAction === 'collapse') {
      $facetElements.collapse('hide');
      $target.attr('data-button-action', 'expand')
        .tooltip('hide')
        .attr('data-original-title', 'Expand all')
        .tooltip('show');
    }
  });
}

export {
  // eslint-disable-next-line import/prefer-default-export
  bindAccordians,
};
