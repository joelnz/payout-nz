document.addEventListener('DOMContentLoaded', () => {
    const startDateInput = document.getElementById('startDate');
    const empTypeSelect = document.getElementById('empType');

    const resStatus = document.getElementById('res-status');
    const resAnniv = document.getElementById('res-anniv');
    const statusBox = document.getElementById('status-box');
    const statusLabel = document.getElementById('status-label');
    const statusDate = document.getElementById('status-date');

    function calculate() {
        if (!startDateInput.value) {
            statusLabel.textContent = 'Enter Start Date';
            statusDate.textContent = '➖';
            resStatus.textContent = '-';
            resAnniv.textContent = '-';
            statusBox.style.background = '';
            statusBox.style.borderColor = '';
            return;
        }

        const type = empTypeSelect.value;
        const startDate = new Date(startDateInput.value);
        const today = new Date();

        if (type === 'casual') {
            statusLabel.textContent = 'Casual Employment';
            statusDate.textContent = 'No 4-week Entitlement';
            statusDate.style.fontSize = '1.3rem';
            resStatus.textContent = 'Receive 8% PAYG on gross pay';
            resAnniv.textContent = 'Not Applicable';
            statusBox.style.background = 'linear-gradient(135deg, rgba(244, 63, 94, 0.08), rgba(244, 63, 94, 0.03))';
            statusBox.style.borderColor = 'rgba(244, 63, 94, 0.3)';
            statusLabel.style.color = '#f43f5e';
            return;
        }

        // Permanent/Fixed-term calculation
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
            statusLabel.style.color = '#2dd4bf';
            statusBox.style.background = 'linear-gradient(135deg, rgba(20, 184, 166, 0.08), rgba(2, 132, 199, 0.03))';
            statusBox.style.borderColor = 'rgba(20, 184, 166, 0.3)';
        } else {
            statusLabel.textContent = 'Entitlement unlocks on';
            statusDate.textContent = nextAnniversary.toLocaleDateString('en-NZ', options);
            statusDate.style.fontSize = '1.5rem';
            resStatus.textContent = 'Accruing (Under 12 Months)';
            statusLabel.style.color = '#38bdf8';
            statusBox.style.background = 'linear-gradient(135deg, rgba(56, 189, 248, 0.08), rgba(56, 189, 248, 0.03))';
            statusBox.style.borderColor = 'rgba(56, 189, 248, 0.3)';
        }

        resAnniv.textContent = nextAnniversary.toLocaleDateString('en-NZ', options);
    }

    flatpickr(startDateInput, {
        altInput: true,
        altFormat: "d/m/Y",
        dateFormat: "Y-m-d",
        disableMobile: "true",
        onChange: function() {
            calculate();
        }
    });

    empTypeSelect.addEventListener('change', calculate);
    startDateInput.addEventListener('input', calculate);
    startDateInput.addEventListener('change', calculate);

    calculate(); // Initial
});
