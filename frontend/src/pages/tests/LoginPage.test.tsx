
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi, describe, it, beforeEach, expect } from "vitest";
import LoginPage from "../LoginPage";

vi.mock("react-hot-toast", () => {
  return {
    __esModule: true,
    default: {
      success: vi.fn(),
      error: vi.fn(),
    },
    Toaster: () => <div data-testid="toast" />,
  };
});

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (orig) => {
  const actual: any = await orig();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("LoginPage", () => {
  let toast: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    localStorage.clear();

    // Load the mocked toast after mocks are set
    toast = (await vi.importMock("react-hot-toast")).default;
  });

  it("renders login form and register link", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /need an account\? register/i })
    ).toBeInTheDocument();
  });

  it("handles successful login", async () => {
    const fakeToken = "abc123";

    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify({ token: fakeToken }),
    } as any);

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: "john" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "pass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(localStorage.getItem("token")).toBe(fakeToken);
      expect(toast.success).toHaveBeenCalledWith("Login successful");
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("handles invalid login", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      text: async () => "Invalid",
    } as any);

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: "bad" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "creds" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid username or password");
    });
  });

  it("handles network error", async () => {
    vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Network error"));

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: "net" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "error" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Something went wrong. Please try again."
      );
    });
  });
});
