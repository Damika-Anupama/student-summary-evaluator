import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { WelcomeDialog } from "./welcome-dialog";

afterEach(cleanup);

const noop = () => {};

describe("WelcomeDialog", () => {
	it("introduces the demo and its key features", () => {
		render(<WelcomeDialog open onClose={noop} onChooseRole={noop} />);
		expect(screen.getByText(/welcome to the demo/i)).toBeInTheDocument();
		expect(screen.getByText(/two personas/i)).toBeInTheDocument();
		expect(screen.getByText(/jump anywhere/i)).toBeInTheDocument();
		expect(screen.getByText(/instant scoring/i)).toBeInTheDocument();
	});

	it("reports the chosen role", () => {
		const onChooseRole = vi.fn();
		render(<WelcomeDialog open onClose={noop} onChooseRole={onChooseRole} />);
		fireEvent.click(
			screen.getByRole("button", { name: /explore as student/i })
		);
		expect(onChooseRole).toHaveBeenCalledWith("student");
		fireEvent.click(
			screen.getByRole("button", { name: /explore as teacher/i })
		);
		expect(onChooseRole).toHaveBeenCalledWith("teacher");
	});

	it("renders nothing when closed", () => {
		render(<WelcomeDialog open={false} onClose={noop} onChooseRole={noop} />);
		expect(screen.queryByText(/welcome to the demo/i)).not.toBeInTheDocument();
	});
});
