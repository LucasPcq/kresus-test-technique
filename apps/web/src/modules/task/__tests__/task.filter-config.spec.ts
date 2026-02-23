import { describe, expect, it } from "vitest";

import type { ActiveFilter } from "../task.filter-config";
import { formatFilterLabel } from "../task.filter-config";

describe("formatFilterLabel", () => {
  it("should format completed filter", () => {
    const filter: ActiveFilter = { field: "completed", operator: "eq", value: false };

    expect(formatFilterLabel(filter)).toBe("Statut · est · À faire");
  });

  it("should format completed=true filter", () => {
    const filter: ActiveFilter = { field: "completed", operator: "eq", value: true };

    expect(formatFilterLabel(filter)).toBe("Statut · est · Terminées");
  });

  it("should format priority eq filter", () => {
    const filter: ActiveFilter = { field: "priority", operator: "eq", value: "HIGH" };

    expect(formatFilterLabel(filter)).toBe("Priorité · est · Haute");
  });

  it("should format priority neq filter", () => {
    const filter: ActiveFilter = { field: "priority", operator: "neq", value: "LOW" };

    expect(formatFilterLabel(filter)).toBe("Priorité · n'est pas · Basse");
  });

  it("should format date between filter", () => {
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

  it("should format date gte filter", () => {
    const filter: ActiveFilter = {
      field: "executionDate",
      operator: "gte",
      value: { from: "2026-03-01" },
    };
    const label = formatFilterLabel(filter);

    expect(label).toContain("Date d'exécution");
    expect(label).toContain("après le");
  });

  it("should format date lte filter", () => {
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
