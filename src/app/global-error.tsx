"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            padding: "0 24px",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: 480 }}>
            <h1 style={{ fontSize: "2rem", margin: "0 0 8px" }}>
              Something went wrong
            </h1>
            <p style={{ color: "#666", margin: "0 0 24px" }}>
              An unexpected error occurred. The issue has been logged.
            </p>
            <button
              type="button"
              onClick={reset}
              style={{
                padding: "10px 24px",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#fff",
                backgroundColor: "#1976d2",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
