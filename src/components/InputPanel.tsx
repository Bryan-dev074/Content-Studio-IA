"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { VideoDropzone } from "./VideoDropzone";
import { ProductList, makeProduct } from "./ProductList";
import { SegmentedToggle } from "./SegmentedToggle";
import { SparklesIcon, CameraIcon, PlayIcon } from "./icons";
import { useI18n } from "./providers/I18nProvider";
import { cn } from "@/lib/utils";
import type {
  GenerateRequest,
  ProductInput,
  ProductionMode,
  UploadResponse,
} from "@/lib/types";

const fieldVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1.5 block text-sm font-medium text-foreground/90">
      {children}
    </span>
  );
}

const inputCls =
  "w-full rounded-xl border border-border bg-surface/60 px-4 py-2.5 text-foreground placeholder:text-muted-2 outline-none transition-all focus:border-accent focus:bg-surface focus:ring-4 focus:ring-[var(--ring)]";

export function InputPanel({
  onGenerate,
  onExample,
  loading,
}: {
  onGenerate: (req: GenerateRequest) => void;
  onExample: (mode: ProductionMode) => void;
  loading: boolean;
}) {
  const { t } = useI18n();
  const [products, setProducts] = useState<ProductInput[]>([makeProduct()]);
  const [niche, setNiche] = useState("");
  const [mode, setMode] = useState<ProductionMode>("ia");
  const [durationSec, setDurationSec] = useState(0); // 0 = auto
  const [tone, setTone] = useState("");
  const [extraPrompt, setExtraPrompt] = useState("");
  const [referenceNotes, setReferenceNotes] = useState("");
  const [upload, setUpload] = useState<UploadResponse | null>(null);
  const [error, setError] = useState("");

  // Duración real del video subido: actúa de piso (no se puede elegir menos).
  const videoDuration = upload?.durationSec;

  // Si la selección manual queda por debajo del video, vuelve a "Auto".
  useEffect(() => {
    if (videoDuration && durationSec > 0 && durationSec < videoDuration) {
      setDurationSec(0);
    }
  }, [videoDuration, durationSec]);

  const submit = () => {
    if (!products.some((p) => p.name.trim())) {
      setError(t.requiredProduct);
      return;
    }
    setError("");
    onGenerate({
      products: products.filter((p) => p.name.trim() || p.benefits.trim()),
      niche: niche.trim(),
      productionMode: mode,
      durationSec: durationSec || undefined,
      videoDurationSec: videoDuration,
      tone: tone || undefined,
      extraPrompt: extraPrompt.trim() || undefined,
      referenceNotes: referenceNotes.trim() || undefined,
      videoFileUri: upload?.fileUri,
      videoMimeType: upload?.mimeType,
    });
  };

  const durationOpts = [
    { label: t.durationAuto, value: 0 },
    { label: "15s", value: 15 },
    { label: "20s", value: 20 },
    { label: "30s", value: 30 },
    { label: "45s", value: 45 },
  ];

  const chipCls = (active: boolean) =>
    cn(
      "rounded-xl border px-3.5 py-2 text-sm font-medium transition-all",
      active
        ? "gradient-primary border-transparent text-primary-foreground shadow-soft"
        : "border-border bg-surface/60 text-muted hover:border-accent/50 hover:text-foreground",
    );

  return (
    <motion.section
      initial="hidden"
      animate="show"
      transition={{ staggerChildren: 0.06, delayChildren: 0.1 }}
      className="glass flex flex-col gap-5 rounded-2xl p-5 shadow-soft sm:p-6"
    >
      <motion.div
        variants={fieldVariants}
        className="flex flex-wrap items-start justify-between gap-3"
      >
        <div>
          <h2 className="font-serif text-2xl font-semibold text-foreground">
            {t.inputTitle}
          </h2>
          <p className="mt-1 text-sm text-muted">{t.inputSubtitle}</p>
        </div>
        {/* Botón Generar también arriba, para no tener que bajar hasta el final */}
        <motion.button
          type="button"
          onClick={submit}
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.03 }}
          whileTap={{ scale: loading ? 1 : 0.97 }}
          className={cn(
            "gradient-primary shimmer group relative inline-flex h-10 shrink-0 items-center justify-center gap-2 overflow-hidden rounded-xl px-4 text-sm font-semibold text-primary-foreground shadow-soft transition-opacity",
            loading && "cursor-not-allowed opacity-80",
          )}
        >
          {loading ? (
            <span className="h-4 w-4 animate-spin-slow rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
          ) : (
            <SparklesIcon className="h-4 w-4 transition-transform group-hover:rotate-12" />
          )}
          {t.generate}
        </motion.button>
      </motion.div>

      <motion.div variants={fieldVariants}>
        <VideoDropzone onUploaded={setUpload} />
      </motion.div>

      <motion.div variants={fieldVariants}>
        <Label>{t.products}</Label>
        <p className="-mt-1 mb-2 text-xs text-muted">{t.productsHint}</p>
        <ProductList products={products} onChange={setProducts} />
      </motion.div>

      <motion.div variants={fieldVariants}>
        <Label>{t.niche}</Label>
        <input
          className={inputCls}
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          placeholder={t.nichePh}
        />
      </motion.div>

      <motion.div variants={fieldVariants}>
        <Label>{t.mode}</Label>
        <SegmentedToggle<ProductionMode>
          layoutId="mode-pill"
          size="lg"
          className="w-full [&>button]:flex-1"
          value={mode}
          onChange={setMode}
          options={[
            {
              value: "ia",
              label: t.modeIA,
              sublabel: t.modeIADesc,
              icon: <SparklesIcon className="h-4 w-4" />,
            },
            {
              value: "hibrido",
              label: t.modeHybrid,
              sublabel: t.modeHybridDesc,
              icon: <CameraIcon className="h-4 w-4" />,
            },
          ]}
        />
      </motion.div>

      <motion.div variants={fieldVariants} className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>{t.duration}</Label>
          <div className="flex flex-wrap gap-2">
            {durationOpts.map((o) => {
              const blocked = !!videoDuration && o.value > 0 && o.value < videoDuration;
              return (
                <button
                  key={o.value}
                  type="button"
                  disabled={blocked}
                  onClick={() => setDurationSec(o.value)}
                  title={blocked ? t.durationMinHint : undefined}
                  className={cn(
                    chipCls(durationSec === o.value),
                    blocked && "cursor-not-allowed opacity-40 line-through",
                  )}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
          <p className="mt-1.5 text-xs text-muted">
            {videoDuration
              ? durationSec === 0
                ? t.durationAutoHint
                : t.durationMinHint
              : t.durationAutoHint}
          </p>
        </div>
        <div>
          <Label>{t.tone}</Label>
          <div className="flex flex-wrap gap-2">
            {t.toneOptions.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => setTone(tone === o ? "" : o)}
                className={chipCls(tone === o)}
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div variants={fieldVariants}>
        <Label>{t.referenceNotes}</Label>
        <textarea
          className={cn(inputCls, "min-h-[64px] resize-y")}
          value={referenceNotes}
          onChange={(e) => setReferenceNotes(e.target.value)}
          placeholder={t.referenceNotesPh}
        />
      </motion.div>

      <motion.div variants={fieldVariants}>
        <Label>{t.extraPrompt}</Label>
        <textarea
          className={cn(inputCls, "min-h-[64px] resize-y")}
          value={extraPrompt}
          onChange={(e) => setExtraPrompt(e.target.value)}
          placeholder={t.extraPromptPh}
        />
      </motion.div>

      {error && (
        <motion.p
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: [0, -5, 5, 0] }}
          className="text-sm font-medium text-danger"
        >
          {error}
        </motion.p>
      )}

      <motion.div variants={fieldVariants} className="flex flex-col gap-2.5">
        <motion.button
          type="button"
          onClick={submit}
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          className={cn(
            "gradient-primary shimmer group relative flex h-14 items-center justify-center gap-2.5 overflow-hidden rounded-2xl text-base font-semibold text-primary-foreground shadow-soft transition-opacity",
            loading && "cursor-not-allowed opacity-80",
          )}
        >
          {loading ? (
            <>
              <span className="h-5 w-5 animate-spin-slow rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
              {t.generating}
            </>
          ) : (
            <>
              <SparklesIcon className="h-5 w-5 transition-transform group-hover:rotate-12" />
              {t.generate}
            </>
          )}
        </motion.button>

        <button
          type="button"
          onClick={() => onExample(mode)}
          disabled={loading}
          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface/50 text-sm font-medium text-muted transition-colors hover:border-accent/50 hover:text-foreground disabled:opacity-50"
        >
          <PlayIcon className="h-4 w-4" />
          {t.seeExample} · {mode === "hibrido" ? t.modeHybrid : t.modeIA}
        </button>
      </motion.div>
    </motion.section>
  );
}
