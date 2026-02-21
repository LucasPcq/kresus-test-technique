import { describe, expect, it } from "vitest";
import qs from "qs";

import { PRIORITY } from "@kresus/contract";
import type { TaskQueryDto } from "@kresus/contract";

describe("qs serialization for TaskQueryDto", () => {
  const serialize = (params: TaskQueryDto) => qs.stringify(params, { encode: false });

  const baseParams: TaskQueryDto = {
    page: 1,
    pageSize: 10,
    sort: "-createdAt",
  };

  it("should serialize base pagination params", () => {
    const result = serialize(baseParams);

    expect(result).toContain("page=1");
    expect(result).toContain("pageSize=10");
    expect(result).toContain("sort=-createdAt");
  });

  it("should not include filter params when filter is undefined", () => {
    const result = serialize(baseParams);

    expect(result).not.toContain("filter");
  });

  it("should serialize completed filter", () => {
    const result = serialize({ ...baseParams, filter: { completed: true } });

    expect(result).toContain("filter[completed]=true");
  });

  it("should serialize priority filter with eq operator", () => {
    const result = serialize({ ...baseParams, filter: { priority: { eq: PRIORITY.HIGH } } });

    expect(result).toContain("filter[priority][eq]=HIGH");
  });

  it("should serialize title filter with contains operator", () => {
    const result = serialize({ ...baseParams, filter: { title: { contains: "rapport" } } });

    expect(result).toContain("filter[title][contains]=rapport");
  });

  it("should serialize executionDate between filter", () => {
    const from = new Date("2026-03-01");
    const to = new Date("2026-06-30");
    const result = serialize({ ...baseParams, filter: { executionDate: { between: [from, to] } } });

    expect(result).toContain("filter[executionDate][between][0]=");
    expect(result).toContain("filter[executionDate][between][1]=");
  });

  it("should serialize executionDate gte filter", () => {
    const date = new Date("2026-03-01");
    const result = serialize({ ...baseParams, filter: { executionDate: { gte: date } } });

    expect(result).toContain("filter[executionDate][gte]=");
  });

  it("should combine multiple filters", () => {
    const result = serialize({
      ...baseParams,
      filter: {
        completed: false,
        priority: { eq: PRIORITY.MEDIUM },
        title: { contains: "facture" },
      },
    });

    expect(result).toContain("filter[completed]=false");
    expect(result).toContain("filter[priority][eq]=MEDIUM");
    expect(result).toContain("filter[title][contains]=facture");
  });
});
