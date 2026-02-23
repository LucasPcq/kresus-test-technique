import { describe, expect, it } from "vitest";

import i18n from "@/lib/i18n";

import type { ActiveFilter } from "../task.filter-config";
import { formatFilterLabel } from "../task.filter-config";

const t = i18n.global.t;

describe("formatFilterLabel", () => {
  it("should return correct label when filter is completed=false", () => {
    const filter: ActiveFilter = { field: "completed", operator: "eq", value: false };

    expect(formatFilterLabel({ filter, t })).toBe("Statut · est · À faire");
  });

  it("should return correct label when filter is completed=true", () => {
    const filter: ActiveFilter = { field: "completed", operator: "eq", value: true };

    expect(formatFilterLabel({ filter, t })).toBe("Statut · est · Terminées");
  });

  it("should return correct label when filter is priority eq", () => {
    const filter: ActiveFilter = { field: "priority", operator: "eq", value: "HIGH" };

    expect(formatFilterLabel({ filter, t })).toBe("Priorité · est · Haute");
  });

  it("should return correct label when filter is priority neq", () => {
    const filter: ActiveFilter = { field: "priority", operator: "neq", value: "LOW" };

    expect(formatFilterLabel({ filter, t })).toBe("Priorité · n'est pas · Basse");
  });

  it("should return correct label when filter is date between", () => {
    const filter: ActiveFilter = {
      field: "executionDate",
      operator: "between",
      value: { from: "2026-03-01", to: "2026-03-15" },
    };
    const label = formatFilterLabel({ filter, t });

    expect(label).toContain("Date d'exécution");
    expect(label).toContain("entre");
    expect(label).toContain("–");
  });

  it("should return correct label when filter is date gte", () => {
    const filter: ActiveFilter = {
      field: "executionDate",
      operator: "gte",
      value: { from: "2026-03-01" },
    };
    const label = formatFilterLabel({ filter, t });

    expect(label).toContain("Date d'exécution");
    expect(label).toContain("après le");
  });

  it("should return correct label when filter is date lte", () => {
    const filter: ActiveFilter = {
      field: "executionDate",
      operator: "lte",
      value: { to: "2026-03-15" },
    };
    const label = formatFilterLabel({ filter, t });

    expect(label).toContain("Date d'exécution");
    expect(label).toContain("avant le");
  });
});
