import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { AssignmentCard } from "./assignment-card";

afterEach(cleanup);

const DAY = 86400000;
const now = new Date("2026-07-20T12:00:00Z").getTime();

const base = {
	id: 1,
	title: "Climate Change",
	description: "Summarise the passage",
	createdAt: "01/07/2026",
	studentIds: ["1", "2", "3", "4", "5", "6", "7", "8"],
};

describe("AssignmentCard deadline chip", () => {
	it("shows an overdue chip for a past deadline", () => {
		render(
			<AssignmentCard
				assignment={{ ...base, deadline: new Date(now - 3 * DAY).toISOString() }}
				now={now}
			/>
		);
		expect(screen.getByText(/overdue/i)).toBeInTheDocument();
	});

	it("shows a countdown for an upcoming deadline", () => {
		render(
			<AssignmentCard
				assignment={{ ...base, deadline: new Date(now + 3 * DAY).toISOString() }}
				now={now}
			/>
		);
		expect(screen.getByText(/due in 3 days/i)).toBeInTheDocument();
	});

	it("renders no deadline chip when the assignment has no deadline", () => {
		render(<AssignmentCard assignment={base} now={now} />);
		expect(screen.queryByText(/due|overdue/i)).not.toBeInTheDocument();
	});
});

describe("AssignmentCard student chip", () => {
	it("counts the students on the assignment's roster", () => {
		render(<AssignmentCard assignment={base} now={now} />);
		expect(screen.getByText("8 Students")).toBeInTheDocument();
	});

	it("counts an edited roster, not the submissions it started with", () => {
		render(
			<AssignmentCard assignment={{ ...base, studentIds: ["1", "2"] }} now={now} />
		);
		expect(screen.getByText("2 Students")).toBeInTheDocument();
	});

	it("keeps the label truthful for one student and for none", () => {
		render(<AssignmentCard assignment={{ ...base, studentIds: ["1"] }} now={now} />);
		expect(screen.getByText("1 Student")).toBeInTheDocument();
		cleanup();

		render(<AssignmentCard assignment={{ ...base, studentIds: [] }} now={now} />);
		expect(screen.getByText("0 Students")).toBeInTheDocument();
	});

	it("hands the modal the assignment whose chip was clicked", () => {
		const setStudentsAssignment = vi.fn();
		const setOpenStudentsModal = vi.fn();
		render(
			<AssignmentCard
				assignment={base}
				now={now}
				setStudentsAssignment={setStudentsAssignment}
				setOpenStudentsModal={setOpenStudentsModal}
			/>
		);

		fireEvent.click(screen.getByText("8 Students"));
		expect(setStudentsAssignment).toHaveBeenCalledWith(base);
		expect(setOpenStudentsModal).toHaveBeenCalledWith(true);
	});
});
