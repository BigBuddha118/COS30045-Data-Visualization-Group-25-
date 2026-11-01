
/*
=========================================
HOSPITALISATIONS DATA VISUALISATION
=========================================
Data sources:
1. National hospitalisations
2. State and territory hospitalisations
3. Road user hospitalisations
4. First Nations hospitalisations

Charts created using D3.js v7.
=========================================
*/

(async function () {

    // =========================================
    // 1. LOAD DATA
    // =========================================

    const load = (file) => {
        return d3.csv("data/" + file, d3.autoType);
    };

    const [national, states, users, first] = await Promise.all([
        load("hospitalisations_national_year.csv"),
        load("hospitalisations_state_year.csv"),
        load("hospitalisations_road_user_year.csv"),
        load("hospitalisations_first_nations_year.csv")
    ]);


    // =========================================
    // 2. REUSABLE LINE CHART FUNCTION
    // =========================================

    const drawLine = (
        target,
        data,
        key,
        label,
        color = COLORS.teal
    ) => {

        const host = d3.select(target);

        host.selectAll("*").remove();

        if (!data.length) {
            host.text("No data available for this selection.");
            return;
        }

        // Create chart area
        const c = createChart(target, {
            height: 390,
            margin: {
                top: 28,
                right: 28,
                bottom: 62,
                left: 90
            }
        });

        // X-axis scale
        const x = d3.scaleLinear()
            .domain(d3.extent(data, d => d.year))
            .range([0, c.innerWidth]);

        // Y-axis scale
        const y = d3.scaleLinear()
            .domain([
                0,
                d3.max(data, d => d[key]) * 1.12
            ])
            .nice()
            .range([c.innerHeight, 0]);

        // Gridlines
        c.inner.append("g")
            .attr("class", "gridline")
            .call(
                d3.axisLeft(y)
                    .tickSize(-c.innerWidth)
                    .tickFormat("")
            );

        // X-axis
        c.inner.append("g")
            .attr("class", "axis")
            .attr(
                "transform",
                `translate(0,${c.innerHeight})`
            )
            .call(
                d3.axisBottom(x)
                    .tickFormat(d3.format("d"))
                    .ticks(7)
            );

        // Y-axis
        c.inner.append("g")
            .attr("class", "axis")
            .call(
                d3.axisLeft(y)
                    .ticks(5)
                    .tickFormat(d3.format("~s"))
            );

        // Axis labels
        addAxisLabels(
            c,
            "Year",
            "Hospitalisations"
        );

        // Draw line
        const line = d3.line()
            .x(d => x(d.year))
            .y(d => y(d[key]));

        c.inner.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("stroke", color)
            .attr("d", line);

        // Draw data points
        c.inner.selectAll(".dot")
            .data(data)
            .join("circle")
            .attr("class", "dot")
            .attr("cx", d => x(d.year))
            .attr("cy", d => y(d[key]))
            .attr("r", 5)
            .on("mouseover", (event, d) => {

                showTooltip(
                    event,
                    `<strong>${label} — ${d.year}</strong>
                     <span class="tt-value">
                         ${formatInt(d[key])} hospitalisations
                     </span>`
                );

            })
            .on("mousemove", moveTooltip)
            .on("mouseout", hideTooltip);

    };


    // =========================================
    // 3. NATIONAL HOSPITALISATION TREND
    // =========================================

    drawLine(
        "#hospital-national",
        national,
        "hospitalisations",
        "Australia"
    );


    // =========================================
    // 4. STATE AND TERRITORY COMPARISON
    // =========================================

    // Create state filter buttons
    const stateOptions = STATES.map(id => {
        return {
            id: id,
            label: id
        };
    });

    createFilterButtons(
        "#hospital-state-filters",
        stateOptions,
        "NSW",
        id => {

            const filteredData = states.filter(
                d => d.state === id
            );

            drawLine(
                "#hospital-state",
                filteredData,
                "hospitalisations",
                STATE_NAMES[id]
            );

        }
    );

    // Default state: New South Wales
    drawLine(
        "#hospital-state",
        states.filter(d => d.state === "NSW"),
        "hospitalisations",
        "New South Wales"
    );


    // =========================================
    // 5. ROAD USER HOSPITALISATIONS
    // =========================================

    const years = [
        2011,
        2015,
        2019,
        2020,
        2021
    ];

    function drawUsers(year) {

        // Filter dataset by year
        const data = users
            .filter(d => d.year === year)
            .sort(
                (a, b) =>
                    b.hospitalisations - a.hospitalisations
            );

        const host = d3.select("#hospital-users");

        host.selectAll("*").remove();

        // Create chart
        const c = createChart("#hospital-users", {
            height: 540,
            margin: {
                top: 20,
                right: 48,
                bottom: 55,
                left: 255
            }
        });

        // Y-axis scale
        const y = d3.scaleBand()
            .domain(data.map(d => d.road_user))
            .range([0, c.innerHeight])
            .padding(0.2);

        // X-axis scale
        const x = d3.scaleLinear()
            .domain([
                0,
                d3.max(
                    data,
                    d => d.hospitalisations
                ) * 1.12
            ])
            .range([0, c.innerWidth]);

        // Y-axis
        c.inner.append("g")
            .attr("class", "axis")
            .call(
                d3.axisLeft(y)
                    .tickSize(0)
            );

        // X-axis
        c.inner.append("g")
            .attr("class", "axis")
            .attr(
                "transform",
                `translate(0,${c.innerHeight})`
            )
            .call(
                d3.axisBottom(x)
                    .ticks(5)
                    .tickFormat(d3.format("~s"))
            );

        // Draw bars
        c.inner.selectAll(".bar")
            .data(data)
            .join("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("y", d => y(d.road_user))
            .attr(
                "width",
                d => x(d.hospitalisations)
            )
            .attr("height", y.bandwidth())
            .on("mouseover", (event, d) => {

                showTooltip(
                    event,
                    `<strong>${d.road_user} — ${year}</strong>
                     <span class="tt-value">
                         ${formatInt(d.hospitalisations)}
                     </span>`
                );

            })
            .on("mousemove", moveTooltip)
            .on("mouseout", hideTooltip);

        // Axis labels
        addAxisLabels(
            c,
            "Hospitalisations",
            ""
        );

    }

    // Create year filter buttons
    const yearOptions = years.map(year => {
        return {
            id: String(year),
            label: String(year)
        };
    });

    createFilterButtons(
        "#hospital-user-filters",
        yearOptions,
        "2021",
        id => {
            drawUsers(Number(id));
        }
    );

    // Default year
    drawUsers(2021);


    // =========================================
    // 6. FIRST NATIONS HOSPITALISATIONS
    // =========================================

    const populations = [
        {
            id: "first_nations",
            label: "First Nations peoples"
        },
        {
            id: "non_indigenous",
            label: "Non-Indigenous Australians"
        }
    ];

    // Function to display selected population
    const plotFirst = (key) => {

        const selectedPopulation = populations.find(
            d => d.id === key
        );

        drawLine(
            "#hospital-first",
            first,
            key,
            selectedPopulation.label
        );

    };

    // Create population filter buttons
    createFilterButtons(
        "#hospital-first-filters",
        populations,
        "first_nations",
        plotFirst
    );

    // Default population
    plotFirst("first_nations");


})().catch(error => {

    // =========================================
    // 7. ERROR HANDLING
    // =========================================

    console.error(
        "Could not load hospitalisation data",
        error
    );

    const chartIds = [
        "hospital-national",
        "hospital-state",
        "hospital-users",
        "hospital-first"
    ];

    chartIds.forEach(id => {

        d3.select("#" + id)
            .text(
                "Unable to load chart data. " +
                "Open the site using a local web server " +
                "and check the CSV paths."
            );

    });

});
