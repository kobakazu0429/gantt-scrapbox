import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { builder, extract } from "./builder";
import { tree } from "./tree";

describe("extract", () => {
  it("default", () => {
    const raw = `GanttTest
[g-start.icon]
テストガント
  要件定義: 2023-06-20, 1d
  仕様書作成: 2d
  見積もり: 1d
    仕様書確認:3d
[g-end.icon]
`;

    expect(extract(raw)).toBe(`テストガント
  要件定義: 2023-06-20, 1d
  仕様書作成: 2d
  見積もり: 1d
    仕様書確認:3d`);
  });

  it("extract: specify start and end block", () => {
    const raw = `GanttTest
[start.icon]
テストガント
  要件定義: 2023-06-20, 1d
  仕様書作成: 2d
  見積もり: 1d
    仕様書確認:3d
[end.icon]
`;

    expect(extract(raw, { startBlock: "[start.icon]", endBlock: "[end.icon]" }))
      .toBe(`テストガント
  要件定義: 2023-06-20, 1d
  仕様書作成: 2d
  見積もり: 1d
    仕様書確認:3d`);
  });
});

const counter: Record<string, number> = {};

describe("builder", () => {
  beforeEach(() => {
    if (!counter[process.env.VITEST_WORKER_ID!]) {
      counter[process.env.VITEST_WORKER_ID!] = 1;
    }

    vi.mock("ulid", () => ({
      ulid: vi.fn(() => counter[process.env.VITEST_WORKER_ID!]++),
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    counter[process.env.VITEST_WORKER_ID!] = 1;
  });

  it("default", () => {
    const raw = `テストガント
  要件定義: 2023-06-20, 1d
  仕様書作成: 2d
  見積もり: 1d
    仕様書確認:3d`;

    expect(builder(tree(raw))).toBe(`gantt
dateFormat  YYYY-MM-DD

section テストガント
要件定義: 3,   2023-06-20, 1d
仕様書作成: 4,   2d
見積もり: 5,   1d
仕様書確認: 6, after 5 , 3d`);
  });
});
