
/*
=========================================
HOME PAGE STATISTICS
=========================================
Displays 2024 road enforcement figures.

Data sources:
1. enforcement_state_year.csv
2. fines_state_year_offence.csv
=========================================
*/

// =========================================
// 1. LOAD CSV DATA
// =========================================

Promise.all([

    d3.csv(
        "data/enforcement_state_year.csv",
        d3.autoType
    ),

    d3.csv(
        "data/fines_state_year_offence.csv",
        d3.autoType
    )

]).then(([enforcementData, finesData]) => {

    // =========================================
    // 2. FILTER DATA FOR 2024
    // =========================================

    const data2024 = enforcementData.filter(
        d => d.YEAR === 2024
    );


    // =========================================
    // 3. CALCULATE TOTALS
    // =========================================

    const calculateTotal = (column) => {

        return d3.sum(
            data2024,
            d => +d[column] || 0
        );

    };


    // =========================================
    // 4. UPDATE STATISTIC CARDS
    // =========================================

    const updateStat = (id, value) => {

        const element = document.getElementById(id);

        if (element) {

            element.textContent = formatInt(value);

        }

    };


    // =========================================
    // 5. BREATH TESTS CONDUCTED
    // =========================================

    const breathTests = calculateTotal(
        "breath_tests_conducted"
    );

    updateStat(
        "stat-breath",
        breathTests
    );


    // =========================================
    // 6. DRUG TESTS CONDUCTED
    // =========================================

    const drugTests = calculateTotal(
        "drug_tests_conducted"
    );

    updateStat(
        "stat-drug-tests",
        drugTests
    );


    // =========================================
    // 7. POSITIVE DRUG TESTS
    // =========================================

    const positiveDrugTests = calculateTotal(
        "positive_drug_tests"
    );

    updateStat(
        "stat-positive-drug",
        positiveDrugTests
    );


    // =========================================
    // 8. TOTAL FINES ISSUED
    // =========================================

    const fines2024 = finesData.filter(
        d => d.YEAR === 2024
    );

    const totalFines = d3.sum(
        fines2024,
        d => +d["Sum(FINES)"] || 0
    );

    updateStat(
        "stat-fines",
        totalFines
    );


// =========================================
// 9. ERROR HANDLING
// =========================================

}).catch(error => {

    console.error(
        "Error loading homepage statistics:",
        error
    );

});
