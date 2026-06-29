"use client";

import { useI18n } from "./providers/I18nProvider";
import { SegmentedToggle } from "./SegmentedToggle";
import type { Lang } from "@/lib/types";
import { LANGS } from "@/lib/i18n";

export function LanguageToggle() {
  const { lang, setLang } = useI18n();
  return (
    <SegmentedToggle<Lang>
      layoutId="ui-lang-pill"
      size="sm"
      value={lang}
      onChange={setLang}
      options={LANGS.map((l) => ({
        value: l.code,
        label: `${l.flag} ${l.code.toUpperCase()}`,
      }))}
    />
  );
}
