// JS file for creating the intersection visualization with D3

$(document).ready(function() {

  // Create the svg canvas

  var w = 1000;
  var h = 1000;
  var svg = d3.select("#visualization-container").append("svg")
           .attr("preserveAspectRatio", "xMinYMin meet")
           .attr("viewBox", "-20 -60 " + w + " " + h)
           .attr("width", '100%')
           .attr("height", '100%')
           .attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
           //this is to zoom out
           //.attr("viewBox", "-20 -20 1600 1600")
           .style("padding", 5)
           .style("margin", 5)
           .attr('id', 'svg-canvas');

  // Set scales for the surrounding canvas, establishing relative coordinates for
  // all contained elements

  var xScale = d3.scaleLinear()
               //accepts
               .domain([0, 100])
               //outputs
               .range([0, w]);

  var yScale = d3.scaleLinear()
               //accepts
               .domain([0, 100])
               //outputs
               .range([0, h]);

  // Draw axes for help with development
  var axes = false;

  if (axes) {

    var xAxisBottom = d3.axisBottom(xScale).ticks(20);
    var xAxisTop = d3.axisTop(xScale).ticks(20);
    var yAxisLeft = d3.axisLeft(yScale).ticks(20);
    var yAxisRight = d3.axisRight(yScale).ticks(20);

    var ygridlines = d3.axisTop()
                     .tickFormat("")
                     .tickSize(-h)
                     .ticks(10)
                     .scale(xScale);

    var xgridlines = d3.axisLeft()
                     .tickFormat("")
                     .tickSize(-w)
                     .ticks(10)
                     .scale(yScale);

    //MINOR
    var ygridlinesmin = d3.axisTop()
                        .tickFormat("")
                        .tickSize(-h)
                        .ticks(100)
                        .scale(xScale);

    var xgridlinesmin = d3.axisLeft()
                        .tickFormat("")
                        .tickSize(-w)
                        .ticks(100)
                        .scale(yScale);

    svg.append("g")
    .attr("class", "minor-grid")
    .call(ygridlinesmin);

    svg.append("g")
    .attr("class", "minor-grid")
    .call(xgridlinesmin);

    //MAIN GRID
    svg.append("g")
    .attr("class", "main-grid")
    .call(ygridlines);

    svg.append("g")
    .attr("class", "main-grid")
    .call(xgridlines);

    //AXES
    svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + h + ")")
    .call(xAxisBottom);

    svg.append("g")
    .attr("class", "axis")
    .call(xAxisTop);

    svg.append("g")
    .attr("class", "axis")
    .call(yAxisLeft);

    svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + w + ",0)")
    .call(yAxisRight);
  }

  // Text to place on a blank canvas
  var holder_text = "Activate an intersection on the left menu";


  var last_approach_select = null;      // keep track of last visualized approach
  var last_intersection_select = null;  // keep track of last selected intersection
  var displaySelect = 'amount';         // Initial setting for data formatting (amount/percent)

  // Path code for the enter/exit arrows
  var arrow_path = "M479.046,283.925c-1.664-3.989-5.547-6.592-9.856-6.592H352.305V10.667C352.305,4.779,347.526,0,341.638,0H170.971c-5.888,0-10.667,4.779-10.667,10.667v266.667H42.971c-4.309,0-8.192,2.603-9.856,6.571c-1.643,3.989-0.747,8.576,2.304,11.627l212.8,213.504c2.005,2.005,4.715,3.136,7.552,3.136s5.547-1.131,7.552-3.115l213.419-213.504C479.793,292.501,480.71,287.915,479.046,283.925z"

  // Coordinates/variables for the intersection visualization
  var cx = 50;                // center of intersection x
  var cy = 45;                // center of intersection x
  var streetDims = [45, 30];  // dimensions for the street rectangles
  var titleSize = 25;         // Title font size
  var streetLabelSize = 30;   // Intersection street label size
  var approachLabelSize = 22; // Street label size for external streets

  var appDim = 85;            // Max approach arrow size
  var minApp = 30;            // Min approach arrow size
  var depDim = 75;            // Max depart arrow size
  var minDep = 20;            // Min "                "
  var streetDimMult = 0.88;   // Proportion of street dimension to offset approach titles by

  // Proportion of street dimension offsets for the approach and depart arrows
  var app0mult = 0.41;
  var app1mult = 0.3;
  var dep0mult = app0mult;
  var dep1mult = app1mult;

  // Initialize canvas with holder text
  svg.append('text')
    .attr('x', xScale(cx))
    .attr('y', yScale(cy - 20))
    .style('text-anchor', 'middle')
    .style('font-family', 'sans-serif')
    .style('dominant-baseline', 'central')
    .style('text-align', 'center')
    .style('font-size', 25)
    .text(holder_text);

  // On click of an intersection header, draw the coinciding intersection on the canvas
  $('#nav-container').on('click', '.intersection-header, .intersection-header .expand-all', function() {
    var clean = svg.selectAll('*').remove(); // remove any elements that may have come from a previous interaction
    var ref = $(this);

    // If the expand all '++' is selected, update the reference variable to it's respective intersection header
    if ($(this).hasClass('expand-all')) {
      ref = $(this).parents('.intersection-header');
    }

    // If the intersetion header is not active, do not draw an intersection and instead place holder text
    if (!ref.hasClass('active')) {
      $('#vis-buttons').css('opacity', 0);
      svg.append('text')
        .attr('x', xScale(cx))
        .attr('y', yScale(cy - 20))
        .style('text-anchor', 'middle')
        .style('dominant-baseline', 'central')
        .style('font-family', 'sans-serif')
        .style('text-align', 'center')
        .style('font-size', 25)
        .text(holder_text);
      return
    }

    $('#vis-buttons').css('opacity', 1);
    var i_key = ref.attr("class").split(/\s+/)[1];              // intersection key from data
    var interTotal = parseInt(ref.find('.inter-total').text()); // total approach amount rom data

    // INTERSECTION TITLE
    var title = svg.append('text')
      .attr('x', function(d){
        return xScale(5);})
      .attr('y', function(d){
        return yScale(0);})
      .attr('stroke', 'black')
      .style('font-size', titleSize)
      .style('font-family', 'sans-serif')
      .text(i_key.split('_').join(' ') + ' Intersection')
      .classed('intersection-title')

    var streetNames = i_key.split('_')

    //SPATIAL INTERSECTION DATA
    var streets = [
      {name: streetNames[0], w: streetDims[0], h: streetDims[1],
        x: cx - streetDims[0]/2, y: cy - streetDims[1]/2},
      {name: streetNames[1], w: streetDims[1], h: streetDims[0],
        x: cx - streetDims[1]/2, y: cy - streetDims[0]/2},
    ]


    // STREET LABEL DATA, two spatial options for the intersetion names (2 is preferred for now)
    var streetLabels = [
      {name: streetNames[0], x: cx + 21, y: cy - 16, r: 0, anchor: 'start', color: 'black'},
      {name: streetNames[1], x: cx + 17.5, y: cy - 21, r: 270, anchor: 'start', color: 'black'},
      {name: streetNames[0], x: cx - 21, y: cy + 17.5, r: 0, anchor: 'end', color: 'black'},
      {name: streetNames[1], x: cx - 16, y: cy + 21, r: 270, anchor: 'end', color: 'black'}
    ]
    var streetLabels2 = [
      {name: streetNames[0], x: cx+1, y: cy, r: 0, anchor: 'start', color: 'white'},
      {name: streetNames[1], x: cx, y: cy-1, r: 270, anchor: 'start', color: 'white'},
    ]

    // Make rectangles (streets)
    svg.selectAll('rect.streets')
      .data(streets)
      .enter().append('rect')
      .attr("height",function(d){return yScale(d.h)})
      .attr("width", function(d){return xScale(d.w)})
      .attr("y",function(d){return yScale(d.y);})
      .attr("x",function(d){return xScale(d.x);})
      .attr("class", (d) => {return `${d.name} streets`})
      .classed('streets');

    // Make street names
    svg.selectAll('text.intersection-street-names')
      .data(streetLabels2)
      .enter().append('text')
      .attr('fill', (d) => {return d.color})
      .attr('transform', (d) => {
        return `translate(${xScale(d.x)},${yScale(d.y)}) rotate(${d.r})`})
      .style('font-size', streetLabelSize)
      .style('text-anchor', (d) => {return d.anchor})
      .style('font-family', 'sans-serif')
      .text((d) => {return d.name})
      .classed((d) => {return `${d.name} intersection-street-names`})

    // Obj for help with approach street label placement
    var streetCounter = {
      [streetNames[0]]: 0,
      [streetNames[1]]: 0
    }

    // Dict for keeping track of dynamic arrow sizing based off of percentage of total through the intersection
    depResize = {};

    var intersection_wrapper = ref.next('.intersection-wrapper');

    // Loop through each approach in intersection
    intersection_wrapper.children('.approach-header').each(function() {
      var a_key = $(this).find('h3').text();
      var appTotal = parseInt($(this).find('.app-total').text()); // Total amount for each approach

      var approachNames = a_key.split('_');
      var appTitleRot = 0;  // Rotation for the approach titles
      var d_x = 0;          // x, y offsets for approach titles
      var d_y = 0;
      var d_y_app = 0;      // x,y offsets for the approach arrows
      var d_x_app = 0;
      var d_y_dep = 0;      // x, y ofsets for the depart arrows
      var d_x_dep = 0;


      var refRect = d3.select(`rect.${approachNames[1]}`); // reference rectangle for aligning approach correctly

      // rotate text and adjust x offset for the horizontal 'road'
      if (refRect.attr('width') > refRect.attr('height')) {
        appTitleRot = 270;
        if (streetCounter[approachNames[1]] > 0) {
          d_x = streetDims[0] * streetDimMult;
          d_x_app = (streetDims[0] * app0mult);
          d_y_app = -(streetDims[1] * app1mult);
        } else {
          d_x = streetDims[0] * -streetDimMult;
          d_x_app = -(streetDims[0] * app0mult);
          d_y_app = (streetDims[1] * app1mult);
        }
        d_x_dep = d_x_app;
        d_y_dep = -d_y_app;
      } else { // do not rotate and adjust y offset for the vertical 'road'
        if (streetCounter[approachNames[1]] > 0) {
          d_y = streetDims[0] * streetDimMult;
          d_x_app = (streetDims[1] * app1mult);
          d_y_app = (streetDims[0] * app0mult);
        } else {
          d_y = streetDims[0] * -streetDimMult;
          d_x_app = -(streetDims[1] * app1mult);
          d_y_app = -(streetDims[0] * app0mult);
        }
        d_x_dep = -d_x_app;
        d_y_dep = d_y_app;
      }

      var app_rot = 0 // approach and depart arrow rotation angles
      var dep_rot = 0
      var t_off_x = 0 // additional x, y text offset for approach/depart values next to corresponding arrows
      var t_off_y = 0

      // case 1: approch from 'bottom' of intersection
      // case 2: approach from 'top' of intersection
      // case 3: approach from 'right' of intersection
      // case 4: approach from 'left' of intersection
      if (d_x == 0 && d_y > 0) {app_rot = 180; dep_rot = 0; t_off_y = 9}
      else if (d_x == 0 && d_y < 0) {app_rot = 0; dep_rot = 180; t_off_y = -9}
      else if (d_x > 0 && d_y == 0) {app_rot = 90; dep_rot = 270; t_off_x = 10}
      else if (d_x < 0 && d_y == 0) {app_rot = 270; dep_rot = 90; t_off_x = -10}

      // Place approach title surrounding intersection

      var approach_title = svg.append('svg')
        .attr('x', xScale(cx + d_x))
        .attr('y', yScale(cy + d_y))
        .attr('class', `approach ${approachNames[0]}`)
        .append('text')
        .attr('transform', `rotate(${appTitleRot})`)
        .attr('stroke', 'grey')
        .style('text-anchor', 'middle')
        .style('dominant-baseline', 'central')
        .style('text-align', 'center')
        .style('font-family', 'sans-serif')
        .style('font-size', approachLabelSize)
        .text(approachNames[0])

      // Place the approach arrow inside a nested svg for ease of changing size/dimensions

      var approach_wrap = svg.append('g')
        .attr('transform', `rotate(${app_rot} ${xScale(cx + d_x_app)} ${yScale(cy + d_y_app)})`)

      var approach_svg = approach_wrap.append('svg')
        .attr('x', xScale(cx + d_x_app)-appDim/2)
        .attr('y', yScale(cy + d_y_app)-appDim/2)
        .attr('viewBox', "0 0 512.171 512.171")
        .attr('width', appDim)
        .attr('height', appDim)
        .attr('class', `approach-in ${a_key}`)
        .style('opacity', 0)
        .append('path')
        .attr('d', arrow_path)
        .attr('fill', '#78A869')

      // Place the text box that is updated with the approach values

      var approach_text = svg.append('svg')
        .attr('x', xScale(cx + d_x_app + t_off_x))
        .attr('y', yScale(cy + d_y_app + t_off_y))
        .attr('width', '20')
        .attr('height', '20')
        .attr('class', `approach-in-text ${a_key}`)
        .style('opacity', 0)
        .append('text')
        .style('font-size', '1.7em')
        .style('fill', '#78A869')
        .style('stroke', '#78A869')
        .style('text-anchor', 'middle')
        .style('text-align', 'center')
        .style('dominant-baseline', 'central')
        .style('font-family', 'sans-serif')
        .text('0')

      // Similar to approach, place the departure arrow in a nested svg

      var depart_wrap = svg.append('g')
        .attr('transform', `rotate(${dep_rot} ${xScale(cx + d_x_dep)} ${yScale(cy + d_y_dep)})`)

      var depart_svg = depart_wrap.append('svg')
        .attr('x', xScale(cx + d_x_dep)-depDim/2)
        .attr('y', yScale(cy + d_y_dep)-depDim/2)
        .attr('viewBox', "0 0 512.171 512.171")
        .attr('width', depDim)
        .attr('height', depDim)
        .attr('class', `depart-out ${a_key.split('_')[0]}`)
        .style('opacity', 0)
        .append('path')
        .attr('d', arrow_path)
        .attr('fill', 'indianred');

      // Place the text box that is updated with the departure values

      var depart_text = svg.append('svg')
        .attr('x', xScale(cx + d_x_dep + t_off_x))
        .attr('y', yScale(cy + d_y_dep + t_off_y))
        .attr('width', '20')
        .attr('height', '20')
        .attr('class', `depart-out-text ${a_key.split('_')[0]}`)
        .style('opacity', 0)
        .append('text')
        .style('font-size', '1.5em')
        .style('fill', 'indianred')
        .style('stroke', 'indianred')
        .style('text-anchor', 'middle')
        .style('text-align', 'center')
        .style('dominant-baseline', 'central')
        .style('font-family', 'sans-serif')
        .text('0');

      // Resize the approach arrow as a proportion of the approach total to the total intersection approach amount

      approach_wrap.select(`.${a_key}`)
        .attr('x', xScale(cx + d_x_app) - (minApp + (appDim - minApp) * (appTotal / interTotal)) / 2)
        .attr('y', yScale(cy + d_y_app) - (minApp + (appDim - minApp) * (appTotal / interTotal)) / 2)
        .attr('width', minApp + (appDim - minApp) * (appTotal / interTotal))
        .attr('height', minApp + (appDim - minApp) * (appTotal / interTotal))

      // Update dynamic street counter dict to help with subsequent approach placement
      streetCounter[approachNames[1]] += 1

      // Save x, y coordinates for the relevent approach from the data
      depResize[a_key.split('_')[0]] = {
        'x': xScale(cx + d_x_dep),
        'y': yScale(cy + d_y_dep)
      }

      // Loop through each departure from each approach
      var app_wrapper = $(this).next('.approach-wrapper');
      app_wrapper.children('.departure-header').each(function() {
        var d_key = $(this).find('h4').text();
        var depTotal = parseInt($(this).find('.dep-total').text());

        // Arrow resizing interpolation experimentation, linear ended up being the most successful

        // Percentage of approach
        // var width_n = ((depDim - minDep) * (appTotal / interTotal)) * (depTotal / appTotal) + minDep;

        // Linear
        var width_n = minDep + (depDim - minDep) * (depTotal / interTotal);

        // Polynomial
        // var width_n = (depDim - minDep) * Math.pow((depTotal / interTotal), 1/10) + minDep;
        var height_n = width_n

        // save the departure arrow resize dimensions in the dynamic dict
        depResize[a_key.split('_')[0]][d_key] = {
          w: width_n,
          h: height_n
        }
      });
    })

    console.log(streetCounter);
    console.log(depResize);

    // Visualize an approach when clicking a map icon on the nav
    $('#nav-container').on('click', '.approach-header .map-icon', function(e) {
      // Make the active selection on the nav
      last_approach_select = $(this);
      $(this).addClass('active');
      $(this).parents('.approach-header').siblings('.approach-header').find('.map-icon').removeClass('active');

      // Display the approach
      displayApproach(last_approach_select, depResize, minDep, displaySelect);
      e.stopPropagation();
    })

    // Update the visualization when toggling the amount/percent buttons
    $('#vis-buttons button').on('click', function() {
      displaySelect = $(this).attr('id');
      $(this).addClass('active');
      $(this).siblings('button').removeClass('active');
      displayApproach(last_approach_select, depResize, minDep, displaySelect);
    })
  })

});

// Function for handling arrow departure resizing for the current visualization

function displayApproach(ref, depResize, minDep, displaySelect) {
  // Do not visualize anything if no approach has been selected
  if (ref == null) {
    return
  }
  // If the selected map-icon is not part of an active intersection, do not visualize
  if (!ref.parents('.intersection-wrapper').prev('.intersection-header').hasClass('active')) {
    return
  }

  // Get the reference approach/intersection names
  var a_key = ref.parents('.approach-header').attr("class").split(/\s+/)[1];
  var i_key = ref.parents('.intersection-wrapper').attr("class").split(/\s+/)[1];
  var app_wrapper = ref.parents('.approach-header').next('.approach-wrapper');
  console.log(i_key, a_key);

  // Display the corresponding approach arrow and hide the others
  $(`.approach-in.${a_key}, .approach-in-text.${a_key}`).css('opacity', 1);
  $('.approach-in, .approach-in-text').not(`.${a_key}`).css('opacity', 0);

  // Update the approach total text
  var approach_text = d3.select('#svg-canvas').select(`.approach-in-text.${a_key}`)
    .select('text')
    .text(ref.siblings('.app-total').text());

  // Get the departure amounts/percentages from the selected approach
  app_wrapper.children('.departure-header').each(function() {
    var d_key = $(this).find('h4').text();
    var depTotal = parseInt($(this).find('.dep-total').text());
    var depPercent = $(this).find('.dep-percent').text()

    // Reference the depart arrow that will be resized and the depart text that will be updated
    var depart_resize = d3.select('#svg-canvas').select(`.depart-out.${d_key.split('_')[1]}`)
    var depart_text = d3.select('#svg-canvas').select(`.depart-out-text.${d_key.split('_')[1]}`)

    // Resize with the interpolated dimensions from the dynamic dict
    depart_resize
      .transition().duration(200)
      .attr('x', depResize[d_key.split('_')[1]]['x'] - depResize[a_key.split('_')[0]][d_key]['w']/2)
      .attr('y', depResize[d_key.split('_')[1]]['y'] - depResize[a_key.split('_')[0]][d_key]['h']/2)
      .attr('width', depResize[a_key.split('_')[0]][d_key]['w'])
      .attr('height', depResize[a_key.split('_')[0]][d_key]['h']);
    // Do not show the departure arrow if the amount is 0, show otherwise
    depart_resize
      .style('opacity', (depResize[a_key.split('_')[0]][d_key]['w'] == minDep) ? 0 : 1)
    depart_text
      .style('opacity', (depResize[a_key.split('_')[0]][d_key]['w'] == minDep) ? 0 : 1)
    // Update text with corresponding formatting from amount/percent menu
    if (displaySelect == 'amount') {
      depart_text.select('text')
        .text(depTotal);
    } else {
      depart_text.select('text')
        .text(depPercent);
    }
  });

}
