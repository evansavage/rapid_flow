$(document).ready(function() {
  const reducer = (accumulator, currentValue) => accumulator + currentValue;

  var mapImageURL = 'assets/img/map.png'

  var w = 1000;
  var h = 1000;
  var svg = d3.select("#visualization-container").append("svg")
           .attr("preserveAspectRatio", "xMinYMin meet")
           .attr("viewBox", "-20 -20 " + w + " " + h)
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

  var axes = true;

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

  $.getJSON("assets/data/intersection_1.json", function (data) {

  }).fail(function() {
    console.log("an error occured.")
  }).done(function(data) {

    for (i_key in data) {
      //----------------FUN SHAPES----------------//
      //RECTANGLE
      var cx = 50;
      var cy = 50;
      var width = 50;
      var height = 30;

      var rect = svg.append("rect")
             .attr("height",function(d){
               return yScale(width);})
             .attr("width", function(d){
                return xScale(height);})
             .attr("y",function(d){
                return yScale(cy - width/2);})
             .attr("x",function(d){
                return xScale(cx - height/2);})
             .attr("class", "rectangle");

       var rect2 = svg.append("rect")
              .attr("height",function(d){
                return yScale(height);})
              .attr("width", function(d){
                 return xScale(width);})
              .attr("y",function(d){
                 return yScale(cy-height/2);})
              .attr("x",function(d){
                 return xScale(cx-width/2);})
              .attr("class", "rectangle");

        var tex1 = svg.append('text')
          .attr('x', function(d){
            return xScale(15);})
          .attr('y', function(d){
            return yScale(10);})
          .attr('stroke', 'black')
          .style('font-size', 25)
          .style('font-family', 'sans-serif')
          .text(i_key)
      // Loop through each approach in intersection
      for (a_key in data[i_key]) {


        for (d_key in data[i_key][a_key]) {


        }
      }
    }



  });;

  // var rect = $("<div id='rect'>").appendTo('#visualization-container');
  // var svg = d3.select('#rect').append("svg");
  // var g = svg.selectAll(".rect")
  //   .data([1])
  //   .enter()
  //   .append("g")
  //   .classed('rect', true)
  //
  // g.append("rect")
  //   .attr("width", 240)
  //   .attr("height", 600)
  //   .attr("x", 20)
  //   .attr("y", 13)
  //   .attr("fill",  "black")
  //
  // g.append("rect")
  //   .attr("width", 600)
  //   .attr("height", 240)
  //   .attr("x", 120)
  //   .attr("y", 18)
  //   .attr("fill",  "black")

})
