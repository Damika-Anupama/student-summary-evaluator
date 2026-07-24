import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import axios from "axios";
import { SnackbarProvider } from "src/contexts/snackbar-context";
import { ViewAssignmentModal } from "./view-assignment";

vi.mock("axios", () => ({
	default: { get: vi.fn() },
}));

const noop = () => {};

const DEADLINE = "2025-03-04T15:30:00";

const assignmentResponse = (overrides = {}) => ({
	data: {
		assignments: {
			id: 2,
			question: "Summarize how photosynthesis works",
			deadline: DEADLINE,
			textTitle: "Photosynthesis",
			eval_text: { id: 2, title: "Photosynthesis", text: "Plants use light." },
			...overrides,
		},
	},
});

const renderModal = (setOpenViewModal = noop) =>
	render(
		<SnackbarProvider>
			<LocalizationProvider dateAdapter={AdapterDayjs}>
				<ViewAssignmentModal
					openViewModal
					viewID={2}
					setOpenViewModal={setOpenViewModal}
				/>
			</LocalizationProvider>
		</SnackbarProvider>
	);

const httpError = (status) =>
	Object.assign(new Error(`Request failed with status code ${status}`), {
		response: { status },
	});

const deadlineInput = () => screen.getByLabelText(/deadline/i);

beforeEach(() => {
	axios.get.mockReset();
});
afterEach(cleanup);

describe("ViewAssignmentModal", () => {
	it("shows the assignment's real deadline, not the current time", async () => {
		axios.get.mockResolvedValue(assignmentResponse());
		renderModal();

		await screen.findByDisplayValue("Photosynthesis");
		expect(screen.getByDisplayValue("Summarize how photosynthesis works")).toBeInTheDocument();
		expect(screen.getByDisplayValue("Plants use light.")).toBeInTheDocument();

		const expected = dayjs(DEADLINE).format("MM/DD/YYYY hh:mm A");
		await waitFor(() => expect(deadlineInput()).toHaveValue(expected));

		// Regression guard: the old code read res.data.deadline (undefined), so
		// dayjs(undefined) rendered "now" and it looked like a real deadline.
		expect(deadlineInput()).not.toHaveValue(dayjs().format("MM/DD/YYYY hh:mm A"));
	});

	it("leaves the deadline blank when the assignment has none", async () => {
		axios.get.mockResolvedValue(assignmentResponse({ deadline: null }));
		renderModal();

		await screen.findByDisplayValue("Photosynthesis");
		await waitFor(() =>
			expect(deadlineInput()).toHaveValue("")
		);
	});

	it("leaves the deadline blank when the deadline is unparseable", async () => {
		axios.get.mockResolvedValue(assignmentResponse({ deadline: "not-a-date" }));
		renderModal();

		await screen.findByDisplayValue("Photosynthesis");
		await waitFor(() =>
			expect(deadlineInput()).toHaveValue("")
		);
	});

	it("does not crash when the payload is missing eval_text", async () => {
		axios.get.mockResolvedValue(
			assignmentResponse({ eval_text: undefined, textTitle: "Fallback title" })
		);
		renderModal();

		await screen.findByDisplayValue("Fallback title");
		expect(
			screen.getByDisplayValue("Summarize how photosynthesis works")
		).toBeInTheDocument();
	});

	it("does not fetch until the modal is opened", () => {
		axios.get.mockResolvedValue(assignmentResponse());
		render(
			<SnackbarProvider>
				<LocalizationProvider dateAdapter={AdapterDayjs}>
					<ViewAssignmentModal
						openViewModal={false}
						viewID={2}
						setOpenViewModal={noop}
					/>
				</LocalizationProvider>
			</SnackbarProvider>
		);
		expect(axios.get).not.toHaveBeenCalled();
	});

	describe("when the assignment cannot be loaded", () => {
		// The component logs the failure like the rest of the app; keep it out of
		// the test output.
		let errorSpy;
		beforeEach(() => {
			errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		});
		afterEach(() => errorSpy.mockRestore());

		it("reports a 404 in the snackbar and closes instead of showing a blank form", async () => {
			const setOpenViewModal = vi.fn();
			axios.get.mockRejectedValue(httpError(404));
			renderModal(setOpenViewModal);

			expect(
				await screen.findByText(/that assignment no longer exists/i)
			).toBeInTheDocument();
			await waitFor(() => expect(setOpenViewModal).toHaveBeenCalledWith(false));
		});

		it("reports any other failure with a retry message", async () => {
			const setOpenViewModal = vi.fn();
			axios.get.mockRejectedValue(httpError(500));
			renderModal(setOpenViewModal);

			expect(
				await screen.findByText(/could not load the assignment/i)
			).toBeInTheDocument();
			await waitFor(() => expect(setOpenViewModal).toHaveBeenCalledWith(false));
		});
	});
});
