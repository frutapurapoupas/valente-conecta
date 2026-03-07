import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon({
  searchParams,
}: {
  searchParams: { size?: string };
}) {
  const requestedSize = Number(searchParams?.size || "512");
  const finalSize = requestedSize > 0 ? requestedSize : 512;

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
          position: "relative",
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
            fontSize: finalSize * 0.22,
            fontWeight: 800,
            letterSpacing: -2,
          }}
        >
          VC
        </div>
      </div>
    ),
    {
      width: finalSize,
      height: finalSize,
    }
  );
}