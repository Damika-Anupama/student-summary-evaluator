import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent, within } from "@testing-library/react";
import { SnackbarProvider } from "src/contexts/snackbar-context";
import {
	ASSIGNMENTS_KEY,
	STUDENTS_KEY,
	__resetStoreRuntime,
	readOverlay,
} from "src/demo/local-store";
import { savedRosterIds, seedRosterIds } from "src/demo/roster";
import { AddStudentsModal } from "./add-students";

const ASSIGNMENT = { id: 1, title: "Climate Change" };

let getAssignments;

beforeEach(() => {
	localStorage.clear();
	__resetStoreRuntime();
	getAssignments = vi.fn().mockResolvedValue();
});

afterEach(cleanup);

const saveRosterOverlay = (studentIds) =>
	localStorage.setItem(
		ASSIGNMENTS_KEY,
		JSON.stringify({ created: [], patches: { 1: { studentIds } }, deleted: [] })
	);

const renderModal = (props = {}) => {
	const view = render(
		<SnackbarProvider>
			<AddStudentsModal
				assignment={ASSIGNMENT}
				openStudentsModal
				setOpenStudentsModal={() => {}}
				getAssignments={getAssignments}
				{...props}
			/>
		</SnackbarProvider>
	);
	return view;
};

const listNames = (title) =>
	within(screen.getByRole("list", { name: title }))
		.queryAllByRole("checkbox")
		.map((row) => row.textContent);

const row = (title, name) =>
	within(screen.getByRole("list", { name: title })).getByRole("checkbox", {
		name,
	});

const saved = () => savedRosterIds(1, readOverlay(ASSIGNMENTS_KEY));

describe("AddStudentsModal — what it opens with", () => {
	it("pre-fills both columns from the saved roster", async () => {
		saveRosterOverlay(["1", "2"]);
		renderModal();

		// The overlay lands in an effect, the way useDemoOverlay hydrates it.
		expect(await screen.findByRole("list", { name: "Enrolled" })).toBeInTheDocument();
		expect(listNames("Enrolled")).toEqual(["Jane Smith", "John Doe"]);
		expect(listNames("Available")).toContain("Mike Johnson");
		expect(listNames("Available")).not.toContain("John Doe");
	});

	it("falls back to the assignment's own class when nothing is saved", () => {
		renderModal();
		expect(listNames("Enrolled")).toHaveLength(seedRosterIds(1).length);
	});

	it("offers students the visitor added on the students page", async () => {
		localStorage.setItem(
			STUDENTS_KEY,
			JSON.stringify({
				created: [{ id: "new-1", name: "Nimal Fernando" }],
				patches: {},
				deleted: [],
			})
		);
		saveRosterOverlay(["1"]);
		renderModal();

		expect(
			await within(screen.getByRole("list", { name: "Available" })).findByRole(
				"checkbox",
				{ name: "Nimal Fernando" }
			)
		).toBeInTheDocument();
	});

	it("survives a corrupt overlay instead of white-screening", () => {
		localStorage.setItem(ASSIGNMENTS_KEY, "{not json");
		expect(() => renderModal()).not.toThrow();
		expect(listNames("Enrolled")).toHaveLength(seedRosterIds(1).length);
	});
});

describe("AddStudentsModal — moving students", () => {
	beforeEach(() => saveRosterOverlay(["1", "2"]));

	it("moves a student off the assignment and back on", async () => {
		renderModal();
		await screen.findByRole("checkbox", { name: "Jane Smith" });

		fireEvent.click(row("Enrolled", "John Doe"));
		fireEvent.click(screen.getByRole("button", { name: /remove selected/i }));
		expect(listNames("Enrolled")).toEqual(["Jane Smith"]);
		expect(listNames("Available")).toContain("John Doe");

		fireEvent.click(row("Available", "Mike Johnson"));
		fireEvent.click(screen.getByRole("button", { name: /add selected/i }));
		expect(listNames("Enrolled")).toEqual(["Jane Smith", "Mike Johnson"]);
	});

	it("selects a row from the keyboard", async () => {
		renderModal();
		const johnRow = await within(
			screen.getByRole("list", { name: "Enrolled" })
		).findByRole("checkbox", { name: "John Doe" });

		expect(johnRow).not.toBeChecked();
		johnRow.focus();
		fireEvent.keyDown(johnRow, { key: "Enter", code: "Enter" });
		expect(johnRow).toBeChecked();
		expect(
			screen.getByRole("button", { name: /remove selected/i })
		).toBeEnabled();
	});

	it("moves a whole column with the select-all box", async () => {
		renderModal();
		await screen.findByRole("checkbox", { name: "Jane Smith" });

		fireEvent.click(screen.getByRole("checkbox", { name: /select all enrolled/i }));
		fireEvent.click(screen.getByRole("button", { name: /remove selected/i }));
		expect(listNames("Enrolled")).toEqual([]);
		expect(screen.getByText(/no students on this assignment yet/i)).toBeInTheDocument();
	});
});

describe("AddStudentsModal — saving", () => {
	beforeEach(() => saveRosterOverlay(["1", "2"]));

	it("persists the roster and refreshes the cards", async () => {
		const setOpen = vi.fn();
		renderModal({ setOpenStudentsModal: setOpen });
		await screen.findByRole("checkbox", { name: "Jane Smith" });

		fireEvent.click(row("Available", "Mike Johnson"));
		fireEvent.click(screen.getByRole("button", { name: /add selected/i }));
		fireEvent.click(screen.getByRole("button", { name: /^save$/i }));

		expect(await screen.findByText(/class roster updated — 3 students/i)).toBeInTheDocument();
		expect(saved()).toEqual(["1", "2", "3"]);
		expect(getAssignments).toHaveBeenCalled();
		expect(setOpen).toHaveBeenCalledWith(false);
		// Stored as a patch on the assignment, not a copy of the record.
		expect(readOverlay(ASSIGNMENTS_KEY).created).toEqual([]);
	});

	it("shows the saved roster the next time it opens", async () => {
		const { rerender } = renderModal();
		await screen.findByRole("checkbox", { name: "Jane Smith" });

		fireEvent.click(row("Enrolled", "John Doe"));
		fireEvent.click(screen.getByRole("button", { name: /remove selected/i }));
		fireEvent.click(screen.getByRole("button", { name: /^save$/i }));
		await screen.findByText(/class roster updated/i);

		const modal = (open) => (
			<SnackbarProvider>
				<AddStudentsModal
					assignment={ASSIGNMENT}
					openStudentsModal={open}
					setOpenStudentsModal={() => {}}
					getAssignments={getAssignments}
				/>
			</SnackbarProvider>
		);
		rerender(modal(false));
		rerender(modal(true));

		expect(listNames("Enrolled")).toEqual(["Jane Smith"]);
		expect(listNames("Available")).toContain("John Doe");
	});

	it("discards the edit on Cancel", async () => {
		const { rerender } = renderModal();
		await screen.findByRole("checkbox", { name: "Jane Smith" });

		fireEvent.click(row("Enrolled", "John Doe"));
		fireEvent.click(screen.getByRole("button", { name: /remove selected/i }));
		expect(listNames("Enrolled")).toEqual(["Jane Smith"]);

		fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
		expect(saved()).toEqual(["1", "2"]);

		const modal = (open) => (
			<SnackbarProvider>
				<AddStudentsModal
					assignment={ASSIGNMENT}
					openStudentsModal={open}
					setOpenStudentsModal={() => {}}
					getAssignments={getAssignments}
				/>
			</SnackbarProvider>
		);
		rerender(modal(false));
		rerender(modal(true));
		expect(listNames("Enrolled")).toEqual(["Jane Smith", "John Doe"]);
	});

	it("keeps working when the browser refuses to store anything", async () => {
		const setItem = vi
			.spyOn(Storage.prototype, "setItem")
			.mockImplementation(() => {
				throw new Error("QuotaExceededError");
			});
		renderModal();

		fireEvent.click(row("Enrolled", "John Doe"));
		fireEvent.click(screen.getByRole("button", { name: /remove selected/i }));
		fireEvent.click(screen.getByRole("button", { name: /^save$/i }));

		expect(
			await screen.findByText(/this session only/i)
		).toBeInTheDocument();
		setItem.mockRestore();
		// The in-memory fallback still answers, so the demo keeps working.
		expect(saved()).not.toContain("1");
	});
});
