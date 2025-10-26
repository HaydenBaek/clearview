// src/pages/tests/MapPage.test.tsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  vi,
  type Mock,
} from "vitest";
import MapPage from "../MapPage";

// --- Mock react-map-gl/mapbox so clicks call props.onClick ---
vi.mock("react-map-gl/mapbox", () => {
  const MockMap = (props: any) => (
    <div
      data-testid="mock-map"
      onClick={() =>
        props.onClick?.({
          lngLat: { lat: 49.2827, lng: -123.1207 },
        } as any)
      }
    >
      {props.children}
    </div>
  );

  const Marker = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-marker">{children}</div>
  );

  return { __esModule: true, default: MockMap, Marker };
});

// --- Stub geolocation and fetch once for the suite ---
const mockGeolocation = {
  watchPosition: vi.fn(),
  clearWatch: vi.fn(),
};

beforeAll(() => {
  vi.stubGlobal("navigator", { geolocation: mockGeolocation } as any);
  global.fetch = vi.fn() as any;
});

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  // keep stubs but reset call history
  (global.fetch as unknown as Mock).mockReset();
});

describe("MapPage", () => {
  it("shows loading state initially", () => {
    render(
      <MemoryRouter>
        <MapPage />
      </MemoryRouter>
    );

    // With no success/error callback invoked, loading overlay should be visible
    expect(screen.getByText(/locating you/i)).toBeInTheDocument();
  });

  it("renders marker and address after clicking map", async () => {
    (global.fetch as unknown as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ features: [{ place_name: "123 Main St" }] }),
    });

    render(
      <MemoryRouter>
        <MapPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByTestId("mock-map"));

    await waitFor(() => {
      expect(screen.getByTestId("mock-marker")).toBeInTheDocument();
      expect(screen.getByText(/123 main st/i)).toBeInTheDocument();
    });
  });

  it("handles address fetch failure", async () => {
    (global.fetch as unknown as Mock).mockRejectedValueOnce(new Error("API error"));

    render(
      <MemoryRouter>
        <MapPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByTestId("mock-map"));

    await waitFor(() => {
      expect(screen.getByText(/unable to fetch address/i)).toBeInTheDocument();
    });
  });

  it("shows 'Create a Job' button after a pin and allows clicking it", async () => {
    (global.fetch as unknown as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ features: [{ place_name: "456 Oak St" }] }),
    });

    render(
      <MemoryRouter>
        <MapPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByTestId("mock-map"));

    const button = await screen.findByRole("button", { name: /create a job/i });
    expect(button).toBeInTheDocument();

    // We don't assert navigation here (MemoryRouter has no history by default)
    fireEvent.click(button);
  });

  it("handles geolocation error (loading overlay goes away)", async () => {
    mockGeolocation.watchPosition.mockImplementationOnce((_success, error) => {
      error?.({ message: "Permission denied" } as any);
      return 1 as any;
    });

    render(
      <MemoryRouter>
        <MapPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      // After error callback, component sets loadingLocation to false
      expect(screen.queryByText(/locating you/i)).not.toBeInTheDocument();
    });
  });
});
