/**
 * NZ Public Holidays Engine
 * Calculates national public holidays for a given year and
 * finds any that fall within an employee's annual leave payout window.
 */

// Official Matariki public holiday dates (legislated by NZ government)
const MATARIKI_DATES = {
    2022: [2022, 5, 24],
    2023: [2023, 6, 14],
    2024: [2024, 5, 28],
    2025: [2025, 5, 20],
    2026: [2026, 6, 10],
    2027: [2027, 5, 25],
    2028: [2028, 6, 14],
    2029: [2029, 6,  6],
    2030: [2030, 5, 21],
};

/** Easter Sunday — Anonymous Gregorian algorithm */
function getEasterSunday(year) {
    const a = year % 19, b = Math.floor(year / 100), c = year % 100;
    const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4), k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month, day);
}

/** Move a Saturday to Monday, Sunday to Monday */
function mondayize(date) {
    const d = date.getDay();
    if (d === 6) return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 2);
    if (d === 0) return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    return new Date(date);
}

function firstMondayOf(year, month) {
    const d = new Date(year, month, 1);
    const shift = d.getDay() === 1 ? 0 : (8 - d.getDay()) % 7;
    return new Date(year, month, 1 + shift);
}

function nthMondayOf(year, month, n) {
    const first = firstMondayOf(year, month);
    return new Date(year, month, first.getDate() + (n - 1) * 7);
}

function getNewYearHolidays(year) {
    const d = new Date(year, 0, 1).getDay();
    if (d === 6) return [
        { date: new Date(year, 0, 3), name: "New Year's Day" },
        { date: new Date(year, 0, 4), name: "Day after New Year's" },
    ];
    if (d === 0) return [
        { date: new Date(year, 0, 2), name: "New Year's Day" },
        { date: new Date(year, 0, 3), name: "Day after New Year's" },
    ];
    return [
        { date: new Date(year, 0, 1), name: "New Year's Day" },
        { date: mondayize(new Date(year, 0, 2)), name: "Day after New Year's" },
    ];
}

function getChristmasHolidays(year) {
    const d = new Date(year, 11, 25).getDay();
    if (d === 6) return [
        { date: new Date(year, 11, 27), name: 'Christmas Day' },
        { date: new Date(year, 11, 28), name: 'Boxing Day' },
    ];
    if (d === 0) return [
        { date: new Date(year, 11, 26), name: 'Christmas Day' },
        { date: new Date(year, 11, 27), name: 'Boxing Day' },
    ];
    return [
        { date: new Date(year, 11, 25), name: 'Christmas Day' },
        { date: mondayize(new Date(year, 11, 26)), name: 'Boxing Day' },
    ];
}

/** Returns all NZ national public holidays for a year as [{date, name}] */
function getNZPublicHolidays(year) {
    const easter = getEasterSunday(year);
    const holidays = [
        ...getNewYearHolidays(year),
        { date: mondayize(new Date(year, 1, 6)),  name: 'Waitangi Day' },
        { date: new Date(year, easter.getMonth(), easter.getDate() - 2), name: 'Good Friday' },
        { date: new Date(year, easter.getMonth(), easter.getDate() + 1), name: 'Easter Monday' },
        { date: mondayize(new Date(year, 3, 25)), name: 'ANZAC Day' },
        { date: firstMondayOf(year, 5),           name: "King's Birthday" },
        { date: nthMondayOf(year, 9, 4),          name: 'Labour Day' },
        ...getChristmasHolidays(year),
    ];

    if (MATARIKI_DATES[year]) {
        const [y, m, d] = MATARIKI_DATES[year];
        holidays.push({ date: new Date(y, m, d), name: 'Matariki' });
    }

    return holidays;
}

/**
 * Walk through the annual leave window after lastDay and find public holidays.
 *
 * Under the Holidays Act, unused annual leave is treated as if taken immediately
 * after the last day. Public holidays that fall on a day the employee would
 * normally work are paid, and the leave window extends by one day per holiday found.
 *
 * @param {Date}   lastDay        - Last official day of employment
 * @param {number} unusedLeaveDays - Entitled annual leave days remaining
 * @param {number} daysPerWeek    - Number of days normally worked per week (1–5)
 * @returns {{ count: number, holidays: Array<{date: Date, name: string}> }}
 */
function calculatePublicHolidaysInWindow(lastDay, unusedLeaveDays, daysPerWeek) {
    if (!lastDay || unusedLeaveDays <= 0) return { count: 0, holidays: [] };

    // Work days: assume Mon through N days (0=Sun,1=Mon,...,6=Sat)
    const n = Math.min(Math.max(Math.round(daysPerWeek), 1), 5);
    const workDays = [1, 2, 3, 4, 5].slice(0, n);

    // Load holidays for the year of lastDay + following year
    const yr = lastDay.getFullYear();
    const allHolidays = [...getNZPublicHolidays(yr), ...getNZPublicHolidays(yr + 1)];
    const holidayMap = new Map(allHolidays.map(h => [h.date.toDateString(), h.name]));

    const found = [];
    let remaining = unusedLeaveDays;
    let current = new Date(lastDay.getFullYear(), lastDay.getMonth(), lastDay.getDate() + 1);
    let safety = 0;

    while (remaining > 0 && safety < 400) {
        safety++;
        if (workDays.includes(current.getDay())) {
            const key = current.toDateString();
            if (holidayMap.has(key)) {
                found.push({ date: new Date(current), name: holidayMap.get(key) });
                // window extends — do NOT decrement remaining
            } else {
                remaining--;
            }
        }
        current = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1);
    }

    return { count: found.length, holidays: found };
}
