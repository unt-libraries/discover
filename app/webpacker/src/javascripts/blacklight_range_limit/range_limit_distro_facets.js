/* eslint-disable no-use-before-define */
/**
 * Modified for our use from blacklight_range_version version 7.8.0
 */
import 'bootstrap/js/dist/collapse';
import debounce from 'lodash/debounce';

// Uses turbolinks:load instead of Blacklight.onLoad, otherwise doesn't work in some cases

/* A custom event "plotDrawn.blacklight.rangeLimit" will be sent when flot plot
   is (re-)drawn on screen possibly with a new size. target of event will be the DOM element
   containing the plot.  Used to resize slider to match. */

document.addEventListener('turbolinks:load', () => {
  // ratio of width to height for desired display, multiply width by this ratio
  // to get height. hard-coded in for now.
  const displayRatio = 1 / (1.618 * 2); // half a golden rectangle, why not
  const redrawnEvent = 'plotDrawn.blacklight.rangeLimit';

  // Facets already on the page? Turn em into a chart.
  $('.range_limit .profile .distribution.chart_js ul').each(function () {
    turnIntoPlot($(this).parent());
  });

  checkForNeededFacetsToFetch();

  // Listen for twitter bootstrap collapsible open events, to render flot
  // in previously hidden divs on open, if needed.
  $('body').on('show.bs.collapse', (event) => {
    // Was the target a .facet-content including a .chart-js?
    const container = $(event.target).filter('.facet-content').find('.chart_js');

    // only if it doesn't already have a canvas, it isn't already drawn
    if (container && container.find('canvas').length === 0) {
      // be willing to wait up to 1100ms for container to
      // have width -- right away on show.bs is too soon, but
      // shown.bs is later than we want, we want to start rendering
      // while animation is still in progress.
      turnIntoPlot(container, 1100);
    }
  });

  // When loaded in a modal
  $(Blacklight.modal.modalSelector).on('shown.bs.modal', function () {
    $(this).find('.range_limit .profile .distribution.chart_js ul').each(function () {
      turnIntoPlot($(this).parent());
    });

    // Case when there is no currently selected range
    checkForNeededFacetsToFetch();
  });

  // Add AJAX fetched range facets if needed, and add a chart to em
  function checkForNeededFacetsToFetch() {
    $('.range_limit .profile .distribution a.load_distribution').each(function () {
      const container = $(this).parent('div.distribution');

      $(container).load($(this).attr('href'), (response, status) => {
        if ($(container).hasClass('chart_js') && status === 'success') {
          turnIntoPlot(container);
        }
      });
    });
  }

  // after a collapsible facet contents is fully shown,
  // resize the flot chart to current conditions. This way, if you change
  // browser window size, you can get chart resized to fit by closing and opening
  // again, if needed.

  function redrawPlot(container) {
    if (container && container.width() > 0) {
      // resize the container's height, since width may have changed.
      container.height(container.width() * displayRatio);

      // redraw the chart.
      const plot = container.data('plot');
      if (plot) {
        // how to redraw after possible resize?
        // Cribbed from https://github.com/flot/flot/blob/master/jquery.flot.resize.js
        plot.resize();
        plot.setupGrid();
        plot.draw();
        // plus trigger redraw of the selection, which otherwise ain't always right
        // we'll trigger a fake event on one of the boxes
        const form = $(container).closest('.limit_content').find('form.range_limit');
        form.find('input.range_begin').trigger('change');

        // send our custom event to trigger redraw of slider
        $(container).trigger(redrawnEvent);
      }
    }
  }

  $('body').on('shown.bs.collapse', (event) => {
    const container = $(event.target).filter('.facet-content').find('.chart_js');
    redrawPlot(container);
  });

  $(window).on('resize', debounce(() => {
    $('.chart_js').each((i, container) => {
      redrawPlot($(container));
    });
  }, 350));

  // second arg, if provided, is a number of ms we're willing to
  // wait for the container to have width before giving up -- we'll
  // set 50ms timers to check back until timeout is expired or the
  // container is finally visible. The timeout is used when we catch
  // bootstrap show event, but the animation hasn't barely begun yet -- but
  // we don't want to wait until it's finished, we want to start rendering
  // as soon as we can.
  //
  // We also will
  function turnIntoPlot(container, waitForVisible) {
    // flot can only render in a a div with a defined width.
    // for instance, a hidden div can't generally be rendered in (although if you set
    // an explicit width on it, it might work)
    //
    // We'll count on later code that catch bootstrap collapse open to render
    // on show, for currently hidden divs.

    // for some reason width sometimes return negative, not sure
    // why but it's some kind of hidden.
    if (container.width() > 0) {
      const height = container.width() * displayRatio;

      // Need an explicit height to make flot happy.
      container.height(height);

      areaChart($(container));

      $(container).trigger(redrawnEvent);
    } else if (waitForVisible > 0) {
      setTimeout(() => {
        turnIntoPlot(container, waitForVisible - 50);
      }, 50);
    }
  }

  // Takes a div holding a ul of distribution segments produced by
  // blacklight_range_limit/_range_facets and makes it into
  // a flot area chart.
  function areaChart(container) {
    // flot loaded? And canvas element supported.
    if (domDependenciesMet()) {
      // Grab the data from the ul div
      const seriesData = [];
      const pointerLookup = [];
      const xTicks = [];
      const min = window.BlacklightRangeLimit.parseNum($(container).find('ul li:first-child span.from').first().data('blrlBegin'));
      const max = window.BlacklightRangeLimit.parseNum($(container).find('ul li:last-child span.to').first().data('blrlEnd'));

      $(container).find('ul li').each(function () {
        const from = window.BlacklightRangeLimit.parseNum($(this).find('span.from').first().data('blrlBegin'));
        const to = window.BlacklightRangeLimit.parseNum($(this).find('span.to').first().data('blrlEnd'));
        const count = window.BlacklightRangeLimit.parseNum($(this).find('span.count').text());
        const avg = (count / (to - from + 1));

        // We use the avg as the y-coord, to make the area of each
        // segment proportional to how many documents it holds.
        seriesData.push([from, avg]);
        seriesData.push([to + 1, avg]);

        xTicks.push(from);

        pointerLookup.push({
          from, to, count, label: $(this).find('.facet_select').html(),
        });
      });

      const maxPlusOne = window.BlacklightRangeLimit.parseNum($(container).find('ul li:last-child span.to').text()) + 1;
      xTicks.push(maxPlusOne);

      let plot;
      const config = $(container).closest('.blrl-plot-config').data('plot-config') || $(container).closest('.facet-limit').data('plot-config') || {};

      try {
        plot = $.plot($(container), [seriesData],
          $.extend(true, config, {
            yaxis: { ticks: [], min: 0, autoscaleMargin: 0.1 },
            xaxis: {
              labelHeight: 20,
              labelWidth: 30,
              ticks: xTicks,
              tickDecimals: 0, // force integer ticks
              tickLength: 0,
              reserveSpace: true,
            },
            series: { lines: { fill: true, steps: true } },
            grid: {
              clickable: true, hoverable: true, autoHighlight: false, margin: { left: 0, right: 0 },
            },
            selection: { mode: 'x' },
          }));
      } catch (err) {
        alert(err);
      }

      const findSegmentFor = functionForFindSegment(pointerLookup);
      let lastSegment = null;

      $(container).tooltip({
        html: true, placement: 'bottom', trigger: 'manual', delay: { show: 0, hide: 100 },
      });

      $(container).on('plothover', (event, pos, item) => {
        const segment = findSegmentFor(pos.x);

        if (segment !== lastSegment) {
          const humanizedNumber = window.BlacklightRangeLimit.parseNum(segment.count).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',');
          const humanizedLabel = window.BlacklightRangeLimit.parseNum(segment.count) === 1 ? 'item' : 'items';

          const title = `${findSegmentFor(pos.x).label} (${humanizedNumber} ${humanizedLabel})`;
          $(container).attr('title', title).tooltip('_fixTitle').tooltip('show');

          lastSegment = segment;
        }
      });

      $(container).on('mouseout', () => {
        lastSegment = null;
        $(container).tooltip('hide');
      });

      $(container).on('plotclick', (event, pos, item) => {
        if (plot.getSelection() == null) {
          const segment = findSegmentFor(pos.x);
          plot.setSelection(normalizedSelection(segment.from, segment.to));
        }
      });

      $(container).on('plotselected plotselecting', (event, ranges) => {
        if (ranges != null) {
          const from = Math.floor(ranges.xaxis.from);
          const to = Math.floor(ranges.xaxis.to);

          const form = $(container).closest('.limit_content').find('form.range_limit');
          form.find('input.range_begin').val(from);
          form.find('input.range_end').val(to);

          const sliderPlaceholder = $(container).closest('.limit_content').find('[data-slider-placeholder]');
          if (sliderPlaceholder) {
            sliderPlaceholder.slider('setValue', [from, to + 1]);
          }
        }
      });

      const form = $(container).closest('.limit_content').find('form.range_limit');
      form.find('input.range_begin, input.range_end').on('change', () => {
        plot.setSelection(formSelection(form, min, max), true);
      });

      $(container).closest('.limit_content').find('.profile .range').on('slide', (event, ui) => {
        const values = $(event.target).data('slider').getValue();
        form.find('input.range_begin').val(values[0]);
        form.find('input.range_end').val(values[1]);
        plot.setSelection(normalizedSelection(values[0], Math.max(values[0], values[1] - 1)), true);
      });

      // initially entirely selected, to match slider
      plot.setSelection({ xaxis: { from: min, to: max + 0.9999 } });
    }
  }

  // Send endpoint to endpoint+0.99999 to have display
  // more closely approximate limiting behavior esp
  // at small resolutions. (Since we search on whole numbers,
  // inclusive, but flot chart is decimal.)
  function normalizedSelection(min, max) {
    const newMax = max + 0.99999;

    return { xaxis: { from: min, to: newMax } };
  }

  function formSelection(form, min, max) {
    let beginVal = window.BlacklightRangeLimit.parseNum($(form).find('input.range_begin').val());
    if (Number.isNaN(beginVal) || beginVal < min) {
      beginVal = min;
    }

    let endVal = window.BlacklightRangeLimit.parseNum($(form).find('input.range_end').val());
    if (Number.isNaN(endVal) || endVal > max) {
      endVal = max;
    }

    return normalizedSelection(beginVal, endVal);
  }

  function functionForFindSegment(pointerLookupArr) {
    return function (xCoord) {
      for (let i = pointerLookupArr.length - 1; i >= 0; i -= 1) {
        const hash = pointerLookupArr[i];
        if (xCoord >= hash.from) {
          return hash;
        }
      }
      return pointerLookupArr[0];
    };
  }

  // Check if Flot is loaded, and if browser has support for
  // canvas object, either natively or via IE excanvas.
  function domDependenciesMet() {
    const flotLoaded = (typeof $.plot !== 'undefined');
    const canvasAvailable = ((typeof (document.createElement('canvas').getContext) !== 'undefined') || (typeof window.CanvasRenderingContext2D !== 'undefined' || typeof G_vmlCanvasManager !== 'undefined'));

    return (flotLoaded && canvasAvailable);
  }

  // Additional listener to trigger collapse when page is loaded to resize date chart
  window.addEventListener('load', () => {
    $('#facet-publication_year_range_facet').trigger('shown.bs.collapse');
  });
});
