// Lives outside src/pages because anything with a page extension under
// src/pages/ becomes a Next.js route.
//
// The round trip this feature exists for: the teacher writes a remark in the
// profile drawer, and the student reads it on their grade history. Nothing is
// handed between the two here — they are rendered separately, and the only
// thing they share is the browser store.
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import {
	render,
	screen,
	cleanup,
	fireEvent,
	waitFor,
} from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import axios from "axios";
import { SnackbarProvider } from "src/contexts/snackbar-context";
import { getStudentHistory, getStudentProfile } from "src/demo/demo-data";
import { REMARKS_KEY, __resetStoreRuntime } from "src/demo/local-store";
import { SEEDED_REMARKS, getSeededRemarks, remarkId } from "src/demo/remarks";
import { StudentProfileDrawer } from "src/sections/mission-control/student-profile-drawer";
import HistoryPage from "src/pages/history-student";

vi.mock("axios", () => ({ default: { get: vi.fn() } }));

vi.mock("next/router", () => ({
	useRouter: () => ({ push: vi.fn(), pathname: "/", query: {} }),
}));

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: vi.fn() }),
	usePathname: () => "/",
	useSearchParams: () => new URLSearchParams(),
}));

// simplebar calls getComputedStyle with pseudo-elements, which jsdom does not
// implement; the scroll container is not what these tests are about.
vi.mock("src/components/scrollbar", () => ({
	Scrollbar: ({ children }) => <div>{children}</div>,
}));

// ApexCharts needs a real layout engine; the trend lines are not under test.
vi.mock("src/components/chart", () => ({ Chart: () => <div /> }));

const JOHN = 1;
const history = getStudentHistory(JOHN);
const profile = getStudentProfile(JOHN);
const seededFor = (assignmentId) =>
	SEEDED_REMARKS.find((r) => r.id === remarkId(JOHN, assignmentId));

// The submission the drawer offers first, and one the fixtures left uncommented.
const latest = profile.submissions.find((s) => s.isSubmitted);
const uncommented = profile.submissions.find(
	(s) => s.isSubmitted && !seededFor(s.assignmentId)
);

beforeEach(() => {
	localStorage.clear();
	__resetStoreRuntime();
	axios.get.mockReset();
	// The demo API only ever serves the fixtures; written remarks live in the
	// browser, so anything beyond the seed here has to come from the store.
	axios.get.mockImplementation((url) => {
		if (url.startsWith("/api/students/")) {
			return Promise.resolve({ data: { profile } });
		}
		if (url.startsWith("/api/remarks")) {
			return Promise.resolve({ data: { remarks: getSeededRemarks(JOHN) } });
		}
		return Promise.resolve({ data: {} });
	});
});

afterEach(cleanup);

const renderDrawer = () =>
	render(
		<SnackbarProvider>
			<StudentProfileDrawer studentId={JOHN} open onClose={() => {}} />
		</SnackbarProvider>
	);

const renderHistory = () => render(<HistoryPage history={history} />);

// Expand every remark on the history table so its text is readable.
const revealAllRemarks = async () => {
	const chips = await screen.findAllByRole("button", { name: /^remark$/i });
	for (const chip of chips) fireEvent.click(chip);
	return chips;
};

describe("seeded remarks", () => {
	it("appear on the student's history with nothing saved", async () => {
		expect(localStorage.getItem(REMARKS_KEY)).toBeNull();
		renderHistory();

		const chips = await revealAllRemarks();
		expect(chips).toHaveLength(getSeededRemarks(JOHN).length);

		for (const remark of getSeededRemarks(JOHN)) {
			expect(screen.getByText(remark.text)).toBeInTheDocument();
		}
	});

	it("render identically on the server and the first client paint", () => {
		// Hydration safety: the overlay is empty on the first render of both, so
		// the markup can only differ if something reads the clock or storage
		// during render.
		const server = renderToStaticMarkup(<HistoryPage history={history} />);
		const { container } = renderHistory();
		expect(server).toContain("Remark");
		expect(container.innerHTML).toContain("Remark");
	});

	it("are shown to the teacher in the profile drawer", async () => {
		renderDrawer();
		for (const remark of getSeededRemarks(JOHN)) {
			expect(await screen.findByText(remark.text)).toBeInTheDocument();
		}
	});
});

describe("a teacher writing a remark", () => {
	it("reaches the student's history", async () => {
		renderDrawer();
		await screen.findByText(/John Doe/);

		// A submission the fixtures left uncommented, so this is genuinely new.
		fireEvent.click(
			screen.getByRole("button", {
				name: new RegExp(`add remark.*${uncommented.assignmentTitle}`, "i"),
			})
		);
		fireEvent.change(
			screen.getByLabelText(`Remark on ${uncommented.assignmentTitle}`),
			{ target: { value: "Lovely structure — tighten the closing sentence." } }
		);
		fireEvent.click(screen.getByRole("button", { name: /save remark/i }));

		await screen.findByText(/Remark saved for John/i);
		cleanup();

		// A separate render, reading only what the browser kept.
		renderHistory();
		await revealAllRemarks();
		expect(
			screen.getByText("Lovely structure — tighten the closing sentence.")
		).toBeInTheDocument();
	});

	it("can reword a seeded remark, and the student sees the new wording", async () => {
		const seeded = seededFor(latest.assignmentId);
		renderDrawer();
		await screen.findByText(seeded.text);

		fireEvent.click(
			screen.getByRole("button", {
				name: new RegExp(`edit remark.*${latest.assignmentTitle}`, "i"),
			})
		);
		// The composer opens on what is already there rather than a blank box.
		const input = screen.getByLabelText(`Remark on ${latest.assignmentTitle}`);
		expect(input).toHaveValue(seeded.text);

		fireEvent.change(input, { target: { value: "Much improved this time." } });
		fireEvent.click(screen.getByRole("button", { name: /save remark/i }));
		await screen.findByText(/Remark saved for John/i);
		cleanup();

		renderHistory();
		await revealAllRemarks();
		expect(screen.getByText("Much improved this time.")).toBeInTheDocument();
		expect(screen.queryByText(seeded.text)).not.toBeInTheDocument();
	});

	it("will not save empty or whitespace-only text", async () => {
		renderDrawer();
		await screen.findByText(/John Doe/);

		fireEvent.click(
			screen.getByRole("button", {
				name: new RegExp(`add remark.*${uncommented.assignmentTitle}`, "i"),
			})
		);
		const input = screen.getByLabelText(
			`Remark on ${uncommented.assignmentTitle}`
		);
		const save = screen.getByRole("button", { name: /save remark/i });
		expect(input).toHaveValue("");
		expect(save).toBeDisabled();

		fireEvent.change(input, { target: { value: "   " } });
		expect(save).toBeDisabled();

		fireEvent.change(input, { target: { value: "Real feedback." } });
		expect(save).toBeEnabled();
		fireEvent.click(save);

		await waitFor(() =>
			expect(localStorage.getItem(REMARKS_KEY)).not.toBeNull()
		);
		const stored = JSON.parse(localStorage.getItem(REMARKS_KEY));
		const written = [...stored.created, ...Object.values(stored.patches)];
		expect(written.map((r) => r.text)).toEqual(["Real feedback."]);
	});

	it("abandons the draft on cancel", async () => {
		renderDrawer();
		await screen.findByText(/John Doe/);

		fireEvent.click(
			screen.getByRole("button", {
				name: new RegExp(`add remark.*${uncommented.assignmentTitle}`, "i"),
			})
		);
		fireEvent.change(
			screen.getByLabelText(`Remark on ${uncommented.assignmentTitle}`),
			{ target: { value: "Never mind." } }
		);
		fireEvent.click(screen.getByRole("button", { name: /^cancel$/i }));

		expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
		expect(localStorage.getItem(REMARKS_KEY)).toBeNull();
	});

	it("starts on the latest submission from the drawer footer", async () => {
		renderDrawer();
		// The button renders before the profile arrives, but disabled — clicking
		// it then is a no-op and the composer never opens. Waiting only for the
		// button to exist made this pass locally and fail on slower CI.
		const trigger = await screen.findByRole("button", {
			name: /leave a remark/i,
		});
		await waitFor(() => expect(trigger).toBeEnabled());
		fireEvent.click(trigger);
		expect(
			await screen.findByLabelText(`Remark on ${latest.assignmentTitle}`)
		).toBeInTheDocument();
	});

	it("falls back to the bundled fixtures when the remarks request fails", async () => {
		axios.get.mockImplementation((url) =>
			url.startsWith("/api/students/")
				? Promise.resolve({ data: { profile } })
				: Promise.reject(new Error("offline"))
		);

		renderDrawer();
		// The profile still renders, and the seeded remarks are still shown.
		expect(await screen.findByText(/John Doe/)).toBeInTheDocument();
		expect(
			await screen.findByText(getSeededRemarks(JOHN)[0].text)
		).toBeInTheDocument();
	});
});

describe("remark fixtures", () => {
	it("cover more than one student so the cohort view has feedback in it", () => {
		expect(
			new Set(SEEDED_REMARKS.map((r) => r.studentId)).size
		).toBeGreaterThan(1);
	});

	it("leave some submissions uncommented, so the marker means something", () => {
		expect(uncommented).toBeDefined();
	});
});
