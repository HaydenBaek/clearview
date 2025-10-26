import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi, describe, it, beforeEach, expect } from "vitest";
import RevenuePage from "../RevenuePage";
import userEvent from "@testing-library/user-event";

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
    fetchSpy.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <MemoryRouter>
        <RevenuePage />
      </MemoryRouter>
    );

    expect(screen.getByText(/loading revenue/i)).toBeInTheDocument();
  });

  it("fetches and displays revenue data", async () => {
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
      expect(screen.queryByText(/loading revenue/i)).not.toBeInTheDocument();
    });

    // Check KPI cards
    expect(screen.getByText("$2500.00")).toBeInTheDocument(); // Total Paid
    expect(screen.getByText("$800.00")).toBeInTheDocument(); // Total Unpaid
    expect(screen.getByText("$3300.00")).toBeInTheDocument(); // Total Revenue

    // Check table data
    expect(screen.getByText("January 2025")).toBeInTheDocument();
    expect(screen.getByText("February 2025")).toBeInTheDocument();
  });

  it("displays correct calculations in KPI cards", async () => {
    const mockData = [
      { month: "March 2025", paid: 750.5, unpaid: 250.75 },
      { month: "April 2025", paid: 1000.25, unpaid: 100.5 },
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
      expect(screen.getByText("$1750.75")).toBeInTheDocument(); // Total Paid
    });

    expect(screen.getByText("$351.25")).toBeInTheDocument(); // Total Unpaid
    expect(screen.getByText("$2102.00")).toBeInTheDocument(); // Total Revenue
  });

  it("displays monthly breakdown correctly", async () => {
    const mockData = [
      { month: "May 2025", paid: 2000, unpaid: 1000 },
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
      expect(screen.getByText("May 2025")).toBeInTheDocument();
    });

    // Check table values
    const rows = screen.getAllByRole("row");
    const dataRow = rows[1]; // Skip header row
    expect(dataRow).toHaveTextContent("May 2025");
    expect(dataRow).toHaveTextContent("$2000.00");
    expect(dataRow).toHaveTextContent("$1000.00");
    expect(dataRow).toHaveTextContent("$3000.00");
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

    // All three KPI cards show $0.00
    expect(screen.getAllByText("$0.00")).toHaveLength(3);
    expect(screen.getByText(/monthly breakdown/i)).toBeInTheDocument();
  });

  it("handles fetch error and still renders page", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    
    fetchSpy.mockRejectedValueOnce(new Error("Network error"));

    render(
      <MemoryRouter>
        <RevenuePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/loading revenue/i)).not.toBeInTheDocument();
    });

    // Page should render with zero values
    expect(screen.getByText("Revenue Dashboard")).toBeInTheDocument();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error fetching revenue",
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });

  it("navigates back when back button clicked", async () => {
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

    await waitFor(() => {
      expect(screen.getByText("Revenue Dashboard")).toBeInTheDocument();
    });

    const backButton = screen.getByRole("button", { name: /← back/i });
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("sends authorization header with token", async () => {
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
        "http://localhost:8080/api/jobs/revenue",
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
        "http://localhost:8080/api/jobs/revenue",
        expect.objectContaining({
          headers: {},
        })
      );
    });
  });

  it("displays current date in header", async () => {
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
      expect(screen.getByText("Revenue Dashboard")).toBeInTheDocument();
    });

    const currentDate = new Date().toLocaleDateString();
    expect(screen.getByText(currentDate)).toBeInTheDocument();
  });

  it("displays table headers correctly", async () => {
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
      expect(screen.getByText("Revenue Dashboard")).toBeInTheDocument();
    });

    // Use getAllByRole to get all column headers and verify they exist
    const headers = screen.getAllByRole("columnheader");
    expect(headers).toHaveLength(4);
    expect(headers[0]).toHaveTextContent("Month");
    expect(headers[1]).toHaveTextContent("Paid");
    expect(headers[2]).toHaveTextContent("Unpaid");
    expect(headers[3]).toHaveTextContent("Total");
  });

  it("renders multiple months in correct order", async () => {
    const mockData = [
      { month: "January 2025", paid: 100, unpaid: 50 },
      { month: "February 2025", paid: 200, unpaid: 75 },
      { month: "March 2025", paid: 300, unpaid: 100 },
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
      expect(screen.getByText("January 2025")).toBeInTheDocument();
    });

    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(4); 
    expect(rows[1]).toHaveTextContent("January 2025");
    expect(rows[2]).toHaveTextContent("February 2025");
    expect(rows[3]).toHaveTextContent("March 2025");
  });
});