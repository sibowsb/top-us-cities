console.log(window.innerWidth, window.innerHeight);
var width = window.innerWidth, height = window.innerHeight;
var svg = d3.select('#section2')
            .append('svg')
            .attr('width', width)
            .attr('height', height);

// Taken from https://stackoverflow.com/a/34683867/7432468 ------
function parseColor(color) {
  var arr=[];
  color.replace(/[\d+\.]+/g, function(v) {
    arr.push(parseFloat(v));
  });
  return {
    hex: "#" + arr.slice(0, 3).map(toHex).join(""),
    opacity: arr.length == 4 ? arr[3] : 1
  };
}
function toHex(int) {
  var hex = int.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}
// end ---------------------------------------------------------

var centered;

var projection = d3.geoAlbersUsa()
  .scale(1000)
  .translate([width / 2, height / 2 + 50]);

var path = d3.geoPath()
  .projection(projection);

var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .style('z-index', '99999999999')
  .html(function(d) {
    // console.log(d.city);
    return "<p><strong>" + d.city + "</strong>, " + d.state + "</p>" +
           "<p><strong>Population:</strong> <span style='color:#bb93d8'>" + d.population + "</span></p>" +
           "<p><strong>2000-2013 growth:</strong> <span style='color:#bb93d8'>" + d['2000-2013 growth'] + "</span></p>";
  });
svg.call(tip);

svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", clicked);

var g = svg.append("g");

d3.json("data/us.json", function(error, us) {
  if (error) throw error;

  g.append("g")
      .attr("id", "states")
    .selectAll("path")
      .data(topojson.feature(us, us.objects.states).features)
    .enter().append("path")
      .attr("d", path)
      .style('z-index', 10)
      .on("click", clicked);

  g.append("path")
      .datum(topojson.mesh(us, us.objects.states, function(a, b) {return a !== b;}))
      .attr("id", "state-borders")
      .attr("d", path);

  d3.csv('data/merged.csv', function(error, csv) {
    if (error) throw error;
    // console.log(csv[0]);

    var circle = g.selectAll('circle').data(csv);
    console.log(circle);
    circle.enter().append('circle')
      .merge(circle)
      .attr('cx', function(d, i) {
        if (d.lng == "" || d.lat == "") return -9999;
        return projection([d.lng, d.lat])[0];
      })
      .attr('cy', function(d, i) {
        if (d.lng == "" || d.lat == "") return -9999;
        return projection([d.lng, d.lat])[1];
      })
      .attr('fill', function(d) {
        var norm_var = - (d['2000-2013 growth'] / 0.6) + 0.5;
        norm_var = Math.min(1, norm_var);
        norm_var = Math.max(0, norm_var);
        return d3.interpolateRdBu(norm_var);
      })
      .attr('r', function(d) {
        return (d.population ** 0.5) / 300;
      })
      .style('z-index', function(d) {return 9999999 - d.population;})
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);
  });
});

function clicked(d) {
  var x, y, k;

  if (d && centered !== d) {
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 4;
    centered = d;
  } else {
    x = width / 2;
    y = height / 2;
    k = 1;
    centered = null;
  }

  g.selectAll("path")
      .classed("active", centered && function(d) { return d === centered; });

  g.transition()
      .duration(750)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");

}

var linearSize = d3.scaleLinear().domain([0.01, 10]).range([0.33, 10.55]);
var svg = d3.select("svg");

svg.append("g")
  .attr("class", "legendSize")
  .attr("transform", function(d) {
    return "translate(30," + (window.innerHeight - 70) + ")";
  });

var legendSize = d3.legendSize()
  .scale(linearSize)
  .shape('circle')
  .shapePadding(30)
  .labelOffset(15)
  .orient('horizontal');

svg.select(".legendSize")
  .call(legendSize)
  .attr('fill', 'gray')
  .style('font-size', '10px');


// =================

var thresholdScale = d3.scaleThreshold()
  .domain([ -0.4, -0.2, 0, 0.2, 0.4 ])
  .range(d3.range(5)
  .map(function(i) { return "q" + i + "-9"}));

var svg = d3.select("svg");

var temp = svg.append("g")
  .attr("class", "legendQuant")
  .attr("transform", function(d) {
    return "translate(" + (window.innerWidth - 130) + ","
      + (window.innerHeight - 130) + ")";
  });


var legend = d3.legendColor()
  .labelFormat(d3.format(".2f"))
  .labels(d3.legendHelpers.thresholdLabels)
  .useClass(true)
  .scale(thresholdScale);

svg.select(".legendQuant")
  .call(legend)
  .style('font-size', '12px')

temp.selectAll('.label').attr('fill', 'gray');
