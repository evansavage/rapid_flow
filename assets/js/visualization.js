$(document).ready(function() {
  const reducer = (accumulator, currentValue) => accumulator + currentValue;

  var mapImageURL = 'assets/img/map.png'

  var w = 1000;
  var h = 1000;
  var svg = d3.select("#visualization-container").append("svg")
           .attr("preserveAspectRatio", "xMinYMin meet")
           .attr("viewBox", "-20 -20 " + w + " " + h)
           .attr("width", '100%')
           .attr("height", '100%')
           .attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
           //this is to zoom out
           //.attr("viewBox", "-20 -20 1600 1600")
           .style("padding", 5)
           .style("margin", 5);

  //----------------CANVAS PREPARATION----------------//
  //PREPARE SCALES
  //PREPARE SCALES
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

  var axes = false;

  if (axes) {



    //PREPARE AXES
    var xAxisBottom = d3.axisBottom(xScale).ticks(20);
    var xAxisTop = d3.axisTop(xScale).ticks(20);
    var yAxisLeft = d3.axisLeft(yScale).ticks(20);
    var yAxisRight = d3.axisRight(yScale).ticks(20);

    //PREPARE GRIDS
    //MAIN
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
    //DRAW EVERYTHING
    //LAYER BOTTOM UP
    //MINOR GRID
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

  var arrow_path = "M479.046,283.925c-1.664-3.989-5.547-6.592-9.856-6.592H352.305V10.667C352.305,4.779,347.526,0,341.638,0H170.971c-5.888,0-10.667,4.779-10.667,10.667v266.667H42.971c-4.309,0-8.192,2.603-9.856,6.571c-1.643,3.989-0.747,8.576,2.304,11.627l212.8,213.504c2.005,2.005,4.715,3.136,7.552,3.136s5.547-1.131,7.552-3.115l213.419-213.504C479.793,292.501,480.71,287.915,479.046,283.925z"

  $.getJSON("assets/data/intersection_1.json", function (data) {

  }).fail(function() {
    console.log("an error occured.")
  }).done(function(data) {

    var cx = 50;
    var cy = 40;
    var streetDims = [45, 30];
    var width = 55;
    var height = 30;
    var titleSize = 25;
    var streetLabelSize = 22;

    var depDim = 70;
    var appDim = 100;
    var minApp = 30;
    var minDep = 20;
    var mult = 0.8;
    var app0mult = 0.41;
    var app1mult = 0.3;
    var dep0mult = app0mult;
    var dep1mult = app1mult;

    $('#nav-container').on('click', '.intersection-header', function() {
      var i_key = $(this).attr("class").split(/\s+/)[1];
      //TITLE
      var clean = svg.selectAll('*').remove();

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

      svg.selectAll('rect.streets')
        .data(streets)
        .enter().append('rect')
        .attr("height",function(d){return yScale(d.h)})
        .attr("width", function(d){return xScale(d.w)})
        .attr("y",function(d){return yScale(d.y);})
        .attr("x",function(d){return xScale(d.x);})
        .attr("class", (d) => {return `${d.name} streets`})
        .classed('streets');


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

      var streetCounter = {
        [streetNames[0]]: 0,
        [streetNames[1]]: 0
      }

      var depResize = {};
      // Loop through each approach in intersection

      for (a_key in data[i_key]) {

        var approachNames = a_key.split('_');
        var rotate = 0;
        var d_x = 0; //
        var d_y = 0;
        var d_y_app = 0;
        var d_x_app = 0;
        var d_y_dep = 0;
        var d_x_dep = 0;


        var refRect = d3.select(`rect.${approachNames[1]}`);

        // rotate text and adjust x offset if horizontal road
        if (refRect.attr('width') > refRect.attr('height')) {
          rotate = 270;
          if (streetCounter[approachNames[1]] > 0) {
            d_x = streetDims[0] * mult;
            d_x_app = (streetDims[0] * app0mult);
            d_y_app = -(streetDims[1] * app1mult);
          } else {
            d_x = streetDims[0] * -mult;
            d_x_app = -(streetDims[0] * app0mult);
            d_y_app = (streetDims[1] * app1mult);
          }
          d_x_dep = d_x_app;
          d_y_dep = -d_y_app;
        } else { // do not rotate and adjust y offset
          if (streetCounter[approachNames[1]] > 0) {
            d_y = streetDims[0] * mult;
            d_x_app = (streetDims[1] * app1mult);
            d_y_app = (streetDims[0] * app0mult);
          } else {
            d_y = streetDims[0] * -mult;
            d_x_app = -(streetDims[1] * app1mult);
            d_y_app = -(streetDims[0] * app0mult);
          }
          d_x_dep = -d_x_app;
          d_y_dep = d_y_app;
        }

        var app_rot = 0
        var dep_rot = 0

        if (d_x == 0 && d_y > 0) {app_rot = 180; dep_rot = 0}
        else if (d_x == 0 && d_y < 0) {app_rot = 0; dep_rot = 180}
        else if (d_x > 0 && d_y == 0) {app_rot = 90; dep_rot = 270}
        else if (d_x < 0 && d_y == 0) {app_rot = 270; dep_rot = 90}

        var approach_title = svg.append('svg')
          .attr('x', xScale(cx + d_x))
          .attr('y', yScale(cy + d_y))
          .attr('class', `approach ${approachNames[0]}`)
          .append('text')
          .attr('transform', `rotate(${rotate})`)
          .attr('stroke', 'grey')
          // .style('transform', `translate(50%, 50%)`)
          .style('text-anchor', 'middle')
          .style('text-align', 'center')
          .style('font-family', 'sans-serif')
          .text(approachNames[0])

        var approach_wrap = svg.append('g')
          .attr('transform', `rotate(${app_rot} ${xScale(cx + d_x_app)} ${yScale(cy + d_y_app)})`)
          // .attr('transform', ``)

        var approach_svg = approach_wrap.append('svg')
          .attr('x', xScale(cx + d_x_app)-appDim/2)
          .attr('y', yScale(cy + d_y_app)-appDim/2)
          .attr('viewBox', "0 0 512.171 512.171")
          .attr('width', appDim)
          .attr('height', appDim)
          .attr('class', `approach-in ${a_key}`)
          .style('opacity', 0)
          .append('path')
          // .attr('transform', `scale(${exp}) translate(${(1 - exp)*appDim} ${(1-exp)*appDim})`)
          .attr('d', arrow_path)
          .attr('fill', '#78A869')


        var depart_wrap = svg.append('g')
          .attr('transform', `rotate(${dep_rot} ${xScale(cx + d_x_dep)} ${yScale(cy + d_y_dep)})`)
          .append('svg')
          .attr('x', xScale(cx + d_x_dep)-depDim/2)
          .attr('y', yScale(cy + d_y_dep)-depDim/2)
          .attr('viewBox', "0 0 512.171 512.171")
          .attr('width', depDim)
          .attr('height', depDim)
          // .attr('transform', `translate(${xScale(cx + d_x_dep)-depDim/2}, ${yScale(cy + d_y_dep)-depDim/2})`)
          // .attr('class', `depart ${approachNames[0]}`)
          .attr('class', `depart-out ${a_key.split('_')[0]}`)
          .style('opacity', 0)
          .append('path')
          // .attr('transform', 'scale(0.1)')
          .attr('d', arrow_path)
          .attr('fill', 'lightyellow')

        console.log(minApp + (appDim - minApp) * (totalLevel(data[i_key][a_key]) / totalLevel(data[i_key])))

        approach_wrap.select(`.${a_key}`).attr('x', xScale(cx + d_x_app) - (minApp + (appDim - minApp) * (totalLevel(data[i_key][a_key]) / totalLevel(data[i_key]))) / 2)
          .attr('y', yScale(cy + d_y_app) - (minApp + (appDim - minApp) * (totalLevel(data[i_key][a_key]) / totalLevel(data[i_key]))) / 2)
          .attr('width', minApp + (appDim - minApp) * (totalLevel(data[i_key][a_key]) / totalLevel(data[i_key])))
          .attr('height', minApp + (appDim - minApp) * (totalLevel(data[i_key][a_key]) / totalLevel(data[i_key])))

        streetCounter[approachNames[1]] += 1
        depResize[a_key.split('_')[0]] = {
          'x': xScale(cx + d_x_dep),
          'y': yScale(cy + d_y_dep)
        }

        for (d_key in data[i_key][a_key]) {
          var depAmt = data[i_key][a_key][d_key];
          var width_n = minDep + (depDim - minDep) * (depAmt / totalLevel(data[i_key]));
          var height_n = width_n

          depResize[a_key.split('_')[0]][d_key] = {
            w: width_n,
            h: height_n
          }
          // d3.select(`.depart-out.${a_key.split('_')[0]}`)
          //   .attr(d_key + '_x', x_n)
          //   .attr(d_key + '_y', y_n)
          //   .attr(d_key + '_w', width_n)
          //   .attr(d_key + '_h', height_n)
        }
      }
      console.log(streetCounter);
      $('#nav-container').on('click', '.approach-header .map-icon', function() {
        var a_key = $(this).parents('.approach-header').attr("class").split(/\s+/)[1];
        var i_key = $(this).parents('.intersection-wrapper').attr("class").split(/\s+/)[1];
        console.log(i_key, a_key);
        $('.approach-in').each(function() {
          if ($(this).css('opacity') == 1 && !$(this).hasClass(a_key)) {
            $(this).animate({'opacity': 0}, 400);
          }
        })
        // console.log(a_key.split('_')[0])
        for (d_key in data[i_key][a_key]) {
          var depAmt = data[i_key][a_key][d_key];
          var x_n = d3.select(`.depart-out.${d_key.split('_')[1]}`).attr(`x`)
          var y_n = d3.select(`.depart-out.${d_key.split('_')[1]}`).attr(`y`)
          //
          console.log(depResize[a_key.split('_')[0]]['x'], depResize[a_key.split('_')[0]]['y'])
          d3.select(`.depart-out.${d_key.split('_')[1]}`)
            .transition().duration(400)
            .attr('x', depResize[d_key.split('_')[1]]['x'] - depResize[a_key.split('_')[0]][d_key]['w']/2)
            .attr('y', depResize[d_key.split('_')[1]]['y'] - depResize[a_key.split('_')[0]][d_key]['h']/2)
            .attr('width', depResize[a_key.split('_')[0]][d_key]['w'])
            .attr('height', depResize[a_key.split('_')[0]][d_key]['h'])
            .style('opacity', (depResize[a_key.split('_')[0]][d_key]['w'] == minDep) ? 0 : 1)
        }
        $(`.approach-in.${a_key}`).animate({'opacity': 1}, 400);
      })
    })

    // for (i_key in data) {
    //
    // }
    // console.log(depResize);



  });
})
