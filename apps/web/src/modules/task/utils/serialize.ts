export const serializeBoolean = (v: boolean | undefined): string | undefined =>
  v === undefined ? undefined : v ? "1" : "0";
