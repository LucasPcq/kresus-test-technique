import { describe, expect, it } from "vitest";

import type { ActiveFilter } from "../task.filter-config";
import { formatFilterLabel } from "../task.filter-config";

describe("formatFilterLabel", () => {
  it("should return correct label when filter is completed=false", () => {
    const filter: ActiveFilter = { field: "completed", operator: "eq", value: false };

    expect(formatFilterLabel(filter)).toBe("Statut · est · À faire");
  });

  it("should return correct label when filter is completed=true", () => {
    const filter: ActiveFilter = { field: "completed", operator: "eq", value: true };

    expect(formatFilterLabel(filter)).toBe("Statut · est · Terminées");
  });

  it("should return correct label when filter is priority eq", () => {
    const filter: ActiveFilter = { field: "priority", operator: "eq", value: "HIGH" };

    expect(formatFilterLabel(filter)).toBe("Priorité · est · Haute");
  });

  it("should return correct label when filter is priority neq", () => {
    const filter: ActiveFilter = { field: "priority", operator: "neq", value: "LOW" };

    expect(formatFilterLabel(filter)).toBe("Priorité · n'est pas · Basse");
  });

  it("should return correct label when filter is date between", () => {
    const filter: ActiveFilter = {
      field: "executionDate",
      operator: "between",
      value: { from: "2026-03-01", to: "2026-03-15" },
    };
    const label = formatFilterLabel(filter);

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
    const label = formatFilterLabel(filter);

    expect(label).toContain("Date d'exécution");
    expect(label).toContain("après le");
  });

  it("should return correct label when filter is date lte", () => {
    const filter: ActiveFilter = {
      field: "executionDate",
      operator: "lte",
      value: { to: "2026-03-15" },
    };
    const label = formatFilterLabel(filter);

    expect(label).toContain("Date d'exécution");
    expect(label).toContain("avant le");
  });
});
