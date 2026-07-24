import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { SnackbarProvider } from "src/contexts/snackbar-context";
import { NotificationsPopover } from "./notifications-popover";

vi.mock("next/router", () => ({
	useRouter: () => ({ push: vi.fn() }),
}));

afterEach(cleanup);

const renderPopover = () =>
	render(
		<SnackbarProvider>
			<NotificationsPopover />
		</SnackbarProvider>
	);

describe("NotificationsPopover", () => {
	it("shows the unread count on the bell", () => {
		renderPopover();
		expect(
			screen.getByRole("button", { name: /notifications \(4 unread\)/i })
		).toBeInTheDocument();
	});

	it("marks a single notification as read on click", () => {
		renderPopover();
		fireEvent.click(
			screen.getByRole("button", { name: /notifications \(4 unread\)/i })
		);
		fireEvent.click(
			screen.getByRole("button", {
				name: /sarah wilson hit a new high \(unread\)/i,
			})
		);
		// The popover (a modal) aria-hides the rest of the page, so query the
		// bell by its label rather than by role.
		expect(
			screen.getByLabelText(/notifications \(3 unread\)/i)
		).toBeInTheDocument();
		// The clicked item no longer carries the unread marker.
		expect(screen.queryByTestId("unread-dot-n2")).not.toBeInTheDocument();
		expect(screen.getByTestId("unread-dot-n1")).toBeInTheDocument();
	});

	it("marks a notification as read via the keyboard", () => {
		renderPopover();
		fireEvent.click(
			screen.getByRole("button", { name: /notifications \(4 unread\)/i })
		);
		const row = screen.getByRole("button", {
			name: /sarah wilson hit a new high \(unread\)/i,
		});
		expect(row).toHaveAttribute("tabindex", "0");
		fireEvent.keyDown(row, { key: "Enter" });
		expect(
			screen.getByLabelText(/notifications \(3 unread\)/i)
		).toBeInTheDocument();
	});

	it("re-anchors its relative timestamps to the current clock", () => {
		vi.useFakeTimers();
		try {
			vi.setSystemTime(new Date("2026-03-01T12:00:00.000Z"));
			renderPopover();
			fireEvent.click(
				screen.getByRole("button", { name: /notifications \(4 unread\)/i })
			);
			// The oldest fixture is 5h old and still reads as 5 hours old...
			expect(screen.getByText("12 minutes ago")).toHaveAttribute(
				"datetime",
				"2026-03-01T11:48:00.000Z"
			);
			expect(screen.getByText("5 hours ago")).toBeInTheDocument();
			cleanup();

			// ...and a year later it still does, anchored to the new clock
			// rather than frozen at a hardcoded "12m ago".
			vi.setSystemTime(new Date("2027-03-01T12:00:00.000Z"));
			renderPopover();
			fireEvent.click(
				screen.getByRole("button", { name: /notifications \(4 unread\)/i })
			);
			expect(screen.getByText("12 minutes ago")).toHaveAttribute(
				"datetime",
				"2027-03-01T11:48:00.000Z"
			);
		} finally {
			vi.useRealTimers();
		}
	});

	it("clears the badge when marking all as read", () => {
		renderPopover();
		fireEvent.click(
			screen.getByRole("button", { name: /notifications \(4 unread\)/i })
		);
		const markAll = screen.getByRole("button", { name: /mark all read/i });
		fireEvent.click(markAll);
		expect(screen.getByLabelText(/^notifications$/i)).toBeInTheDocument();
		expect(markAll).toBeDisabled();
		expect(
			screen.getByText(/all notifications marked as read/i)
		).toBeInTheDocument();
	});
});
