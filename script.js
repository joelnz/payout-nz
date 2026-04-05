document.addEventListener('DOMContentLoaded', () => {
    // Inputs
    const radiosType = document.querySelectorAll('input[name="employmentType"]');
    const payRateInput = document.getElementById('payRate');
    const labelPayRate = document.getElementById('label-pay-rate');
    const groupHourlyDetails = document.getElementById('group-hourly-details');
    const hoursPerDayInput = document.getElementById('hoursPerDay');
    const annualLeaveInput = document.getElementById('annualLeave');
    const grossEarningsInput = document.getElementById('grossEarnings');
    const altLeaveInput = document.getElementById('altLeave');
    const publicHolidaysInput = document.getElementById('publicHolidays');
    const taxRateSelect = document.getElementById('taxRate');

    // Outputs
    const resAnnualLeave = document.getElementById('res-annual-leave');
    const resAccruedLeave = document.getElementById('res-accrued-leave');
    const resAltLeave = document.getElementById('res-alt-leave');
    const resPublicHolidays = document.getElementById('res-public-holidays');
    const resGross = document.getElementById('res-gross');
    const resTax = document.getElementById('res-tax');
    const resNet = document.getElementById('res-net');

    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-NZ', {
            style: 'currency',
            currency: 'NZD',
        }).format(amount);
    }

    function calculate() {
        // 1. Get values
        const isSalary = document.getElementById('type-salary').checked;
        const payRate = parseFloat(payRateInput.value) || 0;
        const annualLeave = parseFloat(annualLeaveInput.value) || 0;
        const grossEarnings = parseFloat(grossEarningsInput.value) || 0;
        const altLeave = parseFloat(altLeaveInput.value) || 0;
        const publicHolidays = parseFloat(publicHolidaysInput.value) || 0;
        const taxRate = parseFloat(taxRateSelect.value) || 0.3;

        // 2. Determine daily rate
        let dailyRate = 0;
        if (isSalary) {
            dailyRate = payRate / 260; // Standard working days in a year (52 weeks * 5 days)
        } else {
            const hoursPerDay = parseFloat(hoursPerDayInput.value) || 8; // default 8
            dailyRate = payRate * hoursPerDay;
        }

        // 3. Calculate components according to NZ Holidays Act 2003
        // Entitled Leave is paid at the daily rate (at the time the leave is taken/paid)
        const entitledLeaveVal = annualLeave * dailyRate;
        
        // Accrued Leave is paid at 8% of gross earnings since the last anniversary
        // (Note: This is the standard simplified calculation for current-year holiday pay)
        const accruedLeaveVal = grossEarnings * 0.08;

        const altLeaveVal = altLeave * dailyRate;
        const publicHolidaysVal = publicHolidays * dailyRate;

        const grossTotal = entitledLeaveVal + accruedLeaveVal + altLeaveVal + publicHolidaysVal;
        const taxEstimated = grossTotal * taxRate;
        const netTotal = grossTotal - taxEstimated;

        // 4. Update UI
        if (payRate <= 0) {
            resAnnualLeave.textContent = '-';
            resAccruedLeave.textContent = '-';
            resAltLeave.textContent = '-';
            resPublicHolidays.textContent = '-';
            resGross.textContent = '-';
            resTax.textContent = '-';
            resNet.style.fontSize = '1.2rem';
            resNet.style.background = 'none';
            resNet.style.webkitTextFillColor = '#94a3b8';
            resNet.style.filter = 'none';
            resNet.textContent = 'Enter pay rate to calculate';
            return;
        }

        resNet.style.fontSize = '';
        resNet.style.background = '';
        resNet.style.webkitTextFillColor = '';
        resNet.style.filter = '';

        resAnnualLeave.textContent = formatCurrency(entitledLeaveVal);
        resAccruedLeave.textContent = formatCurrency(accruedLeaveVal);
        resAltLeave.textContent = formatCurrency(altLeaveVal);
        resPublicHolidays.textContent = formatCurrency(publicHolidaysVal);
        resGross.textContent = formatCurrency(grossTotal);
        resTax.textContent = '-' + formatCurrency(taxEstimated);
        resNet.textContent = formatCurrency(netTotal);
    }

    // Share and Copy functionality
    function shareCalculator() {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            const btn = document.getElementById('share-btn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span>✅</span> Copied!';
            setTimeout(() => btn.innerHTML = originalText, 2000);
        });
    }

    function copyBreakdown() {
        const annual = resAnnualLeave.textContent;
        const accrued = resAccruedLeave.textContent;
        const alt = resAltLeave.textContent;
        const holidays = resPublicHolidays.textContent;
        const gross = resGross.textContent;
        const tax = resTax.textContent;
        const net = resNet.textContent;

        const text = `NZ Final Pay Estimate Breakdown
-------------------------------
Unused Annual Leave: ${annual}
8% Accrued Holiday Pay: ${accrued}
Days in Lieu (Alt Leave): ${alt}
Public Holidays: ${holidays}
-------------------------------
Total Gross Pay: ${gross}
Estimated Tax: ${tax}
Estimated Net Payout: ${net}
-------------------------------
Estimate only. Powered by NZ Final Pay Calculator.`;

        navigator.clipboard.writeText(text).then(() => {
            const btn = document.getElementById('copy-results-btn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span>✅</span> Breakdown Copied!';
            setTimeout(() => btn.innerHTML = originalText, 2000);
        });
    }

    // Toggle fields based on employment type
    function toggleEmploymentType() {
        const isSalary = document.getElementById('type-salary').checked;
        if (isSalary) {
            labelPayRate.innerHTML = 'Yearly Salary (NZD) * <span class="tooltip-icon" data-tip="Your usual yearly pay before any tax is taken out (gross pay).">?</span>';
            payRateInput.placeholder = 'e.g. 70000';
            groupHourlyDetails.style.display = 'none';
        } else {
            labelPayRate.innerHTML = 'Hourly Rate (NZD) * <span class="tooltip-icon" data-tip="How much you are paid per hour, before any tax is taken out.">?</span>';
            payRateInput.placeholder = 'e.g. 25.50';
            groupHourlyDetails.style.display = 'flex';
        }
        calculate();
    }

    // Event Listeners
    radiosType.forEach(radio => radio.addEventListener('change', toggleEmploymentType));
    
    const allInputs = [
        payRateInput, hoursPerDayInput, annualLeaveInput, 
        grossEarningsInput, altLeaveInput, publicHolidaysInput, taxRateSelect
    ];

    allInputs.forEach(input => {
        input.addEventListener('input', calculate);
        input.addEventListener('change', calculate); // For select
    });

    document.getElementById('share-btn').addEventListener('click', shareCalculator);
    document.getElementById('copy-results-btn').addEventListener('click', copyBreakdown);

    // Initial compute
    calculate();
});
