import dayjs from "dayjs";

export const DAY_MS = 86400000;

// Whole calendar days from `now` to `deadline` — negative when the deadline
// has already passed. Both sides are normalised to local start-of-day so the
// answer is a date difference, not an elapsed-time one: a deadline later today
// is 0 (due today) and yesterday's is -1 (overdue), whatever the clock time.
// Comparing raw instants called a deadline six hours out "due in 1 day".
//
// The subtraction is rounded rather than handed to dayjs' own `diff("day")`,
// which truncates: across a DST boundary two adjacent start-of-days are 23 or
// 25 hours apart, and truncation would call that 0 days.
const calendarDaysUntil = (deadline, now) => {
	const end = dayjs(deadline).startOf("day").valueOf();
	const start = dayjs(now).startOf("day").valueOf();
	return Math.round((end - start) / DAY_MS);
};

// Returns a label + MUI color for an assignment deadline relative to `now`
// (both as comparable values: deadline is an ISO string or timestamp, now
// is a timestamp in ms). Pure so it can be unit tested and stays
// hydration-safe when `now` is supplied by the server.
export const deadlineStatus = (deadline, now) => {
	const days = calendarDaysUntil(deadline, now);
	if (days < 0) return { label: "Overdue", color: "error" };
	if (days === 0) return { label: "Due today", color: "warning" };
	if (days <= 5)
		return {
			label: `Due in ${days} day${days > 1 ? "s" : ""}`,
			color: "warning",
		};
	return { label: `Due in ${days} days`, color: "success" };
};
