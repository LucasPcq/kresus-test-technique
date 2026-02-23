import { describe, expect, it } from "vitest";
import qs from "qs";

import { PRIORITY } from "@kresus/contract";
import type { TaskQueryInput } from "@kresus/contract";

describe("qs serialization for TaskQueryInput", () => {
  const serialize = (params: TaskQueryInput) => qs.stringify(params, { encode: false });

  const baseParams: TaskQueryInput = {
    page: 1,
    pageSize: 10,
    sort: "-createdAt",
  };

  it("should serialize base pagination params when given default query", () => {
    const result = serialize(baseParams);

    expect(result).toContain("page=1");
    expect(result).toContain("pageSize=10");
    expect(result).toContain("sort=-createdAt");
  });

  it("should not include filter params when filter is undefined", () => {
    const result = serialize(baseParams);

    expect(result).not.toContain("filter");
  });

  it("should serialize completed filter when completed is provided", () => {
    const result = serialize({ ...baseParams, filter: { completed: 1 } });

    expect(result).toContain("filter[completed]=1");
  });

  it("should serialize priority filter when eq operator is used", () => {
    const result = serialize({ ...baseParams, filter: { priority: { eq: PRIORITY.HIGH } } });

    expect(result).toContain("filter[priority][eq]=HIGH");
  });

  it("should serialize title filter when contains operator is used", () => {
    const result = serialize({ ...baseParams, filter: { title: { contains: "rapport" } } });

    expect(result).toContain("filter[title][contains]=rapport");
  });

  it("should serialize executionDate filter when between operator is used", () => {
    const from = new Date("2026-03-01");
    const to = new Date("2026-06-30");
    const result = serialize({ ...baseParams, filter: { executionDate: { between: [from, to] } } });

    expect(result).toContain("filter[executionDate][between][0]=");
    expect(result).toContain("filter[executionDate][between][1]=");
  });

  it("should serialize executionDate filter when gte operator is used", () => {
    const date = new Date("2026-03-01");
    const result = serialize({ ...baseParams, filter: { executionDate: { gte: date } } });

    expect(result).toContain("filter[executionDate][gte]=");
  });

  it("should combine multiple filters when several are provided", () => {
    const result = serialize({
      ...baseParams,
      filter: {
        completed: 0,
        priority: { eq: PRIORITY.MEDIUM },
        title: { contains: "facture" },
      },
    });

    expect(result).toContain("filter[completed]=0");
    expect(result).toContain("filter[priority][eq]=MEDIUM");
    expect(result).toContain("filter[title][contains]=facture");
  });
});
