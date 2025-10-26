import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LandingPage from "../LandingPage";
import { describe, expect, it } from "vitest";

describe("LandingPage", () => {
  it("renders heading and description", () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Welcome to ClearView")).toBeInTheDocument();
    expect(
      screen.getByText("Manage your jobs, customers, and invoices all in one place.")
    ).toBeInTheDocument();
  });

  it("renders login and register links", () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    const loginLink = screen.getByRole("link", { name: /login/i });
    const registerLink = screen.getByRole("link", { name: /create account/i });

    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute("href", "/login");

    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute("href", "/register");
  });
});
