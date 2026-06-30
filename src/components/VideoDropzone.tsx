"use client";

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckIcon, FilmIcon, TrashIcon, UploadIcon } from "./icons";
import { useI18n } from "./providers/I18nProvider";
import { cn } from "@/lib/utils";
import type { UploadResponse } from "@/lib/types";

type Status = "idle" | "uploading" | "ready" | "error";

/** Lee la duración (s) de un archivo de video en el cliente, sin subirlo. */
function readVideoDuration(file: File): Promise<number | undefined> {
  return new Promise((resolve) => {
    try {
      const url = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.preload = "metadata";
      const done = (value?: number) => {
        URL.revokeObjectURL(url);
        resolve(value);
      };
      video.onloadedmetadata = () => {
        const d = video.duration;
        done(Number.isFinite(d) && d > 0 ? Math.round(d) : undefined);
      };
      video.onerror = () => done(undefined);
      video.src = url;
    } catch {
      resolve(undefined);
    }
  });
}

export function VideoDropzone({
  onUploaded,
}: {
  onUploaded: (r: UploadResponse | null) => void;
}) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [durationSec, setDurationSec] = useState<number | undefined>(undefined);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("video/")) {
        setStatus("error");
        setErrorMsg(t.dropError);
        return;
      }
      setFileName(file.name);
      setStatus("uploading");
      setErrorMsg("");

      // La duración se lee en paralelo a la subida (no bloquea si falla).
      const durationPromise = readVideoDuration(file);

      try {
        const fd = new FormData();
        fd.append("video", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || t.dropError);
        const dur = await durationPromise;
        setDurationSec(dur);
        setStatus("ready");
        onUploaded({ ...(data as UploadResponse), durationSec: dur });
      } catch (err) {
        setStatus("error");
        setErrorMsg(err instanceof Error ? err.message : t.dropError);
        onUploaded(null);
      }
    },
    [onUploaded, t],
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const reset = () => {
    setStatus("idle");
    setFileName("");
    setDurationSec(undefined);
    setErrorMsg("");
    onUploaded(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      <motion.div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => status !== "uploading" && inputRef.current?.click()}
        animate={{ scale: dragging ? 1.015 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={cn(
          "relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed p-6 text-center transition-colors",
          dragging
            ? "border-accent bg-accent/10"
            : "border-border bg-surface/40 hover:border-accent/60 hover:bg-surface/70",
          status === "uploading" && "cursor-wait",
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {status === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-col items-center gap-2"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                className="gradient-primary grid h-12 w-12 place-items-center rounded-2xl text-primary-foreground shadow-soft"
              >
                <UploadIcon className="h-6 w-6" />
              </motion.div>
              <p className="font-medium text-foreground">{t.dropTitle}</p>
              <p className="text-sm text-muted">{t.dropSubtitle}</p>
            </motion.div>
          )}

          {status === "uploading" && (
            <motion.div
              key="uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 py-1"
            >
              <span className="h-9 w-9 animate-spin-slow rounded-full border-2 border-accent/30 border-t-accent" />
              <p className="text-sm font-medium text-foreground">
                {t.dropAnalyzing}
              </p>
              <p className="max-w-full truncate text-xs text-muted">{fileName}</p>
            </motion.div>
          )}

          {status === "ready" && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between gap-3 text-left"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-success/15 text-success">
                  <CheckIcon className="h-6 w-6" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">
                    {fileName}
                  </p>
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-success">
                    <span className="flex items-center gap-1">
                      <FilmIcon className="h-3.5 w-3.5" /> {t.dropReady}
                    </span>
                    {durationSec ? (
                      <span className="rounded-md bg-success/15 px-1.5 py-0.5 font-mono font-semibold text-success">
                        {t.durationVideoDetected}: ~{durationSec}s
                      </span>
                    ) : null}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  reset();
                }}
                className="shrink-0 rounded-lg p-2 text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                aria-label={t.dropRemove}
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: [0, -5, 5, -3, 3, 0] }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-1"
            >
              <p className="text-sm font-medium text-danger">{t.dropError}</p>
              <p className="max-w-md text-xs text-muted">{errorMsg}</p>
              <span className="mt-1 text-xs text-accent underline">
                {t.dropChange}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
