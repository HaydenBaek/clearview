import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, beforeEach, vi, expect } from "vitest";
import NewCustomerPage from "../NewCustomerPage";

// Mock react-toastify
vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

let fetchSpy: ReturnType<typeof vi.fn>;

describe("NewCustomerPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchSpy = vi.fn();
    global.fetch = fetchSpy;
    localStorage.setItem("token", "fake-token");
  });

  it("shows validation errors when required fields are empty", async () => {
    render(
      <MemoryRouter>
        <NewCustomerPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /create customer/i }));

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/address is required/i)).toBeInTheDocument();
  });

  it("submits form successfully and navigates on success", async () => {
    const { toast } = await import("react-toastify");

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, name: "Alice" }),
    });

    render(
      <MemoryRouter>
        <NewCustomerPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/enter customer name/i), {
      target: { value: "Alice" },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter address/i), {
      target: { value: "123 St" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create customer/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Customer created successfully!");
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });

    const call = fetchSpy.mock.calls[0];
    expect(call[0]).toContain("/api/customers");
    expect((call[1] as RequestInit).method).toBe("POST");
    expect((call[1] as RequestInit).headers).toMatchObject({
      "Content-Type": "application/json",
      Authorization: "Bearer fake-token",
    });
  });

  it("shows error toast when API call fails", async () => {
    const { toast } = await import("react-toastify");

    fetchSpy.mockResolvedValueOnce({ ok: false });

    render(
      <MemoryRouter>
        <NewCustomerPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/enter customer name/i), {
      target: { value: "Bob" },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter address/i), {
      target: { value: "456 Ave" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create customer/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to save customer");
    });
  });

  it("navigates back when ← Back is clicked", () => {
    render(
      <MemoryRouter>
        <NewCustomerPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /← back/i }));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
