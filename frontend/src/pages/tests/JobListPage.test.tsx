import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import JobListPage from "../JobListPage";

vi.mock("react-toastify", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

let fetchSpy: ReturnType<typeof vi.fn>;

describe("JobListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchSpy = vi.fn();
    global.fetch = fetchSpy;
  });

  it("shows loading then renders jobs", async () => {
    const today = new Date().toISOString();

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          id: 1,
          service: "Window Cleaning",
          customerName: "Alice",
          jobDate: today,
          price: 100,
          notes: "Test note",
          address: "123 St",
          paid: false,
        },
      ],
    });

    render(
      <MemoryRouter>
        <JobListPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/loading jobs/i)).toBeInTheDocument();

    const todayHeading = await screen.findByRole("heading", { name: /today/i });
    const todaySection = todayHeading.closest("section")!;
    expect(within(todaySection).getByText("Alice")).toBeInTheDocument();
  });

  it("shows error toast when fetch fails", async () => {
    const { toast } = await import("react-toastify");
    fetchSpy.mockResolvedValueOnce({ ok: false });

    render(
      <MemoryRouter>
        <JobListPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to load jobs");
    });
  });

  it("navigates to create new job when no jobs", async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(
      <MemoryRouter>
        <JobListPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/no jobs found/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /\+ create new job/i })).toBeInTheDocument();
  });

  it("opens and confirms delete modal", async () => {
    const { toast } = await import("react-toastify");
    fetchSpy
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: 2,
            service: "Gutter Cleaning",
            customerName: "Bob",
            jobDate: new Date().toISOString(),
            price: 200,
            notes: "",
            address: "456 Ave",
            paid: false,
          },
        ],
      })
      .mockResolvedValueOnce({ ok: true, json: async () => [] }); // After delete re-fetch

    render(
      <MemoryRouter>
        <JobListPage />
      </MemoryRouter>
    );

    // Scope delete button to the correct section
    const todayHeading = await screen.findByRole("heading", { name: /today/i });
    const todaySection = todayHeading.closest("section")!;
    const deleteBtn = within(todaySection).getByRole("button", { name: /delete/i });
    fireEvent.click(deleteBtn);

    expect(await screen.findByText(/delete job/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /confirm/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Job deleted");
    });
  });

  it("marks job as paid", async () => {
    const { toast } = await import("react-toastify");
    const today = new Date().toISOString();

    fetchSpy
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: 3,
            service: "Window Cleaning",
            customerName: "Alice",
            jobDate: today,
            price: 100,
            notes: "",
            address: "123 St",
            paid: false,
          },
        ],
      })
      .mockResolvedValueOnce({ ok: true, json: async () => [] }) // PATCH
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: 3,
            service: "Window Cleaning",
            customerName: "Alice",
            jobDate: today,
            price: 100,
            notes: "",
            address: "123 St",
            paid: true,
          },
        ],
      }); // After re-fetch

    render(
      <MemoryRouter>
        <JobListPage />
      </MemoryRouter>
    );

    const todayHeading = await screen.findByRole("heading", { name: /today/i });
    const todaySection = todayHeading.closest("section")!;
    fireEvent.click(within(todaySection).getByRole("button", { name: /mark as paid/i }));

    fireEvent.click(await screen.findByRole("button", { name: /confirm/i }));

    await waitFor(() => {
      const paidHeading = screen.getByRole("heading", { name: /^paid$/i });
      const paidSection = paidHeading.closest("section")!;
      expect(within(paidSection).getByText("Alice")).toBeInTheDocument();
      expect(within(paidSection).getByText("Window Cleaning")).toBeInTheDocument();
      expect(within(paidSection).getByText("Paid", { selector: "span" })).toBeInTheDocument();
    });

    const patchCall = fetchSpy.mock.calls.find((c) =>
      String(c[0]).includes("/api/jobs/3/mark-paid")
    );
    const init = patchCall?.[1] as RequestInit;
    expect(init?.method).toBe("PATCH");

    expect(toast.success).toHaveBeenCalledWith("Job marked as paid");
  });
});
