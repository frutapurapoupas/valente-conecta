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
          background: "#16a34a",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            width: "78%",
            height: "78%",
            borderRadius: "24%",
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#16a34a",
            fontSize: 44,
            fontWeight: 800,
            letterSpacing: -1.5,
          }}
        >
          VC
        </div>
      </div>
    ),
    { width: 180, height: 180 }
  );
}