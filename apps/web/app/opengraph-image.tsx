import { ImageResponse } from "next/og";

export const alt = "Median - Vetted mentorship for African professionals";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#fcfcfd",
          color: "#111827",
          padding: "72px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            fontSize: "34px",
            fontWeight: 800,
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              background: "#ff4f1f",
            }}
          />
          Median
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              maxWidth: "860px",
              fontSize: "76px",
              lineHeight: 0.95,
              fontWeight: 900,
              letterSpacing: "-2px",
            }}
          >
            Meet the mentor who changes everything.
          </div>
          <div
            style={{
              maxWidth: "720px",
              fontSize: "28px",
              lineHeight: 1.35,
              color: "#4b5563",
              fontWeight: 600,
            }}
          >
            Vetted experts. Real advice. Free to start. Built for ambitious
            African professionals.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: "#ff4f1f",
            fontSize: "24px",
            fontWeight: 800,
          }}
        >
          Join the waitlist
          <span style={{ color: "#111827" }}>medianhq.co</span>
        </div>
      </div>
    ),
    size,
  );
}
