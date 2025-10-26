import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi, describe, it, beforeEach, expect } from "vitest";
import NewJobPage from "../NewJobPage";

// Mock toast
vi.mock("react-toastify", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock useNavigate + useLocation
const mockNavigate = vi.fn();
const mockUseLocation = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockUseLocation(),
  };
});

let fetchSpy: ReturnType<typeof vi.fn>;

describe("NewJobPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchSpy = vi.fn();
    global.fetch = fetchSpy;
    localStorage.setItem("token", "fake-token");
    // Default: provide address from map
    mockUseLocation.mockReturnValue({ state: { address: "789 Pine St" } });
    
    // Default mock for fetchCustomers
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => [],
    });
  });

  it("shows validation errors when fields are missing (manual tab)", async () => {
    // Override to not provide pre-filled address
    mockUseLocation.mockReturnValue({ state: null });
    
    render(
      <MemoryRouter>
        <NewJobPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /create job/i }));

    expect(await screen.findByText(/customer name is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/address is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/job date is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/price must be greater than 0/i)).toBeInTheDocument();
  });

  it("submits job successfully in manual mode", async () => {
    const { toast } = await import("react-toastify");

    fetchSpy
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 1, name: "Alice", address: "123 St" }],
      })
      .mockResolvedValueOnce({ ok: true });

    render(
      <MemoryRouter>
        <NewJobPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/enter customer name/i), {
      target: { value: "Alice" },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter address/i), {
      target: { value: "123 St" },
    });
    
    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(dateInput, {
      target: { value: "2025-10-01" },
    });
    
    fireEvent.change(screen.getByPlaceholderText(/enter price/i), {
      target: { value: "150" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create job/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Job created!");
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });

    const call = fetchSpy.mock.calls.find(([url]) => String(url).includes("/api/jobs"));
    expect((call?.[1] as RequestInit).method).toBe("POST");
  });

  it("shows error toast when job creation fails", async () => {
    const { toast } = await import("react-toastify");

    fetchSpy
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({ ok: false });

    render(
      <MemoryRouter>
        <NewJobPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/enter customer name/i), {
      target: { value: "Bob" },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter address/i), {
      target: { value: "456 Ave" },
    });
    
    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(dateInput, {
      target: { value: "2025-10-02" },
    });
    
    fireEvent.change(screen.getByPlaceholderText(/enter price/i), {
      target: { value: "200" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create job/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to create job");
    });
  });

  it("switches to customer tab and requires selecting a customer", async () => {
    render(
      <MemoryRouter>
        <NewJobPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /from customer/i }));

    fireEvent.click(screen.getByRole("button", { name: /create job/i }));

    expect(await screen.findByText(/please select a customer/i)).toBeInTheDocument();
  });

  it("navigates back when ← Back button clicked", () => {
    render(
      <MemoryRouter>
        <NewJobPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /← back/i }));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("displays pre-filled address from map when provided", () => {
    render(
      <MemoryRouter>
        <NewJobPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/selected address/i)).toBeInTheDocument();
    expect(screen.getByText(/789 pine st/i)).toBeInTheDocument();
  });
});