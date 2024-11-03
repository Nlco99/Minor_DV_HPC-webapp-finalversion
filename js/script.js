//Side bar page navigation
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));

    // Show the selected section
    document.getElementById(sectionId).classList.add('active');
}


// Fetch maximum values from CSV file
async function fetchMaxValues() {
    const response = await fetch('data/results-person1.csv');
    const data = await response.text();

    Papa.parse(data, {
        header: false,
        skipEmptyLines: true,
        complete: function(results) {
            const rows = results.data.slice(2); // Skip the first 2 lines (header and units)
    
            let maxLactaat = 0, maxVO2 = 0, maxHR = 0, maxPower = 0;
    
            rows.forEach(row => {
                const lactaat = parseFloat(row[9].replace(',', '.'));
                const vo2 = parseFloat(row[4].replace(',', '.'));
                const hr = parseFloat(row[7].replace(',', '.'));
                const power = parseFloat(row[8].replace(',', '.'));
    
                if (lactaat > maxLactaat) maxLactaat = lactaat;
                if (vo2 > maxVO2) maxVO2 = vo2;
                if (hr > maxHR) maxHR = hr;
                if (power > maxPower) maxPower = power;
            });
    
            console.log('Max Values:', { maxLactaat, maxVO2, maxHR, maxPower }); // Debugging line
    
            // Round up to the nearest tenth
            const roundToTenth = (value) => Math.ceil(value * 10) / 10;
    
            document.getElementById('lactaat-value').textContent = `${roundToTenth(maxLactaat)} mmol/L`;
            document.getElementById('vo2-value').textContent = `${roundToTenth(maxVO2)} ml/kg/min`;
            document.getElementById('hr-value').textContent = `${roundToTenth(maxHR)} bpm`;
            document.getElementById('power-value').textContent = `${roundToTenth(maxPower)} W`;
        }
    });
}

fetchMaxValues();

// set the dimensions and margins of the graph
var margin = {top: 10, right: 60, bottom: 30, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg1 = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var svg2 = d3.select("#my_dataviz2")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Read the data
d3.dsv(";", "data/results-person1.csv", d3.autoType).then(function(data) {
    // Log the raw data to inspect its structure
    console.log("Raw Data:", data);

    // Filter out rows where the time property is null
    data = data.filter(d => d.t !== null);

    // Ensure the data is an array before using .map
    if (!Array.isArray(data)) {
        console.error("Data is not an array:", data);
        return;
    }

    // Convert time to minutes and extract HR, Power, and Lactate
    var formattedData = data.map(function(d) {
        var timeParts = d.t.split(":");
        var timeInMinutes = (+timeParts[0]) * 60 + (+timeParts[1]);
        var hr = +d.HR;
        var power = +d.Power;
        var lactate = +d["La-"];
        if (isNaN(timeInMinutes) || isNaN(hr) || isNaN(power) || isNaN(lactate)) {
            console.error("Invalid data:", d);
            return null;
        }
        return {time: timeInMinutes, HR: hr, Power: power, Lactate: lactate};
    }).filter(d => d !== null); // Filter out invalid data

    // Log the formatted data to inspect its structure
    console.log("Formatted Data:", formattedData);

    // Add X axis
    var x = d3.scaleLinear()
      .domain([0, d3.max(formattedData, function(d) { return d.time; })])
      .range([0, width]);
    svg1.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).ticks(5));

    // Add Y axis for HR and Power
    var y = d3.scaleLinear()
      .domain([0, d3.max(formattedData, function(d) { return Math.max(d.HR, d.Power); })])
      .range([height, 0]);
    svg1.append("g")
      .call(d3.axisLeft(y));

    // Draw the smooth line for HR
    svg1.append("path")
      .datum(formattedData)
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x(function(d) { return x(d.time); })
        .y(function(d) { return y(d.HR); })
        .curve(d3.curveMonotoneX) // Apply smoothing
      );

    // Draw the smooth line for Power
    svg1.append("path")
      .datum(formattedData)
      .attr("fill", "none")
      .attr("stroke", "blue")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x(function(d) { return x(d.time); })
        .y(function(d) { return y(d.Power); })
        .curve(d3.curveMonotoneX) // Apply smoothing
      );

    // Add the points for HR
    svg1.selectAll("dot")
      .data(formattedData)
      .enter()
      .append("circle")
        .attr("cx", function(d) { return x(d.time); })
        .attr("cy", function(d) { return y(d.HR); })
        .attr("r", 3)
        .attr("fill", "red");

    // Add the points for Power
    svg1.selectAll("dot")
      .data(formattedData)
      .enter()
      .append("circle")
        .attr("cx", function(d) { return x(d.time); })
        .attr("cy", function(d) { return y(d.Power); })
        .attr("r", 3)
        .attr("fill", "blue");

    // Data for the second graph
    var lactateData = [
        {Lactate: 1.2, Power: 0, HR: 67, time: 5},
        {Lactate: 1.5, Power: 80, HR: 108, time: 235},
        {Lactate: 1.6, Power: 100, HR: 120, time: 415},
        {Lactate: 1.9, Power: 120, HR: 141, time: 595},
        {Lactate: 2.8, Power: 140, HR: 158, time: 780},
        {Lactate: 3.9, Power: 160, HR: 167, time: 955},
        {Lactate: 5.6, Power: 180, HR: 174, time: 1130},
        {Lactate: 7.6, Power: 200, HR: 181, time: 1315},
        {Lactate: 10.8, Power: 220, HR: 186, time: 1490}
    ];

    // Add background color for the ERG LICHT - zone
    svg2.append("rect")
    .attr("x", x(0))
    .attr("y", 0)
    .attr("width", x(235))
    .attr("height", height)
    .attr("fill", "lightgreen")
    .attr("opacity", 0.5);

    // Add background color for the ERG LICHT - zone !!!!!TIJD AANPASSEN
    svg2.append("rect")
    .attr("x", x(235))
    .attr("y", 0)
    .attr("width", x(635) - x(235))
    .attr("height", height)
    .attr("fill", "yellow")
    .attr("opacity", 0.3);

    // Add background color for the MATIG - zone !!!!!TIJD AANPASSEN
    svg2.append("rect")
    .attr("x", x(635))
    .attr("y", 0)
    .attr("width", x(815) - x(635))
    .attr("height", height)
    .attr("fill", "darkorange")
    .attr("opacity", 0.6);

    // Add background color for the ZWAAR - zone !!!!!TIJD AANPASSEN
    svg2.append("rect")
    .attr("x", x(815))
    .attr("y", 0)
    .attr("width", x(1190) - x(815))
    .attr("height", height)
    .attr("fill", "lightblue")
    .attr("opacity", 1);

    // Add background color for the MAX - zone !!!!!TIJD AANPASSEN
    svg2.append("rect")
    .attr("x", x(1190))
    .attr("y", 0)
    .attr("width", x(1505) - x(1190))
    .attr("height", height)
    .attr("fill", "purple")
    .attr("opacity", 0.4);


    // Add X axis for the second graph
    var x2 = d3.scaleLinear()
      .domain([0, d3.max(lactateData, function(d) { return d.time; })])
      .range([0, width]);
    svg2.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x2).ticks(5));

    // Add Y axis for HR and Power on the left
    var yLeft2 = d3.scaleLinear()
      .domain([0, d3.max(lactateData, function(d) { return Math.max(d.HR, d.Power); })])
      .range([height, 0]);
    svg2.append("g")
      .call(d3.axisLeft(yLeft2));

    // Add Y axis for Lactate on the right
    var yRight2 = d3.scaleLinear()
      .domain([0, d3.max(lactateData, function(d) { return d.Lactate; })])
      .range([height, 0]);
    svg2.append("g")
      .attr("transform", "translate(" + width + " ,0)")   
      .call(d3.axisRight(yRight2));

    // Draw the smooth line for HR
    svg2.append("path")
      .datum(lactateData)
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x(function(d) { return x2(d.time); })
        .y(function(d) { return yLeft2(d.HR); })
        .curve(d3.curveMonotoneX) // Apply smoothing
      );

    // Draw the smooth line for Power
    svg2.append("path")
      .datum(lactateData)
      .attr("fill", "none")
      .attr("stroke", "blue")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x(function(d) { return x2(d.time); })
        .y(function(d) { return yLeft2(d.Power); })
        .curve(d3.curveMonotoneX) // Apply smoothing
      );

    // Draw the smooth line for Lactate
    svg2.append("path")
      .datum(lactateData)
      .attr("fill", "none")
      .attr("stroke", "green")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x(function(d) { return x2(d.time); })
        .y(function(d) { return yRight2(d.Lactate); })
        .curve(d3.curveMonotoneX) // Apply smoothing
      );

    // Add the points for HR
    svg2.selectAll("dot")
      .data(lactateData)
      .enter()
      .append("circle")
        .attr("cx", function(d) { return x2(d.time); })
        .attr("cy", function(d) { return yLeft2(d.HR); })
        .attr("r", 3)
        .attr("fill", "red");

    // Add the points for Power
    svg2.selectAll("dot")
      .data(lactateData)
      .enter()
      .append("circle")
        .attr("cx", function(d) { return x2(d.time); })
        .attr("cy", function(d) { return yLeft2(d.Power); })
        .attr("r", 3)
        .attr("fill", "blue");

    // Add the points for Lactate
    svg2.selectAll("dot")
      .data(lactateData)
      .enter()
      .append("circle")
        .attr("cx", function(d) { return x2(d.time); })
        .attr("cy", function(d) { return yRight2(d.Lactate); })
        .attr("r", 3)
        .attr("fill", "green");

    // Add grid lines
    svg2.append("g")
      .attr("class", "grid")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x2)
        .ticks(5)
        .tickSize(-height)
        .tickFormat("")
      );

    svg2.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yLeft2)
        .ticks(5)
        .tickSize(-width)
        .tickFormat("")
      );

}).catch(function(error) {
    console.error('Error fetching or processing data:', error);
});