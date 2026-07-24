import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import {
	render,
	screen,
	cleanup,
	fireEvent,
	waitFor,
	within,
} from "@testing-library/react";
import { SnackbarProvider } from "src/contexts/snackbar-context";
import {
	AssignmentStepper,
	buildShareUrl,
	SHARE_URL_MAX_LENGTH,
} from "./assignment-stepper";

// Shared handles the module mocks below read from. `vi.hoisted` keeps them
// available inside the hoisted `vi.mock` factories.
const h = vi.hoisted(() => ({
	router: { query: {}, isReady: true, push: () => {}, replace: () => {} },
	get: null,
	post: null,
}));

vi.mock("next/router", () => ({
	useRouter: () => h.router,
}));

vi.mock("axios", () => ({
	default: {
		get: (...args) => h.get(...args),
		post: (...args) => h.post(...args),
	},
}));

const ASSIGNMENTS = [
	{
		id: 1,
		question: "Write a summary about Climate Change",
		eval_text: { id: 10, title: "Climate Change", text: "Passage one text." },
	},
	{
		id: 2,
		question: "Summarize how photosynthesis works",
		eval_text: { id: 11, title: "Photosynthesis", text: "Passage two text." },
	},
];

const SCORES = {
	content_score: 74,
	wording_score: 80,
	word_count: 12,
	matched_terms: ["carbon"],
	missed_terms: ["ocean"],
};

beforeEach(() => {
	h.router = { query: {}, isReady: true, push: () => {}, replace: () => {} };
	h.get = vi.fn((url) => {
		if (url === "/api/assignments") {
			return Promise.resolve({ status: 200, data: { assignments: ASSIGNMENTS } });
		}
		const id = Number(String(url).split("/").pop());
		const match = ASSIGNMENTS.find((a) => a.id === id) || ASSIGNMENTS[0];
		return Promise.resolve({ status: 200, data: { assignments: match } });
	});
	h.post = vi.fn((url) => {
		if (url === "/api/remarks") {
			return Promise.resolve({ data: { result: { bullets: [] } } });
		}
		return Promise.resolve({ data: SCORES });
	});
});

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});

const renderStepper = () =>
	render(
		<SnackbarProvider>
			<AssignmentStepper />
		</SnackbarProvider>
	);

const clickNext = () =>
	fireEvent.click(screen.getByRole("button", { name: /^next$/i }));

// Walk from the assignment list to the review step with an answer typed in.
const goToReview = async (answer = "A short summary of the passage.") => {
	renderStepper();
	fireEvent.click(await screen.findByText("Climate Change"));
	clickNext();
	const field = await screen.findByRole("textbox", { name: /your answer/i });
	fireEvent.change(field, { target: { value: answer } });
	clickNext();
	return field;
};

describe("AssignmentStepper — selection and answering", () => {
	it("renders the assignment list on the first step", async () => {
		renderStepper();
		expect(await screen.findByText("Climate Change")).toBeInTheDocument();
		expect(screen.getByText("Photosynthesis")).toBeInTheDocument();
		expect(
			screen.getByText(/choose an assignment to summarize/i)
		).toBeInTheDocument();
		// Nothing selected yet, so the user can't move on.
		expect(screen.getByRole("button", { name: /^next$/i })).toBeDisabled();
	});

	it("selecting an assignment enables Next and advances to the answer step", async () => {
		renderStepper();
		fireEvent.click(await screen.findByText("Photosynthesis"));
		const next = screen.getByRole("button", { name: /^next$/i });
		expect(next).toBeEnabled();
		fireEvent.click(next);
		expect(
			await screen.findByRole("textbox", { name: /your answer/i })
		).toBeInTheDocument();
		// The chosen assignment's question is echoed on the answer step.
		expect(
			screen.getByText("Summarize how photosynthesis works")
		).toBeInTheDocument();
	});

	it("exposes the assignment cards as focusable buttons", async () => {
		renderStepper();
		const card = await screen.findByRole("button", {
			name: /select climate change/i,
		});
		expect(card).toHaveAttribute("tabindex", "0");
		expect(card).toHaveAttribute("aria-pressed", "false");
	});

	it("selects an assignment with the Enter key", async () => {
		renderStepper();
		const card = await screen.findByRole("button", {
			name: /select photosynthesis/i,
		});
		fireEvent.keyDown(card, { key: "Enter" });
		await waitFor(() => expect(card).toHaveAttribute("aria-pressed", "true"));
		expect(screen.getByRole("button", { name: /^next$/i })).toBeEnabled();
	});

	it("selects an assignment with the Space key without scrolling", async () => {
		renderStepper();
		const card = await screen.findByRole("button", {
			name: /select photosynthesis/i,
		});
		const event = new KeyboardEvent("keydown", {
			key: " ",
			bubbles: true,
			cancelable: true,
		});
		fireEvent(card, event);
		expect(event.defaultPrevented).toBe(true);
		await waitFor(() => expect(card).toHaveAttribute("aria-pressed", "true"));
	});

	it("ignores other keys on an assignment card", async () => {
		renderStepper();
		const card = await screen.findByRole("button", {
			name: /select photosynthesis/i,
		});
		fireEvent.keyDown(card, { key: "a" });
		expect(card).toHaveAttribute("aria-pressed", "false");
		expect(screen.getByRole("button", { name: /^next$/i })).toBeDisabled();
	});

	it("updates the word counter as the student types", async () => {
		renderStepper();
		fireEvent.click(await screen.findByText("Climate Change"));
		clickNext();
		const field = await screen.findByRole("textbox", { name: /your answer/i });
		expect(
			screen.getByText(/write your summary in your own words/i)
		).toBeInTheDocument();
		fireEvent.change(field, { target: { value: "one" } });
		expect(screen.getByText(/^1 word —/)).toBeInTheDocument();
		fireEvent.change(field, { target: { value: "one two three" } });
		expect(screen.getByText(/^3 words —/)).toBeInTheDocument();
	});

	it("fills the answer from the strong sample button", async () => {
		renderStepper();
		fireEvent.click(await screen.findByText("Climate Change"));
		clickNext();
		fireEvent.click(
			await screen.findByRole("button", { name: /try a strong sample/i })
		);
		const field = screen.getByRole("textbox", { name: /your answer/i });
		await waitFor(() => expect(field.value.length).toBeGreaterThan(0));
	});

	it("blocks Next on the answer step until something is written", async () => {
		renderStepper();
		fireEvent.click(await screen.findByText("Climate Change"));
		clickNext();
		await screen.findByRole("textbox", { name: /your answer/i });
		expect(screen.getByRole("button", { name: /^next$/i })).toBeDisabled();
		fireEvent.change(screen.getByRole("textbox", { name: /your answer/i }), {
			target: { value: "   " },
		});
		expect(screen.getByRole("button", { name: /^next$/i })).toBeDisabled();
	});
});

describe("AssignmentStepper — scoring", () => {
	it("submits the summary and shows the scores in the modal", async () => {
		await goToReview("The passage explains carbon emissions in plain terms.");
		fireEvent.click(await screen.findByRole("button", { name: /submit/i }));

		const dialog = await screen.findByRole("presentation");
		expect(await within(dialog).findByText("74")).toBeInTheDocument();
		expect(within(dialog).getByText("80")).toBeInTheDocument();
		// Concept-coverage chips come straight from the API payload.
		expect(within(dialog).getByText("carbon")).toBeInTheDocument();
		expect(within(dialog).getByText("ocean")).toBeInTheDocument();

		const scoreCall = h.post.mock.calls.find(
			(c) => c[0] === "/api/summaryview"
		);
		expect(scoreCall[1]).toMatchObject({
			prompt_id: 1,
			summary: "The passage explains carbon emissions in plain terms.",
		});
	});

	it("surfaces a snackbar error when scoring fails", async () => {
		h.post = vi.fn((url) => {
			if (url === "/api/remarks") {
				return Promise.resolve({ data: { result: { bullets: [] } } });
			}
			return Promise.reject(new Error("boom"));
		});
		await goToReview();
		fireEvent.click(await screen.findByRole("button", { name: /submit/i }));
		expect(
			await screen.findByText(/scoring failed — please try submitting again/i)
		).toBeInTheDocument();
	});
});

describe("buildShareUrl", () => {
	const origin = "https://example.test";

	it("embeds the summary when the link fits", () => {
		const { url, includesSummary } = buildShareUrl(
			3,
			"A compact summary.",
			origin
		);
		expect(includesSummary).toBe(true);
		expect(url).toBe(
			"https://example.test/dashboard-student?prompt_id=3&summary=A+compact+summary."
		);
		expect(url.length).toBeLessThanOrEqual(SHARE_URL_MAX_LENGTH);
	});

	it("drops the summary and links to the assignment when too long", () => {
		const { url, includesSummary } = buildShareUrl(
			3,
			"climate ".repeat(400),
			origin
		);
		expect(includesSummary).toBe(false);
		expect(url).toBe("https://example.test/dashboard-student?assignment=3");
		expect(url.length).toBeLessThanOrEqual(SHARE_URL_MAX_LENGTH);
	});

	it("keeps a link that lands exactly on the limit", () => {
		const prefix = `${origin}/dashboard-student?prompt_id=3&summary=`;
		const summary = "a".repeat(SHARE_URL_MAX_LENGTH - prefix.length);
		const { url, includesSummary } = buildShareUrl(3, summary, origin);
		expect(includesSummary).toBe(true);
		expect(url).toHaveLength(SHARE_URL_MAX_LENGTH);
	});

	it("returns an empty link when there is no origin to build on", () => {
		expect(buildShareUrl(3, "anything", "")).toEqual({
			url: "",
			includesSummary: false,
		});
	});
});

describe("AssignmentStepper — sharing", () => {
	const useClipboard = () => {
		const writeText = vi.fn(() => Promise.resolve());
		Object.defineProperty(window.navigator, "clipboard", {
			value: { writeText },
			configurable: true,
		});
		return writeText;
	};

	it("copies a permalink that replays the summary", async () => {
		const writeText = useClipboard();
		await goToReview("A concise summary of the passage.");
		fireEvent.click(await screen.findByRole("button", { name: /submit/i }));
		fireEvent.click(await screen.findByRole("button", { name: /copy link/i }));

		expect(writeText).toHaveBeenCalledTimes(1);
		expect(writeText.mock.calls[0][0]).toContain(
			"prompt_id=1&summary=A+concise+summary+of+the+passage."
		);
		expect(
			await screen.findByText(/share link copied to clipboard/i)
		).toBeInTheDocument();
	});

	it("falls back to an assignment link when the summary is too long", async () => {
		const writeText = useClipboard();
		await goToReview("climate change ".repeat(200));
		fireEvent.click(await screen.findByRole("button", { name: /submit/i }));
		fireEvent.click(await screen.findByRole("button", { name: /copy link/i }));

		const copied = writeText.mock.calls[0][0];
		expect(copied).toContain("/dashboard-student?assignment=1");
		expect(copied).not.toContain("summary=");
		expect(copied.length).toBeLessThanOrEqual(SHARE_URL_MAX_LENGTH);
		expect(
			await screen.findByText(/too long for a link/i)
		).toBeInTheDocument();
	});
});

describe("AssignmentStepper — deep links", () => {
	it("jumps to the answer step for ?assignment=ID", async () => {
		h.router = { ...h.router, query: { assignment: "2" } };
		renderStepper();
		expect(
			await screen.findByRole("textbox", { name: /your answer/i })
		).toBeInTheDocument();
		expect(
			screen.getByText("Summarize how photosynthesis works")
		).toBeInTheDocument();
	});

	it("replays a shared result from ?prompt_id=&summary=", async () => {
		h.router = {
			...h.router,
			query: { prompt_id: "1", summary: "A shared summary of the passage." },
		};
		renderStepper();

		const dialog = await screen.findByRole("presentation");
		expect(await within(dialog).findByText("74")).toBeInTheDocument();
		await waitFor(() =>
			expect(
				h.post.mock.calls.find((c) => c[0] === "/api/summaryview")
			).toBeTruthy()
		);
		expect(
			h.post.mock.calls.find((c) => c[0] === "/api/summaryview")[1]
		).toMatchObject({
			prompt_id: 1,
			summary: "A shared summary of the passage.",
		});
		// The replayed answer is preserved on the review step behind the modal.
		expect(
			screen.getByText("A shared summary of the passage.")
		).toBeInTheDocument();
	});

	it("ignores a blank summary= instead of replaying an empty submission", async () => {
		h.router = { ...h.router, query: { prompt_id: "1", summary: "   " } };
		renderStepper();
		expect(await screen.findByText("Climate Change")).toBeInTheDocument();
		// Still on the selection step, with no score request fired.
		expect(screen.queryByText(/your scores/i)).not.toBeInTheDocument();
		await waitFor(() =>
			expect(
				h.post.mock.calls.filter((c) => c[0] === "/api/summaryview")
			).toHaveLength(0)
		);
	});

	it("falls back to ?assignment when the shared summary is blank", async () => {
		h.router = {
			...h.router,
			query: { assignment: "2", prompt_id: "1", summary: "" },
		};
		renderStepper();
		expect(
			await screen.findByRole("textbox", { name: /your answer/i })
		).toBeInTheDocument();
		expect(
			screen.getByText("Summarize how photosynthesis works")
		).toBeInTheDocument();
	});

	it("explains when a shared link points at an unknown assignment", async () => {
		h.router = {
			...h.router,
			query: { prompt_id: "999", summary: "A shared summary." },
		};
		renderStepper();
		expect(
			await screen.findByText(/points to an assignment we couldn't find/i)
		).toBeInTheDocument();
		expect(screen.queryByText(/your scores/i)).not.toBeInTheDocument();
	});

	it("lets the share permalink win when both deep links are present", async () => {
		h.router = {
			...h.router,
			query: {
				assignment: "2",
				prompt_id: "1",
				summary: "A shared summary of the passage.",
			},
		};
		renderStepper();

		const dialog = await screen.findByRole("presentation");
		expect(await within(dialog).findByText("74")).toBeInTheDocument();
		// The share replay scored assignment 1, not the ?assignment=2 deep link.
		expect(
			h.post.mock.calls.find((c) => c[0] === "/api/summaryview")[1]
		).toMatchObject({ prompt_id: 1 });
		// Behind the modal we are on the review step for assignment 1.
		expect(
			screen.getByText("Write a summary about Climate Change")
		).toBeInTheDocument();
		expect(
			screen.queryByRole("textbox", { name: /your answer/i })
		).not.toBeInTheDocument();
	});

	it("applies a share permalink only once across re-renders", async () => {
		h.router = {
			...h.router,
			query: { prompt_id: "1", summary: "A shared summary of the passage." },
		};
		const { rerender } = renderStepper();
		const dialog = await screen.findByRole("presentation");
		await within(dialog).findByText("74");

		// A fresh query object with identical values (what Next.js hands back on
		// re-render) must not re-trigger the replay.
		h.router = { ...h.router, query: { ...h.router.query } };
		rerender(
			<SnackbarProvider>
				<AssignmentStepper />
			</SnackbarProvider>
		);
		await waitFor(() =>
			expect(
				h.post.mock.calls.filter((c) => c[0] === "/api/summaryview")
			).toHaveLength(1)
		);
	});

	it("tells the user when a shared result can't be scored", async () => {
		h.router = {
			...h.router,
			query: { prompt_id: "1", summary: "A shared summary." },
		};
		h.post = vi.fn((url) => {
			if (url === "/api/remarks") {
				return Promise.resolve({ data: { result: { bullets: [] } } });
			}
			return Promise.reject(new Error("boom"));
		});
		renderStepper();
		expect(
			await screen.findByText(/couldn't load the shared result/i)
		).toBeInTheDocument();
	});
});
