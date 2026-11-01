
/*
=========================================
SHARED JAVASCRIPT
ROAD ENFORCEMENT AUSTRALIA
=========================================

Contains:
1. Colour constants
2. State and territory names
3. Offence labels
4. Number formatting
5. Chart creation functions
6. Axis labels
7. Tooltips
8. Filter buttons
9. Error handling

Used by all D3.js visualisations.
=========================================
*/


// =========================================
// 1. COLOUR CONSTANTS
// =========================================

const COLORS = {

    black: "#031716",

    deep: "#032F30",

    tealDark: "#0A7075",

    teal: "#0C969C",

    sky: "#6BA3BE",

    slate: "#274D60",

    pale: "#A9D6D8",

    amber: "#F2A541"

};


// =========================================
// 2. STATES AND TERRITORIES
// =========================================

const STATES = [
    "ACT",
    "NSW",
    "NT",
    "QLD",
    "SA",
    "TAS",
    "VIC",
    "WA"
];


// =========================================
// 3. FULL STATE NAMES
// =========================================

const STATE_NAMES = {

    ACT: "Australian Capital Territory",

    NSW: "New South Wales",

    NT: "Northern Territory",

    QLD: "Queensland",

    SA: "South Australia",

    TAS: "Tasmania",

    VIC: "Victoria",

    WA: "Western Australia"

};


// =========================================
// 4. OFFENCE LABELS
// =========================================

// Converts CSV offence codes into readable names.

const OFFENCE_LABELS = {

    speed_fines: "Speeding",

    mobile_phone_use: "Mobile phone use",

    non_wearing_seatbelts: "Seatbelt not worn",

    unlicensed_driving: "Unlicensed driving"

};


// =========================================
// 5. NUMBER FORMATTING
// =========================================

// Example: 1234567 becomes 1,234,567

const formatInt = d3.format(",");


// Example: 1500000 becomes 1.5M

const formatSI = d3.format("~s");


// Example: 4.56 becomes 4.6%

const formatPct = value => {

    return d3.format(".1f")(value) + "%";

};


// =========================================
// 6. CREATE SVG CHART
// =========================================

function createChart(target, options = {}) {

    // Default chart dimensions
    const width = options.width || 800;

    const height = options.height || 500;

    // Default chart margins
    const margin = options.margin || {

        top: 40,

        right: 40,

        bottom: 70,

        left: 90

    };

    // Create responsive SVG
    const svg = d3.select(target)
        .append("svg")
        .attr(
            "viewBox",
            `0 0 ${width} ${height}`
        )
        .attr(
            "preserveAspectRatio",
            "xMidYMid meet"
        );

    // Create inner chart group
    const inner = svg.append("g")
        .attr(
            "transform",
            `translate(${margin.left}, ${margin.top})`
        );

    // Calculate available drawing area
    const innerWidth =
        width - margin.left - margin.right;

    const innerHeight =
        height - margin.top - margin.bottom;

    // Return chart components
    return {

        svg: svg,

        inner: inner,

        width: width,

        height: height,

        margin: margin,

        innerWidth: innerWidth,

        innerHeight: innerHeight

    };

}


// =========================================
// 7. ADD AXIS LABELS
// =========================================

function addAxisLabels(chart, xText, yText) {

    // X-axis label
    chart.inner.append("text")
        .attr("class", "axis-label")
        .attr(
            "x",
            chart.innerWidth / 2
        )
        .attr(
            "y",
            chart.innerHeight +
            chart.margin.bottom - 18
        )
        .attr(
            "text-anchor",
            "middle"
        )
        .text(xText);

    // Y-axis label
    chart.inner.append("text")
        .attr("class", "axis-label")
        .attr(
            "transform",
            "rotate(-90)"
        )
        .attr(
            "x",
            -chart.innerHeight / 2
        )
        .attr(
            "y",
            -chart.margin.left + 26
        )
        .attr(
            "text-anchor",
            "middle"
        )
        .text(yText);

}


// =========================================
// 8. TOOLTIP CREATION
// =========================================

// One tooltip is shared between all charts.

const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .attr("role", "status");


// =========================================
// 9. SHOW TOOLTIP
// =========================================

function showTooltip(event, html) {

    tooltip
        .html(html)
        .classed("visible", true);

    moveTooltip(event);

}


// =========================================
// 10. MOVE TOOLTIP
// =========================================

function moveTooltip(event) {

    const gap = 14;

    const tipWidth =
        tooltip.node().offsetWidth;

    // Determine the right boundary
    const rightEdge =
        window.scrollX +
        document.documentElement.clientWidth -
        tipWidth -
        8;

    // Calculate horizontal position
    const leftPosition = Math.max(
        window.scrollX + 8,
        Math.min(
            event.pageX + gap,
            rightEdge
        )
    );

    // Calculate vertical position
    const topPosition =
        event.pageY + gap;

    // Update tooltip position
    tooltip
        .style(
            "left",
            leftPosition + "px"
        )
        .style(
            "top",
            topPosition + "px"
        );

}


// =========================================
// 11. HIDE TOOLTIP
// =========================================

function hideTooltip() {

    tooltip.classed(
        "visible",
        false
    );

}


// =========================================
// 12. CREATE FILTER BUTTONS
// =========================================

function createFilterButtons(
    target,
    options,
    activeId,
    onSelect
) {

    // Select filter container
    const container = d3.select(target);

    // Create buttons using D3 data binding
    const buttons = container
        .selectAll("button.filter-button")
        .data(
            options,
            d => d.id
        )
        .join("button")
        .attr("type", "button")
        .attr("class", "filter-button")
        .text(d => d.label);

    // Function to highlight selected button
    function setActive(id) {

        buttons
            .classed(
                "active",
                d => d.id === id
            )
            .attr(
                "aria-pressed",
                d => d.id === id
            );

    }

    // Handle button clicks
    buttons.on("click", (event, d) => {

        setActive(d.id);

        onSelect(d.id);

    });

    // Set the default selected button
    setActive(activeId);

}


// =========================================
// 13. DATA LOADING ERROR HELPER
// =========================================

function loadError(file) {

    return error => {

        console.error(
            `Could not load ${file}:`,
            error
        );

    };

}
