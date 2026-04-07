document.addEventListener('DOMContentLoaded', () => {

    // ── Input elements ────────────────────────────────────────────────────────
    const radiosType    = document.querySelectorAll('input[name="employmentType"]');
    const radiosTenure  = document.querySelectorAll('input[name="employmentTenure"]');
    const payRateInput  = document.getElementById('payRate');
    const labelPayRate  = document.getElementById('label-pay-rate');
    const groupHourly   = document.getElementById('group-hourly-details');
    const groupSalary   = document.getElementById('group-salary-details');
    const groupAnnual   = document.getElementById('group-annual-leave');
    const groupLastDay  = document.getElementById('group-last-day');
    const groupManualPH = document.getElementById('group-manual-public-holidays');
    const hoursPerDayInput    = document.getElementById('hoursPerDay');
    const daysPerWeekInput    = document.getElementById('daysPerWeek');
    const annualLeaveInput    = document.getElementById('annualLeave');
    const grossEarningsInput  = document.getElementById('grossEarnings');
    const labelGrossEarnings  = document.getElementById('label-gross-earnings');
    const hintGrossEarnings   = document.getElementById('hint-gross-earnings');
    const altLeaveInput       = document.getElementById('altLeave');
    const publicHolidaysInput = document.getElementById('publicHolidays');
    const lastDayInput        = document.getElementById('lastDayInput');
    const taxRateSelect       = document.getElementById('taxRate');

    // ── Output elements ───────────────────────────────────────────────────────
    const resAnnualRow   = document.getElementById('res-annual-leave-row');
    const resAnnual      = document.getElementById('res-annual-leave');
    const resAccrued     = document.getElementById('res-accrued-leave');
    const resAlt         = document.getElementById('res-alt-leave');
    const resPH          = document.getElementById('res-public-holidays');
    const resPHDetail    = document.getElementById('res-public-holidays-detail');
    const resGross       = document.getElementById('res-gross');
    const resTax         = document.getElementById('res-tax');
    const resNet         = document.getElementById('res-net');
    const holidayCallout = document.getElementById('holiday-callout');

    // ── Helpers ───────────────────────────────────────────────────────────────
    function fmt(amount) {
        return new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD' }).format(amount);
    }

    function parseLocalDate(str) {
        if (!str) return null;
        const [y, m, d] = str.split('-').map(Number);
        return new Date(y, m - 1, d);
    }

    function formatDate(date) {
        return date.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    function isOver12() { return document.getElementById('tenure-over').checked; }
    function isSalary()  { return document.getElementById('type-salary').checked; }

    function formatCurrencyInput(input) {
        // Remove all non-numeric characters except one decimal point
        let value = input.value.replace(/[^0-9.]/g, '');
        
        // Split decimal part if it exists
        const parts = value.split('.');
        if (parts.length > 2) value = parts[0] + '.' + parts.slice(1).join('');
        
        // Add commas to the integer part
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        
        // Reassemble value
        input.value = parts.length > 1 ? parts.join('.') : parts[0];
    }

    function parseFormattedValue(value) {
        if (!value) return 0;
        return parseFloat(value.toString().replace(/,/g, '')) || 0;
    }

    // ── Main calculation ──────────────────────────────────────────────────────
    function calculate() {
        const over12     = isOver12();
        const salary     = isSalary();
        const payRate    = parseFormattedValue(payRateInput.value);
        const annualDays = over12 ? (parseFloat(annualLeaveInput.value) || 0) : 0;
        const grossBase  = parseFormattedValue(grossEarningsInput.value);
        const altDays    = parseFloat(altLeaveInput.value) || 0;
        const taxRate    = parseFloat(taxRateSelect.value) || 0.30;

        // Daily rate
        let dailyRate = 0;
        if (salary) {
            const dpw = parseFloat(daysPerWeekInput.value) || 5;
            dailyRate = payRate / (52 * dpw);
        } else {
            const hpd = parseFloat(hoursPerDayInput.value) || 0;
            dailyRate = payRate * hpd;
        }

        // Determine public holidays to charge
        let phCount = 0;
        let phHolidays = [];
        const lastDay = parseLocalDate(lastDayInput ? lastDayInput.value : '');
        if (over12 && lastDay && annualDays > 0) {
            const dpw = parseFloat(daysPerWeekInput.value) || 5;
            const result = calculatePublicHolidaysInWindow(lastDay, annualDays, dpw);
            phCount    = result.count;
            phHolidays = result.holidays;
        } else if (over12) {
            phCount = parseFloat(publicHolidaysInput.value) || 0;
        }

        // Monetary values
        const entitledLeaveVal = annualDays * dailyRate;
        const altLeaveVal      = altDays    * dailyRate;
        const phVal            = phCount    * dailyRate;

        // 8% holiday bonus — applied to gross base + all other final pay items
        const accruedVal = (grossBase + entitledLeaveVal + altLeaveVal + phVal) * 0.08;

        const grossTotal = entitledLeaveVal + accruedVal + altLeaveVal + phVal;
        const taxAmt     = grossTotal * taxRate;
        const netTotal   = grossTotal - taxAmt;

        // ── Update holiday callout ────────────────────────────────────────────
        if (holidayCallout) {
            if (over12 && lastDay && annualDays > 0) {
                if (phCount === 0) {
                    holidayCallout.innerHTML = '<span class="callout-icon">✅</span> No public holidays fall within your paid leave window — none extra owed.';
                    holidayCallout.className = 'holiday-callout callout-none';
                } else {
                    const list = phHolidays.map(h =>
                        `<span class="holiday-chip">${h.name} (${formatDate(h.date)})</span>`
                    ).join('');
                    holidayCallout.innerHTML = `<span class="callout-icon">🎉</span> <strong>${phCount} public holiday${phCount > 1 ? 's' : ''} found</strong> — you're owed pay for:<br>${list}`;
                    holidayCallout.className = 'holiday-callout callout-found';
                }
                holidayCallout.style.display = 'block';
            } else {
                holidayCallout.style.display = 'none';
            }
        }

        // ── Update public holiday detail in results ───────────────────────────
        if (resPHDetail) {
            if (phHolidays.length > 0) {
                resPHDetail.textContent = phHolidays.map(h => h.name).join(', ');
                resPHDetail.style.display = 'block';
            } else {
                resPHDetail.style.display = 'none';
            }
        }

        // ── UI reset when no pay rate ─────────────────────────────────────────
        if (payRate <= 0) {
            [resAnnual, resAccrued, resAlt, resPH, resGross, resTax].forEach(el => {
                if (el) el.textContent = '-';
            });
            resNet.style.cssText = 'font-size:1.2rem;background:none;-webkit-text-fill-color:#94a3b8;filter:none;';
            resNet.textContent = 'Enter pay rate to calculate';
            return;
        }

        resNet.style.cssText = '';
        if (resAnnual)  resAnnual.textContent  = fmt(entitledLeaveVal);
        if (resAccrued) resAccrued.textContent  = fmt(accruedVal);
        if (resAlt)     resAlt.textContent      = fmt(altLeaveVal);
        if (resPH)      resPH.textContent       = fmt(phVal);
        if (resGross)   resGross.textContent    = fmt(grossTotal);
        if (resTax)     resTax.textContent      = '-' + fmt(taxAmt);
        if (resNet)     resNet.textContent      = fmt(netTotal);
    }

    // ── Toggle: Employment length ─────────────────────────────────────────────
    function toggleTenure() {
        const over12 = isOver12();

        if (groupAnnual)   groupAnnual.style.display   = over12 ? '' : 'none';
        if (groupLastDay)  groupLastDay.style.display  = over12 ? '' : 'none';
        if (resAnnualRow)  resAnnualRow.style.display  = over12 ? '' : 'none';

        // Show manual public holidays only if 12+ months AND no date entered
        updatePublicHolidayInputVisibility();

        // Relabel gross earnings based on tenure
        if (labelGrossEarnings) {
            if (over12) {
                labelGrossEarnings.innerHTML = 'Your Pay Since Your Last Work Anniversary (NZD) <span class="tooltip-icon" data-tip="Each year on the anniversary of when you started, your holiday balance resets. Enter your total gross (before-tax) pay since that last anniversary date. Your 8% bonus is calculated on this plus any leave being paid out.">?</span>';
                if (hintGrossEarnings) hintGrossEarnings.textContent = 'Add up your payslips from your work anniversary until now';
            } else {
                labelGrossEarnings.innerHTML = 'Total Pay You\'ve Earned Since You Started (NZD) <span class="tooltip-icon" data-tip="Because you\'ve worked here less than a year, your 8% holiday bonus is based on your total gross pay since day one. Add up all your before-tax wages since you started — check your payslips.">?</span>';
                if (hintGrossEarnings) hintGrossEarnings.textContent = 'Your total before-tax wages since your very first day';
            }
        }

        calculate();
    }

    // ── Toggle: Show/hide manual public holidays input ────────────────────────
    function updatePublicHolidayInputVisibility() {
        if (!groupManualPH) return;
        const over12  = isOver12();
        const hasDate = lastDayInput && lastDayInput.value;
        const hasAnnual = annualLeaveInput && (parseFloat(annualLeaveInput.value) || 0) > 0;

        // Show manual input only if: 12+ months, no date entered (or no annual leave to form a window)
        if (over12 && (!hasDate || !hasAnnual)) {
            groupManualPH.style.display = '';
        } else {
            groupManualPH.style.display = 'none';
        }
    }

    // ── Toggle: Employment type (salary/hourly) ───────────────────────────────
    function toggleEmploymentType() {
        const salary = isSalary();
        if (salary) {
            labelPayRate.innerHTML = 'Yearly Salary (NZD) * <span class="tooltip-icon" data-tip="Your annual salary before tax (gross pay).">?</span>';
            if (groupHourly) groupHourly.style.display = 'none';
            if (groupSalary) groupSalary.style.display = 'flex';
        } else {
            labelPayRate.innerHTML = 'Hourly Rate (NZD) * <span class="tooltip-icon" data-tip="How much you are paid per hour, before any tax is taken out.">?</span>';
            if (groupHourly) groupHourly.style.display = 'flex';
            if (groupSalary) groupSalary.style.display = 'none';
        }
        calculate();
    }

    // ── Copy breakdown ────────────────────────────────────────────────────────
    function copyBreakdown() {
        const over12   = isOver12();
        const annual   = resAnnual ? resAnnual.textContent : '-';
        const accrued  = resAccrued ? resAccrued.textContent : '-';
        const alt      = resAlt ? resAlt.textContent : '-';
        const ph       = resPH ? resPH.textContent : '-';
        const gross    = resGross ? resGross.textContent : '-';
        const tax      = resTax ? resTax.textContent : '-';
        const net      = resNet ? resNet.textContent : '-';

        const annualLine = over12 ? `Unused Holiday Days:   ${annual}\n` : '';
        const text = [
            'NZ Final Pay Estimate',
            '─────────────────────────────',
            annualLine + `8% Holiday Bonus:      ${accrued}`,
            `Days in Lieu Owed:     ${alt}`,
            `Public Holidays:       ${ph}`,
            '─────────────────────────────',
            `Total (Before Tax):    ${gross}`,
            `Estimated Tax (PAYE):  ${tax}`,
            `Estimated Net Pay:     ${net}`,
            '─────────────────────────────',
            'Estimate only — verify with your employer.',
            'Based on NZ Holidays Act 2003 | payout.nz',
        ].join('\n');

        navigator.clipboard.writeText(text).then(() => {
            const btn = document.getElementById('copy-results-btn');
            const orig = btn.innerHTML;
            btn.innerHTML = '<span>✅</span> Copied!';
            setTimeout(() => btn.innerHTML = orig, 2000);
        });
    }

    // ── Event listeners ───────────────────────────────────────────────────────
    radiosType.forEach(r  => r.addEventListener('change', toggleEmploymentType));
    radiosTenure.forEach(r => r.addEventListener('change', toggleTenure));

    if (lastDayInput) {
        flatpickr(lastDayInput, {
            altInput: true,
            altFormat: "d/m/Y",
            dateFormat: "Y-m-d",
            disableMobile: "true",
            onChange: function() {
                updatePublicHolidayInputVisibility();
                calculate();
            }
        });
    }

    if (annualLeaveInput) {
        annualLeaveInput.addEventListener('input', () => {
            updatePublicHolidayInputVisibility();
            calculate();
        });
    }

    [payRateInput, grossEarningsInput].forEach(el => {
        if (el) {
            el.addEventListener('input', (e) => {
                formatCurrencyInput(e.target);
                calculate();
            });
        }
    });

    [hoursPerDayInput, daysPerWeekInput,
     altLeaveInput, publicHolidaysInput, taxRateSelect
    ].forEach(el => {
        if (el) {
            el.addEventListener('input',  calculate);
            el.addEventListener('change', calculate);
        }
    });

    document.getElementById('copy-results-btn').addEventListener('click', copyBreakdown);

    // ── Initialise ────────────────────────────────────────────────────────────
    toggleTenure();
    toggleEmploymentType();
});
