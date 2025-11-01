import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi, describe, it, beforeEach, expect } from "vitest";
import RevenuePage from "../RevenuePage";
import userEvent from "@testing-library/user-event";

// Mock navigate from react-router-dom
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

let fetchSpy: ReturnType<typeof vi.fn>;

describe("RevenuePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchSpy = vi.fn();
    global.fetch = fetchSpy;
    localStorage.setItem("token", "fake-token");
  });

  it("shows loading state initially", () => {
    fetchSpy.mockImplementation(() => new Promise(() => {})); // never resolves
    render(
      <MemoryRouter>
        <RevenuePage />
      </MemoryRouter>
    );
    expect(screen.getByText(/loading revenue/i)).toBeInTheDocument();
  });

  it("fetches and displays revenue data correctly", async () => {
    const mockData = [
      { month: "January 2025", paid: 1000, unpaid: 500 },
      { month: "February 2025", paid: 1500, unpaid: 300 },
    ];

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    render(
      <MemoryRouter>
        <RevenuePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Revenue Dashboard")).toBeInTheDocument();
    });

    // KPI cards
    expect(screen.getByText("$2500.00")).toBeInTheDocument(); // total paid
    expect(screen.getByText("$800.00")).toBeInTheDocument();  // total unpaid
    expect(screen.getByText("$3300.00")).toBeInTheDocument(); // total revenue

    // Monthly breakdown
    expect(screen.getByText("January 2025")).toBeInTheDocument();
    expect(screen.getByText("February 2025")).toBeInTheDocument();
  });

  it("handles empty data gracefully", async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(
      <MemoryRouter>
        <RevenuePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/loading revenue/i)).not.toBeInTheDocument();
    });

    expect(screen.getAllByText("$0.00")).toHaveLength(3); // all KPI cards zero
    expect(screen.getByText(/monthly breakdown/i)).toBeInTheDocument();
  });

  it("handles fetch error and still renders", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    fetchSpy.mockRejectedValueOnce(new Error("Network error"));

    render(
      <MemoryRouter>
        <RevenuePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Revenue Dashboard")).toBeInTheDocument();
    });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("sends authorization header when token exists", async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(
      <MemoryRouter>
        <RevenuePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        `${import.meta.env.VITE_API_URL}/api/jobs/revenue`,
        expect.objectContaining({
          headers: { Authorization: "Bearer fake-token" },
        })
      );
    });
  });

  it("fetches without authorization header when no token", async () => {
    localStorage.removeItem("token");
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(
      <MemoryRouter>
        <RevenuePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        `${import.meta.env.VITE_API_URL}/api/jobs/revenue`,
        expect.objectContaining({ headers: {} })
      );
    });
  });

  it("navigates back when 'Back' button clicked", async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <RevenuePage />
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(screen.getByText("Revenue Dashboard")).toBeInTheDocument()
    );

    const backButton = screen.getByRole("button", { name: /← back/i });
    await user.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("shows the current date in header", async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(
      <MemoryRouter>
        <RevenuePage />
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(screen.getByText("Revenue Dashboard")).toBeInTheDocument()
    );

    const currentDate = new Date().toLocaleDateString();
    expect(screen.getByText(currentDate)).toBeInTheDocument();
  });

it("renders monthly totals correctly for one month", async () => {
  const mockData = [{ month: "May 2025", paid: 2000, unpaid: 1000 }];

  fetchSpy.mockResolvedValueOnce({
    ok: true,
    json: async () => mockData,
  });

  render(
    <MemoryRouter>
      <RevenuePage />
    </MemoryRouter>
  );

  await waitFor(() => {
    expect(screen.getByText("May 2025")).toBeInTheDocument();
  });

  expect(screen.getAllByText("$2000.00").length).toBeGreaterThanOrEqual(2);
  expect(screen.getAllByText("$1000.00").length).toBeGreaterThanOrEqual(2);
  expect(screen.getAllByText("$3000.00").length).toBeGreaterThanOrEqual(2);
});

});
