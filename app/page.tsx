import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <h1>Peel</h1>
      <p style={{ color: "#4b5563", maxWidth: 480 }}>
        Remove stickers and objects from images with manual masking and AI inpainting.
      </p>
      <Link
        href="/editor"
        style={{
          display: "inline-block",
          background: "#0f172a",
          color: "#fff",
          borderRadius: 10,
          padding: "10px 18px",
          fontWeight: 600,
          textDecoration: "none"
        }}
      >
        Open Editor
      </Link>
    </main>
  );
}
