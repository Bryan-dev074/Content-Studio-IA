"use client";

import { motion } from "framer-motion";
import { WalletIcon } from "./icons";
import { useI18n } from "./providers/I18nProvider";
import { cn } from "@/lib/utils";
import type { CostSummary, Lang } from "@/lib/types";

function WalletMeter({
  name,
  total,
  limit,
  within,
  over,
}: {
  name: string;
  total: number;
  limit: number;
  within: string;
  over: string;
}) {
  const ratio = limit > 0 ? Math.min(total / limit, 1) : 0;
  const isOver = total > limit;
  return (
    <div className="rounded-xl border border-border bg-surface-2/40 p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <WalletIcon className="h-4 w-4 text-accent" />
          {name}
        </span>
        <span className="font-mono text-sm font-bold text-foreground">
          {total}
          <span className="text-muted-2">/{limit}c</span>
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-background/60">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${ratio * 100}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className={cn(
            "h-full rounded-full",
            isOver ? "bg-danger" : "gradient-primary",
          )}
        />
      </div>
      <p
        className={cn(
          "mt-1.5 text-xs font-medium",
          isOver ? "text-danger" : "text-success",
        )}
      >
        {isOver ? over : within}
      </p>
    </div>
  );
}

export function CostTable({
  costs,
  lang,
}: {
  costs: CostSummary;
  lang: Lang;
}) {
  const { t } = useI18n();
  const rows = costs.rows ?? [];

  const highfieldTotal = rows
    .filter((r) => r.wallet === "Highfield")
    .reduce((s, r) => s + (Number(r.cost) || 0), 0);
  const omniTotal = rows
    .filter((r) => r.wallet === "Omni Flash")
    .reduce((s, r) => s + (Number(r.cost) || 0), 0);

  return (
    <div className="glass rounded-2xl p-5 shadow-soft">
      <h3 className="mb-4 font-serif text-xl font-semibold text-foreground">
        {t.costsTitle}
      </h3>

      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <WalletMeter
          name={t.walletHighfield}
          total={highfieldTotal}
          limit={costs.highfieldLimit || 100}
          within={t.withinBudget}
          over={t.overBudget}
        />
        <WalletMeter
          name={t.walletOmni}
          total={omniTotal}
          limit={costs.omniFlashLimit || 38}
          within={t.withinBudget}
          over={t.overBudget}
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="bg-surface-2/50 text-xs uppercase tracking-wider text-muted">
              <th className="px-4 py-2.5 font-semibold">{t.costShot}</th>
              <th className="px-4 py-2.5 font-semibold">{t.costModel}</th>
              <th className="px-4 py-2.5 font-semibold">{t.costRes}</th>
              <th className="px-4 py-2.5 font-semibold">{t.costDur}</th>
              <th className="px-4 py-2.5 text-right font-semibold">
                {t.costCredits}
              </th>
              <th className="px-4 py-2.5 font-semibold">{t.costWallet}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <motion.tr
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="border-t border-border text-foreground/90"
              >
                <td className="px-4 py-2.5 font-medium">{r.shot}</td>
                <td className="px-4 py-2.5">{r.model}</td>
                <td className="px-4 py-2.5 text-muted">{r.resolution}</td>
                <td className="px-4 py-2.5 text-muted">{r.duration}</td>
                <td className="px-4 py-2.5 text-right font-mono font-semibold">
                  {r.cost}c
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className={cn(
                      "rounded-md px-2 py-0.5 text-xs font-medium",
                      r.wallet === "Highfield"
                        ? "bg-primary/15 text-primary"
                        : "bg-accent/15 text-accent",
                    )}
                  >
                    {r.wallet}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {costs.notes?.[lang] && (
        <p className="mt-3 text-xs italic text-muted">{costs.notes[lang]}</p>
      )}
    </div>
  );
}
