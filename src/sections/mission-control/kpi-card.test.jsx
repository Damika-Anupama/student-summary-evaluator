import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { KpiCard } from "./kpi-card";

afterEach(cleanup);

describe("KpiCard", () => {
	it("renders the label, value and suffix", () => {
		render(<KpiCard label="Class average" value={78} suffix="/100" />);
		expect(screen.getByText("Class average")).toBeInTheDocument();
		expect(screen.getByText("78")).toBeInTheDocument();
		expect(screen.getByText("/100")).toBeInTheDocument();
	});

	it("shows a positive delta with a + sign", () => {
		render(<KpiCard label="Submissions" value={12} delta={5} />);
		expect(screen.getByText("+5")).toBeInTheDocument();
	});

	it("shows a negative delta without a + sign", () => {
		render(<KpiCard label="Submissions" value={12} delta={-3} />);
		expect(screen.getByText("-3")).toBeInTheDocument();
	});

	it("does not render the value while loading", () => {
		render(<KpiCard label="Class average" value={78} loading />);
		expect(screen.queryByText("78")).not.toBeInTheDocument();
	});

	it("omits the delta row when delta is not a number", () => {
		render(<KpiCard label="Active" value={5} />);
		expect(screen.queryByText(/vs last week/i)).not.toBeInTheDocument();
	});
});
