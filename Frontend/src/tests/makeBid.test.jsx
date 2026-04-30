import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MakeBid } from "../pages/makeBid";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({
      state: {
        job: {
          id: "job-1",
          jobId: "job-1",
          services: ["valokuvat"],
          city: "Helsinki",
          area: "Lauttasaari",
          radius: "25",
          date: "2026-08-01",
          duration: "Half day (3-4 hours)",
          budgetMin: 100,
          budgetMax: 500,
          difficulty: "perus",
          description: "Test job",
          status: "open",
        },
      },
    }),
  };
});

vi.mock("../controllers/user", () => ({
  getUser: () => ({ uid: "photo-1", email: "photo@test.fi", name: "Test", userType: "photographer" }),
  isAuthenticated: () => true,
}));

vi.mock("../controllers/jobs", () => ({
  makeBid: vi.fn().mockResolvedValue({ success: true }),
}));

describe("MakeBid", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("renders the job brief with city", () => {
    render(<MemoryRouter><MakeBid /></MemoryRouter>);
    expect(screen.getByText(/Helsinki/)).toBeInTheDocument();
  });

  it("renders job description", () => {
    render(<MemoryRouter><MakeBid /></MemoryRouter>);
    expect(screen.getByText(/Test job/)).toBeInTheDocument();
  });

  it("does not show exactAddress (it is not in job state)", () => {
    render(<MemoryRouter><MakeBid /></MemoryRouter>);
    expect(screen.queryByText(/Sensitive Address/)).not.toBeInTheDocument();
  });

  it("shows the mandatory confirmation checkbox text", () => {
    render(<MemoryRouter><MakeBid /></MemoryRouter>);
    expect(screen.getByText(/Vahvistan, että pystyn toteuttamaan/)).toBeInTheDocument();
  });

  it("submit button is disabled when checkbox not checked", () => {
    render(<MemoryRouter><MakeBid /></MemoryRouter>);
    const submitBtn = screen.getByRole("button", { name: /Lähetä tarjous/i });
    expect(submitBtn).toBeDisabled();
  });

  it("submit button is enabled when price, proposal and checkbox are all set", () => {
    render(<MemoryRouter><MakeBid /></MemoryRouter>);

    fireEvent.change(screen.getByPlaceholderText(/hinta/i), { target: { value: "300" } });
    fireEvent.change(screen.getByPlaceholderText(/kuvaa/i), { target: { value: "I can do this job well" } });
    fireEvent.click(screen.getByRole("checkbox"));

    const submitBtn = screen.getByRole("button", { name: /Lähetä tarjous/i });
    expect(submitBtn).not.toBeDisabled();
  });
});
