import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
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
          position: "relative",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            width: "84%",
            height: "84%",
            borderRadius: "26%",
            background: "rgba(255,255,255,0.14)",
            border: "8px solid rgba(255,255,255,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "inset 0 0 0 4px rgba(255,255,255,0.08)",
          }}
        >
          <div
            style={{
              position: "relative",
              width: 250,
              height: 250,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                position: "absolute",
                width: 160,
                height: 160,
                borderRadius: "50%",
                border: "22px solid white",
                opacity: 0.95,
              }}
            />

            <div
              style={{
                position: "absolute",
                width: 46,
                height: 46,
                borderRadius: "50%",
                background: "#facc15",
                top: 102,
                left: 102,
              }}
            />

            <div
              style={{
                position: "absolute",
                width: 30,
                height: 110,
                background: "white",
                borderRadius: 18,
                transform: "rotate(45deg)",
                top: 124,
                left: 168,
              }}
            />

            <div
              style={{
                position: "absolute",
                bottom: -6,
                fontSize: 52,
                fontWeight: 800,
                color: "white",
                letterSpacing: -2,
              }}
            >
              VC
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 512,
      height: 512,
    }
  );
}