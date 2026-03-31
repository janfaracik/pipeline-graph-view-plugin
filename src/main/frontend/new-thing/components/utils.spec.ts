import { Result, StageInfo } from "../../pipeline-graph-view/pipeline-graph/main/PipelineGraphModel.tsx";
import {
  collapseTopLevelStages,
  getVisibleRunItemLimit,
  VisibleRunItem,
} from "./utils.ts";

function createStage(index: number, state = Result.success): StageInfo {
  return {
    name: `Stage ${index}`,
    title: `Stage ${index}`,
    state,
    id: index,
    type: "STAGE",
    children: [],
    pauseDurationMillis: 0,
    startTimeMillis: 0,
    totalDurationMillis: 1_000,
    previousTotalDurationMillis: 1_000,
    agent: "",
    url: "",
  };
}

function createStages(count: number): StageInfo[] {
  return Array.from({ length: count }, (_, index) => createStage(index));
}

function summarize(items: VisibleRunItem[]): string[] {
  return items.map((item) =>
    item.kind === "stage" ? item.stage.name : `collapsed:${item.hiddenCount}`,
  );
}

describe("Run snippet utils", () => {
  describe("getVisibleRunItemLimit", () => {
    it("returns the full stage count when the width fits", () => {
      expect(getVisibleRunItemLimit(8, 236)).toBe(8);
    });

    it("reduces the visible item count when the full snippet would overflow", () => {
      expect(getVisibleRunItemLimit(12, 236)).toBe(7);
    });

    it("keeps a minimum first-collapsed-last layout when space is very tight", () => {
      expect(getVisibleRunItemLimit(12, 10)).toBe(3);
    });
  });

  describe("collapseTopLevelStages", () => {
    it("collapses the middle section with a balanced head and tail", () => {
      expect(summarize(collapseTopLevelStages(createStages(10), 7))).toEqual([
        "Stage 0",
        "Stage 1",
        "Stage 2",
        "collapsed:4",
        "Stage 7",
        "Stage 8",
        "Stage 9",
      ]);
    });

    it("keeps the first and last stage visible when space is tight", () => {
      const stages = createStages(10);
      stages[5] = createStage(5, Result.failure);

      expect(summarize(collapseTopLevelStages(stages, 3))).toEqual([
        "Stage 0",
        "collapsed:8",
        "Stage 9",
      ]);
    });

    it("shifts the visible window to keep a nearby failing stage when possible", () => {
      const stages = createStages(10);
      stages[4] = createStage(4, Result.failure);

      expect(summarize(collapseTopLevelStages(stages, 7))).toEqual([
        "Stage 0",
        "Stage 1",
        "Stage 2",
        "Stage 3",
        "Stage 4",
        "collapsed:4",
        "Stage 9",
      ]);
    });
  });
});
