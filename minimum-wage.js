document.addEventListener('DOMContentLoaded', () => {
    const wageTypeSelect = document.getElementById('wageType');
    const hourlyRateInput = document.getElementById('hourlyRate');
    const hoursPerWeekInput = document.getElementById('hoursPerWeek');

    const statusBox = document.getElementById('status-box');
    const statusLabel = document.getElementById('status-label');
    const statusIcon = document.getElementById('status-icon');
    
    const resMinRate = document.getElementById('res-min-rate');
    const resDiff = document.getElementById('res-diff');
    const resWeekly = document.getElementById('res-weekly');
    const resAnnual = document.getElementById('res-annual');

    // Official 2026 rates
    const rates = {
        adult: 23.95,
        starting: 19.16,
        training: 19.16
    };

    function fmt(amount) {
        return new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD' }).format(amount);
    }

    function calculate() {
        const type = wageTypeSelect.value;
        const myRate = parseFloat(hourlyRateInput.value) || 0;
        const hours = parseFloat(hoursPerWeekInput.value) || 0;
        const minRate = rates[type];

        const weekly = myRate * hours;
        const annual = weekly * 52;
        const diff = myRate - minRate;

        // UI Reset
        if (myRate <= 0) {
            statusLabel.textContent = 'Enter your rate';
            statusIcon.textContent = '➖';
            statusBox.className = 'net-total-box';
            resMinRate.textContent = fmt(minRate) + ' / hr';
            resDiff.textContent = '$0.00 / hr';
            resWeekly.textContent = '$0.00';
            resAnnual.textContent = '$0.00';
            return;
        }

        resMinRate.textContent = fmt(minRate) + ' / hr';
        resDiff.textContent = (diff >= 0 ? '+' : '') + fmt(diff) + ' / hr';
        resWeekly.textContent = fmt(weekly);
        resAnnual.textContent = fmt(annual);

        if (diff < 0) {
            statusLabel.textContent = 'Below Minimum Wage';
            statusIcon.textContent = '⚠️';
            statusBox.className = 'net-total-box alert-warning';
        } else {
            statusLabel.textContent = 'Meets Legal Minimum';
            statusIcon.textContent = '✅';
            statusBox.className = 'net-total-box alert-success';
        }
    }

    [wageTypeSelect, hourlyRateInput, hoursPerWeekInput].forEach(el => {
        el.addEventListener('input', calculate);
    });

    calculate();
});
