/**
 * Modified for our use from blacklight_range_version version 7.8.0
 *
 * Changes:
 * - Update style to match our style guide (no var, arrow functions, quotes, semicolons,
 *    camel case names)
 */

// Uses turbolinks:load instead of Blacklight.onLoad, otherwise doesn't work in some cases
document.addEventListener('turbolinks:load', () => {
  $('.range_limit .profile .range.slider_js').each(function () {
    buildSlider(this);
  });

  $(Blacklight.modal.modalSelector).on('shown.bs.modal', function () {
    $(this).find('.range_limit .profile .range.slider_js').each(function () {
      buildSlider(this);
    });
  });

  // catch event for redrawing chart, to redraw slider to match width
  $('body').on('plotDrawn.blacklight.rangeLimit', (event) => {
    const area = $(event.target).closest('.limit_content.range_limit');
    const plot = area.find('.chart_js').data('plot');
    const sliderEl = area.find('.slider');

    if (plot && sliderEl) {
      sliderEl.width(plot.width());
      sliderEl.css('display', 'block');
    }
  });

  // returns two element array min/max as numbers. If there is a limit applied,
  // it's boundaries are are limits. Otherwise, min/max in current result
  // set as sniffed from HTML. Pass in a DOM element for a div.range
  // Will return NaN as min or max in case of error or other weirdness.
  function minMax(rangeElement) {
    const currentLimit = $(rangeElement).closest('.limit_content.range_limit').find('.current');
    let min = window.BlacklightRangeLimit.parseNum(currentLimit.find('.single').data('blrlSingle'));
    let max = min;

    if (Number.isNaN(min)) {
      min = window.BlacklightRangeLimit.parseNum(currentLimit.find('.from').first().data('blrlBegin'));
      max = window.BlacklightRangeLimit.parseNum(currentLimit.find('.to').first().data('blrlEnd'));
    }

    if (Number.isNaN(min) || Number.isNaN(max)) {
      // no current limit, take from results min max included in spans
      min = window.BlacklightRangeLimit.parseNum($(rangeElement).find('.min').first().text());
      max = window.BlacklightRangeLimit.parseNum($(rangeElement).find('.max').first().text());
    }
    return [min, max];
  }

  // Check to see if a value is an Integer
  // see: http://stackoverflow.com/questions/3885817/how-to-check-if-a-number-is-float-or-integer
  function isInt(n) {
    return n % 1 === 0;
  }

  function buildSlider(thisContext) {
    const boundaries = minMax(thisContext);
    const min = boundaries[0];
    const max = boundaries[1];

    if (isInt(min) && isInt(max)) {
      $(thisContext).contents().wrapAll('<div class="sr-only" />');

      const rangeElement = $(thisContext);
      let form = $(rangeElement).closest('.range_limit').find('form.range_limit');
      const beginEl = form.find('input.range_begin');
      const endEl = form.find('input.range_end');

      const placeholderInput = $('<input type="hidden" data-slider-placeholder="true" />').appendTo(rangeElement);

      // make sure slider is loaded
      if (placeholderInput.slider !== undefined) {
        placeholderInput.slider({
          min,
          max: max + 1,
          value: [min, max + 1],
          tooltip: 'hide',
        });

        // try to make slider width/orientation match chart's
        const container = rangeElement.closest('.range_limit');
        const plotEl = container.find('.chart_js');
        const plot = plotEl.data('plot');
        const sliderEl = container.find('.slider');

        if (plotEl) {
          plotEl.attr('aria-hidden', 'true');
        }

        if (sliderEl) {
          sliderEl.attr('aria-hidden', 'true');
        }

        if (plot && sliderEl) {
          sliderEl.width(plot.width());
          sliderEl.css('display', 'block');
        } else if (sliderEl) {
          sliderEl.css('width', '100%');
        }
      }

      // Slider change should update text input values.
      const parent = $(thisContext).parent();
      form = $(parent).closest('.limit_content').find('form.range_limit');
      $(parent).closest('.limit_content').find('.profile .range').on('slide', (event, ui) => {
        const values = $(event.target).data('slider').getValue();
        form.find('input.range_begin').val(values[0]);
        form.find('input.range_end').val(values[1]);
      });

      beginEl.val(min);
      endEl.val(max);

      beginEl.change(function () {
        let val = window.BlacklightRangeLimit.parseNum($(this).val());
        if (Number.isNaN(val) || val < min) {
          // for weird data, set slider at min
          val = min;
        }
        const values = placeholderInput.data('slider').getValue();
        values[0] = val;
        placeholderInput.slider('setValue', values);
      });

      endEl.change(function () {
        let val = window.BlacklightRangeLimit.parseNum($(this).val());
        if (Number.isNaN(val) || val > max) {
          // weird entry, set slider to max
          val = max;
        }
        const values = placeholderInput.data('slider').getValue();
        values[1] = val;
        placeholderInput.slider('setValue', values);
      });
    }
  }
});
