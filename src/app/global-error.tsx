"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Global Error]:", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, -apple-system, sans-serif", margin: 0, padding: 0, backgroundColor: "#FAF8F5", color: "#1E1E1E" }}>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", textAlign: "center" }}>
          <div style={{ maxWidth: "480px", width: "100%", backgroundColor: "#FFF", border: "1px solid #EFEAE2", borderRadius: "24px", padding: "36px", boxShadow: "0 10px 30px rgba(0,0,0,0.06)" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "#FEE2E2", color: "#E10600", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: "28px" }}>
              🎀
            </div>
            <h1 style={{ fontSize: "24px", margin: "0 0 8px", fontWeight: "600", color: "#1E1E1E" }}>
              Atelier Knot Encountered
            </h1>
            <p style={{ fontSize: "13px", color: "#666", lineHeight: "1.6", margin: "0 0 24px" }}>
              Our bespoke studio encountered an unexpected error. Please untangle and reload the display.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={() => reset()}
                style={{ backgroundColor: "#E10600", color: "#FFF", border: "none", padding: "12px 24px", borderRadius: "9999px", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px", cursor: "pointer" }}
              >
                Reload Atelier
              </button>
              <Link
                href="/"
                style={{ backgroundColor: "#FAF8F5", color: "#1E1E1E", border: "1px solid #EFEAE2", padding: "12px 24px", borderRadius: "9999px", fontSize: "12px", fontWeight: "600", textDecoration: "none", textTransform: "uppercase", letterSpacing: "1px", display: "inline-block" }}
              >
                Return Home
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

