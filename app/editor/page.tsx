"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
    <main style={{ display: "grid", gap: 28 }}>
      {/* Header */}
      <header style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "var(--text-muted)",
            textDecoration: "none",
            fontSize: "0.875rem",
            fontWeight: 500,
            padding: "6px 10px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)",
            background: "var(--surface)",
            boxShadow: "var(--shadow-sm)",
            transition: "color 0.15s, border-color 0.15s"
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </Link>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}>Peel Editor</h1>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.875rem" }}>
            Mask the region you want removed, then run inpainting.
          </p>
        </div>
      </header>

      {view === "upload" ? (
        <div className="animate-in">
          <UploadZone
            onFile={(file) => {
              setImageFile(file);
              setView("edit");
            }}
          />
        </div>
      ) : null}

      {view === "edit" && imageFile ? (
        <div className="animate-in">
          <MaskCanvas imageFile={imageFile} onSubmit={run} />
        </div>
      ) : null}

      {view === "processing" && (phase === "uploading" || phase === "inferring") ? (
        <div className="animate-in">
          <ProcessingOverlay phase={phase} />
        </div>
      ) : null}

      {view === "result" && resultUrl ? (
        <div className="animate-in" style={{ display: "grid", gap: 20 }}>
          <ResultViewer originalUrl={originalUrl} resultUrl={resultUrl} elapsedMs={elapsedMs} />
          <button
            type="button"
            onClick={() => {
              reset();
              setImageFile(null);
              setView("upload");
            }}
            style={{ width: "fit-content", background: "var(--primary)", color: "var(--primary-fg)" }}
          >
            ← New Image
          </button>
        </div>
      ) : null}

      {error && phase === "error" ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "var(--danger-bg)",
            border: "1px solid var(--danger-border)",
            borderRadius: "var(--radius-md)",
            padding: "12px 16px",
            color: "var(--danger)",
            fontSize: "0.9rem",
            fontWeight: 500
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden style={{ flexShrink: 0 }}>
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          {error}
        </div>
      ) : null}
    </main>
  );
}
