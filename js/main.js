
/*
=========================================
MAIN JAVASCRIPT
=========================================
Updates the copyright year automatically.
=========================================
*/

// Find all elements containing the current year
document.querySelectorAll("[data-current-year]")
    .forEach(element => {

        // Get current year
        const currentYear = new Date().getFullYear();

        // Display current year
        element.textContent = currentYear;

    });
