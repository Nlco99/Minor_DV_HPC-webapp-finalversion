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
    
            let maxLactaat = 0, maxVO2 = 0, maxVCO2 = 0, maxHR = 0, maxPower = 0, maxRf = 0, maxVT = 0;
    
            rows.forEach(row => {
                const lactaat = parseFloat(row[9].replace(',', '.'));
                const vo2 = parseFloat(row[4].replace(',', '.'));
                const vco2 = parseFloat(row[5].replace(',', '.'));
                const hr = parseFloat(row[7].replace(',', '.'));
                const power = parseFloat(row[8].replace(',', '.'));
                const rf = parseFloat(row[1].replace(',', '.'));
                const vt = parseFloat(row[2].replace(',', '.'));
    
                if (lactaat > maxLactaat) maxLactaat = lactaat;
                if (vo2 > maxVO2) maxVO2 = vo2;
                if (vco2 > maxVCO2) maxVCO2 = vco2;
                if (hr > maxHR) maxHR = hr;
                if (power > maxPower) maxPower = power;
                if (rf > maxRf) maxRf = rf;
                if (vt > maxVT) maxVT = vt;
            });
    
            console.log('Max Values:', { maxLactaat, maxVO2, maxVCO2, maxHR, maxPower, maxRf, maxVT }); // Debugging line
    
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
                VCO2: convertAndRound(row.VCO2),
                Rf: convertAndRound(row.Rf),
                VT: convertAndRound(row.VT)
            })).filter(row => 
              !isNaN(row.HR) && 
              !isNaN(row.Power) && 
              !isNaN(row.VO2) && 
              !isNaN(row.VCO2)&&
              !isNaN(row.Rf) &&
              !isNaN(row.VT)) ;

            // Call the callback function with the data
            callback(allData);
        }
    });
}

// function calculatePrestatiezones(data) {
//     const prestatiezones = {
//         "ERG LICHT": { start: null, end: null },
//         "LICHT": { start: null, end: null },
//         "MATIG": { start: null, end: null },
//         "ZWAAR": { start: null, end: null },
//         "MAX": { start: null, end: null }
//     };

//     data.forEach((d, i) => {
//         const lactate = d.Lactate;
//         const time = d.t;

//         if (lactate < 1.5) {
//             if (!prestatiezones["ERG LICHT"].start) prestatiezones["ERG LICHT"].start = time;
//             prestatiezones["ERG LICHT"].end = time;
//         } else if (lactate >= 1.5 && lactate < 2) {
//             if (!prestatiezones["LICHT"].start) prestatiezones["LICHT"].start = time;
//             prestatiezones["LICHT"].end = time;
//         } else if (lactate >= 2 && lactate < 3) {
//             if (!prestatiezones["MATIG"].start) prestatiezones["MATIG"].start = time;
//             prestatiezones["MATIG"].end = time;
//         } else if (lactate >= 3 && lactate < 6) {
//             if (!prestatiezones["ZWAAR"].start) prestatiezones["ZWAAR"].start = time;
//             prestatiezones["ZWAAR"].end = time;
//         } else if (lactate >= 6) {
//             if (!prestatiezones["MAX"].start) prestatiezones["MAX"].start = time;
//             prestatiezones["MAX"].end = time;
//         }
//     });

//     console.log("Prestatiezones:", prestatiezones);
// }
// fetchData(calculatePrestatiezones);

function addPrestatiezones(svg, x, height) {
    // Define prestatiezones
    const prestatiezones = {
        "ERG LICHT": { start: 0, end: 235, color: "#60FD78", label: "ERG LICHT La <1.5" },
        "LICHT": { start: 235, end: 635, color: "#FCE65C", label: "LICHT La 1.5-2" },
        "MATIG": { start: 635, end: 815, color: "#FFA743", label: "MATIG La 2-3" },
        "ZWAAR": { start: 815, end: 1190, color: "#5978FF", label: "ZWAAR La 3-6" },
        "MAX": { start: 1190, end: 1505, color: "#F26DFF", label: "MAX La >6" }
    };

    // Add dotted lines and labels for prestatiezones
    Object.keys(prestatiezones).forEach(zone => {
        const { start, end, color, label } = prestatiezones[zone];

        // Add start line
        svg.append("line")
            .attr("x1", x(start))
            .attr("y1", 0)
            .attr("x2", x(start))
            .attr("y2", height)
            .attr("stroke", "grey")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "4");

        // Add end line
        svg.append("line")
            .attr("x1", x(end))
            .attr("y1", 0)
            .attr("x2", x(end))
            .attr("y2", height)
            .attr("stroke", "grey")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "4");

        // Add background rectangle for label
        svg.append("rect")
            .attr("x", (x(start) + x(end)) / 2 - 50) // Adjust width as needed
            .attr("y", -40) // Adjust height as needed
            .attr("width", 100) // Adjust width as needed
            .attr("height", 20) // Adjust height as needed
            .attr("fill", color)
            .attr("opacity", 0.7);

        // Add label
        svg.append("text")
            .attr("x", (x(start) + x(end)) / 2)
            .attr("y", -23)
            .attr("text-anchor", "middle")
            .style("font-size", "11px")
            .style("font-weight", "bold")
            .style("fill", "black")
            .text(label);
    });
}

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
                        VCO2: d.VCO2,
                        Rf: d.Rf,
                        VT: d.VT};
          });

      // Extract first and last data points by time
      const firstDataPoint = formattedData[2]; // Third row (index 2)
      const lastDataPoint = formattedData[formattedData.length - 1]; // Last row

      // Filter data points for every whole minute
      let filteredData = formattedData.filter(d => d.time % 60 === 0);

      // Add the first and last data points to the filtered data
      filteredData = [firstDataPoint, ...filteredData, lastDataPoint];

      console.log('Filtered Data:', filteredData); // Debugging line

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
    var margin = {top: 35, right: 62, bottom: 30, left: 60},
        width = 915 - margin.left - margin.right,
        height = 370 - margin.top - margin.bottom;

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
        .attr("stroke", "#fb2618")
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
        .attr("stroke", "#2f79ce")
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
        .attr("fill", "#fb2618");

    // Add the points for Power
    svg.selectAll(".dotPower")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "dotPower")
        .attr("cx", function(d) { return x(d.time); })
        .attr("cy", function(d) { return yRight(d.Power); })
        .attr("r", 3)
        .attr("fill", "#2f79ce");

    //--------------------------------------- 
    // Call the addPrestatiezones function
    addPrestatiezones(svg, x, height); 
        
    //---------------------------------------
    // Add legend
    svg.append("circle").attr("cx", width - 760).attr("cy", 20).attr("r", 6).style("fill", "#fb2618");
    svg.append("circle").attr("cx", width - 760).attr("cy", 50).attr("r", 6).style("fill", "#2f79ce");
    svg.append("text").attr("x", width - 740).attr("y", 20).text("HR").style("font-size", "15px").attr("alignment-baseline", "middle");
    svg.append("text").attr("x", width - 740).attr("y", 50).text("Power").style("font-size", "15px").attr("alignment-baseline", "middle");

    // Add Y axis label at the top left of the x-axis
    svg.append("text")
        .attr("x", -60)
        .attr("y", -margin.top / 2)
        .style("text-anchor", "start")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .style("fill", "black")
        .text("HR(bpm)");

    // Add Y axis label at the top right of the x-axis
    svg.append("text")
        .attr("x", 800)
        .attr("y", -margin.top / 2)
        .style("text-anchor", "start")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .style("fill", "black")
        .text("Power(W)");

    // Add X axis label at the bottom right of the x-axis
    svg.append("text")
        .attr("x", width)
        .attr("y", height + margin.bottom - 1)
        .style("text-anchor", "end")
        .style("font-size", "12px")        
        .style("font-weight", "bold")
        .text("Tijd (min)");

  // // This allows to find the closest X index of the mouse:
  // var bisect = d3.bisector(function(d) { return d.time; }).left;

  // // Create the circle that travels along the curve of chart
  // var focus = svg
  //     .append('g')
  //     .append('circle')
  //     .style("fill", "none")
  //     .attr("stroke", "black")
  //     .attr('r', 8.5)
  //     .style("opacity", 0);

  // // Create the rectangle that travels along the curve of chart
  // var focusRect = svg
  //     .append('g')
  //     .append('rect')
  //     .style("fill", "white")
  //     .style("stroke", "black")
  //     .attr('width', 120)
  //     .attr('height', 50)
  //     .style("opacity", 0);

  // // Create the text that travels along the curve of chart
  // var focusText = svg
  //     .append('g')
  //     .append('text')
  //     .style("opacity", 0)
  //     .attr("text-anchor", "left")
  //     .attr("alignment-baseline", "middle");

  // // Create a rect on top of the svg area: this rectangle recovers mouse position
  // svg.append('rect')
  //     .style("fill", "none")
  //     .style("pointer-events", "all")
  //     .attr('width', width)
  //     .attr('height', height)
  //     .on('mouseover', mouseover)
  //     .on('mousemove', mousemove)
  //     .on('mouseout', mouseout);

  // // What happens when the mouse move -> show the annotations at the right positions.
  // function mouseover() {
  //     focus.style("opacity", 1);
  //     focusRect.style("opacity", 1);
  //     focusText.style("opacity", 1);
  // }

  // function mousemove() {
  //     // recover coordinate we need
  //     var x0 = x.invert(d3.mouse(this)[0]);
  //     var i = bisect(data, x0, 1);
  //     var selectedData = data[i];
  //     focus
  //         .attr("cx", x(selectedData.time))
  //         .attr("cy", yLeft(selectedData.HR));
  //     focusRect
  //         .attr("x", x(selectedData.time) + 10)
  //         .attr("y", yLeft(selectedData.HR) - 25);
  //     focusText
  //         .html("Time: " + selectedData.time + "\nHR: " + selectedData.HR + "\nPower: " + selectedData.Power)
  //         .attr("x", x(selectedData.time) + 15)
  //         .attr("y", yLeft(selectedData.HR) - 10);
  // }

  // function mouseout() {
  //     focus.style("opacity", 0);
  //     focusRect.style("opacity", 0);
  //     focusText.style("opacity", 0);
  // }
}
fetchDataEveryMinute(lineGraphPowerHR);

function lineGraphRfVT(data) {
    // Set the dimensions and margins of the graph
    const margin = { top: 19, right: 62, bottom: 30, left: 60 },
          width = 915 - margin.left - margin.right,
          height = 370 - margin.top - margin.bottom;
  
    // Remove any existing SVG elements in the container
    d3.select("#linegraph-Rf-VT")
  
    // Append the svg object to the body of the page
    const svg = d3.select("#linegraph-Rf-VT")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
  
    // Calculate the maximum values for VT, Rf, and time
    const maxVT = d3.max(data, d => d.VT);
    const maxRf = d3.max(data, d => d.Rf);
    const maxTime = d3.max(data, d => d.time);
  
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
  
    // Add Y axis for VT on the left with a range from 0 to maxVT
    const yLeft = d3.scaleLinear()
        .domain([0, maxVT])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(yLeft));
  
    // Add Y axis for Rf on the right with a range from 0 to maxRf
    const yRight = d3.scaleLinear()
        .domain([0, maxRf])
        .range([height, 0]);
    svg.append("g")
        .attr("transform", `translate(${width},0)`)
        .call(d3.axisRight(yRight));
  
    // Add the points for VT
    svg.selectAll(".dotVT")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "dotVT")
        .attr("cx", d => x(d.time))
        .attr("cy", d => yLeft(d.VT))
        .attr("r", 3)
        .attr("fill", "blue");
  
    // Draw the smooth line for VT
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "blue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(d => x(d.time))
            .y(d => yLeft(d.VT))
            .curve(d3.curveMonotoneX) // Apply smoothing
        );
        
    // Define the area for VT
    const areaVT = d3.area()
    .x(d => x(d.time))
    .y0(height)
    .y1(d => yLeft(d.VT))
    .curve(d3.curveMonotoneX); // Apply smoothing
  
    // Draw the area for VT
    svg.append("path")
    .datum(data)
    .attr("fill", "lightblue")
    .attr("opacity", 0.5)
    .attr("d", areaVT);
    
    //-------------Rf--------------
    // Draw the smooth line for Rf
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "green")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(d => x(d.time))
            .y(d => yRight(d.Rf))
            .curve(d3.curveMonotoneX) // Apply smoothing
        );
  
    // Add the points for Rf
    svg.selectAll(".dotRf")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "dotRf")
        .attr("cx", d => x(d.time))
        .attr("cy", d => yRight(d.Rf))
        .attr("r", 3)
        .attr("fill", "green");
  
      // Define the area for Rf
      const areaRf = d3.area()
          .x(d => x(d.time))
          .y0(height)
          .y1(d => yRight(d.Rf))
          .curve(d3.curveMonotoneX); // Apply smoothing
  
      // Draw the area for Rf
      svg.append("path")
          .datum(data)
          .attr("fill", "lightgreen")
          .attr("opacity", 0.5)
          .attr("d", areaRf);
  
      //----------------------------------------------------
      // Call the addPrestatiezones function
      addPrestatiezones(svg, x, height);
      //----------------------------------------------------
      // Add legend
      svg.append("circle").attr("cx", width - 760).attr("cy", 30).attr("r", 6).style("fill", "blue");
      svg.append("circle").attr("cx", width - 760).attr("cy", 60).attr("r", 6).style("fill", "green");
      svg.append("text").attr("x", width - 740).attr("y", 30).text("VT").style("font-size", "15px").attr("alignment-baseline", "middle");
      svg.append("text").attr("x", width - 740).attr("y", 60).text("Rf").style("font-size", "15px").attr("alignment-baseline", "middle");

    // Add Y axis label at the top left of the x-axis
    svg.append("text")
        .attr("x", -60)
        .attr("y", -margin.top / 2)
        .style("text-anchor", "start")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .style("fill", "black")
        .text("VT(L(btps))");

    // Add Y axis label at the top right of the x-axis
    svg.append("text")
        .attr("x", 800)
        .attr("y", -margin.top / 2)
        .style("text-anchor", "start")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .style("fill", "black")
        .text("Rf(1/min)");

    // Add X axis label at the bottom right of the x-axis
    svg.append("text")
        .attr("x", width)
        .attr("y", height + margin.bottom - 1)
        .style("text-anchor", "end")
        .style("font-size", "12px")        
        .style("font-weight", "bold")
        .text("Tijd (min)");
  }
  fetchDataEveryMinute(lineGraphRfVT);

function barchartVO2VCO2(data) {
    // Set the dimensions and margins of the graph
    const margin = { top: 10, right: 30, bottom: 40, left: 60 },
            width = 900 - margin.left - margin.right,
            height = 380 - margin.top - margin.bottom;

    // Remove any existing SVG elements in the container
    d3.select("#barchart-VO2-VCO2")

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

    // Calculate the maximum value for VO2 and VCO2
    const maxYValue = d3.max(formattedData, d => Math.max(d.VO2, d.VCO2));

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

    // Add Y axis for VO2 and VCO2 on the left 
    const yLeft = d3.scaleLinear()
        .domain([0, maxYValue])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(yLeft));

    // Add horizontal grid lines
    svg.append("g")
        .attr("class", "grid")
        .attr("stroke-dasharray", "4")
        .attr("stroke", "grey")
        .call(d3.axisLeft(yLeft)
            .tickSize(-width)
            .tickFormat("")
        );

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
      .attr("fill", "#408ce3");

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
      .attr("fill", "#fe8d09");

    //---------------------------------------
    // // Call the addPrestatiezones function
    // addPrestatiezones(svg, x, height);

    //---------------------------------------------------


     // Add legend
     svg.append("circle").attr("cx", width - 780).attr("cy", 20).attr("r", 6).style("fill", "#408ce3");
     svg.append("circle").attr("cx", width - 780).attr("cy", 50).attr("r", 6).style("fill", "#fe8d09");
     svg.append("text").attr("x", width - 760).attr("y", 20).text("VO2").style("font-size", "15px").attr("alignment-baseline", "middle");
     svg.append("text").attr("x", width - 760).attr("y", 50).text("VCO2").style("font-size", "15px").attr("alignment-baseline", "middle");

    // Add Y axis label at the top left of the x-axis
    svg.append("text")
        .attr("x", -60)
        .attr("y", 0)
        .style("text-anchor", "start")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .style("font-color", "grey")
        .text("VO2/VCO2");

     svg.append("text")
        .attr("x", -60)
        .attr("y", 17)
        .style("text-anchor", "start")
        .style("font-size", "12px")
        .text("(mL/min)");
  

    // Add X axis label at the bottom right of the x-axis
    svg.append("text")
        .attr("x", 782)
        .attr("y", height + margin.bottom - 0)
        .style("text-anchor", "end")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text("Tijd(min)");
  //stacked bar chart
    // // Add bars for VO2 and VCO2
    // svg.selectAll(".bar")
    //     .data(formattedData)
    //     .enter()
    //     .append("g")
    //     .attr("class", "bar")
    //     .attr("transform", d => `translate(${x(d.time)},0)`)
    //     .each(function(d) {
    //         d3.select(this)
    //             .append("rect")
    //             .attr("class", "barVO2")
    //             .attr("x", 0)
    //             .attr("y", yLeft(d.VO2))
    //             .attr("width", x.bandwidth())
    //             .attr("height", height - yLeft(d.VO2))
    //             .attr("fill", "blue")
    //             .attr("opacity", 0.7);

    //         d3.select(this)
    //             .append("rect")
    //             .attr("class", "barVCO2")
    //             .attr("x", 0)
    //             .attr("y", yLeft(d.VO2 + d.VCO2))
    //             .attr("width", x.bandwidth())
    //             .attr("height", height - yLeft(d.VCO2))
    //             .attr("fill", "grey")
    //             .attr("opacity", 0.7);
    //     });
}
fetchDataEveryMinute(barchartVO2VCO2);
//bar chart --- ALL DATA POINTS
// fetchData(barchartVO2VCO2);

