// Lives outside src/pages because anything with a page extension under
// src/pages/ becomes a Next.js route.
//
// This is the user-visible promise of the local store: what you create in the
// demo is still there after you navigate away and come back. Every axios.get
// here answers with the untouched fixtures — exactly what a cold Vercel lambda
// returns once the instance that handled the create is gone — so the only way
// these assertions can pass is if the browser overlay is doing the work.
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import {
	render,
	screen,
	cleanup,
	fireEvent,
	waitFor,
	waitForElementToBeRemoved,
} from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import axios from "axios";
import { SnackbarProvider } from "src/contexts/snackbar-context";
import { DEMO_ASSIGNMENTS, DEMO_STUDENTS } from "src/demo/demo-data";
import {
	ASSIGNMENTS_KEY,
	STUDENTS_KEY,
	__resetStoreRuntime,
	readOverlay,
	resetDemoData,
} from "src/demo/local-store";
import AssignmentsPage from "src/pages/assignments";
import StudentsPage from "src/pages/students";
import { SettingsDemoData } from "src/sections/settings/settings-demo-data";

vi.mock("axios", () => ({
	default: {
		get: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
		delete: vi.fn(),
	},
}));

// The demo API only ever knows about the fixtures.
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

const STUDENT_PROPS = DEMO_STUDENTS.map((s, i) => ({
	id: String(s.id),
	name: `${s.firstName} ${s.lastName}`,
	email: s.email,
	grade: s.grade,
	enrolled: s.enrolled,
	address: { city: "Colombo", state: "Western", country: "Sri Lanka" },
	createdAt: new Date(2025, 0, 10 + i * 5).getTime(),
}));

const renderStudents = () =>
	render(
		<SnackbarProvider>
			<StudentsPage students={STUDENT_PROPS} />
		</SnackbarProvider>
	);

// A saved student deliberately missing `address`: a persisted record that
// predates a field must not white-screen the roster.
const saveStudentOverlay = () =>
	localStorage.setItem(
		STUDENTS_KEY,
		JSON.stringify({
			created: [{ id: "new-1", name: "Saved Student", email: "s@school.demo" }],
			patches: {},
			deleted: [],
		})
	);

const type = (label, value) =>
	fireEvent.change(screen.getByLabelText(label), { target: { value } });

let errorSpy;

beforeEach(() => {
	localStorage.clear();
	__resetStoreRuntime();
	axios.get.mockReset().mockResolvedValue(fixturesResponse());
	axios.post
		.mockReset()
		.mockResolvedValue({ status: 201, data: { assignment: { id: 6 } } });
	axios.put.mockReset().mockResolvedValue({ status: 200, data: {} });
	axios.delete.mockReset().mockResolvedValue({ status: 200, data: {} });
	errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
	cleanup();
	errorSpy.mockRestore();
});

const createAssignment = async (title, question) => {
	fireEvent.click(screen.getByRole("button", { name: /create new/i }));
	type(/^title$/i, title);
	type(/prompt question/i, question);
	fireEvent.click(screen.getByRole("button", { name: /create assignment/i }));
	expect(await screen.findByText(title)).toBeInTheDocument();
};

describe("created assignments survive a remount", () => {
	it("still lists a created assignment after the page is torn down and rebuilt", async () => {
		renderAssignments();
		await screen.findByText("Climate Change");

		await createAssignment("Volcanoes", "Summarize how volcanoes form");
		expect(screen.getByText("Summarize how volcanoes form")).toBeInTheDocument();

		// Navigate away and back: everything React held is gone, and the API
		// still answers with nothing but the fixtures.
		cleanup();
		expect(screen.queryByText("Volcanoes")).not.toBeInTheDocument();

		renderAssignments();
		expect(await screen.findByText("Volcanoes")).toBeInTheDocument();
		expect(screen.getByText("Summarize how volcanoes form")).toBeInTheDocument();
		// The fixtures are still there — the overlay adds, it does not replace.
		expect(screen.getByText("Climate Change")).toBeInTheDocument();
	});

	it("gives each created assignment its own id instead of reusing the server's", async () => {
		renderAssignments();
		await screen.findByText("Climate Change");

		await createAssignment("Volcanoes", "How volcanoes form");
		await createAssignment("Glaciers", "How glaciers move");

		// The mocked API hands back id 6 both times, the way a cold lambda would.
		const ids = readOverlay(ASSIGNMENTS_KEY).created.map((a) => a.id);
		expect(new Set(ids).size).toBe(2);
		expect(screen.getByText("Volcanoes")).toBeInTheDocument();
		expect(screen.getByText("Glaciers")).toBeInTheDocument();
	});

	it("keeps working when the demo API is unreachable", async () => {
		axios.get.mockRejectedValue(new Error("cold start"));
		axios.post.mockRejectedValue(new Error("cold start"));

		renderAssignments();
		await screen.findByText("Climate Change");
		await createAssignment("Offline", "Written while the API was down");

		cleanup();
		renderAssignments();
		expect(await screen.findByText("Offline")).toBeInTheDocument();
	});
});

describe("edits and deletes survive a remount", () => {
	it("keeps an edit to a fixture assignment", async () => {
		renderAssignments();
		await screen.findByText("Climate Change");

		fireEvent.click(screen.getAllByRole("button", { name: /edit/i })[0]);
		type(/^title$/i, "Climate Change (revised)");
		fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

		expect(
			await screen.findByText("Climate Change (revised)")
		).toBeInTheDocument();

		cleanup();
		renderAssignments();
		expect(
			await screen.findByText("Climate Change (revised)")
		).toBeInTheDocument();

		// Stored as a patch, not a copy of the record.
		const overlay = readOverlay(ASSIGNMENTS_KEY);
		expect(overlay.created).toEqual([]);
		expect(overlay.patches["1"].eval_text.title).toBe(
			"Climate Change (revised)"
		);
	});

	it("keeps a fixture assignment deleted even though the API still serves it", async () => {
		renderAssignments();
		await screen.findByText("Climate Change");

		fireEvent.click(screen.getAllByRole("button", { name: /delete/i })[0]);
		fireEvent.click(screen.getByRole("button", { name: /confirm/i }));
		await waitForElementToBeRemoved(() => screen.queryByText("Climate Change"));

		cleanup();
		renderAssignments();
		await screen.findByText("Photosynthesis");
		expect(screen.queryByText("Climate Change")).not.toBeInTheDocument();
		expect(readOverlay(ASSIGNMENTS_KEY).deleted).toEqual(["1"]);
	});
});

describe("students survive a remount", () => {
	it("keeps a student added through the dialog", async () => {
		renderStudents();
		await screen.findByText("John Doe");

		fireEvent.click(screen.getByRole("button", { name: /^add$/i }));
		type(/first name/i, "Nimal");
		type(/last name/i, "Fernando");
		fireEvent.click(screen.getByRole("button", { name: /add student/i }));

		expect(await screen.findByText("Nimal Fernando")).toBeInTheDocument();

		cleanup();
		renderStudents();
		expect(await screen.findByText("Nimal Fernando")).toBeInTheDocument();
		// The static seed still comes through.
		expect(screen.getByText("John Doe")).toBeInTheDocument();
	});

	it("prerenders the seed alone, so hydration cannot mismatch", () => {
		// Simulate a returning visitor: the overlay is already on disk.
		saveStudentOverlay();

		// This page is statically generated. Rendering it the way Next.js does
		// proves two things at once: nothing touches localStorage at import time
		// or during render (which would break the build), and the prerendered
		// markup is the seed alone — exactly what the client's first pass draws
		// before the effect hydrates.
		const html = renderToStaticMarkup(
			<SnackbarProvider>
				<StudentsPage students={STUDENT_PROPS} />
			</SnackbarProvider>
		);
		expect(html).toContain("John Doe");
		expect(html).not.toContain("Saved Student");
	});

	it("shows the saved student once the effect hydrates", async () => {
		saveStudentOverlay();
		renderStudents();
		expect(await screen.findByText("Saved Student")).toBeInTheDocument();
		expect(screen.getByText("John Doe")).toBeInTheDocument();
	});

	it("falls back to the seed when the stored overlay is corrupt", async () => {
		localStorage.setItem(STUDENTS_KEY, "{not json");
		expect(() => renderStudents()).not.toThrow();
		expect(await screen.findByText("John Doe")).toBeInTheDocument();
	});
});

describe("reset demo data", () => {
	it("restores the fixtures after a confirmation", async () => {
		renderAssignments();
		await screen.findByText("Climate Change");
		await createAssignment("Volcanoes", "How volcanoes form");
		cleanup();

		render(
			<SnackbarProvider>
				<SettingsDemoData />
			</SnackbarProvider>
		);
		fireEvent.click(screen.getByRole("button", { name: /reset demo data/i }));
		fireEvent.click(screen.getByRole("button", { name: /^reset$/i }));
		expect(await screen.findByText(/demo data reset/i)).toBeInTheDocument();
		cleanup();

		renderAssignments();
		await screen.findByText("Climate Change");
		expect(screen.queryByText("Volcanoes")).not.toBeInTheDocument();
	});

	it("keeps the visitor's data when the dialog is cancelled", async () => {
		renderAssignments();
		await screen.findByText("Climate Change");
		await createAssignment("Volcanoes", "How volcanoes form");
		cleanup();

		render(
			<SnackbarProvider>
				<SettingsDemoData />
			</SnackbarProvider>
		);
		fireEvent.click(screen.getByRole("button", { name: /reset demo data/i }));
		fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
		await waitFor(() =>
			expect(readOverlay(ASSIGNMENTS_KEY).created).toHaveLength(1)
		);
		cleanup();

		renderAssignments();
		expect(await screen.findByText("Volcanoes")).toBeInTheDocument();
	});

	it("leaves unrelated settings alone", () => {
		localStorage.setItem("notificationPrefs", '{"notifEmail":false}');
		resetDemoData();
		expect(localStorage.getItem("notificationPrefs")).toBe(
			'{"notifEmail":false}'
		);
	});
});
