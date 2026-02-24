import { useColorMode } from "@vueuse/core";
import { computed } from "vue";

const MODES = ["light", "dark", "auto"] as const;
type Mode = (typeof MODES)[number];

export function useTheme() {
  const mode = useColorMode({ emitAuto: true });

  const next = () => {
    const idx = MODES.indexOf(mode.value as Mode);
    mode.value = MODES[(idx + 1) % MODES.length] ?? "auto";
  };

  return {
    mode: computed<Mode>(() => mode.value as Mode),
    next,
  };
}
