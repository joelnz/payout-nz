import sys, re

def generate_faq_html(faqs):
    if not faqs:
        return ""
    
    faq_html = """
        <section class="card faq-section">
            <div class="faq-header">
                <h2>Frequently Asked Questions</h2>
                <p>Common clarifications and helpful advice for non-experts.</p>
            </div>
            <div class="faq-list">"""
    
    for q, a in faqs:
        faq_html += f"""
                <details class="faq-item">
                    <summary>{q}</summary>
                    <div class="faq-content">
                        <p>{a}</p>
                    </div>
                </details>"""
                
    faq_html += """
            </div>
        </section>"""
    return faq_html

def generate():
    try:
        with open("index.html", "r") as f:
            html = f.read()
    except FileNotFoundError:
        print("Error: index.html not found.")
        return

    # Find master boundaries
    idx_start = html.find("<div class=\"calculator-grid\">")
    idx_end = html.find("<div class=\"lead-gen-header\">")

    if idx_start == -1 or idx_end == -1:
        print("Could not find boundaries in index.html")
        return

    base_head = html[:idx_start]
    base_tail = html[idx_end:]
    
    # Strip the generic FAQ section from base_tail to avoid duplicates on sub-pages
    base_tail = re.sub(r'<section class="card faq-section">.*?</section>', '', base_tail, flags=re.DOTALL)

    # --- SHARED NAVIGATION ---
    nav_html = """
                <a href="index.html" class="nav-pill">Final Pay</a>
                <a href="pay-calculator.html" class="nav-pill">Take-Home Pay</a>
                <a href="leave-entitlement.html" class="nav-pill">Holiday Pay & Leave</a>
                <a href="kiwisaver.html" class="nav-pill">KiwiSaver</a>
                <a href="redundancy.html" class="nav-pill">Redundancy</a>
                <a href="minimum-wage.html" class="nav-pill">Minimum Wage</a>
    """
    base_head = re.sub(r'<div class="nav-links" id="nav-links">.*?</div>', 
                       f'<div class="nav-links" id="nav-links">{nav_html}</div>', 
                       base_head, flags=re.DOTALL)

    # --- PAGE DEFINITIONS ---
    PAGES = {
        "minimum-wage.html": {
            "title": "NZ Minimum Wage Checker 2026",
            "description": "Check if you are being paid the correct New Zealand minimum wage (Adult, Training, or Starting-out) for 2026.",
            "h1": "NZ Minimum Wage Checker",
            "subtitle": "Quickly check if your hourly rate meets New Zealand minimum wage laws (Updated for 2026 rates).",
            "assurance": "Based on the <strong>Minimum Wage Act 1983</strong>",
            "mascot": "mascot-min-wage.png",
            "script": "minimum-wage.js",
            "calc_html": """<div class="calculator-grid">
            <section class="card input-section">
                <form id="minimum-wage-form" onsubmit="event.preventDefault();">
                    <div class="form-group">
                        <label for="wageType">Minimum Wage Category</label>
                        <div class="select-wrapper">
                            <select id="wageType">
                                <option value="adult" selected>Adult ($23.95/hr) - 16 yrs or over</option>
                                <option value="starting">Starting-out ($19.16/hr) - 16/17 yrs</option>
                                <option value="training">Training ($19.16/hr) - Apprentices</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="hourlyRate">Your Hourly Rate (NZD) *</label>
                        <div class="input-wrapper">
                            <span class="prefix material-symbols-outlined">attach_money</span>
                            <input type="number" id="hourlyRate" class="has-prefix" placeholder="0" min="0" max="5000" step="0.01">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="hoursPerWeek">Hours Worked per Week <span class="tooltip-icon" data-tip="Used to calculate your total weekly and annual earnings.">?</span></label>
                        <input type="number" id="hoursPerWeek" value="40" min="0" max="168" step="0.5">
                    </div>
                </form>
            </section>
            <section class="card results-section">
                <h2>Wage Assessment</h2>
                <div class="net-total-box" id="status-box" style="padding: 1.5rem;">
                    <span class="net-label" id="status-label">Enter your rate</span>
                    <span class="net-value" id="status-icon" style="font-size: 2.5rem; margin-top: 0.5rem;">➖</span>
                </div>
                <div class="result-list">
                    <div class="result-item">
                        <span class="result-label">Legal Minimum Rate</span>
                        <span class="result-value" id="res-min-rate">$0.00 / hr</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Difference</span>
                        <span class="result-value" id="res-diff">$0.00 / hr</span>
                    </div>
                    <div class="divider"></div>
                    <div class="result-item gross-total">
                        <span class="result-label">Weekly Equivalent (Gross)</span>
                        <span class="result-value" id="res-weekly">$0.00</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Annual Equivalent (Gross)</span>
                        <span class="result-value" id="res-annual">$0.00</span>
                    </div>
                </div>
                <div class="disclaimers">
                    <p><strong>⚠️ Legal Disclaimer:</strong> This tool provides an estimate based on April 2026 minimum wage figures. Rates typically change every April.</p>
                </div>
            </section>
        </div>""",
            "faqs": [
                ("Can I be paid less than minimum wage on a trial period?", "No. Minimum wage laws apply to the trial period just like any other time. Your employer cannot legally pay you less than the minimum for your age category during a 90-day trial."),
                ("What if I'm on a salary, not an hourly rate?", "Even if you are salaried, your total pay divided by the hours you work must meet the legal minimum for every hour. If you are doing significant overtime that drops your effective rate below minimum wage, your employer is likely in breach."),
                ("Does minimum wage apply to commission or piece-rates?", "Yes. If you work on commission or 'per unit', your employer must still ensure your total take-home pay for the pay period at least equals the minimum wage for the number of hours you worked."),
                ("Does the rate include tax?", "No. The legal minimum wage rates ($23.95 for adults) are 'Gross' amounts, meaning before PAYE tax, ACC, and KiwiSaver deductions are taken out."),
                ("What if my boss says they can't afford the new 2026 rate?", "Economic hardship does not exempt an employer from the Minimum Wage Act. They are legally required to pay the current rate. If they don't, you can contact Employment New Zealand for assistance."),
                ("Does this apply to contractors or freelancers?", "Minimum wage laws only apply to 'employees'. However, if your boss controls your hours and tools, you might legally be an employee regardless of what your contract says.")
            ]
        },
        "leave-entitlement.html": {
            "title": "NZ Holiday Pay & Annual Leave Calculator",
            "description": "Calculate your NZ holiday pay (8% of gross) or find your annual leave entitlement date. Essential for casual workers.",
            "h1": "NZ Holiday Pay & Leave",
            "subtitle": "Calculate your 8% holiday pay payout or check when you become entitled to 4 weeks of annual leave.",
            "assurance": "Based on the <strong>NZ Holidays Act 2003</strong>",
            "mascot": "mascot-holiday.png",
            "script": "leave-entitlement.js",
            "calc_html": """<div class="calculator-grid">
            <section class="card input-section">
                <form id="leave-form" onsubmit="event.preventDefault();">
                    <div class="form-group">
                        <label>What would you like to calculate?</label>
                        <div class="segmented-control" id="calc-mode-selector">
                            <input type="radio" id="mode-8percent" name="calcMode" value="8percent" checked>
                            <label for="mode-8percent">8% Holiday Pay</label>
                            <input type="radio" id="mode-anniversary" name="calcMode" value="anniversary">
                            <label for="mode-anniversary">Entitlement Date</label>
                        </div>
                    </div>
                    <div id="section-8percent">
                        <div class="form-group">
                            <label for="grossEarnings">Total Gross Earnings (NZD) <span class="tooltip-icon" data-tip="Enter your total before-tax earnings for the period. Holiday pay is 8% of this total.">?</span></label>
                            <div class="input-wrapper">
                                <span class="prefix material-symbols-outlined">attach_money</span>
                                <input type="text" id="grossEarnings" class="has-prefix" placeholder="0" max="10000000">
                            </div>
                            <small class="hint">Your total pay before tax during the employment period</small>
                        </div>
                    </div>
                    <div id="section-anniversary" style="display: none;">
                        <div class="form-group">
                            <label for="startDate">Your Start Date *</label>
                            <input type="text" id="startDate" placeholder="dd/mm/yyyy">
                        </div>
                    </div>
                </form>
            </section>
            <section class="card results-section">
                <div id="results-8percent">
                    <h2>Estimated Payout</h2>
                    <div class="net-total-box" style="padding: 2.5rem;">
                        <span class="net-label">8% Holiday Pay (Gross)</span>
                        <span class="net-value" id="res-8percent">$0.00</span>
                    </div>
                </div>
                <div id="results-anniversary" style="display: none;">
                    <h2>Entitlement Status</h2>
                    <div class="net-total-box" id="status-box" style="padding: 1.5rem;">
                        <span class="net-label" id="status-label">Enter Start Date</span>
                        <span class="net-value" id="status-date" style="font-size: 2rem; margin-top: 0.5rem;">➖</span>
                    </div>
                </div>
            </section>
        </div>""",
            "faqs": [
                ("What is the difference between Holiday Pay and Annual Leave?", "'Holiday Pay' (the 8% rule) usually applies to casual workers or those reaching the end of a job. 'Annual Leave' refers to the 4 weeks of time-off you become entitlement to after working for 1 year."),
                ("I've worked less than 12 months. What am I owed?", "If you leave your job before your 1-year anniversary, you are generally owed 8% of your total gross earnings from that job as a cash payout."),
                ("Can I take my leave before my 1-year anniversary?", "Technically, you don't 'own' it yet. Taking leave before 12 months is called 'Leave in Advance'. Your employer doesn't have to agree to it, but many do to keep staff happy."),
                ("Can my employer force me to take my annual leave?", "Yes, but only if you cannot agree on when to take it and they give you at least 14 days' notice. This often happens during 'Christmas close-downs'."),
                ("Can I 'cash up' my annual leave for money?", "The law allows you to ask to cash up to 1 week of your 4 weeks' annual holiday per year, but your employer has the right to say no."),
                ("What is an 'Alternative Holiday'?", "Commonly called a 'day in lieu', this is an extra day off you earn for working on a public holiday that falls on a day you would normally work.")
            ]
        },
        "kiwisaver.html": {
            "title": "NZ KiwiSaver Contribution Estimator",
            "description": "Estimate your KiwiSaver weekly/monthly contributions and projected balance at retirement age in New Zealand.",
            "h1": "NZ KiwiSaver Estimator",
            "subtitle": "Calculate your personal and employer KiwiSaver contributions and see a simple projected balance by age 65.",
            "assurance": "Based on standard guidance from the <strong>KiwiSaver Act 2006</strong>",
            "mascot": "mascot-kiwisaver.png",
            "script": "kiwisaver.js",
            "calc_html": """<div class="calculator-grid">
            <section class="card input-section">
                <div class="wizard-nav">
                    <div class="step-item active" data-step="1">
                        <span class="step-num">1</span>
                        <span class="step-text">Profile</span>
                    </div>
                    <div class="step-line"></div>
                    <div class="step-item" data-step="2">
                        <span class="step-num">2</span>
                        <span class="step-text">Savings</span>
                    </div>
                </div>
                <form id="kiwisaver-form" onsubmit="event.preventDefault();">
                    <div class="wizard-step active" id="step-1">
                        <div class="form-group">
                            <label for="employmentStatus">Employment Status</label>
                            <div class="select-wrapper">
                                <select id="employmentStatus">
                                    <option value="employed" selected>Employed (PAYE)</option>
                                    <option value="self-employed">Self-Employed / Other</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="salary">Annual Gross Salary / Wages (NZD) *</label>
                            <div class="input-wrapper">
                                <span class="prefix material-symbols-outlined">attach_money</span>
                                <input type="text" id="salary" class="has-prefix" placeholder="0" max="10000000">
                            </div>
                            <div class="select-wrapper" style="margin-top: 0.5rem;">
                                <select id="payFrequency">
                                    <option value="52">Weekly</option>
                                    <option value="26">Fortnightly</option>
                                    <option value="12">Monthly</option>
                                    <option value="1" selected>Annual</option>
                                </select>
                            </div>
                            <small class="hint">Include bonuses and overtime (as per KS4 April 2026 guide).</small>
                        </div>
                        <div class="form-group">
                            <label for="currentAge">Your Current Age: <span id="age-val" class="value-display">-</span></label>
                            <input type="range" id="currentAge" min="18" max="65" value="30" class="styled-range">
                        </div>
                        <div class="wizard-actions">
                            <button type="button" class="btn-primary next-step">Next: Strategy <span class="material-symbols-outlined">arrow_forward</span></button>
                        </div>
                    </div>
                    <div class="wizard-step" id="step-2">
                        <div class="form-group">
                            <label for="currentBalance">Current KiwiSaver Balance (Optional)</label>
                            <div class="input-wrapper">
                                <span class="prefix material-symbols-outlined">account_balance_wallet</span>
                                <input type="text" id="currentBalance" class="has-prefix" placeholder="0" max="1000000000">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Your Contribution Rate</label>
                            <div class="radio-group horizontal">
                                <input type="radio" id="cr-3" name="contribRate" value="0.03">
                                <label for="cr-3">3%</label>
                                <input type="radio" id="cr-3.5" name="contribRate" value="0.035" checked>
                                <label for="cr-3.5">3.5%</label>
                                <input type="radio" id="cr-4" name="contribRate" value="0.04">
                                <label for="cr-4">4%</label>
                                <input type="radio" id="cr-6" name="contribRate" value="0.06">
                                <label for="cr-6">6%</label>
                                <input type="radio" id="cr-10" name="contribRate" value="0.10">
                                <label for="cr-10">10%</label>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="fundType">KiwiSaver Fund Type</label>
                            <div class="select-wrapper">
                                <select id="fundType">
                                    <option value="defensive">Defensive (2.5%)</option>
                                    <option value="conservative">Conservative (4.0%)</option>
                                    <option value="balanced" selected>Balanced (5.5%)</option>
                                    <option value="growth">Growth (7.0%)</option>
                                    <option value="aggressive">Aggressive (8.0%)</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Employer Contribution Rate</label>
                            <div class="radio-group horizontal">
                                <input type="radio" id="er-3" name="employerRate" value="0.03">
                                <label for="er-3">3%</label>
                                <input type="radio" id="er-3.5" name="employerRate" value="0.035" checked>
                                <label for="er-3.5">3.5%</label>
                                <input type="radio" id="er-other" name="employerRate" value="other">
                                <label for="er-other">Other</label>
                            </div>
                            <div id="emp-custom-container" style="display: none; margin-top: 0.5rem;">
                                <div class="input-wrapper">
                                    <input type="number" id="employerRateCustom" placeholder="Enter %" min="0" max="100" step="0.1">
                                    <span class="suffix">%</span>
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="topupAmount">Voluntary Top-ups (Optional)</label>
                            <div class="input-wrapper">
                                <span class="prefix material-symbols-outlined">payments</span>
                                <input type="text" id="topupAmount" class="has-prefix" placeholder="0" max="1000000">
                            </div>
                            <div class="select-wrapper" style="margin-top: 0.5rem;">
                                <select id="topupFrequency">
                                    <option value="52">Weekly</option>
                                    <option value="26">Fortnightly</option>
                                    <option value="12">Monthly</option>
                                    <option value="1">Once a year</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="retireAge">Retirement Age: <span id="retire-val" class="value-display">65 years</span></label>
                            <input type="range" id="retireAge" min="65" max="80" value="65" class="styled-range">
                        </div>

                        <div class="form-group">
                            <label class="toggle-container">
                                <div class="toggle-text">Adjust for Inflation (2% p.a.)</div>
                                <input type="checkbox" id="inflationToggle" checked>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        <div class="wizard-actions">
                            <button type="button" class="btn-secondary prev-step"><span class="material-symbols-outlined">arrow_back</span> Back</button>
                        </div>
                    </div>
                </form>
            </section>
            <section class="card results-section">
                <h2>Projected Outcome</h2>
                <div class="net-total-box" style="padding: 1.5rem; text-align: center;">
                    <span class="net-label" id="res-big-label">Projected Total at Age 65</span>
                    <span class="net-value" id="res-projected" style="font-size: 3rem;">$0</span>
                </div>
                <div class="result-list">
                    <div class="result-item">
                        <span class="result-label">Total Annual Contributions</span>
                        <span class="result-value" id="res-annual-total">$0.00</span>
                    </div>
                    <div class="divider"></div>
                    <div class="result-item">
                        <span class="result-label">Your Deduction (Weekly)</span>
                        <span class="result-value" id="res-you-weekly">$0.00</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Your Deduction (Monthly)</span>
                        <span class="result-value" id="res-you-monthly">$0.00</span>
                    </div>
                    <div class="divider"></div>
                    <div class="result-item">
                        <span class="result-label">Employer Contrib (Weekly)*</span>
                        <span class="result-value" id="res-emp-weekly">+$0.00</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Employer Contrib (Monthly)*</span>
                        <span class="result-value" id="res-emp-monthly">+$0.00</span>
                    </div>
                </div>
            </section>
        </div>""",
            "faqs": [
                ("How much does my employer have to contribute?", "If you are a KiwiSaver member and contributing from your pay, your employer must generally contribute at least 3.5% of your gross pay (as of April 2026), provided you are between 18 and 65 years old."),
                ("What is the Government contribution?", "If you are 18 or older and live in NZ, the government will contribute 50 cents for every dollar you contribute, up to a maximum of $260.72 per year (starting 2026)."),
                ("Can I stop my KiwiSaver contributions?", "Yes. After you've been a member for 12 months, you can apply for a 'savings suspension' for between 3 months and 1 year via your myIR account."),
                ("Can I use my KiwiSaver to buy my first home?", "Yes! If you've been a member for at least 3 years, you can usually withdraw almost all of your balance (leaving $1,000) to help with a deposit."),
                ("What happens if I move overseas permanently?", "If you move to a country other than Australia, you can usually withdraw your funds after living abroad for 1 year, though you won't get the government's contributions."),
                ("Is my money safe in KiwiSaver?", "Your funds are held by private providers (like banks or investment firms), not the government. While markets can go up and down, these providers are strictly regulated.")
            ]
        },
        "redundancy.html": {
            "title": "NZ Redundancy Pay Calculator | Compensation Estimate",
            "description": "Estimate your NZ redundancy payout including compensation weeks, notice period pay, and tax on lump sum payments.",
            "h1": "NZ Redundancy Pay Calculator",
            "subtitle": "Calculate your estimated redundancy compensation and see the tax impact on your lump sum payout.",
            "assurance": "Based on standard <strong>NZ Employment Law</strong> & IRD Tax Rules",
            "mascot": "mascot-redundancy.png",
            "script": "redundancy.js",
            "calc_html": """<div class="calculator-grid">
            <section class="card input-section">
                <form id="redundancy-form" onsubmit="event.preventDefault();">
                    <div class="form-group">
                        <label for="baseSalary">Current Annual Salary (Gross NZD) *</label>
                        <div class="input-wrapper">
                            <span class="prefix material-symbols-outlined">attach_money</span>
                            <input type="text" id="baseSalary" class="has-prefix" placeholder="0" max="10000000">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="yearsService">Years of Service</label>
                        <input type="number" id="yearsService" value="1" min="0" max="100">
                    </div>
                    <div class="form-group">
                        <label for="weeksPerYear">Weeks of Pay per Year</label>
                        <input type="number" id="weeksPerYear" value="4" min="0" max="52" step="0.5">
                    </div>
                    <div class="form-group">
                        <label for="noticePay">Notice Period to be Paid Out (Weeks) <span class="tooltip-icon" data-tip="If your employer is paying you 'in lieu of notice' rather than having you work your notice period, enter how many weeks of notice you are being paid for.">?</span></label>
                        <input type="number" id="noticePay" value="0" min="0" max="52" step="1">
                    </div>
                    <div class="form-group">
                        <label for="taxBracket">Your Tax Bracket (for Lump Sum)</label>
                        <div class="select-wrapper">
                            <select id="taxBracket">
                                <option value="0.105">10.5% (Under $14k)</option>
                                <option value="0.175">17.5% ($14k - $48k)</option>
                                <option value="0.30" selected>30% ($48k - $70k)</option>
                                <option value="0.33">33% ($70k - $180k)</option>
                                <option value="0.39">39% (Over $180k)</option>
                            </select>
                        </div>
                        <small class="hint">Redundancy is taxed as "Extra Pay" based on your total annual income.</small>
                    </div>
                </form>
            </section>
            <section class="card results-section">
                <h2>Payout Breakdown</h2>
                <div class="result-list">
                    <div class="result-item">
                        <span class="result-label">Base Compensation</span>
                        <span class="result-value" id="res-comp-value">$0.00</span>
                        <small class="hint" id="res-comp-detail">0 weeks @ $0/wk</small>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Payment in Lieu of Notice</span>
                        <span class="result-value" id="res-notice-value">$0.00</span>
                    </div>
                    <div class="divider"></div>
                    <div class="result-item gross-total">
                        <span class="result-label">Total Gross Payout</span>
                        <span class="result-value" id="res-gross-payout">$0.00</span>
                    </div>
                    <div class="result-item tax-deduction">
                        <span class="result-label">Estimated Tax (PAYE)</span>
                        <span class="result-value" id="res-tax-value">-$0.00</span>
                    </div>
                </div>
                <div class="net-total-box">
                    <span class="net-label">Estimated Net Redundancy</span>
                    <span class="net-value" id="res-net-payout">$0.00</span>
                </div>
            </section>
        </div>""",
            "faqs": [
                ("Is redundancy pay legally required in NZ?", "No. There is no legal requirement to pay redundancy compensation in NZ unless it is explicitly written in your employment agreement (contract)."),
                ("How is redundancy pay taxed?", "It is treated as 'Extra Pay' and taxed at your marginal rate (PAYE). However, it is not subject to ACC levies or KiwiSaver deductions unless you choose to."),
                ("What is 'Notice in Lieu'?", "This is when your employer pays you for your notice period instead of requiring you to work it. You effectively finish immediately but get paid as if you worked the notice weeks."),
                ("Can I be made redundant while on sick leave?", "Yes, but the company must follow a fair process. Redundancy is about the 'role' being unnecessary, not your personal situation or performance."),
                ("Will redundancy affect my student loan?", "Yes. Deductions will be taken from your total gross payout at the standard 12% rate for everything over the threshold."),
                ("What if I find another job before my redundancy date?", "You can ask for an earlier finish date, but technically you are bound by your notice period. Many employers will agree to an early exit to save on costs.")
            ]
        },
        "pay-calculator.html": {
            "title": "NZ Take-Home Pay Calculator | 2026 Tax Estimate",
            "description": "Calculate your NZ weekly take-home pay for 2026. Includes PAYE tax, ACC, and student loans.",
            "h1": "NZ Take-Home Pay Calculator",
            "subtitle": "See exactly how much lands in your bank account after PAYE, ACC, and student loans.",
            "assurance": "Updated for <strong>2026 IRD Tax Rates</strong>",
            "mascot": "mascot-pay.png",
            "script": "pay-calculator.js",
            "calc_html": None, # Special extraction logic below
            "faqs": [
                ("What is the ACC levy in 2026?", "The ACC earners' levy for the 2025/26 year is 1.75% of your gross income, capped at a maximum liable income of $156,641."),
                ("Does this accountant for Student Loans?", "Yes. If selected, the calculator applies the 12% deduction on everything you earn over the weekly threshold ($464 per week)."),
                ("What is the Independent Earner Tax Credit (IETC)?", "It is a tax credit of up to $10 per week for people earning between $24,000 and $70,000 who don't receive other benefits."),
                ("Why does my first pay look lower than expected?", "New employees are often on an 'Emergency' or 'Standard' tax code until their details are fully processed. Ensure you've submitted your IR330 form correctly."),
                ("Is my 'Gross Pay' different from my 'Taxable Pay'?", "Yes, sometimes. Certain deductions like KiwiSaver are taken out after tax, whereas other specific allowances might be non-taxable."),
                ("Does this calculator handle the 3.5% KiwiSaver rate?", "Yes. We have updated the calculations to reflect the mandatory 3.5% employer contribution rate coming into effect in April 2026.")
            ]
        }
    }

    # Helper to get the Pay Calculator unique content
    try:
        with open("pay-calculator.html", "r") as f:
            pay_orig = f.read()
            p_start = pay_orig.find("<div class=\"calculator-grid\">")
            p_end = pay_orig.find("<div class=\"lead-gen-header\">")
            if p_start != -1 and p_end != -1:
                PAGES["pay-calculator.html"]["calc_html"] = pay_orig[p_start:p_end]
    except:
        pass

    # --- EXECUTION LOOP ---
    for filename, data in PAGES.items():
        print(f"Generating {filename}...")
        
        # Start with fresh head/tail for the page
        head = base_head
        tail = base_tail
        
        # replacements
        head = head.replace("<title>NZ Final Pay Calculator | New Zealand Holiday Pay Estimate</title>", f"<title>{data['title']}</title>")
        head = head.replace("<meta name=\"description\" content=\"Helps estimate your final pay when leaving a job in New Zealand. Includes unused leave, public holiday payouts, and estimated tax.\">", f"<meta name=\"description\" content=\"{data['description']}\">")
        head = head.replace("<h1>NZ Final Pay Calculator</h1>", f"<h1>{data['h1']}</h1>")
        head = head.replace("<p class=\"subtitle\">Estimate your final pay when leaving a job in New Zealand. See how much you're owed for unused leave and public holidays.</p>", f"<p class=\"subtitle\">{data['subtitle']}</p>")
        head = head.replace("Based on the <strong>NZ Holidays Act 2003</strong>", data['assurance'])
        head = head.replace("mascot-final-pay.png", data['mascot'])
        
        # Build the full page content
        calc_content = data['calc_html'] if data['calc_html'] else "<!-- Content Missing -->"
        faq_content = generate_faq_html(data['faqs'])
        
        # Inject script name
        tail = tail.replace("script.js", data['script'])
        
        # Build final block
        full_content = calc_content + "\n" + faq_content
        
        # Assemble
        with open(filename, "w") as f:
            f.write(head + full_content + tail)

    print("Success: All pages rebuilt safely.")

if __name__ == "__main__":
    generate()
