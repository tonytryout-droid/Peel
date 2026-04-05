import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <h1>Peel</h1>
      <p>Remove stickers and objects from images with manual masking.</p>
      <Link href="/editor">Open Editor</Link>
    </main>
  );
}
