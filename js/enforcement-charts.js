
/*
=========================================
ROAD ENFORCEMENT VISUALISATIONS
=========================================

Alcohol and Drugs:
1. Breath testing trends
2. Positive breath test scatter plot
3. Drug-type chart information

Fines:
4. Fines donut chart
5. Mobile phone fines by state
6. Age-group chart information

Uses D3.js v7 and shared.js.
=========================================
*/


(async function () {

    // =========================================
    // 1. IDENTIFY CURRENT PAGE
    // =========================================

    const currentPage = window.location.pathname
        .toLowerCase();

    const isAlcohol = currentPage.includes(
        "alcohol-drugs.html"
    );

    const isFines = currentPage.includes(
        "fines.html"
    );

    // Stop if this script is on another page.
    if (!isAlcohol && !isFines) {
        return;
    }


    // =========================================
    // 2. COMMON HELPER FUNCTIONS
    // =========================================

    const isValid = value => {

        return Number.isFinite(value);

    };

    const formatNumber = d3.format(",");


    // =========================================
    // 3. REUSABLE LINE CHART
    // =========================================

    function drawLineChart(
        target,
        data,
        xKey,
        yKey,
        title
    ) {

        const container = d3.select(target);

        // Clear previous chart.
        container.selectAll("*").remove();

        // Remove missing values and sort by year.
        const validData = data
            .filter(d =>
                isValid(d[xKey]) &&
                isValid(d[yKey])
            )
            .sort(
                (a, b) => a[xKey] - b[xKey]
            );

        if (validData.length === 0) {

            container.text(
                "No reported data available."
            );

            return;
        }

        // Create SVG chart.
        const chart = createChart(target, {

            height: 420,

            margin: {
                top: 35,
                right: 35,
                bottom: 65,
                left: 90
            }

        });

        // X-axis scale.
        const xScale = d3.scaleLinear()
            .domain(
                d3.extent(
                    validData,
                    d => d[xKey]
                )
            )
            .range([
                0,
                chart.innerWidth
            ]);

        // Y-axis scale.
        const yScale = d3.scaleLinear()
            .domain([
                0,
                d3.max(
                    validData,
                    d => d[yKey]
                ) * 1.1
            ])
            .nice()
            .range([
                chart.innerHeight,
                0
            ]);

        // Horizontal gridlines.
        chart.inner.append("g")
            .attr("class", "gridline")
            .call(
                d3.axisLeft(yScale)
                    .tickSize(
                        -chart.innerWidth
                    )
                    .tickFormat("")
            );

        // X-axis.
        chart.inner.append("g")
            .attr("class", "axis")
            .attr(
                "transform",
                `translate(0,${chart.innerHeight})`
            )
            .call(
                d3.axisBottom(xScale)
                    .ticks(7)
                    .tickFormat(
                        d3.format("d")
                    )
            );

        // Y-axis.
        chart.inner.append("g")
            .attr("class", "axis")
            .call(
                d3.axisLeft(yScale)
                    .ticks(5)
                    .tickFormat(
                        d3.format("~s")
                    )
            );

        // Axis labels.
        addAxisLabels(
            chart,
            "Year",
            title
        );

        // Line generator.
        const lineGenerator = d3.line()
            .x(
                d => xScale(d[xKey])
            )
            .y(
                d => yScale(d[yKey])
            );

        // Draw line.
        chart.inner.append("path")
            .datum(validData)
            .attr("class", "line")
            .attr("d", lineGenerator);

        // Draw interactive dots.
        chart.inner.selectAll(".dot")
            .data(validData)
            .join("circle")
            .attr("class", "dot")
            .attr(
                "cx",
                d => xScale(d[xKey])
            )
            .attr(
                "cy",
                d => yScale(d[yKey])
            )
            .attr("r", 5)
            .on("mouseover", (event, d) => {

                showTooltip(
                    event,
                    `<strong>${title} — ${d[xKey]}</strong>
                     <span class="tt-value">
                        ${formatNumber(d[yKey])}
                     </span>`
                );

            })
            .on("mousemove", moveTooltip)
            .on("mouseout", hideTooltip);

    }


    // =========================================
    // 4. ALCOHOL AND DRUGS PAGE
    // =========================================

    if (isAlcohol) {

        // =========================================
        // 4.1 LOAD ENFORCEMENT DATA
        // =========================================

        const enforcementData = await d3.csv(
            "data/enforcement_state_year.csv",
            d3.autoType
        );

        console.log(
            "Enforcement data loaded:",
            enforcementData.length
        );


        // =========================================
        // 4.2 BREATH TESTING LINE CHART
        // =========================================

        function drawBreathTests(stateId) {

            let records = [];

            // Show all states combined.
            if (stateId === "ALL") {

                const groupedData = d3.rollups(

                    enforcementData,

                    rows => {

                        const reported = rows.filter(
                            d => isValid(
                                d.breath_tests_conducted
                            )
                        );

                        if (reported.length === 0) {
                            return null;
                        }

                        return d3.sum(
                            reported,
                            d => d.breath_tests_conducted
                        );

                    },

                    d => d.YEAR

                );

                records = groupedData
                    .map(
                        ([YEAR, total]) => ({
                            YEAR: YEAR,
                            breath_tests_conducted: total
                        })
                    );

            } else {

                // Show selected state.
                records = enforcementData.filter(
                    d => d.JURISDICTION === stateId
                );

            }

            // Draw line chart.
            drawLineChart(
                "#tests-line",
                records,
                "YEAR",
                "breath_tests_conducted",
                "Breath tests conducted"
            );

        }


        // =========================================
        // 4.3 STATE FILTER BUTTONS
        // =========================================

        const breathOptions = [

            {
                id: "ALL",
                label: "All Australia"
            },

            ...STATES.map(id => ({
                id: id,
                label: id
            }))

        ];

        createFilterButtons(
            "#tests-filters",
            breathOptions,
            "ALL",
            drawBreathTests
        );

        // Display national chart by default.
        drawBreathTests("ALL");


        // =========================================
        // 4.4 POSITIVE BREATH TEST SCATTER PLOT
        // =========================================

        const scatterData = enforcementData.filter(
            d =>
                isValid(d.breath_tests_conducted) &&
                d.breath_tests_conducted > 0 &&
                isValid(d.breath_rate_pct)
        );

        const scatterContainer = d3.select(
            "#rate-scatter"
        );

        scatterContainer.selectAll("*").remove();

        if (scatterData.length > 0) {

            // Create chart.
            const chart = createChart(
                "#rate-scatter",
                {

                    height: 480,

                    margin: {
                        top: 35,
                        right: 40,
                        bottom: 75,
                        left: 100
                    }

                }
            );

            // X-axis logarithmic scale.
            const xScale = d3.scaleLog()
                .domain([
                    d3.min(
                        scatterData,
                        d => d.breath_tests_conducted
                    ) * 0.8,

                    d3.max(
                        scatterData,
                        d => d.breath_tests_conducted
                    ) * 1.15
                ])
                .range([
                    0,
                    chart.innerWidth
                ]);

            // Y-axis percentage scale.
            const yScale = d3.scaleLinear()
                .domain([
                    0,

                    d3.max(
                        scatterData,
                        d => d.breath_rate_pct
                    ) * 1.05
                ])
                .nice()
                .range([
                    chart.innerHeight,
                    0
                ]);

            // Horizontal gridlines.
            chart.inner.append("g")
                .attr("class", "gridline")
                .call(
                    d3.axisLeft(yScale)
                        .tickSize(
                            -chart.innerWidth
                        )
                        .tickFormat("")
                );

            // X-axis.
            chart.inner.append("g")
                .attr("class", "axis")
                .attr(
                    "transform",
                    `translate(0,${chart.innerHeight})`
                )
                .call(
                    d3.axisBottom(xScale)
                        .ticks(5, "~s")
                );

            // Y-axis.
            chart.inner.append("g")
                .attr("class", "axis")
                .call(
                    d3.axisLeft(yScale)
                        .ticks(6)
                );

            // Axis labels.
            addAxisLabels(
                chart,
                "Breath tests conducted (log scale)",
                "Positive tests (%)"
            );

            // Draw scatter points.
            const dots = chart.inner
                .selectAll(".scatter-dot")
                .data(scatterData)
                .join("circle")
                .attr(
                    "class",
                    "scatter-dot"
                )
                .attr(
                    "cx",
                    d => xScale(
                        d.breath_tests_conducted
                    )
                )
                .attr(
                    "cy",
                    d => yScale(
                        d.breath_rate_pct
                    )
                )
                .attr("r", 5)
                .on("mouseover", (event, d) => {

                    showTooltip(
                        event,
                        `<strong>
                            ${STATE_NAMES[d.JURISDICTION]}
                            — ${d.YEAR}
                         </strong>
                         <span class="tt-value">
                            ${formatNumber(
                                d.breath_tests_conducted
                            )} tests
                         </span>
                         ${d.breath_rate_pct.toFixed(2)}%
                         positive`
                    );

                })
                .on("mousemove", moveTooltip)
                .on("mouseout", hideTooltip);


            // =========================================
            // 4.5 SCATTER STATE FILTERS
            // =========================================

            const scatterOptions = [

                {
                    id: "ALL",
                    label: "All"
                },

                ...STATES.map(id => ({
                    id: id,
                    label: id
                }))

            ];

            createFilterButtons(
                "#scatter-filters",
                scatterOptions,
                "ALL",

                stateId => {

                    dots.classed(
                        "selected",
                        d =>
                            stateId !== "ALL" &&
                            d.JURISDICTION === stateId
                    );

                    dots.classed(
                        "faded",
                        d =>
                            stateId !== "ALL" &&
                            d.JURISDICTION !== stateId
                    );

                }
            );

        } else {

            scatterContainer.text(
                "No positive breath test data available."
            );

        }


        // =========================================
        // 4.6 DRUG TYPE INFORMATION
        // =========================================

        // This chart requires a detailed drug-type
        // CSV prepared from the source workbook.

        d3.select("#drug-types")
            .html(
                `<p class="chart-note">
                    The drug-type visualisation requires
                    a prepared CSV from the detailed
                    positive-drug-test workbook.
                    The state-year summary CSV does not
                    include individual drug categories.
                </p>`
            );

    }


    // =========================================
    // 5. FINES PAGE
    // =========================================

    if (isFines) {

        // =========================================
        // 5.1 LOAD FINES DATA
        // =========================================

        const finesData = await d3.csv(
            "data/fines_state_year_offence.csv",
            d3.autoType
        );

        console.log(
            "Fines data loaded:",
            finesData.length
        );


        // =========================================
        // 5.2 PREPARE 2024 FINES DATA
        // =========================================

        const fines2024 = finesData
            .filter(
                d => d.YEAR === 2024
            )
            .map(d => ({

                ...d,

                count: d["Sum(FINES)"]

            }));


        // =========================================
        // 5.3 GROUP FINES BY OFFENCE
        // =========================================

        const categories = d3.rollups(

            fines2024,

            rows => d3.sum(
                rows,
                d => isValid(d.count) ? d.count : 0
            ),

            d => d.METRIC

        ).map(([id, count]) => ({

            id: id,

            name: OFFENCE_LABELS[id] || id,

            count: count

        }));

        // Use four required offence categories.
        const offenceOrder = [
            "speed_fines",
            "mobile_phone_use",
            "non_wearing_seatbelts",
            "unlicensed_driving"
        ];

        categories.sort(
            (a, b) =>
                offenceOrder.indexOf(a.id) -
                offenceOrder.indexOf(b.id)
        );


        // =========================================
        // 5.4 FINES DONUT CHART
        // =========================================

        const donutContainer = d3.select(
            "#fines-donut"
        );

        donutContainer.selectAll("*").remove();

        const totalFines = d3.sum(
            categories,
            d => d.count
        );

        // Create SVG.
        const svg = donutContainer
            .append("svg")
            .attr(
                "viewBox",
                "0 0 850 435"
            )
            .attr(
                "preserveAspectRatio",
                "xMidYMid meet"
            );

        // Position donut.
        const donutGroup = svg.append("g")
            .attr(
                "transform",
                "translate(270,210)"
            );

        // Donut arc generator.
        const arc = d3.arc()
            .innerRadius(100)
            .outerRadius(172);

        // Pie generator.
        const pie = d3.pie()
            .sort(null)
            .value(d => d.count);

        // Generate slices.
        const slices = pie(categories);

        // Chart colours.
        const donutColors = [
            COLORS.teal,
            COLORS.sky,
            COLORS.slate,
            COLORS.tealDark
        ];

        // Draw donut slices.
        donutGroup
            .selectAll(".donut-slice")
            .data(slices)
            .join("path")
            .attr(
                "class",
                "donut-slice"
            )
            .attr(
                "d",
                arc
            )
            .attr(
                "fill",
                (d, i) =>
                    donutColors[i % donutColors.length]
            )
            .on("mouseover", (event, d) => {

                const percentage =
                    totalFines > 0
                        ? d.data.count / totalFines * 100
                        : 0;

                showTooltip(
                    event,
                    `<strong>${d.data.name}</strong>
                     <span class="tt-value">
                        ${formatNumber(d.data.count)}
                        fines
                     </span>
                     ${percentage.toFixed(1)}%`
                );

            })
            .on("mousemove", moveTooltip)
            .on("mouseout", hideTooltip);


        // =========================================
        // 5.5 DONUT CENTRE LABEL
        // =========================================

        donutGroup.append("text")
            .attr(
                "class",
                "donut-total"
            )
            .attr("dy", "0")
            .text(
                d3.format(".3s")(totalFines)
            );

        donutGroup.append("text")
            .attr(
                "class",
                "donut-caption"
            )
            .attr("y", 24)
            .text("fines in 2024");


        // =========================================
        // 5.6 DONUT LEGEND
        // =========================================

        const legendRows = svg
            .selectAll(".legend-row")
            .data(categories)
            .join("g")
            .attr(
                "class",
                "legend-row"
            )
            .attr(
                "transform",
                (d, i) =>
                    `translate(485,${105 + i * 65})`
            );

        legendRows.each(function (d, i) {

            const row = d3.select(this);

            // Legend colour.
            row.append("rect")
                .attr("width", 18)
                .attr("height", 18)
                .attr(
                    "fill",
                    donutColors[i % donutColors.length]
                );

            // Offence name.
            row.append("text")
                .attr("x", 30)
                .attr("y", 14)
                .attr(
                    "class",
                    "legend-name"
                )
                .text(d.name);

            // Offence count.
            row.append("text")
                .attr("x", 30)
                .attr("y", 34)
                .attr(
                    "class",
                    "legend-value"
                )
                .text(
                    formatNumber(d.count)
                );

        });


        // =========================================
        // 5.7 MOBILE PHONE FINES BY STATE
        // =========================================

        const mobileContainer = d3.select(
            "#mobile-lines"
        );

        mobileContainer.selectAll("*").remove();

        // Create one chart for each state.
        for (const state of STATES) {

            // Create panel.
            const panel = mobileContainer
                .append("div")
                .attr(
                    "class",
                    "small-multiple"
                );

            // State name.
            panel.append("div")
                .style(
                    "font-weight",
                    "700"
                )
                .style(
                    "padding",
                    "5px"
                )
                .text(state);

            // Panel dimensions.
            const width = 280;

            const height = 180;

            const margin = {
                left: 46,
                right: 12,
                top: 15,
                bottom: 32
            };

            // Filter mobile phone fines.
            const mobileData = finesData
                .filter(
                    d =>
                        d.JURISDICTION === state &&
                        d.METRIC === "mobile_phone_use"
                )
                .map(d => ({

                    year: d.YEAR,

                    value: d["Sum(FINES)"]

                }))
                .sort(
                    (a, b) => a.year - b.year
                );

            // Create SVG.
            const panelSvg = panel
                .append("svg")
                .attr(
                    "viewBox",
                    `0 0 ${width} ${height}`
                );

            // X-axis scale.
            const xScale = d3.scaleLinear()
                .domain([
                    2008,
                    2024
                ])
                .range([
                    margin.left,
                    width - margin.right
                ]);

            // Y-axis scale.
            const yScale = d3.scaleLinear()
                .domain([
                    0,

                    d3.max(
                        mobileData.filter(
                            d => isValid(d.value)
                        ),
                        d => d.value
                    ) * 1.12 || 1
                ])
                .nice()
                .range([
                    height - margin.bottom,
                    margin.top
                ]);

            // X-axis.
            panelSvg.append("g")
                .attr(
                    "class",
                    "axis"
                )
                .attr(
                    "transform",
                    `translate(0,${height - margin.bottom})`
                )
                .call(
                    d3.axisBottom(xScale)
                        .tickValues([
                            2008,
                            2016,
                            2024
                        ])
                        .tickFormat(
                            d3.format("d")
                        )
                );

            // Y-axis.
            panelSvg.append("g")
                .attr(
                    "class",
                    "axis"
                )
                .attr(
                    "transform",
                    `translate(${margin.left},0)`
                )
                .call(
                    d3.axisLeft(yScale)
                        .ticks(4)
                        .tickFormat(
                            d3.format("~s")
                        )
                );

            // Line generator.
            const lineGenerator = d3.line()
                .defined(
                    d => isValid(d.value)
                )
                .x(
                    d => xScale(d.year)
                )
                .y(
                    d => yScale(d.value)
                );

            // Draw line.
            panelSvg.append("path")
                .datum(mobileData)
                .attr(
                    "class",
                    "line"
                )
                .attr(
                    "d",
                    lineGenerator
                );

            // Draw interactive dots.
            panelSvg.selectAll(".dot")
                .data(
                    mobileData.filter(
                        d => isValid(d.value)
                    )
                )
                .join("circle")
                .attr(
                    "class",
                    "dot"
                )
                .attr("r", 3)
                .attr(
                    "cx",
                    d => xScale(d.year)
                )
                .attr(
                    "cy",
                    d => yScale(d.value)
                )
                .on("mouseover", (event, d) => {

                    showTooltip(
                        event,
                        `<strong>
                            ${state} — ${d.year}
                         </strong>
                         <span class="tt-value">
                            ${formatNumber(d.value)} fines
                         </span>`
                    );

                })
                .on("mousemove", moveTooltip)
                .on("mouseout", hideTooltip);

        }


        // =========================================
        // 5.8 DRIVER AGE INFORMATION
        // =========================================

        d3.select("#age-bars")
            .html(
                `<p class="chart-note">
                    The age-group chart requires
                    a prepared CSV from the detailed
                    2024 fines workbook.
                    The state-year summary CSV does
                    not contain driver ages.
                </p>`
            );


        // =========================================
        // 5.9 AGE FILTER BUTTONS
        // =========================================

        // Do not display nonfunctional filters
        // until age-group data is prepared.

    }


// =========================================
// 6. ERROR HANDLING
// =========================================

})().catch(error => {

    console.error(
        "Chart loading error:",
        error
    );

    d3.selectAll(".chart-container")
        .filter(function () {

            return !this.hasChildNodes();

        })
        .text(
            "Unable to display chart. " +
            "Check the browser Console for details."
        );

});
