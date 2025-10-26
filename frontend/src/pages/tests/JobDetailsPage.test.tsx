import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import JobDetailsPage from "../JobDetailsPage";
import { vi, describe, test, expect, beforeEach } from "vitest";

// --- Mock toast ---
vi.mock("react-toastify", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// --- Mock navigate ---
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual: any = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("JobDetailsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Mock fetch globally ---
  beforeEach(() => {
    (global.fetch as unknown) = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 1,
        service: "Window Cleaning",
        customerName: "Alice",
        jobDate: "2025-09-29T00:00:00",
        price: 100,
        notes: "Initial note",
        address: "123 Street",
      }),
    });
  });

  test("renders job details after fetch", async () => {
    render(
      <MemoryRouter initialEntries={["/jobs/1"]}>
        <Routes>
          <Route path="/jobs/:id" element={<JobDetailsPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Loading job details/i)).toBeInTheDocument();

    // Wait for job details
    await waitFor(() =>
      expect(screen.getByDisplayValue("Alice")).toBeInTheDocument()
    );

    expect(screen.getByDisplayValue("Window Cleaning")).toBeInTheDocument();
    expect(screen.getByDisplayValue("123 Street")).toBeInTheDocument();
  });

  test("edits and saves job", async () => {
    render(
      <MemoryRouter initialEntries={["/jobs/1"]}>
        <Routes>
          <Route path="/jobs/:id" element={<JobDetailsPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(screen.getByDisplayValue("Alice")).toBeInTheDocument()
    );

    const nameInput = screen.getByDisplayValue("Alice");
    fireEvent.change(nameInput, { target: { value: "Bob" } });

    (global.fetch as unknown) = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    const saveButton = screen.getByRole("button", { name: /Save Changes/i });
    fireEvent.click(saveButton);

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8080/api/jobs/1",
        expect.objectContaining({
          method: "PUT",
        })
      )
    );
  });
});
