"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { VideoDropzone } from "./VideoDropzone";
import { SegmentedToggle } from "./SegmentedToggle";
import { SparklesIcon, FilmIcon, CameraIcon } from "./icons";
import { useI18n } from "./providers/I18nProvider";
import { cn } from "@/lib/utils";
import type {
  GenerateRequest,
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
  loading,
}: {
  onGenerate: (req: GenerateRequest) => void;
  loading: boolean;
}) {
  const { t } = useI18n();
  const [productName, setProductName] = useState("");
  const [benefits, setBenefits] = useState("");
  const [niche, setNiche] = useState("");
  const [mode, setMode] = useState<ProductionMode>("ia");
  const [extraPrompt, setExtraPrompt] = useState("");
  const [referenceNotes, setReferenceNotes] = useState("");
  const [upload, setUpload] = useState<UploadResponse | null>(null);
  const [error, setError] = useState("");

  const submit = () => {
    if (!productName.trim()) {
      setError(t.requiredProduct);
      return;
    }
    setError("");
    onGenerate({
      productName: productName.trim(),
      benefits: benefits.trim(),
      niche: niche.trim(),
      productionMode: mode,
      extraPrompt: extraPrompt.trim() || undefined,
      referenceNotes: referenceNotes.trim() || undefined,
      videoFileUri: upload?.fileUri,
      videoMimeType: upload?.mimeType,
    });
  };

  return (
    <motion.section
      initial="hidden"
      animate="show"
      transition={{ staggerChildren: 0.06, delayChildren: 0.1 }}
      className="glass flex flex-col gap-5 rounded-2xl p-5 shadow-soft sm:p-6"
    >
      <motion.div variants={fieldVariants}>
        <h2 className="font-serif text-2xl font-semibold text-foreground">
          {t.inputTitle}
        </h2>
        <p className="mt-1 text-sm text-muted">{t.inputSubtitle}</p>
      </motion.div>

      <motion.div variants={fieldVariants}>
        <VideoDropzone onUploaded={setUpload} />
      </motion.div>

      <motion.div variants={fieldVariants}>
        <Label>{t.productName}</Label>
        <input
          className={inputCls}
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder={t.productNamePh}
        />
      </motion.div>

      <motion.div variants={fieldVariants} className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>{t.benefits}</Label>
          <input
            className={inputCls}
            value={benefits}
            onChange={(e) => setBenefits(e.target.value)}
            placeholder={t.benefitsPh}
          />
        </div>
        <div>
          <Label>{t.niche}</Label>
          <input
            className={inputCls}
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder={t.nichePh}
          />
        </div>
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

      <motion.button
        variants={fieldVariants}
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
    </motion.section>
  );
}
