function lineGraphLAPowerHR(data) {
    // Set the dimensions and margins of the graph
    var margin = {top: 10, right: 60, bottom: 30, left: 60},
        width = 900 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;
  
    // Append the svg object to the body of the page
    var svg = d3.select("#linegraph-La-Power-HR")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
    // Convert time to minutes and extract HR, Power, and Lactate
    var formattedData = data.map(function(d) {
        var timeParts = d.t.split(":");
        var timeInMinutes = (+timeParts[0]) * 60 + (+timeParts[1]);
        return {time: timeInMinutes, HR: d.HR, Power: d.Power, Lactate: d.Lactate};
    });
  
    // Add X axis
    var x = d3.scaleLinear()
      .domain([0, d3.max(formattedData, function(d) { return d.time; })])
      .range([0, width]);
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).ticks(5));
  
    // Add Y axis for HR and Power on the left
    var yLeft = d3.scaleLinear()
      .domain([0, 240])
      .range([height, 0]);
    svg.append("g")
      .call(d3.axisLeft(yLeft));
  
    // Add Y axis for Lactate on the right
    var yRight = d3.scaleLinear()
      .domain([0, 12])
      .range([height, 0]);
    svg.append("g")
      .attr("transform", "translate(" + width + " ,0)")   
      .call(d3.axisRight(yRight));
  
    // Draw the smooth line for HR
    svg.append("path")
      .datum(formattedData)
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x(function(d) { return x(d.time); })
        .y(function(d) { return yLeft(d.HR); })
        .curve(d3.curveMonotoneX) // Apply smoothing
      );
  
    // Draw the smooth line for Power
    svg.append("path")
      .datum(formattedData)
      .attr("fill", "none")
      .attr("stroke", "blue")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x(function(d) { return x(d.time); })
        .y(function(d) { return yLeft(d.Power); })
        .curve(d3.curveMonotoneX) // Apply smoothing
      );
  
    // Draw the smooth line for Lactate
    svg.append("path")
      .datum(formattedData)
      .attr("fill", "none")
      .attr("stroke", "green")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x(function(d) { return x(d.time); })
        .y(function(d) { return yRight(d.Lactate); })
        .curve(d3.curveMonotoneX) // Apply smoothing
      );
  
    // Add the points for HR
    svg.selectAll(".dotHR")
      .data(formattedData)
      .enter()
      .append("circle")
        .attr("class", "dotHR")
        .attr("cx", function(d) { return x(d.time); })
        .attr("cy", function(d) { return yLeft(d.HR); })
        .attr("r", 3)
        .attr("fill", "red");
  
    // Add the points for Power
    svg.selectAll(".dotPower")
      .data(formattedData)
      .enter()
      .append("circle")
        .attr("class", "dotPower")
        .attr("cx", function(d) { return x(d.time); })
        .attr("cy", function(d) { return yLeft(d.Power); })
        .attr("r", 3)
        .attr("fill", "blue");
  
    // Add the points for Lactate
    svg.selectAll(".dotLactate")
      .data(formattedData)
      .enter()
      .append("circle")
        .attr("class", "dotLactate")
        .attr("cx", function(d) { return x(d.time); })
        .attr("cy", function(d) { return yRight(d.Lactate); })
        .attr("r", 3)
        .attr("fill", "green");
  
    // Add background color for the ERG LICHT - zone
    svg.append("rect")
    .attr("x", x(0))
    .attr("y", 0)
    .attr("width", x(235))
    .attr("height", height)
    .attr("fill", "lightgreen")
    .attr("opacity", 0.5);
  
    // Add background color for the ERG LICHT - zone !!!!!TIJD AANPASSEN
    svg.append("rect")
    .attr("x", x(235))
    .attr("y", 0)
    .attr("width", x(635) - x(235))
    .attr("height", height)
    .attr("fill", "yellow")
    .attr("opacity", 0.3);
  
    // Add background color for the MATIG - zone !!!!!TIJD AANPASSEN
    svg.append("rect")
    .attr("x", x(635))
    .attr("y", 0)
    .attr("width", x(815) - x(635))
    .attr("height", height)
    .attr("fill", "darkorange")
    .attr("opacity", 0.4);
  
    // Add background color for the ZWAAR - zone !!!!!TIJD AANPASSEN
    svg.append("rect")
    .attr("x", x(815))
    .attr("y", 0)
    .attr("width", x(1190) - x(815))
    .attr("height", height)
    .attr("fill", "blue")
    .attr("opacity", 0.3);
  
    // Add background color for the MAX - zone !!!!!TIJD AANPASSEN
    svg.append("rect")
    .attr("x", x(1190))
    .attr("y", 0)
    .attr("width", x(1505) - x(1190))
    .attr("height", height)
    .attr("fill", "purple")
    .attr("opacity", 0.4);
  
  }


//-------------------VERSIE 1-------------------
//   function lineGraphLAPowerHR(data) {
//     // Set the dimensions and margins of the graph
//     var margin = {top: 10, right: 60, bottom: 30, left: 60},
//         width = 900 - margin.left - margin.right,
//         height = 300 - margin.top - margin.bottom;
  
//     // Append the svg object to the body of the page
//     var svg = d3.select("#linegraph-La-Power-HR")
//       .append("svg")
//         .attr("width", width + margin.left + margin.right)
//         .attr("height", height + margin.top + margin.bottom)
//       .append("g")
//         .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
//     // Convert time to minutes and extract HR, Power, and Lactate
//     var formattedData = data.map(function(d) {
//         var timeParts = d.t.split(":");
//         var timeInMinutes = (+timeParts[0]) * 60 + (+timeParts[1]);
//         return {time: timeInMinutes, HR: d.HR, Power: d.Power, Lactate: d.Lactate};
//     });
  
//     // Extract the nine values for Lactate
//     var lactateData = formattedData.slice(0, 9);
  
//     // Calculate the maximum values for HR and Power
//     var maxHR = d3.max(formattedData, function(d) { return d.HR; });
//     var maxPower = d3.max(formattedData, function(d) { return d.Power; });
//     var maxLactate = d3.max(lactateData, function(d) { return d.Lactate; });
  
//     // Add X axis for Lactate values
//     var x = d3.scaleBand()
//       .domain(lactateData.map(function(d) { return d.Lactate; }))
//       .range([0, width])
//       .padding(0.1);
//     svg.append("g")
//       .attr("transform", "translate(0," + height + ")")
//       .call(d3.axisBottom(x));
  
//     // Add Y axis for HR on the left with a range from 0 to maxHR
//     var yLeft = d3.scaleLinear()
//       .domain([0, maxHR])
//       .range([height, 0]);
//     svg.append("g")
//       .call(d3.axisLeft(yLeft));
  
//     // Add Y axis for Power on the right with a range from 0 to maxPower
//     var yRight = d3.scaleLinear()
//       .domain([0, maxPower])
//       .range([height, 0]);
//     svg.append("g")
//       .attr("transform", "translate(" + width + " ,0)")   
//       .call(d3.axisRight(yRight));
  
//     // Draw the smooth line for HR
//     svg.append("path")
//       .datum(formattedData)
//       .attr("fill", "none")
//       .attr("stroke", "red")
//       .attr("stroke-width", 1.5)
//       .attr("d", d3.line()
//         .x(function(d) { return x(d.Lactate) + x.bandwidth() / 2; })
//         .y(function(d) { return yLeft(d.HR); })
//         .curve(d3.curveMonotoneX) // Apply smoothing
//       );
  
//     // Draw the smooth line for Power
//     svg.append("path")
//       .datum(formattedData)
//       .attr("fill", "none")
//       .attr("stroke", "blue")
//       .attr("stroke-width", 1.5)
//       .attr("d", d3.line()
//         .x(function(d) { return x(d.Lactate) + x.bandwidth() / 2; })
//         .y(function(d) { return yRight(d.Power); })
//         .curve(d3.curveMonotoneX) // Apply smoothing
//       );
  
//     // Add the points for HR
//     svg.selectAll(".dotHR")
//       .data(formattedData)
//       .enter()
//       .append("circle")
//         .attr("class", "dotHR")
//         .attr("cx", function(d) { return x(d.Lactate) + x.bandwidth() / 2; })
//         .attr("cy", function(d) { return yLeft(d.HR); })
//         .attr("r", 3)
//         .attr("fill", "red");
  
//     // Add the points for Power
//     svg.selectAll(".dotPower")
//       .data(formattedData)
//       .enter()
//       .append("circle")
//         .attr("class", "dotPower")
//         .attr("cx", function(d) { return x(d.Lactate) + x.bandwidth() / 2; })
//         .attr("cy", function(d) { return yRight(d.Power); })
//         .attr("r", 3)
//         .attr("fill", "blue");
//   }





// function barchartVO2VCO2(data) {
//   // Set the dimensions and margins of the graph
//   var margin = {top: 10, right: 30, bottom: 30, left: 60},
//       width = 460 - margin.left - margin.right,
//       height = 300 - margin.top - margin.bottom;

//   // Append the svg object to the body of the page
//   var svg = d3.select("#barchart-VO2-VCO2")
//     .append("svg")
//       .attr("width", width + margin.left + margin.right)
//       .attr("height", height + margin.top + margin.bottom)
//     .append("g")
//       .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//   // Convert time to minutes and extract VO2 and VCO2
//   var formattedData = data.map(function(d) {
//       var timeParts = d.t.split(":");
//       var timeInMinutes = (+timeParts[0]) * 60 + (+timeParts[1]);
//       return {time: timeInMinutes, VO2: d.VO2, VCO2: d.VCO2};
//   });

//   // Add X axis
//   var x = d3.scaleBand()
//     .domain(formattedData.map(function(d) { return d.time; }))
//     .range([0, width])
//     .padding(0.1);
//   svg.append("g")
//     .attr("transform", "translate(0," + height + ")")
//     .call(d3.axisBottom(x).tickFormat(function(d) {
//         var hours = Math.floor(d / 60);
//         var minutes = d % 60;
//         return hours + ":" + (minutes < 10 ? "0" : "") + minutes;
//     }));

//   // Add Y axis for VO2 and VCO2 on the left with a fixed range from 0 to 3200
//   var yLeft = d3.scaleLinear()
//     .domain([0, 3200])
//     .range([height, 0]);
//   svg.append("g")
//     .call(d3.axisLeft(yLeft));

//   // Add bars for VO2
//   svg.selectAll(".barVO2")
//     .data(formattedData)
//     .enter()
//     .append("rect")
//       .attr("class", "barVO2")
//       .attr("x", function(d) { return x(d.time); })
//       .attr("y", function(d) { return yLeft(d.VO2); })
//       .attr("width", x.bandwidth() / 2)
//       .attr("height", function(d) { return height - yLeft(d.VO2); })
//       .attr("fill", "blue");

//   // Add bars for VCO2
//   svg.selectAll(".barVCO2")
//     .data(formattedData)
//     .enter()
//     .append("rect")
//       .attr("class", "barVCO2")
//       .attr("x", function(d) { return x(d.time) + x.bandwidth() / 2; })
//       .attr("y", function(d) { return yLeft(d.VCO2); })
//       .attr("width", x.bandwidth() / 2)
//       .attr("height", function(d) { return height - yLeft(d.VCO2); })
//       .attr("fill", "red");
// }
// //Fetch data and create the bar chart
// fetchData(barchartVO2VCO2);