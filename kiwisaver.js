document.addEventListener('DOMContentLoaded', () => {
    // ── Wizard Elements ──────────────────────────────────────────────────────
    const wizardSteps    = document.querySelectorAll('.wizard-step');
    const stepItems      = document.querySelectorAll('.step-item');
    const nextBtn        = document.querySelector('.next-step');
    const prevBtn        = document.querySelector('.prev-step');
    
    // Future Tab (Step 1)
    const balanceInput    = document.getElementById('currentBalance');
    const employerRadios  = document.getElementsByName('employerRate');
    const customEmpCont   = document.getElementById('emp-custom-container');
    const empRateCustom   = document.getElementById('employerRateCustom');
    const statusSelect    = document.getElementById('employmentStatus');
    const salaryInput     = document.getElementById('salary');
    const frequencySelect = document.getElementById('payFrequency');
    const ageSlider       = document.getElementById('currentAge');
    const ageVal          = document.getElementById('age-val');
    
    // Details Tab (Step 2)
    const fundSelect      = document.getElementById('fundType');
    const contribRadios   = document.getElementsByName('contribRate');
    const topupInput      = document.getElementById('topupAmount');
    const topupFreqSelect = document.getElementById('topupFrequency');
    const retireSlider    = document.getElementById('retireAge');
    const retireVal       = document.getElementById('retire-val');
    const inflationCheck  = document.getElementById('inflationToggle');
    
    // Outputs
    const resProjected    = document.getElementById('res-projected');
    const resAnnualTotal  = document.getElementById('res-annual-total');
    const resYouWeekly    = document.getElementById('res-you-weekly');
    const resYouMonthly   = document.getElementById('res-you-monthly');
    const resEmpWeekly    = document.getElementById('res-emp-weekly');
    const resEmpMonthly   = document.getElementById('res-emp-monthly');
    const resBigLabel     = document.getElementById('res-big-label');

    let ageTouched = false;

    // ── Navigation Logic ──────────────────────────────────────────────────────
    function goToStep(stepNumber) {
        wizardSteps.forEach(step => step.classList.remove('active'));
        stepItems.forEach(item => {
            const itemStep = parseInt(item.dataset.step);
            if (itemStep === stepNumber) item.classList.add('active');
            else if (itemStep < stepNumber) item.classList.add('completed'); // Optional style
            else item.classList.remove('active');
        });
        document.getElementById(`step-${stepNumber}`).classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (nextBtn) nextBtn.addEventListener('click', () => goToStep(2));
    if (prevBtn) prevBtn.addEventListener('click', () => goToStep(1));

    // Handle clicking the step indicators directly
    stepItems.forEach(item => {
        item.addEventListener('click', () => {
            const step = parseInt(item.dataset.step);
            goToStep(step);
        });
    });

    // ── Helpers ──────────────────────────────────────────────────────────────
    function formatCurrency(amount, skipCents = false) {
        return new Intl.NumberFormat('en-NZ', {
            style: 'currency',
            currency: 'NZD',
            maximumFractionDigits: skipCents ? 0 : 2
        }).format(amount);
    }

    function parseFormatted(val) {
        if (!val) return 0;
        return parseFloat(val.toString().replace(/,/g, '')) || 0;
    }

    function formatInput(input) {
        let value = input.value.replace(/[^0-9.]/g, '');
        const parts = value.split('.');
        if (parts.length > 2) value = parts[0] + '.' + parts.slice(1).join('');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        input.value = parts.length > 1 ? parts.join('.') : parts[0];
    }

    function getESCTRate(salary) {
        if (salary <= 16800) return 0.105;
        if (salary <= 57600) return 0.175;
        if (salary <= 84000) return 0.300;
        if (salary <= 216000) return 0.330;
        return 0.390;
    }

    // ── Calculation Logic ────────────────────────────────────────────────────
    function calculate() {
        const salaryText  = salaryInput.value.trim();
        const salary      = parseFormatted(salaryText);
        const balance     = parseFormatted(balanceInput.value);
        const status      = statusSelect.value;
        const currAge     = parseInt(ageSlider.value);
        const retAge      = parseInt(retireSlider.value);
        const inflation   = inflationCheck.checked;
        
        // Update Age Label
        ageVal.textContent = ageTouched ? `${currAge} years` : '-';
        retireVal.textContent = `${retAge} years`;

        // Handle Employer Contribution Visibility (Needs to be before early return)
        let empRate     = 0.03;
        let selectedEmp = '0.03';
        employerRadios.forEach(r => { if (r.checked) selectedEmp = r.value; });
        
        if (selectedEmp === 'other') {
            customEmpCont.style.display = 'block';
            let customVal = parseFloat(empRateCustom.value) || 0;
            if (customVal > 100) {
                customVal = 100;
                empRateCustom.value = 100;
            }
            empRate = customVal / 100;
        } else {
            customEmpCont.style.display = 'none';
            empRate = parseFloat(selectedEmp);
        }

        // Check for required inputs
        if (!salaryText || salary <= 0 || !ageTouched) {
            resProjected.textContent = '$0';
            resProjected.style.opacity = '0.3';
            resBigLabel.textContent = 'Enter salary & age to calculate';
            
            [resAnnualTotal, resYouWeekly, resYouMonthly, resEmpWeekly, resEmpMonthly].forEach(el => {
                if (el) el.textContent = '-';
            });
            return;
        }

        resProjected.style.opacity = '1';
        resBigLabel.textContent = `Projected Total at Retirement (age ${retAge})`;

        const fundRates = {
            defensive: 0.025,
            conservative: 0.040,
            balanced: 0.055,
            growth: 0.070,
            aggressive: 0.080
        };
        const rAnnual = fundRates[fundSelect.value] || 0.055;
        
        let myRate = 0.03;
        contribRadios.forEach(r => { if (r.checked) myRate = parseFloat(r.value); });

        const esct = getESCTRate(salary);
        const empRateNet = status === 'employed' ? (empRate * (1 - esct)) : 0;
        
        const myContribAnnual = status === 'employed' ? (salary * myRate) : 0;
        const empContribAnnual = status === 'employed' ? (salary * empRateNet) : 0;
        
        let govtContribAnnual = 0;
        if (currAge >= 18 && currAge < 65) {
            govtContribAnnual = Math.min(myContribAnnual * 0.5, 521.43);
        }

        const tuAmount = parseFormatted(topupInput.value);
        const tuFreq   = parseFloat(topupFreqSelect.value);
        const tuAnnual = tuAmount * tuFreq;

        const totalAnnualContrib = myContribAnnual + empContribAnnual + govtContribAnnual + tuAnnual;

        resYouWeekly.textContent = formatCurrency(myContribAnnual / 52);
        resYouMonthly.textContent = formatCurrency(myContribAnnual / 12);
        resEmpWeekly.textContent = status === 'employed' ? ('+' + formatCurrency(empContribAnnual / 52)) : '$0.00';
        resEmpMonthly.textContent = status === 'employed' ? ('+' + formatCurrency(empContribAnnual / 12)) : '$0.00';
        resAnnualTotal.textContent = formatCurrency(totalAnnualContrib);

        const years = retAge - currAge;
        let projected = 0;

        if (years > 0) {
            const n = 12; 
            const r = rAnnual;
            const t = years;
            const pmt = totalAnnualContrib / 12;

            const futureBalance = balance * Math.pow(1 + r/n, n * t);
            const futureContribs = pmt * (Math.pow(1 + r/n, n * t) - 1) / (r/n);
            
            projected = futureBalance + futureContribs;

            if (inflation) {
                projected = projected / Math.pow(1 + 0.02, years);
            }
        } else {
            projected = balance;
        }

        resProjected.textContent = formatCurrency(projected, true);
    }

    // ── Event Listeners ──────────────────────────────────────────────────────
    [balanceInput, salaryInput, topupInput].forEach(input => {
        input.addEventListener('input', (e) => {
            formatInput(e.target);
            calculate();
        });
    });

    ageSlider.addEventListener('input', () => {
        ageTouched = true;
        calculate();
    });

    [statusSelect, frequencySelect, fundSelect, 
     topupFreqSelect, retireSlider, inflationCheck, empRateCustom
    ].forEach(el => {
        el.addEventListener('input', calculate);
        el.addEventListener('change', calculate);
    });

    employerRadios.forEach(r => r.addEventListener('change', calculate));
    contribRadios.forEach(r => r.addEventListener('change', calculate));

    // Initial state
    calculate();
});
