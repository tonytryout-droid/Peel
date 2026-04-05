"use client";

import { useEffect, useState } from "react";
import { MaskCanvas } from "@/components/MaskCanvas";
import { ProcessingOverlay } from "@/components/ProcessingOverlay";
import { ResultViewer } from "@/components/ResultViewer";
import { UploadZone } from "@/components/UploadZone";
import { useInpaint } from "@/hooks/useInpaint";
import { EditorView, phaseToView } from "@/hooks/editor-view";

export default function EditorPage() {
  const [view, setView] = useState<EditorView>("upload");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { run, reset, phase, resultUrl, originalUrl, error, elapsedMs } = useInpaint();

  useEffect(() => {
    setView((current) => phaseToView(phase, current));
  }, [phase]);

  return (
    <main style={{ display: "grid", gap: 20 }}>
      <header>
        <h1 style={{ marginBottom: 8 }}>Peel Editor</h1>
        <p style={{ margin: 0, color: "#4b5563" }}>Mask the region you want removed, then run inpainting.</p>
      </header>

      {view === "upload" ? (
        <UploadZone
          onFile={(file) => {
            setImageFile(file);
            setView("edit");
          }}
        />
      ) : null}

      {view === "edit" && imageFile ? <MaskCanvas imageFile={imageFile} onSubmit={run} /> : null}

      {view === "processing" && (phase === "uploading" || phase === "inferring") ? (
        <ProcessingOverlay phase={phase} />
      ) : null}

      {view === "result" && resultUrl ? (
        <section style={{ display: "grid", gap: 16 }}>
          <ResultViewer originalUrl={originalUrl} resultUrl={resultUrl} elapsedMs={elapsedMs} />
          <button
            type="button"
            onClick={() => {
              reset();
              setImageFile(null);
              setView("upload");
            }}
            style={{ width: "fit-content", background: "#0f172a", color: "#fff" }}
          >
            New Image
          </button>
        </section>
      ) : null}

      {error && phase === "error" ? (
        <p style={{ color: "#b91c1c", marginTop: 0 }}>
          {error}
        </p>
      ) : null}
    </main>
  );
}
