import sys, re

def generate():
    with open("index.html", "r") as f:
        html = f.read()

    # Find boundaries
    idx_start = html.find("<div class=\"calculator-grid\">")
    idx_end = html.find("<div class=\"lead-gen-header\">")

    if idx_start == -1 or idx_end == -1:
        print("Could not find boundaries")
        return

    base_head = html[:idx_start]
    base_tail = "\n        " + html[idx_end:]

    # --- MINIMUM WAGE ---
    min_head = base_head.replace("<title>NZ Final Pay Calculator (New Zealand Leave Payout Estimate)</title>", "<title>NZ Minimum Wage Checker 2024</title>")
    min_head = min_head.replace("<meta name=\"description\" content=\"Helps estimate your final pay when leaving a job in New Zealand. Includes unused leave, public holiday payouts, and estimated tax.\">", "<meta name=\"description\" content=\"Check if you are being paid the correct New Zealand minimum wage (Adult, Training, or Starting-out), and see your weekly/annual equivalent.\">")
    min_head = min_head.replace("<h1>NZ Final Pay Calculator</h1>", "<h1>Minimum Wage Checker</h1>")
    min_head = min_head.replace("<p class=\"subtitle\">Estimate your final pay when leaving a job in New Zealand. See how much you're owed for unused leave and public holidays.</p>", "<p class=\"subtitle\">Quickly check if your hourly rate meets New Zealand minimum wage laws (Updated for 2024 rates).</p>")
    min_head = min_head.replace("💡 Based on standard provisions of the <strong>NZ Holidays Act 2003</strong>", "💡 Based on the <strong>NZ Minimum Wage Act 1983</strong>")

    min_calc = """<div class="calculator-grid">
            <section class="card input-section">
                <form id="minimum-wage-form" onsubmit="event.preventDefault();">
                    <div class="form-group">
                        <label for="wageType">Minimum Wage Category</label>
                        <div class="select-wrapper">
                            <select id="wageType">
                                <option value="adult" selected>Adult ($23.15/hr) - 16 yrs or over</option>
                                <option value="starting">Starting-out ($18.52/hr) - 16/17 yrs</option>
                                <option value="training">Training ($18.52/hr) - Apprentices</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="hourlyRate">Your Hourly Rate (NZD) *</label>
                        <div class="input-wrapper">
                            <span class="prefix">$</span>
                            <input type="number" id="hourlyRate" placeholder="0" min="0" step="0.01">
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
                    <p><strong>⚠️ Legal Disclaimer:</strong> This tool provides an estimate based on 2024 minimum wage figures. Rates typically change every April.</p>
                </div>
            </section>
        </div>"""

    min_tail = base_tail.replace("script.js", "minimum-wage.js").replace('href="https://payout.nz/"', 'href="https://payout.nz/minimum-wage.html"')
    min_tail = re.sub(r"<section class=\"card faq-section\">.*?</section>", "", min_tail, flags=re.DOTALL)

    with open("minimum-wage.html", "w") as f:
        f.write(min_head + min_calc + min_tail)


    # --- LEAVE ENTITLEMENT ---
    leave_head = base_head.replace("<title>NZ Final Pay Calculator (New Zealand Leave Payout Estimate)</title>", "<title>NZ Annual Leave Entitlement Calculator</title>")
    leave_head = leave_head.replace("<meta name=\"description\" content=\"Helps estimate your final pay when leaving a job in New Zealand. Includes unused leave, public holiday payouts, and estimated tax.\">", "<meta name=\"description\" content=\"Calculate your annual leave true entitlement date under NZ law and see how much leave you currently own.\">")
    leave_head = leave_head.replace("<h1>NZ Final Pay Calculator</h1>", "<h1>Annual Leave Entitlement Calculator</h1>")
    leave_head = leave_head.replace("<p class=\"subtitle\">Estimate your final pay when leaving a job in New Zealand. See how much you're owed for unused leave and public holidays.</p>", "<p class=\"subtitle\">Find out exactly when you become legally entitled to your 4 weeks of paid annual leave.</p>")
    
    leave_calc = """<div class="calculator-grid">
            <section class="card input-section">
                <form id="leave-form" onsubmit="event.preventDefault();">
                    <div class="form-group">
                        <label for="empType">Employment Type</label>
                        <div class="select-wrapper">
                            <select id="empType">
                                <option value="permanent" selected>Permanent (Full/Part-time) or Fixed-Term</option>
                                <option value="casual">Casual</option>
                            </select>
                        </div>
                        <small class="hint">Casual workers typically receive 8% holiday pay "pay-as-you-go" instead of 4 weeks leave.</small>
                    </div>

                    <div class="form-group">
                        <label for="startDate">Your Start Date *</label>
                        <input type="date" id="startDate" required>
                    </div>
                </form>
            </section>

            <section class="card results-section">
                <h2>Your Entitlement</h2>
                
                <div class="net-total-box" id="status-box" style="padding: 1.5rem;">
                    <span class="net-label" id="status-label">Enter Start Date</span>
                    <span class="net-value" id="status-date" style="font-size: 2rem; margin-top: 0.5rem;">➖</span>
                </div>

                <div class="result-list">
                    <div class="result-item">
                        <span class="result-label">Status</span>
                        <span class="result-value" id="res-status">-</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Next Anniversary</span>
                        <span class="result-value" id="res-anniv">-</span>
                    </div>
                </div>

                <div class="disclaimers">
                    <p><strong>⚠️ Legal Note:</strong> You only become formally entitled to 4 weeks paid leave upon reaching 12 continuous months of employment. Before then, you are accumulating it, but the employer does not legally have to let you take it unless agreed.</p>
                </div>
            </section>
        </div>"""

    leave_tail = base_tail.replace("script.js", "leave-entitlement.js").replace('href="https://payout.nz/"', 'href="https://payout.nz/leave-entitlement.html"')
    leave_tail = re.sub(r"<section class=\"card faq-section\">.*?</section>", "", leave_tail, flags=re.DOTALL)

    with open("leave-entitlement.html", "w") as f:
        f.write(leave_head + leave_calc + leave_tail)


    # --- KIWISAVER ---
    kiwi_head = base_head.replace("<title>NZ Final Pay Calculator (New Zealand Leave Payout Estimate)</title>", "<title>NZ KiwiSaver Contribution Estimator</title>")
    kiwi_head = kiwi_head.replace("<meta name=\"description\" content=\"Helps estimate your final pay when leaving a job in New Zealand. Includes unused leave, public holiday payouts, and estimated tax.\">", "<meta name=\"description\" content=\"Estimate your KiwiSaver weekly/monthly contributions and projected balance at retirement age in New Zealand.\">")
    kiwi_head = kiwi_head.replace("<h1>NZ Final Pay Calculator</h1>", "<h1>KiwiSaver Estimator</h1>")
    kiwi_head = kiwi_head.replace("<p class=\"subtitle\">Estimate your final pay when leaving a job in New Zealand. See how much you're owed for unused leave and public holidays.</p>", "<p class=\"subtitle\">Calculate your personal and employer KiwiSaver contributions and see a simple projected balance by age 65.</p>")
    kiwi_head = kiwi_head.replace("💡 Based on standard provisions of the <strong>NZ Holidays Act 2003</strong>", "💡 Based on standard guidance from the <strong>KiwiSaver Act 2006</strong>")

    kiwi_calc = """<div class="calculator-grid">
            <section class="card input-section">
                <form id="kiwisaver-form" onsubmit="event.preventDefault();">
                    <div class="form-group">
                        <label for="salary">Your Annual Salary / Wages (Gross NZD) *</label>
                        <div class="input-wrapper">
                            <span class="prefix">$</span>
                            <input type="number" id="salary" placeholder="0" min="0" step="1">
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="contribRate">Your Contribution Rate</label>
                        <div class="select-wrapper">
                            <select id="contribRate">
                                <option value="0.03" selected>3% (Minimum)</option>
                                <option value="0.04">4%</option>
                                <option value="0.06">6%</option>
                                <option value="0.08">8%</option>
                                <option value="0.10">10%</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="currentAge">Your Current Age</label>
                        <input type="number" id="currentAge" value="30" min="18" max="65">
                    </div>
                </form>
            </section>

            <section class="card results-section">
                <h2>Growth & Contributions</h2>
                
                <div class="net-total-box" id="status-box" style="padding: 1.5rem;">
                    <span class="net-label">Total Contributed Each Year</span>
                    <span class="net-value" id="res-annual-total">$0.00</span>
                </div>

                <div class="result-list">
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
                    <div class="divider"></div>
                    <div class="result-item gross-total">
                        <span class="result-label">Projected Total at Age 65</span>
                        <span class="result-value" id="res-projected">$0</span>
                    </div>
                </div>

                <div class="disclaimers">
                    <p><strong>⚠️ Estimate Only:</strong> Employer contributions are generally 3% but are subject to Employer Superannuation Contribution Tax (ESCT). Projections assume a 5% conservative annual return with 0 current balance. Returns and inflation are not guaranteed.</p>
                </div>
            </section>
        </div>"""

    kiwi_tail = base_tail.replace("script.js", "kiwisaver.js").replace('href="https://payout.nz/"', 'href="https://payout.nz/kiwisaver.html"')
    kiwi_tail = re.sub(r"<section class=\"card faq-section\">.*?</section>", "", kiwi_tail, flags=re.DOTALL)

    with open("kiwisaver.html", "w") as f:
        f.write(kiwi_head + kiwi_calc + kiwi_tail)

if __name__ == "__main__":
    generate()
