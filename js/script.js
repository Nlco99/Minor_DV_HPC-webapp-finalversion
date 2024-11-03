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
var margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
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

    // Convert time to minutes and extract HR and Power
    var formattedData = data.map(function(d) {
        var timeParts = d.t.split(":");
        var timeInMinutes = (+timeParts[0]) * 60 + (+timeParts[1]);
        var hr = +d.HR;
        var power = +d.Power;
        if (isNaN(timeInMinutes) || isNaN(hr) || isNaN(power)) {
            console.error("Invalid data:", d);
            return null;
        }
        return {time: timeInMinutes, HR: hr, Power: power};
    }).filter(d => d !== null); // Filter out invalid data

    // Log the formatted data to inspect its structure
    console.log("Formatted Data:", formattedData);

    // Add X axis
    var x = d3.scaleLinear()
      .domain([0, d3.max(formattedData, function(d) { return d.time; })])
      .range([0, width]);
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).ticks(5));

    // Add Y axis for HR and Power
    var y = d3.scaleLinear()
      .domain([0, d3.max(formattedData, function(d) { return Math.max(d.HR, d.Power); })])
      .range([height, 0]);
    svg.append("g")
      .call(d3.axisLeft(y));

    // Draw the smooth line for HR
    svg.append("path")
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
    svg.append("path")
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
    svg.selectAll("dot")
      .data(formattedData)
      .enter()
      .append("circle")
        .attr("cx", function(d) { return x(d.time); })
        .attr("cy", function(d) { return y(d.HR); })
        .attr("r", 1)
        .attr("fill", "red");

    // Add the points for Power
    svg.selectAll("dot")
      .data(formattedData)
      .enter()
      .append("circle")
        .attr("cx", function(d) { return x(d.time); })
        .attr("cy", function(d) { return y(d.Power); })
        .attr("r", 1.5)
        .attr("fill", "blue");

}).catch(function(error) {
    console.error('Error fetching or processing data:', error);
});