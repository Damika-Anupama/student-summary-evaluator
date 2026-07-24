import { describe, it, expect } from "vitest";
import dayjs from "dayjs";
import { deadlineStatus, DAY_MS } from "./deadline";

const NOW = new Date("2026-06-30T12:00:00.000Z").getTime();
const at = (days) => new Date(NOW + days * DAY_MS).toISOString();

// Calendar-boundary cases are expressed in local time (no trailing Z) because
// "today" is a local-calendar notion — that is exactly what the status labels
// describe to the user.
const LOCAL_NOON = dayjs("2026-06-30T12:00:00").valueOf();
const local = (iso) => dayjs(iso).toISOString();

describe("deadlineStatus", () => {
	it("flags past deadlines as Overdue", () => {
		expect(deadlineStatus(at(-2), NOW)).toEqual({
			label: "Overdue",
			color: "error",
		});
	});

	it("flags the exact now as Due today", () => {
		expect(deadlineStatus(NOW, NOW)).toEqual({
			label: "Due today",
			color: "warning",
		});
	});

	it("uses singular 'day' for one day out", () => {
		expect(deadlineStatus(at(1), NOW)).toEqual({
			label: "Due in 1 day",
			color: "warning",
		});
	});

	it("uses plural and warning color within five days", () => {
		expect(deadlineStatus(at(4), NOW)).toEqual({
			label: "Due in 4 days",
			color: "warning",
		});
	});

	it("uses success color beyond five days", () => {
		expect(deadlineStatus(at(10), NOW)).toEqual({
			label: "Due in 10 days",
			color: "success",
		});
	});

	it("treats the five-day boundary as warning", () => {
		expect(deadlineStatus(at(5), NOW).color).toBe("warning");
		expect(deadlineStatus(at(6), NOW).color).toBe("success");
	});
});

// Regression: the status used to compare instants, so a deadline a few hours
// old rounded to "Due today" and one a few hours away jumped to "Due in 1 day".
describe("deadlineStatus calendar-day boundaries", () => {
	it("flags a deadline 23 hours ago as Overdue, not Due today", () => {
		const yesterday = local("2026-06-29T13:00:00");
		expect(deadlineStatus(yesterday, LOCAL_NOON)).toEqual({
			label: "Overdue",
			color: "error",
		});
	});

	it("still says Due today for a deadline earlier the same day", () => {
		const earlierToday = local("2026-06-30T00:05:00");
		expect(deadlineStatus(earlierToday, LOCAL_NOON)).toEqual({
			label: "Due today",
			color: "warning",
		});
	});

	it("says Due today for a deadline at 23:59 tonight", () => {
		const tonight = local("2026-06-30T23:59:00");
		expect(deadlineStatus(tonight, LOCAL_NOON)).toEqual({
			label: "Due today",
			color: "warning",
		});
	});

	it("says Due in 1 day just after midnight tomorrow", () => {
		const tomorrow = local("2026-07-01T00:01:00");
		expect(deadlineStatus(tomorrow, LOCAL_NOON)).toEqual({
			label: "Due in 1 day",
			color: "warning",
		});
	});

	it("counts whole calendar days out to the success band", () => {
		expect(deadlineStatus(local("2026-07-06T08:00:00"), LOCAL_NOON)).toEqual({
			label: "Due in 6 days",
			color: "success",
		});
	});
});
