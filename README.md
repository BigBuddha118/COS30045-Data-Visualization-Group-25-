# COS30045 Data Visualisation Project – Group 25

Group 25 project for COS30045 Data Visualisation. An interactive web-based data visualisation of police road safety enforcement in Australia, built with D3.js and KNIME.

## Team Members

| Name | Role |
|------|------|
| Kevin Kennedy | [e.g. Project Design Book] |
| Prit A/L Vinesh Kumar | [e.g. D3 visualisation and presentation] |
| Vaeshen Raj A/L Jayandra | [e.g. KNIME data processing] |

## Project Overview

**Title:** [Project title, e.g. Roadside Enforcement in Australia, 2008–2024]

**Question:** How have positive alcohol and drug test rates and traffic fines changed across Australian states and territories from 2008 to 2024?

**Purpose:** [One or two sentences on why this matters, e.g. to help road safety audiences see where and how enforcement results differ between jurisdictions over time.]

## Data

- **Source:** Australian Road Safety Data Hub, Police Enforcement data (2024 release): [link]
- **Files used:**
  - Alcohol and drug tests (breath and drug tests conducted)
  - Positive breath tests
  - Positive drug tests
  - Fines (speed, mobile phone use, seatbelts, unlicensed driving)
  - Police enforcement data dictionary (PDF)
- **Coverage:** 2008–2024, all eight states and territories (ACT, NSW, NT, QLD, SA, TAS, VIC, WA)
- **Licence / terms:** [paste the wording from the source]
- **Governance:** Aggregated government statistics (counts only), no personal information.

### Data Processing (KNIME)

1. Read the four Excel files.
2. Positive drug tests: keep only the best detection method (BEST_DETECTION_METHOD = Yes), because each positive can be counted at up to three testing stages.
3. Summarise each file to one row per Year and State, since the files are at different levels of detail (annual state totals to 2022, monthly by region and age from 2023).
4. Pivot the tests file into breath and drug tests conducted.
5. Join the results and calculate positive rates:
   - `breath_rate_pct = positive_breath_tests / breath_tests_conducted × 100`
   - `drug_rate_pct = positive_drug_tests / drug_tests_conducted × 100`
6. Export the clean files for D3.

### Known Data Limitations

- 20 state-years have no drug test total (NT has none), so some drug rates are blank.
- Tasmania has very few recorded drug tests and a high positive rate (about 50%), so it is an outlier.
- NT's breath positive rate (5–8%) is much higher than other states (about 0.3–1%).

## Tools and Technologies

- D3.js v7
- HTML, CSS, JavaScript
- KNIME (data cleaning and processing)
- GitHub / GitHub Classroom

## Repository Structure

```
/
├── data/
│   ├── (raw Excel files)
│   ├── enforcement_state_year.csv
│   └── fines_state_year_offence.csv
├── knime/
├── index.html
├── css/
├── js/
└── README.md
```

## How to Run

1. Clone this repository.
2. Open the project folder in VS Code.
3. Right-click `index.html` and choose **Open with Live Server**.

## Progress

- [x] GitHub Classroom team created
- [x] Data sourced and documented
- [x] KNIME workflow built, clean CSVs exported
- [ ] Project Design Book drafted
- [ ] Exploratory analysis
- [ ] First D3 prototype
