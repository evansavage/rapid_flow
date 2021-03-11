$(document).ready(function() {
  const reducer = (accumulator, currentValue) => accumulator + currentValue;

  var mapImageURL = 'assets/img/map.png'

  function totalLevel(obj) {
    var total = 0;
    var k;
    if (obj instanceof Object) {
      for (k in obj) {
        if (obj.hasOwnProperty(k)) {
          total += totalLevel(obj[k]);
        }
      }
    } else {
      return obj
    }
    return total
  }

  $.getJSON("assets/data/intersection_1.json", function (data) {

  }).fail(function() {
    console.log("an error occured.")
  }).done(function(data) {
    var nav = $('#nav-container');
    // nav.text(JSON.stringify(data));

    // Loop through each intersection
    for (i_key in data) {

      var intersectionHeader = $("<div>").appendTo(nav).addClass(`intersection-header ${i_key}`);
      var intersectionTitle = $("<h2>").appendTo(intersectionHeader).text(i_key);
      var intersectionTotal = $("<span>").appendTo(intersectionHeader).text(totalLevel(data[i_key]));
      var intersectionExpand = $("<a>").appendTo(intersectionHeader).text('++').addClass('expand-all');

      var intersectionWrapper = $("<div>").appendTo(nav).addClass(`intersection-wrapper ${i_key}`);

      // Loop through each approach in intersection
      for (a_key in data[i_key]) {

        var approachHeader = $("<div>").appendTo(intersectionWrapper).addClass(`approach-header ${a_key}`);
        var approachTitle = $("<h3>").appendTo(approachHeader).text(a_key);

        var approachTotalValue = totalLevel(data[i_key][a_key])
        var approachTotal = $("<span>").appendTo(approachHeader).text(approachTotalValue);
        var approachExpand = $("<a>").appendTo(approachHeader).text('+').addClass('expand-approach');
        var approachMap = $(`<a><img src=${mapImageURL}/></a>`).appendTo(approachHeader).addClass('map-icon');

        var approachWrapper = $("<div>").appendTo(intersectionWrapper).addClass(`approach-wrapper ${a_key}`);

        // Loop through each departure in approach
        for (d_key in data[i_key][a_key]) {

          var departureWrapper = $("<div>").appendTo(approachWrapper).addClass('departure-header');
          var departureTitle = $("<h4>").appendTo(departureWrapper).text(d_key);
          var departureAmt = $("<span>").appendTo(departureWrapper).text(data[i_key][a_key][d_key]);
          var departurePercent = $("<span>").appendTo(departureWrapper).text(
            Math.round(data[i_key][a_key][d_key] / approachTotalValue * 100) + '%'
          );
        }
      }
    }
  });;
  // Click on intersection header expands to approach chilren
  $('#nav-container').on('click', '.intersection-header', function() {
    $(this).next('.intersection-wrapper').slideToggle();
    $(this).toggleClass('active');
  });

  var expandAllToggle = 0;

  // Click on intersection expand all will expand everything, only go for expand right now

  $('#nav-container').on('click', '.intersection-header .expand-all', function(e) {
    var intersectionHeader = $(this).parents('.intersection-header');
    var intersectionWrapper = intersectionHeader.next('.intersection-wrapper');
    if (!intersectionWrapper.is(':visible')) {
      intersectionHeader.next('.intersection-wrapper').slideToggle();
      intersectionHeader.addClass('active');
    }
    intersectionWrapper.find('.approach-header').each(function(i) {
      if (!$(this).hasClass('active')) {
        $(this).find('.expand-approach').text('-');
        $(this).addClass('active');
        $(this).next('.approach-wrapper').slideToggle();
      }
    })


    e.stopPropagation();
    expandAllToggle += 1;
    expandAllToggle %= 2;
  });

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
