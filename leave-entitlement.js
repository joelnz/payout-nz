document.addEventListener('DOMContentLoaded', () => {
    // Mode Switching
    const mode8percent = document.getElementById('mode-8percent');
    const modeAnniversary = document.getElementById('mode-anniversary');
    const section8percent = document.getElementById('section-8percent');
    const sectionAnniversary = document.getElementById('section-anniversary');
    const results8percent = document.getElementById('results-8percent');
    const resultsAnniversary = document.getElementById('results-anniversary');

    function switchMode() {
        if (mode8percent.checked) {
            section8percent.style.display = 'block';
            results8percent.style.display = 'block';
            sectionAnniversary.style.display = 'none';
            resultsAnniversary.style.display = 'none';
        } else {
            section8percent.style.display = 'none';
            results8percent.style.display = 'none';
            sectionAnniversary.style.display = 'block';
            resultsAnniversary.style.display = 'block';
        }
    }

    [mode8percent, modeAnniversary].forEach(radio => {
        radio.addEventListener('change', switchMode);
    });

    // 8% Calculation Logic
    const grossEarningsInput = document.getElementById('grossEarnings');
    const res8percent = document.getElementById('res-8percent');
    const resGrossRef = document.getElementById('res-gross-ref');
    const insights8percent = document.getElementById('insights-8percent');
    const insightTimeDesc = document.getElementById('insight-time-desc');
    const insightPayoutDesc = document.getElementById('insight-payout-desc');

    function fmt(amount) {
        return new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD' }).format(amount);
    }

    function parseVal(val) {
        return parseFloat(val.replace(/[^0-9.]/g, '')) || 0;
    }

    function calculate8percent() {
        let val = grossEarningsInput.value;
        // Basic currency formating on-type
        if (val) {
            let num = parseVal(val);
            const rawValue = num.toString();
            const parts = rawValue.split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            // Only update if not currently typing a decimal
            if (!val.endsWith('.')) {
                grossEarningsInput.value = parts.join('.');
            }
        }

        const gross = parseVal(grossEarningsInput.value);
        const holidayPay = gross * 0.08;
        
        res8percent.textContent = fmt(holidayPay);
        resGrossRef.textContent = fmt(gross);

        if (gross > 0) {
            insights8percent.style.display = 'block';
            
            // Logic for "How long is my holiday"
            // 8% is roughly 4.16 weeks of pay. We'll round to "About 4 weeks" for consumer clarity.
            insightTimeDesc.innerHTML = `This <strong>${fmt(holidayPay)}</strong> represents roughly <strong>4 weeks</strong> of paid time off based on your total earnings.`;
            
            insightPayoutDesc.innerHTML = `If you've been working for less than a year, this is the "accrued" value you'll receive in your final paycheck if you leave today.`;
        } else {
            insights8percent.style.display = 'none';
        }
    }

    grossEarningsInput.addEventListener('input', calculate8percent);

    // Anniversary / Entitlement Logic
    const startDateInput = document.getElementById('startDate');
    const empTypeSelect = document.getElementById('empType');

    const resStatus = document.getElementById('res-status');
    const resAnniv = document.getElementById('res-anniv');
    const statusBox = document.getElementById('status-box');
    const statusLabel = document.getElementById('status-label');
    const statusDate = document.getElementById('status-date');

    function calculateAnniversary() {
        if (!startDateInput.value) {
            statusLabel.textContent = 'Enter Start Date';
            statusDate.textContent = '➖';
            resStatus.textContent = '-';
            resAnniv.textContent = '-';
            statusBox.className = 'net-total-box';
            return;
        }

        const type = empTypeSelect.value;
        // Parse dd/mm/yyyy
        const parts = startDateInput.value.split('/');
        if (parts.length !== 3) return;
        const startDate = new Date(parts[2], parts[1] - 1, parts[0]);
        if (isNaN(startDate.getTime())) return;
        
        const today = new Date();

        if (type === 'casual') {
            statusLabel.textContent = 'Casual Employment';
            statusDate.textContent = 'No 4-week Entitlement';
            statusDate.style.fontSize = '1.3rem';
            resStatus.textContent = 'Receive 8% PAYG on gross pay';
            resAnniv.textContent = 'Not Applicable';
            statusBox.className = 'net-total-box alert-warning';
            return;
        }

        statusDate.style.fontSize = '2rem';
        let yearsEmployed = today.getFullYear() - startDate.getFullYear();
        let nextAnniversary = new Date(startDate);
        nextAnniversary.setFullYear(startDate.getFullYear() + yearsEmployed);

        if (today > nextAnniversary) {
            nextAnniversary.setFullYear(nextAnniversary.getFullYear() + 1);
        }

        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        const isCurrentlyEntitled = (today - startDate) >= (1000 * 60 * 60 * 24 * 365);

        if (isCurrentlyEntitled) {
            statusLabel.textContent = 'You are Entitled to';
            statusDate.textContent = '4 Weeks Leave';
            resStatus.textContent = 'Fully Entitled (Passed 12 Months)';
            statusBox.className = 'net-total-box alert-success';
        } else {
            statusLabel.textContent = 'Entitlement unlocks on';
            statusDate.textContent = nextAnniversary.toLocaleDateString('en-NZ', options);
            statusDate.style.fontSize = '1.5rem';
            resStatus.textContent = 'Accruing (Under 12 Months)';
            statusBox.className = 'net-total-box alert-success';
        }

        resAnniv.textContent = nextAnniversary.toLocaleDateString('en-NZ', options);
    }

    if (startDateInput) {
        flatpickr(startDateInput, {
            altInput: true,
            altFormat: "d/m/Y",
            dateFormat: "d/m/Y",
            disableMobile: "true",
            onChange: calculateAnniversary
        });
    }

    empTypeSelect.addEventListener('change', calculateAnniversary);
    
    // Initial State
    switchMode();
});
