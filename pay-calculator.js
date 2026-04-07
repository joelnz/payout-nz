document.addEventListener('DOMContentLoaded', () => {
    const hourlyRateInput   = document.getElementById('hourlyRate');
    const hoursPerWeekInput = document.getElementById('hoursPerWeek');
    const taxCodeSelect     = document.getElementById('taxCode');
    const studentLoanCheck  = document.getElementById('studentLoan');
    const kiwiSaverSelect   = document.getElementById('kiwiSaver');
    const presetBtns        = document.querySelectorAll('.preset-btn');

    const resWeeklyNet      = document.getElementById('res-weekly-net');
    const resWeeklyGross    = document.getElementById('res-weekly-gross');
    const resAnnualNet      = document.getElementById('res-annual-net');
    const resPAYE           = document.getElementById('res-paye');
    const resACC            = document.getElementById('res-acc');
    const resSL             = document.getElementById('res-sl');
    const resKS             = document.getElementById('res-ks');
    const resIETC           = document.getElementById('res-ietc');

    const slRow             = document.getElementById('sl-row');
    const ietcRow           = document.getElementById('ietc-row');
    const ietcAlert         = document.getElementById('ietc-alert');
    const wageBadge         = document.getElementById('wage-badge');
    const payStatusCard     = document.getElementById('pay-status-card');

    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-NZ', {
            style: 'currency',
            currency: 'NZD',
        }).format(amount);
    }

    function calcAnnualPAYE(gross) {
        let tax = 0;
        const brackets = [
            { thresh: 180000, rate: 0.39 },
            { thresh: 78100,  rate: 0.33 },
            { thresh: 53500,  rate: 0.30 },
            { thresh: 15600,  rate: 0.175 },
            { thresh: 0,      rate: 0.105 }
        ];

        let remaining = gross;
        for (const b of brackets) {
            if (remaining > b.thresh) {
                const taxableAtThisLevel = remaining - b.thresh;
                tax += taxableAtThisLevel * b.rate;
                remaining = b.thresh;
            }
        }
        return tax;
    }

    function calculate() {
        const rate      = parseFloat(hourlyRateInput.value) || 0;
        const hours     = parseFloat(hoursPerWeekInput.value) || 0;
        const taxCode   = taxCodeSelect.value;
        const hasSL     = studentLoanCheck.checked;
        const ksPercent = parseFloat(kiwiSaverSelect.value) || 0;

        const weeklyGross = rate * hours;
        const annualGross = weeklyGross * 52;

        if (annualGross <= 0) {
            [resWeeklyNet, resWeeklyGross, resAnnualNet, resPAYE, resACC, resSL, resKS, resIETC].forEach(el => el.textContent = '-');
            wageBadge.style.display = 'none';
            ietcAlert.style.display = 'none';
            return;
        }

        // 1. KiwiSaver (on Gross)
        const weeklyKS = weeklyGross * ksPercent;
        const annualKS = weeklyKS * 52;

        // 2. ACC Levy (1.75% for 2026, max liable $156,641)
        const liableACC = Math.min(annualGross, 156641);
        const annualACC = liableACC * 0.0175;
        const weeklyACC = annualACC / 52;

        // 3. PAYE Tax
        const annualPAYE = calcAnnualPAYE(annualGross);
        const weeklyPAYE = annualPAYE / 52;

        // 4. Student Loan (12% on income over $24,128)
        let weeklySL = 0;
        const slWeeklyThreshold = 464; // $24,128 / 52
        if (hasSL && weeklyGross > slWeeklyThreshold) {
            weeklySL = (weeklyGross - slWeeklyThreshold) * 0.12;
        }
        slRow.style.display = hasSL ? 'flex' : 'none';

        // 5. IETC (Independent Earner Tax Credit)
        // Full $10/week if $24k - $66k. Abates to $70k.
        let annualIETC = 0;
        if (annualGross >= 24000 && annualGross <= 70000) {
            if (annualGross <= 66000) {
                annualIETC = 520;
            } else {
                // Abatement: 13c per $1 over $66,000
                annualIETC = 520 - ((annualGross - 66000) * 0.13);
                if (annualIETC < 0) annualIETC = 0;
            }
        }

        // Only apply IETC if taxCode is 'ME', otherwise show alert
        const weeklyIETC = annualIETC / 52;
        const applyingIETC = (taxCode === 'ME' && weeklyIETC > 0);
        ietcRow.style.display   = applyingIETC ? 'flex' : 'none';
        ietcAlert.style.display = (taxCode === 'M' && weeklyIETC > 9) ? 'block' : 'none';

        // Net Calculation
        const weeklyNet = weeklyGross - weeklyPAYE - weeklyACC - weeklySL - weeklyKS + (applyingIETC ? weeklyIETC : 0);
        const annualNet = weeklyNet * 52;
        const monthlyNet = annualNet / 12;

        // Update UI
        resWeeklyNet.textContent   = formatCurrency(weeklyNet);
        resWeeklyGross.textContent = formatCurrency(weeklyGross);
        resPAYE.textContent        = '-' + formatCurrency(weeklyPAYE);
        resACC.textContent         = '-' + formatCurrency(weeklyACC);
        resSL.textContent          = '-' + formatCurrency(weeklySL);
        resKS.textContent          = '-' + formatCurrency(weeklyKS);
        resIETC.textContent        = '+' + formatCurrency(weeklyIETC);
        resAnnualNet.textContent   = formatCurrency(annualNet);
        document.getElementById('res-monthly-net').textContent = formatCurrency(monthlyNet);

        // Update Wage Badge Status
        wageBadge.style.display = 'inline-block';
        if (rate >= 27.80) {
            wageBadge.textContent = 'Living Wage';
            wageBadge.className = 'badge-tag badge-living-wage';
        } else if (rate >= 23.95) {
            wageBadge.textContent = 'Adult Min Wage';
            wageBadge.className = 'badge-tag badge-min-wage';
        } else if (rate > 0) {
            wageBadge.textContent = 'Underpaid?';
            wageBadge.className = 'badge-tag badge-min-wage';
        } else {
            wageBadge.style.display = 'none';
        }
    }

    // Preset Button Handlers
    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            hourlyRateInput.value = btn.dataset.rate;
            calculate();
        });
    });

    [hourlyRateInput, hoursPerWeekInput, taxCodeSelect, studentLoanCheck, kiwiSaverSelect].forEach(el => {
        el.addEventListener('input', calculate);
        el.addEventListener('change', calculate);
    });

    calculate();
});
