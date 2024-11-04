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
                const vco2 = parseFloat(row[5].replace(',', '.'));
                const hr = parseFloat(row[7].replace(',', '.'));
                const power = parseFloat(row[8].replace(',', '.'));
    
                if (lactaat > maxLactaat) maxLactaat = lactaat;
                if (vo2 > maxVO2) maxVO2 = vo2;
                if (vco2 > maxVO2) maxVO2 = vco2;
                if (hr > maxHR) maxHR = hr;
                if (power > maxPower) maxPower = power;
            });
    
            console.log('Max Values:', { maxLactaat, maxVO2, maxHR, maxPower }); // Debugging line
    
            // Round up to the nearest tenth
            const roundToTenth = (value) => Math.ceil(value * 10) / 10;
    
            document.getElementById('lactaat-value').textContent = `${roundToTenth(maxLactaat)} `;
            document.getElementById('vo2-value').textContent = `${roundToTenth(maxVO2)} `;
            document.getElementById('hr-value').textContent = `${roundToTenth(maxHR)} `;
            document.getElementById('power-value').textContent = `${roundToTenth(maxPower)} `;
        }
    });
}
fetchMaxValues();

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

            // Convert and round values for all rows
            const allData = rows.map(row => ({
                t: row.t,
                HR: convertAndRound(row.HR),
                Power: convertAndRound(row.Power),
                VO2: convertAndRound(row.VO2),
                VCO2: convertAndRound(row.VCO2)
            })).filter(row => !isNaN(row.HR) && !isNaN(row.Power) && !isNaN(row.VO2) && !isNaN(row.VCO2));

            // Call the callback function with the data
            callback(allData);
        }
    });
}


// function lineGraphVO2VCO2(data) {
//   // Set the dimensions and margins of the graph
//   var margin = {top: 10, right: 30, bottom: 30, left: 60},
//       width = 460 - margin.left - margin.right,
//       height = 400 - margin.top - margin.bottom;

//   // Append the svg object to the body of the page
//   var svg = d3.select("#Linegraph-VO2-VCO2")
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
//   var x = d3.scaleLinear()
//     .domain(0, d3.max(formattedData, function(d) { return d.time; }))
//     .range([0, width])
//   svg.append("g")
//     .attr("transform", "translate(0," + height + ")")
//     .call(d3.axisBottom(x).ticks(5));
//        // var hours = Math.floor(d / 60);
//        // var minutes = d % 60;
//        // return hours + ":" + (minutes < 10 ? "0" : "") + minutes;
//   //  }));

//   // Add Y axis for VO2 and VCO2 on the left with a fixed range from 0 to 3200
//   var yLeft = d3.scaleLinear()
//     .domain([0, 3200])
//     .range([height, 0]);
//   svg.append("g")
//     .call(d3.axisLeft(yLeft));

  
// // draw the smooth line for VO2 
//   svg.append("path")
//     .datum(formattedData)
//     .attr("fill", "none")
//     .attr("stroke", "red")
//     .attr("stroke-width", 1.5)
//     .attr("d", d3.line()
//       .x(function(d) { return x(d.time); })
//       .y(function(d) { return yLeft(d.VO2); })
//       .curve(d3.curveMonotoneX) // Apply smoothing
//     );

//   // draw the smooth line for VCO2
//   svg.append("path")
//     .datum(formattedData)
//     .attr("fill", "none")
//     .attr("stroke", "blue")
//     .attr("stroke-width", 1.5)
//     .attr("d", d3.line()
//       .x(function(d) { return x(d.time); })
//       .y(function(d) { return yLeft(d.VCO2); })
//       .curve(d3.curveMonotoneX) // Apply smoothing
//     );

//   // Add the points for VO2
//   svg.selectAll(".dotVO2")
//     .data(formattedData)
//     .enter()
//     .append("circle")
//       .attr("class", "dotVO2")
//       .attr("cx", function(d) { return x(d.time); })
//       .attr("cy", function(d) { return yLeft(d.VO2); })
//       .attr("r", 3)
//       .attr("fill", "red");

//   // Add the points for VCO2
//   svg.selectAll(".dotVCO2")
//     .data(formattedData)
//     .enter()
//     .append("circle")
//       .attr("class", "dotVCO2")
//       .attr("cx", function(d) { return x(d.time); })
//       .attr("cy", function(d) { return yLeft(d.VCO2); })
//       .attr("r", 3)
//       .attr("fill", "blue");
// }


async function fetchDataEveryMinute(callback) {
  fetchData(function(allData) {
      // Convert time to minutes and extract HR, Power, VO2, and VCO2
      const formattedData = allData
          .filter(d => d.t) // Filter out rows where t is undefined
          .map(d => {
              const [hours, minutes] = d.t.split(":").map(Number);
              const timeInMinutes = hours * 60 + minutes;
              return { time: timeInMinutes, 
                        HR: d.HR, 
                        Power: d.Power, 
                        VO2: d.VO2, 
                        VCO2: d.VCO2 };
          });

      // Extract first and last data points by time
      const firstDataPoint = formattedData[2]; // Third row (index 2)
      const lastDataPoint = formattedData[formattedData.length - 1]; // Last row

      // Filter data points for every whole minute
      let filteredData = formattedData.filter(d => d.time % 60 === 0);

      // Add the first and last data points to the filtered data
      filteredData = [firstDataPoint, ...filteredData, lastDataPoint];

      // Call the callback function with the filtered data and all data
      callback(filteredData, allData);
  });
}


function lineGraphPowerHR(data) {
  // Check if data is undefined
  if (!data) {
      console.error('Data is undefined:', data);
      return;
  }

  // Set the dimensions and margins of the graph
  var margin = {top: 10, right: 60, bottom: 30, left: 60},
      width = 900 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;

  // Append the svg object to the body of the page
  var svg = d3.select("#linegraph-HR-Power")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Calculate the maximum values for HR, Power, and time
  var maxHR = d3.max(data, function(d) { return d.HR; });
  var maxPower = d3.max(data, function(d) { return d.Power; });
  var maxTime = d3.max(data, function(d) { return d.time; });

  // Add X axis for time values
  var x = d3.scaleLinear()
  .domain([0, maxTime])
  .range([0, width]);

  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x)
      .tickValues(d3.range(0, maxTime + 1, 60)) // Set tick values every 60 minutes
      .tickFormat(function(d) {
        var hours = Math.floor(d / 60);
        var minutes = d % 60;
        return hours + ":" + (minutes < 10 ? "0" : "") + minutes;
      })
    );

  // Add Y axis for HR on the left with a range from 0 to maxHR
  var yLeft = d3.scaleLinear()
    .domain([0, maxHR])
    .range([height, 0]);
  svg.append("g")
    .call(d3.axisLeft(yLeft));

  // Add Y axis for Power on the right with a range from 0 to maxPower
  var yRight = d3.scaleLinear()
    .domain([0, maxPower])
    .range([height, 0]);
  svg.append("g")
    .attr("transform", "translate(" + width + " ,0)")   
    .call(d3.axisRight(yRight));

  

  // Draw the smooth line for HR
  svg.append("path")
    .datum(data)
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
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "blue")
    .attr("stroke-width", 1.5)
    .attr("d", d3.line()
      .x(function(d) { return x(d.time); })
      .y(function(d) { return yRight(d.Power); })
      .curve(d3.curveMonotoneX) // Apply smoothing
    );

  // Add the points for HR
  svg.selectAll(".dotHR")
    .data(data)
    .enter()
    .append("circle")
      .attr("class", "dotHR")
      .attr("cx", function(d) { return x(d.time); })
      .attr("cy", function(d) { return yLeft(d.HR); })
      .attr("r", 3)
      .attr("fill", "red");

  // Add the points for Power
  svg.selectAll(".dotPower")
    .data(data)
    .enter()
    .append("circle")
      .attr("class", "dotPower")
      .attr("cx", function(d) { return x(d.time); })
      .attr("cy", function(d) { return yRight(d.Power); })
      .attr("r", 3)
      .attr("fill", "blue");

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
fetchDataEveryMinute(lineGraphPowerHR);


function barchartVO2VCO2(data) {
  // Check if data is undefined
  if (!data) {
      console.error('Data is undefined:', data);
      return;
  }

  // Set the dimensions and margins of the graph
  const margin = { top: 10, right: 30, bottom: 30, left: 60 },
        width = 800 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

  // Remove any existing SVG elements in the container
  d3.select("#barchart-VO2-VCO2").selectAll("*").remove();

  // Append the svg object to the body of the page
  const svg = d3.select("#barchart-VO2-VCO2")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  // Convert time to minutes and extract VO2 and VCO2
  const formattedData = data
      .filter(d => d.time !== undefined && d.VO2 !== undefined && d.VCO2 !== undefined) // Filter out rows where time, VO2, or VCO2 is undefined
      .map(d => ({
          time: d.time,
          VO2: d.VO2,
          VCO2: d.VCO2
      }));

  // Log the formatted data to the console
  console.log('Formatted Data:', formattedData);

  // Add X axis
  const x = d3.scaleBand()
      .domain(formattedData.map(d => d.time))
      .range([0, width])
      .padding(0.1);
  svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d => {
          const hours = Math.floor(d / 60);
          const minutes = d % 60;
          return `${hours}:${minutes < 10 ? "0" : ""}${minutes}`;
      }));

  // Add Y axis for VO2 and VCO2 on the left with a fixed range from 0 to 3200
  const yLeft = d3.scaleLinear()
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
      .attr("x", d => x(d.time))
      .attr("y", d => yLeft(d.VO2))
      .attr("width", x.bandwidth() / 2)
      .attr("height", d => height - yLeft(d.VO2))
      .attr("fill", "blue");

  // Add bars for VCO2
  svg.selectAll(".barVCO2")
      .data(formattedData)
      .enter()
      .append("rect")
      .attr("class", "barVCO2")
      .attr("x", d => x(d.time) + x.bandwidth() / 2)
      .attr("y", d => yLeft(d.VCO2))
      .attr("width", x.bandwidth() / 2)
      .attr("height", d => height - yLeft(d.VCO2))
      .attr("fill", "grey");
}

// Fetch data and create the bar chart
fetchDataEveryMinute(barchartVO2VCO2);


//bar chart --- ALL DATA POINTS
// fetchData(barchartVO2VCO2);