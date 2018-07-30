/**
 * REFERENCE:
 * http://bl.ocks.org/weiglemc/6185069
 */

 var margin = {top: 170, right: 80, bottom: 50, left: 80},
     width = window.innerWidth - margin.left - margin.right,
     height = window.innerHeight - margin.top - margin.bottom;

 var svg = d3.select("#section3").append("svg")
     .attr("width", width + margin.left + margin.right)
     .attr("height", height + margin.top + margin.bottom)
   .append("g")
     .attr("transform",
           "translate(" + margin.left + "," + margin.top + ")");

// setup x
var xValue = function(d) { return d.population; }, // data -> value
    xScale = d3.scaleLog().range([0, width]),  // value -> display
    xMap = function(d) { return xScale(xValue(d)); }, // data -> display
    xAxis = d3.axisBottom().scale(xScale);

// setup y
var yValue = function(d) { return d['2000-2013 growth'] * 100; }, // data -> value
    yScale = d3.scaleLinear().range([height, 0]), // value -> display
    yMap = function(d) { return yScale(yValue(d)); }, // data -> display
    yAxis = d3.axisLeft().scale(yScale);

// setup fill color
var getColor = function(d) {
  var norm_var = - (d['2000-2013 growth'] / 0.6) + 0.5;
  norm_var = Math.min(1, norm_var);
  norm_var = Math.max(0, norm_var);
  return d3.interpolateRdBu(norm_var);
};

// setup tooltip
var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .style('z-index', '99999999999')
  .html(function(d) {
    // console.log(d.city);
    return "<p><strong>" + d.city + "</strong>, " + d.state + "</p>" +
           "<p><strong>Population:</strong> <span style='color:steelblue'>" + d.population + "</span></p>" +
           "<p><strong>2000-2013 growth:</strong> <span style='color:steelblue'>" + d['2000-2013 growth'] + "</span></p>";
  });
svg.call(tip);

// load data
d3.csv("data/merged.csv", function(error, data) {
  if (error) throw error;

  xScale.domain([30000, 9000000]);
  yScale.domain([-30, 300]);

  // x-axis
  svg.append("g")
      .attr("class", "x_axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .style("fill", "black")
      .text("Population")

  // y-axis
  svg.append("g")
      .attr("class", "y_axis")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .style("fill", "black")
      .text("2000-2013 Growth (%)");

  // draw dots
  svg.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 2)
      .attr("cx", xMap)
      .attr("cy", yMap)
      .style("alpha", 0.3)
      .style("fill", "#ccc")
      .on("mouseover", tip.show)
      .on("mouseout", tip.hide);
});
