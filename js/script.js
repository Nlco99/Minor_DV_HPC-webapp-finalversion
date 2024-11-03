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

async function fetchData(callback) {
  const response = await fetch('data/results-person1.csv');
  const data = await response.text();

  Papa.parse(data, {
      header: true,
      skipEmptyLines: true,
      complete: function(results) {
          const rows = results.data;

          // Function to convert and round values
          const convertAndRound = (value) => Math.ceil(parseFloat(value.replace(',', '.')) * 10) / 10;

          // Filter out rows where the Lactate value is empty and convert values
          const filteredRows = rows.slice(1).filter(row => row['La-'] !== '').map(row => {
              return {
                  t: row.t,
                  Rf: convertAndRound(row.Rf),
                  VT: convertAndRound(row.VT),
                  VE: convertAndRound(row.VE),
                  VO2: convertAndRound(row.VO2),
                  VCO2: convertAndRound(row.VCO2),
                  RQ: convertAndRound(row.RQ),
                  HR: convertAndRound(row.HR),
                  Power: convertAndRound(row.Power),
                  Lactate: convertAndRound(row['La-'])
              };
          });

          // Log the fetched values to the console
          console.log('Fetched Values:', filteredRows);

          // Call the callback function with the filtered data
          callback(filteredRows);
      }
  });
}


function lineGraphLAPowerHR(data) {
  // Set the dimensions and margins of the graph
  var margin = {top: 10, right: 60, bottom: 30, left: 60},
      width = 460 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

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

function barchartVO2VCO2(data) {
  // Set the dimensions and margins of the graph
  var margin = {top: 10, right: 30, bottom: 30, left: 60},
      width = 460 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

  // Append the svg object to the body of the page
  var svg = d3.select("#barchart-VO2-VCO2")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Convert time to minutes and extract VO2 and VCO2
  var formattedData = data.map(function(d) {
      var timeParts = d.t.split(":");
      var timeInMinutes = (+timeParts[0]) * 60 + (+timeParts[1]);
      return {time: timeInMinutes, VO2: d.VO2, VCO2: d.VCO2};
  });

  // Add X axis
  var x = d3.scaleBand()
    .domain(formattedData.map(function(d) { return d.time; }))
    .range([0, width])
    .padding(0.1);
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickFormat(function(d) {
        var hours = Math.floor(d / 60);
        var minutes = d % 60;
        return hours + ":" + (minutes < 10 ? "0" : "") + minutes;
    }));

  // Add Y axis for VO2 and VCO2 on the left with a fixed range from 0 to 3200
  var yLeft = d3.scaleLinear()
    .domain([0, 3200])
    .range([height, 0]);
  svg.append("g")
    .call(d3.axisLeft(yLeft));

  // Add bars for VO2
  svg.selectAll(".barVO2")
    .data(formattedData)
    .enter()
    .append("rect")
      .attr("class", "barVO2")
      .attr("x", function(d) { return x(d.time); })
      .attr("y", function(d) { return yLeft(d.VO2); })
      .attr("width", x.bandwidth() / 2)
      .attr("height", function(d) { return height - yLeft(d.VO2); })
      .attr("fill", "blue");

  // Add bars for VCO2
  svg.selectAll(".barVCO2")
    .data(formattedData)
    .enter()
    .append("rect")
      .attr("class", "barVCO2")
      .attr("x", function(d) { return x(d.time) + x.bandwidth() / 2; })
      .attr("y", function(d) { return yLeft(d.VCO2); })
      .attr("width", x.bandwidth() / 2)
      .attr("height", function(d) { return height - yLeft(d.VCO2); })
      .attr("fill", "red");
}

// Fetch maximum values for CARD MAX prestatie
fetchMaxValues();

// Fetch data and create the line graph
fetchData(lineGraphLAPowerHR);

// Fetch data and create the bar chart
fetchData(barchartVO2VCO2);