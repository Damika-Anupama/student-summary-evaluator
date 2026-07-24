// Lives outside src/pages because anything with a page extension under
// src/pages/ becomes a Next.js route.
//
// The chip on an assignment card and the Add/Remove Students modal behind it
// have to be reading the same roster. The demo API here only ever answers with
// the fixtures, so the only way the count can change is the browser overlay.
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import {
	render,
	screen,
	cleanup,
	fireEvent,
	waitFor,
	within,
} from "@testing-library/react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import axios from "axios";
import { SnackbarProvider } from "src/contexts/snackbar-context";
import {
	DEMO_ASSIGNMENTS,
	DEMO_STUDENTS,
	DEMO_SUMMARIES_BY_ASSIGNMENT,
} from "src/demo/demo-data";
import {
	ASSIGNMENTS_KEY,
	__resetStoreRuntime,
	readOverlay,
} from "src/demo/local-store";
import AssignmentsPage from "src/pages/assignments";

vi.mock("axios", () => ({
	default: {
		get: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
		delete: vi.fn(),
	},
}));

const fixturesResponse = () => ({
	status: 200,
	data: {
		assignments: DEMO_ASSIGNMENTS.map((a) => ({ ...a, studentCount: 0 })),
	},
});

const renderAssignments = () =>
	render(
		<SnackbarProvider>
			<LocalizationProvider dateAdapter={AdapterDayjs}>
				<AssignmentsPage />
			</LocalizationProvider>
		</SnackbarProvider>
	);

// Assignment 1's class is everyone who has a submission row for it.
const SEED_SIZE = DEMO_SUMMARIES_BY_ASSIGNMENT[1].length;
const ENROLLED = DEMO_STUDENTS.filter((s) => s.enrolled).length;

const chipFor = (title) =>
	screen.getByRole("button", {
		name: new RegExp(`add or remove students on ${title}`, "i"),
	});

let errorSpy;

beforeEach(() => {
	localStorage.clear();
	__resetStoreRuntime();
	axios.get.mockReset().mockResolvedValue(fixturesResponse());
	axios.post
		.mockReset()
		.mockResolvedValue({ status: 201, data: { assignment: { id: 6 } } });
	errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
	cleanup();
	errorSpy.mockRestore();
});

describe("the student count on an assignment card", () => {
	it("counts the roster, not the submission rows the API reports", async () => {
		renderAssignments();
		await screen.findByText("Climate Change");
		expect(chipFor("Climate Change")).toHaveTextContent(`${SEED_SIZE} Students`);
	});

	it("follows a roster saved from the modal, across a remount", async () => {
		renderAssignments();
		await screen.findByText("Climate Change");

		fireEvent.click(chipFor("Climate Change"));
		const enrolled = await screen.findByRole("list", { name: "Enrolled" });
		fireEvent.click(within(enrolled).getByRole("checkbox", { name: "John Doe" }));
		fireEvent.click(screen.getByRole("button", { name: /remove selected/i }));
		fireEvent.click(screen.getByRole("button", { name: /^save$/i }));

		await waitFor(() =>
			expect(chipFor("Climate Change")).toHaveTextContent(
				`${SEED_SIZE - 1} Students`
			)
		);

		// Navigate away and back: the API still serves the untouched fixtures.
		cleanup();
		renderAssignments();
		await screen.findByText("Climate Change");
		expect(chipFor("Climate Change")).toHaveTextContent(
			`${SEED_SIZE - 1} Students`
		);

		const overlay = readOverlay(ASSIGNMENTS_KEY);
		expect(overlay.created).toEqual([]);
		expect(overlay.patches["1"].studentIds).toHaveLength(SEED_SIZE - 1);
		expect(overlay.patches["1"].studentIds).not.toContain("1");
	});

	it("starts a newly created assignment on the enrolled class, not on zero", async () => {
		renderAssignments();
		await screen.findByText("Climate Change");

		fireEvent.click(screen.getByRole("button", { name: /create new/i }));
		fireEvent.change(screen.getByLabelText(/^title$/i), {
			target: { value: "Volcanoes" },
		});
		fireEvent.change(screen.getByLabelText(/prompt question/i), {
			target: { value: "How volcanoes form" },
		});
		fireEvent.click(screen.getByRole("button", { name: /create assignment/i }));

		expect(await screen.findByText("Volcanoes")).toBeInTheDocument();
		expect(chipFor("Volcanoes")).toHaveTextContent(`${ENROLLED} Students`);
	});
});
