document.addEventListener('DOMContentLoaded', () => {
    // Input elements
    const baseSalaryInput  = document.getElementById('baseSalary');
    const yearsServiceInput = document.getElementById('yearsService');
    const weeksPerYearInput = document.getElementById('weeksPerYear');
    const noticePayInput    = document.getElementById('noticePay');
    const taxBracketSelect  = document.getElementById('taxBracket');

    // Output elements
    const resCompValue    = document.getElementById('res-comp-value');
    const resCompDetail   = document.getElementById('res-comp-detail');
    const resNoticeValue  = document.getElementById('res-notice-value');
    const resGrossPayout  = document.getElementById('res-gross-payout');
    const resTaxValue      = document.getElementById('res-tax-value');
    const resNetPayout    = document.getElementById('res-net-payout');

    function fmt(amount) {
        return new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD' }).format(amount);
    }

    function formatCurrencyInput(input) {
        let value = input.value.replace(/[^0-9.]/g, '');
        const parts = value.split('.');
        if (parts.length > 2) value = parts[0] + '.' + parts.slice(1).join('');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        input.value = parts.length > 1 ? parts.join('.') : parts[0];
    }

    function parseFormattedValue(value) {
        if (!value) return 0;
        return parseFloat(value.toString().replace(/,/g, '')) || 0;
    }

    function updateTaxBracket(salary) {
        if (salary <= 14000) taxBracketSelect.value = "0.105";
        else if (salary <= 48000) taxBracketSelect.value = "0.175";
        else if (salary <= 70000) taxBracketSelect.value = "0.30";
        else if (salary <= 180000) taxBracketSelect.value = "0.33";
        else taxBracketSelect.value = "0.39";
    }

    function calculate() {
        const salary       = parseFormattedValue(baseSalaryInput.value);
        const years        = parseFloat(yearsServiceInput.value) || 0;
        const weeksPerYear = parseFloat(weeksPerYearInput.value) || 0;
        const noticeWeeks  = parseFloat(noticePayInput.value) || 0;
        const taxRate      = parseFloat(taxBracketSelect.value) || 0.30;

        const weeklyPay = salary / 52;
        const totalCompWeeks = years * weeksPerYear;
        const compValue = totalCompWeeks * weeklyPay;
        const noticeValue = noticeWeeks * weeklyPay;
        
        const grossTotal = compValue + noticeValue;
        const taxAmount = grossTotal * taxRate;
        const netTotal = grossTotal - taxAmount;

        // UI Reset
        if (salary <= 0) {
            [resCompValue, resNoticeValue, resGrossPayout, resTaxValue].forEach(el => el.textContent = '-');
            resCompDetail.textContent = 'Enter salary to calculate';
            resNetPayout.textContent = '$0.00';
            resNetPayout.style.cssText = 'font-size:1.2rem;background:none;-webkit-text-fill-color:#94a3b8;filter:none;';
            return;
        }

        resNetPayout.style.cssText = '';
        resCompValue.textContent   = fmt(compValue);
        resCompDetail.textContent  = `${totalCompWeeks.toFixed(1)} weeks @ ${fmt(weeklyPay)}/wk`;
        resNoticeValue.textContent = fmt(noticeValue);
        resGrossPayout.textContent = fmt(grossTotal);
        resTaxValue.textContent     = '-' + fmt(taxAmount);
        resNetPayout.textContent   = fmt(netTotal);
    }

    // Event listeners
    baseSalaryInput.addEventListener('input', (e) => {
        formatCurrencyInput(e.target);
        const salary = parseFormattedValue(e.target.value);
        updateTaxBracket(salary);
        calculate();
    });

    [yearsServiceInput, weeksPerYearInput, noticePayInput, taxBracketSelect].forEach(el => {
        el.addEventListener('input', calculate);
    });

    // Initial calc
    calculate();
});
