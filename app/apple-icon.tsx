import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(180deg, #16a34a 0%, #15803d 55%, #166534 100%)",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            width: "84%",
            height: "84%",
            borderRadius: "26%",
            background: "rgba(255,255,255,0.14)",
            border: "4px solid rgba(255,255,255,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 62,
              height: 62,
              borderRadius: "50%",
              border: "9px solid white",
              opacity: 0.95,
              top: 34,
            }}
          />

          <div
            style={{
              position: "absolute",
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: "#facc15",
              top: 57,
            }}
          />

          <div
            style={{
              position: "absolute",
              width: 12,
              height: 42,
              background: "white",
              borderRadius: 10,
              transform: "rotate(45deg)",
              top: 70,
              left: 101,
            }}
          />

          <div
            style={{
              position: "absolute",
              bottom: 18,
              fontSize: 28,
              fontWeight: 800,
              color: "white",
              letterSpacing: -1,
            }}
          >
            VC
          </div>
        </div>
      </div>
    ),
    {
      width: 180,
      height: 180,
    }
  );
}