$(document).ready(function() {

  // Map image for the approach visualization button
  var mapImageURL = '/assets/img/map.png'

  $.getJSON("assets/data/intersection_1.json").fail(function() {
    console.log("The local JSON could not be loaded.");
  }).done(function(data) {

    var nav = $('#nav-container');

    // Loop through each intersection
    for (i_key in data) {

      // Add intersection header
      var intersectionHeader = $("<div>").appendTo(nav).addClass(`intersection-header ${i_key}`);
      var intersectionTitle = $("<h2>").appendTo(intersectionHeader).text(i_key);
      var intersectionTotal = $("<span>").appendTo(intersectionHeader).text(totalLevel(data[i_key])).addClass('inter-total');
      var intersectionExpand = $("<a>").appendTo(intersectionHeader).text('++').addClass('expand-all');

      // Add sibling intersection wrapper to contain the intersection's approaches
      var intersectionWrapper = $("<div>").appendTo(nav).addClass(`intersection-wrapper ${i_key}`);

      // Loop through each approach in intersection
      for (a_key in data[i_key]) {

        // Add approach header
        var approachHeader = $("<div>").appendTo(intersectionWrapper).addClass(`approach-header ${a_key}`);
        var approachTitle = $("<h3>").appendTo(approachHeader).text(a_key);
        var approachTotalValue = totalLevel(data[i_key][a_key]);
        var approachTotal = $("<span>").appendTo(approachHeader).text(approachTotalValue).addClass('app-total');
        var approachExpand = $("<a>").appendTo(approachHeader).text('+').addClass('expand-approach');
        var approachMap = $(`<a><img src=/rapid_flow/${mapImageURL} /></a>`).appendTo(approachHeader).addClass('map-icon');

        // Add sibling approah wrapper to contain the approach's departures
        var approachWrapper = $("<div>").appendTo(intersectionWrapper).addClass(`approach-wrapper ${a_key}`);

        // Loop through each departure in approach
        for (d_key in data[i_key][a_key]) {

          // Add item for each departure, calculating percent in relation to approach total
          var departureWrapper = $("<div>").appendTo(approachWrapper).addClass('departure-header');
          var departureTitle = $("<h4>").appendTo(departureWrapper).text(d_key);
          var departureAmt = $("<span>").appendTo(departureWrapper).text(data[i_key][a_key][d_key]).addClass('dep-total');
          var departurePercent = $("<span>").appendTo(departureWrapper).text(
            Math.round(data[i_key][a_key][d_key] / approachTotalValue * 100) + '%'
          ).addClass('dep-percent');
        }
      }
    }
  });

  // Click on intersection header expands to approach children
  // Expand and visualize if not visible and close all other that are open
  $('#nav-container').on('click', '.intersection-header', function() {
    var refHeader = $(this);
    $(this).next('.intersection-wrapper').slideToggle();
    $(this).toggleClass('active');

    // If this click resulted in a close, remove any active map icon selelctions for the intersection
    if (!$(this).hasClass('active')) {
      $(this).next('.intersection-wrapper').find('.map-icon').removeClass('active');
    }

    // For each sibling intersection that was not selected, remove relevant active classes and close
    $(this).siblings().each(function() {
      $(this).removeClass('active');
      $(this).next('.intersection-wrapper').slideUp();
      $(this).find('.map-icon').removeClass('active');
    })
  });

  // Click on intersection expand all will expand everything
  // - If the intersection wrapper is closed, expand all, and close others intersections
  // - o.w. collapse all

  $('#nav-container').on('click', '.intersection-header .expand-all', function(e) {
    var intersectionHeader = $(this).parents('.intersection-header');
    var intersectionWrapper = intersectionHeader.next('.intersection-wrapper');

    // if {Expand} else {Collapse}
    if (!intersectionWrapper.is(':visible')) {
      intersectionHeader.next('.intersection-wrapper').slideToggle();
      intersectionHeader.addClass('active');

      // Collapse all other intersections
      intersectionWrapper.siblings('.intersection-header').not(intersectionHeader).removeClass('active');
      intersectionWrapper.siblings('.intersection-wrapper').each(function() {
        $(this).slideUp();
        $(this).find('.map-icon').removeClass('active');

        // Within each intersection, close any active approaches
        $(this).find('.approach-header').each(function(i) {
          if ($(this).hasClass('active')) {
            $(this).find('.expand-approach').text('+');
            $(this).removeClass('active');
            $(this).next('.approach-wrapper').slideUp();
          }
        });
      })
      // Expand any headers that are not active in the selected intersection
      intersectionWrapper.find('.approach-header').each(function(i) {
        if (!$(this).hasClass('active')) {
          $(this).find('.expand-approach').text('-');
          $(this).addClass('active');
          $(this).next('.approach-wrapper').slideToggle();
        }
      });
    } else {
      intersectionHeader.next('.intersection-wrapper').slideToggle();
      intersectionHeader.removeClass('active');
      // Close all active approaches in the selected intersection
      intersectionWrapper.find('.approach-header').each(function(i) {
        $('.map-icon').removeClass('active');

        if ($(this).hasClass('active')) {
          $(this).find('.expand-approach').text('+');
          $(this).removeClass('active');
          $(this).next('.approach-wrapper').slideToggle();
        }
      });

    }
    // This is to prevent the click event from being toggled on the parent intersection wrapper
    e.stopPropagation();
  });

  // On click of an approach header, expand the relevant departures
  $('#nav-container').on('click', '.approach-header', function() {
    if ($(this).next('.approach-wrapper').is(':visible')) {
      $(this).find('.expand-approach').text('+');
    } else {
      $(this).find('.expand-approach').text('-');
    }
    $(this).next('.approach-wrapper').slideToggle();
    $(this).toggleClass('active');

  });
})
