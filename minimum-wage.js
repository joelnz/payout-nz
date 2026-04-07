document.addEventListener('DOMContentLoaded', () => {
    const hourlyRateInput = document.getElementById('hourlyRate');
    const wageTypeSelect = document.getElementById('wageType');
    const hoursPerWeekInput = document.getElementById('hoursPerWeek');

    const resMinRate = document.getElementById('res-min-rate');
    const resDiff = document.getElementById('res-diff');
    const resWeekly = document.getElementById('res-weekly');
    const resAnnual = document.getElementById('res-annual');
    
    const statusBox = document.getElementById('status-box');
    const statusLabel = document.getElementById('status-label');
    const statusIcon = document.getElementById('status-icon');

    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-NZ', {
            style: 'currency',
            currency: 'NZD',
        }).format(amount);
    }

    function calculate() {
        const rate = parseFloat(hourlyRateInput.value) || 0;
        const type = wageTypeSelect.value;
        const hours = parseFloat(hoursPerWeekInput.value) || 0;

        let legalMin = 23.95; // Adult rate 2026
        if (type === 'starting' || type === 'training') {
            legalMin = 19.16; // 80% of adult rate 2026
        }

        resMinRate.textContent = formatCurrency(legalMin) + ' / hr';

        if (rate <= 0) {
            resDiff.textContent = '$0.00 / hr';
            resWeekly.textContent = '$0.00';
            resAnnual.textContent = '$0.00';
            statusLabel.textContent = 'Enter your rate';
            statusIcon.textContent = '➖';
            statusBox.style.background = '';
            statusBox.style.borderColor = '';
            return;
        }

        const diff = rate - legalMin;
        const isUnderpaid = diff < 0;

        resDiff.textContent = (isUnderpaid ? '-' : '+') + formatCurrency(Math.abs(diff)) + ' / hr';
        resDiff.style.color = isUnderpaid ? '#f43f5e' : '#2dd4bf'; // Red if underpaid, teal if overpaid
        
        resWeekly.textContent = formatCurrency(rate * hours);
        resAnnual.textContent = formatCurrency(rate * hours * 52);

        if (isUnderpaid) {
            statusLabel.textContent = 'Under Minimum Wage!';
            statusLabel.style.color = '#f43f5e';
            statusIcon.textContent = '⚠️';
            statusBox.style.background = 'linear-gradient(135deg, rgba(244, 63, 94, 0.08), rgba(244, 63, 94, 0.03))';
            statusBox.style.borderColor = 'rgba(244, 63, 94, 0.3)';
        } else {
            statusLabel.textContent = 'Legally Compliant';
            statusLabel.style.color = '#2dd4bf';
            statusIcon.textContent = '✅';
            statusBox.style.background = 'linear-gradient(135deg, rgba(20, 184, 166, 0.08), rgba(2, 132, 199, 0.03))';
            statusBox.style.borderColor = 'rgba(20, 184, 166, 0.3)';
        }
    }

    [hourlyRateInput, wageTypeSelect, hoursPerWeekInput].forEach(el => {
        el.addEventListener('input', calculate);
        el.addEventListener('change', calculate);
    });

    calculate();
});
