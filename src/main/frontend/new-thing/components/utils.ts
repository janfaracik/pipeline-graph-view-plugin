import { StageInfo } from "../../pipeline-graph-view/pipeline-graph/main/PipelineGraphModel.tsx";

export type VisibleRunItem =
  | {
      kind: "stage";
      stage: StageInfo;
    }
  | {
      kind: "collapsed";
      id: string;
      hiddenCount: number;
    };

const FAILURE_STATES = new Set(["FAILED", "FAILURE", "ERROR", "ABORTED"]);

const WARNING_STATES = new Set(["UNSTABLE", "WARNING", "WARN"]);

// Keep these values aligned with run-snippet.scss so the width budget matches
// the actual rendered snippet.
const RUN_SNIPPET_STAGE_WIDTH = 26;
const RUN_SNIPPET_ITEM_GAP = 4;
const RUN_SNIPPET_COLLAPSED_WIDTH = 32;
const MIN_COLLAPSED_VISIBLE_ITEMS = 3;

function isFailureState(state: string): boolean {
  return FAILURE_STATES.has(state.toUpperCase());
}

function isWarningState(state: string): boolean {
  return WARNING_STATES.has(state.toUpperCase());
}

function getSpecialStageIndex(stages: StageInfo[]): number {
  const firstFailure = stages.findIndex((stage) => isFailureState(stage.state));
  if (firstFailure !== -1) {
    return firstFailure;
  }

  return stages.findIndex((stage) => isWarningState(stage.state));
}

function toStageItems(stages: StageInfo[]): VisibleRunItem[] {
  return stages.map((stage) => ({
    kind: "stage",
    stage,
  }));
}

function createCollapsedItems(
  stages: StageInfo[],
  headVisibleCount: number,
  tailVisibleCount: number,
): VisibleRunItem[] {
  return [
    ...toStageItems(stages.slice(0, headVisibleCount)),
    {
      kind: "collapsed",
      id: `collapsed-${headVisibleCount}-${stages.length - tailVisibleCount - 1}`,
      hiddenCount: stages.length - headVisibleCount - tailVisibleCount,
    },
    ...toStageItems(stages.slice(stages.length - tailVisibleCount)),
  ];
}

export function getVisibleRunItemLimit(
  stageCount: number,
  availableWidth: number,
): number {
  if (
    stageCount <= MIN_COLLAPSED_VISIBLE_ITEMS ||
    !Number.isFinite(availableWidth) ||
    availableWidth <= 0
  ) {
    return stageCount;
  }

  const fullWidth =
    stageCount * RUN_SNIPPET_STAGE_WIDTH +
    Math.max(0, stageCount - 1) * RUN_SNIPPET_ITEM_GAP;

  if (fullWidth <= availableWidth) {
    return stageCount;
  }

  const collapsedItemLimit =
    Math.floor(
      (availableWidth - RUN_SNIPPET_COLLAPSED_WIDTH) /
        (RUN_SNIPPET_STAGE_WIDTH + RUN_SNIPPET_ITEM_GAP),
    ) + 1;

  return Math.max(
    MIN_COLLAPSED_VISIBLE_ITEMS,
    Math.min(stageCount - 1, collapsedItemLimit),
  );
}

export function collapseTopLevelStages(
  stages: StageInfo[],
  maxVisibleItems = 10,
): VisibleRunItem[] {
  if (stages.length <= maxVisibleItems) {
    return toStageItems(stages);
  }

  const clampedMaxVisibleItems = Math.max(
    MIN_COLLAPSED_VISIBLE_ITEMS,
    maxVisibleItems,
  );
  const visibleStageCount = clampedMaxVisibleItems - 1;
  let headVisibleCount = Math.ceil(visibleStageCount / 2);
  let tailVisibleCount = visibleStageCount - headVisibleCount;

  if (tailVisibleCount < 1) {
    tailVisibleCount = 1;
    headVisibleCount = visibleStageCount - tailVisibleCount;
  }

  const specialIndex = getSpecialStageIndex(stages);
  const specialAlreadyVisible =
    specialIndex !== -1 &&
    (specialIndex < headVisibleCount ||
      specialIndex >= stages.length - tailVisibleCount);

  if (!specialAlreadyVisible && specialIndex !== -1) {
    const stagesNeededFromHead = specialIndex + 1;
    const stagesNeededFromTail = stages.length - specialIndex;
    const canShiftToHead = stagesNeededFromHead <= visibleStageCount - 1;
    const canShiftToTail = stagesNeededFromTail <= visibleStageCount - 1;
    const distanceFromHead = specialIndex;
    const distanceFromTail = stages.length - 1 - specialIndex;

    if (
      canShiftToHead &&
      (!canShiftToTail || distanceFromHead <= distanceFromTail)
    ) {
      headVisibleCount = stagesNeededFromHead;
      tailVisibleCount = visibleStageCount - headVisibleCount;
    } else if (canShiftToTail) {
      tailVisibleCount = stagesNeededFromTail;
      headVisibleCount = visibleStageCount - tailVisibleCount;
    }
  }

  return createCollapsedItems(stages, headVisibleCount, tailVisibleCount);
}
