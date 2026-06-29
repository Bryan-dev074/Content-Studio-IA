"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckIcon, CloseIcon, ImageIcon, PlusIcon, TrashIcon } from "./icons";
import { useI18n } from "./providers/I18nProvider";
import { cn } from "@/lib/utils";
import type { ProductInput, UploadResponse } from "@/lib/types";

const inputCls =
  "w-full rounded-xl border border-border bg-surface/60 px-4 py-2.5 text-foreground placeholder:text-muted-2 outline-none transition-all focus:border-accent focus:bg-surface focus:ring-4 focus:ring-[var(--ring)]";

type Status = "idle" | "uploading" | "ready" | "error";

export function makeProduct(): ProductInput {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `p-${Math.random().toString(36).slice(2)}`,
    name: "",
    benefits: "",
  };
}

export function ProductList({
  products,
  onChange,
}: {
  products: ProductInput[];
  onChange: (next: ProductInput[]) => void;
}) {
  const { t } = useI18n();
  const [meta, setMeta] = useState<
    Record<string, { preview?: string; status: Status }>
  >({});

  const update = (id: string, patch: Partial<ProductInput>) =>
    onChange(products.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const add = () => onChange([...products, makeProduct()]);

  const remove = (id: string) => {
    onChange(products.filter((p) => p.id !== id));
    setMeta((m) => {
      const next = { ...m };
      delete next[id];
      return next;
    });
  };

  const setStatus = (id: string, status: Status, preview?: string) =>
    setMeta((m) => ({ ...m, [id]: { status, preview: preview ?? m[id]?.preview } }));

  const handleImage = async (id: string, file: File) => {
    if (!file.type.startsWith("image/")) return;
    const preview = URL.createObjectURL(file);
    setStatus(id, "uploading", preview);
    try {
      const fd = new FormData();
      fd.append("video", file); // el endpoint acepta imagen o video
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = (await res.json()) as UploadResponse & { error?: string };
      if (!res.ok) throw new Error(data.error);
      update(id, {
        imageFileUri: data.fileUri,
        imageMimeType: data.mimeType,
        imageName: file.name,
      });
      setStatus(id, "ready", preview);
    } catch {
      setStatus(id, "error", preview);
    }
  };

  const clearImage = (id: string) => {
    update(id, {
      imageFileUri: undefined,
      imageMimeType: undefined,
      imageName: undefined,
    });
    setStatus(id, "idle", undefined);
  };

  return (
    <div className="space-y-3">
      <AnimatePresence initial={false}>
        {products.map((p, i) => {
          const m = meta[p.id] ?? { status: "idle" as Status };
          return (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, height: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="rounded-2xl border border-border bg-surface-2/40 p-3.5"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
                  <span className="grid h-5 w-5 place-items-center rounded-md gradient-primary text-[11px] text-primary-foreground">
                    {i + 1}
                  </span>
                  {t.productLabel}
                </span>
                {products.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(p.id)}
                    className="rounded-lg p-1.5 text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                    aria-label={t.removeProduct}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                {/* Imagen del producto */}
                <label
                  className={cn(
                    "group relative grid h-[88px] w-[88px] shrink-0 cursor-pointer place-items-center overflow-hidden rounded-xl border border-dashed border-border bg-surface/50 text-center transition-colors hover:border-accent/60",
                    m.status === "error" && "border-danger/60",
                  )}
                  title={t.productImage}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleImage(p.id, f);
                    }}
                  />
                  {m.preview ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={m.preview}
                        alt={p.name || "producto"}
                        className="h-full w-full object-cover"
                      />
                      {m.status === "uploading" && (
                        <span className="absolute inset-0 grid place-items-center bg-black/40">
                          <span className="h-5 w-5 animate-spin-slow rounded-full border-2 border-white/40 border-t-white" />
                        </span>
                      )}
                      {m.status === "ready" && (
                        <span className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-success text-white">
                          <CheckIcon className="h-3 w-3" />
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          clearImage(p.id);
                        }}
                        className="absolute left-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <CloseIcon className="h-3 w-3" />
                      </button>
                    </>
                  ) : (
                    <span className="flex flex-col items-center gap-1 px-1 text-muted">
                      <ImageIcon className="h-5 w-5" />
                      <span className="text-[10px] leading-tight">
                        {t.productImage}
                      </span>
                    </span>
                  )}
                </label>

                {/* Nombre + beneficios */}
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <input
                    className={inputCls}
                    value={p.name}
                    onChange={(e) => update(p.id, { name: e.target.value })}
                    placeholder={t.productNamePh}
                  />
                  <input
                    className={inputCls}
                    value={p.benefits}
                    onChange={(e) => update(p.id, { benefits: e.target.value })}
                    placeholder={t.benefitsPh}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={add}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface/30 py-2.5 text-sm font-medium text-muted transition-colors hover:border-accent/60 hover:text-accent"
      >
        <PlusIcon className="h-4 w-4" />
        {t.addProduct}
      </motion.button>
    </div>
  );
}
