import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { SnackbarProvider } from "src/contexts/snackbar-context";
import { MessagesPopover } from "./messages-popover";

afterEach(cleanup);

const renderPopover = () =>
	render(
		<SnackbarProvider>
			<MessagesPopover />
		</SnackbarProvider>
	);

describe("MessagesPopover", () => {
	it("shows the unread count on the icon", () => {
		renderPopover();
		expect(
			screen.getByRole("button", { name: /messages \(2 unread\)/i })
		).toBeInTheDocument();
	});

	it("marks a message read on click", () => {
		renderPopover();
		fireEvent.click(
			screen.getByRole("button", { name: /messages \(2 unread\)/i })
		);
		fireEvent.click(
			screen.getByRole("button", {
				name: /message from priya anderson \(unread\)/i,
			})
		);
		expect(screen.getByLabelText(/messages \(1 unread\)/i)).toBeInTheDocument();
		expect(screen.queryByTestId("unread-msg-dot-m1")).not.toBeInTheDocument();
	});

	it("marks a message read via the keyboard", () => {
		renderPopover();
		fireEvent.click(
			screen.getByRole("button", { name: /messages \(2 unread\)/i })
		);
		const row = screen.getByRole("button", {
			name: /message from sarah wilson \(unread\)/i,
		});
		expect(row).toHaveAttribute("tabindex", "0");
		fireEvent.keyDown(row, { key: " " });
		expect(screen.getByLabelText(/messages \(1 unread\)/i)).toBeInTheDocument();
	});

	it("re-anchors its relative timestamps to the current clock", () => {
		vi.useFakeTimers();
		try {
			vi.setSystemTime(new Date("2026-03-01T12:00:00.000Z"));
			renderPopover();
			fireEvent.click(
				screen.getByRole("button", { name: /messages \(2 unread\)/i })
			);
			expect(screen.getByText("26 minutes ago")).toHaveAttribute(
				"datetime",
				"2026-03-01T11:34:00.000Z"
			);
			expect(screen.getByText("1 day ago")).toBeInTheDocument();
			cleanup();

			// A year on the label is unchanged but the underlying instant has
			// moved with the clock — the fixture is an offset, not a frozen string.
			vi.setSystemTime(new Date("2027-03-01T12:00:00.000Z"));
			renderPopover();
			fireEvent.click(
				screen.getByRole("button", { name: /messages \(2 unread\)/i })
			);
			expect(screen.getByText("26 minutes ago")).toHaveAttribute(
				"datetime",
				"2027-03-01T11:34:00.000Z"
			);
		} finally {
			vi.useRealTimers();
		}
	});

	it("clears the badge when marking all read", () => {
		renderPopover();
		fireEvent.click(
			screen.getByRole("button", { name: /messages \(2 unread\)/i })
		);
		const markAll = screen.getByRole("button", { name: /mark all read/i });
		fireEvent.click(markAll);
		expect(screen.getByLabelText(/^messages$/i)).toBeInTheDocument();
		expect(markAll).toBeDisabled();
	});
});
