import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Jobs } from "../pages/jobs";

vi.mock("../controllers/user", () => ({
  getUser: () => ({ uid: "photo-1", email: "photo@test.fi", name: "Test", userType: "photographer" }),
  isAuthenticated: () => true,
}));

vi.mock("../controllers/jobs", () => ({
  fetchJobs: vi.fn().mockResolvedValue([
    {
      id: "job-1",
      services: ["valokuvat"],
      city: "Helsinki",
      area: "Lauttasaari",
      radius: "25",
      date: "2026-08-01",
      duration: "Half day",
      description: "Photo job",
      status: "open",
      difficulty: "perus",
    },
  ]),
  deleteJob: vi.fn(),
}));

describe("Jobs page - photographer view", () => {
  it("renders job city in listing", async () => {
    render(<MemoryRouter><Jobs /></MemoryRouter>);
    expect(await screen.findByText(/Helsinki/)).toBeInTheDocument();
  });

  it("renders job description", async () => {
    render(<MemoryRouter><Jobs /></MemoryRouter>);
    expect(await screen.findByText(/Photo job/)).toBeInTheDocument();
  });

  it("shows Make a Bid button for open jobs (photographer)", async () => {
    render(<MemoryRouter><Jobs /></MemoryRouter>);
    expect(await screen.findByRole("button", { name: /Make a Bid/i })).toBeInTheDocument();
  });

  it("does not show customer email in the listing", async () => {
    render(<MemoryRouter><Jobs /></MemoryRouter>);
    await screen.findByText(/Helsinki/);
    expect(screen.queryByText(/cust@test/)).not.toBeInTheDocument();
  });
});
