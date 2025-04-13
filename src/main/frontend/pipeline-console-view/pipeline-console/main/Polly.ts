import { useEffect, useRef, useState, useCallback } from "react";
import {
  getConsoleTextOffset,
  LOG_FETCH_SIZE,
  StepLogBufferInfo,
  StageInfo,
  StepInfo,
  RunStatus,
  getRunStatus,
  getRunSteps,
  POLL_INTERVAL,
} from "./PipelineConsoleModel";

export function usePipelineState() {
  const [openStage, setOpenStage] = useState("");
  const [expandedSteps, setExpandedSteps] = useState<string[]>([]);
  const [stages, setStages] = useState<StageInfo[]>([]);
  const [steps, setSteps] = useState<StepInfo[]>([]);
  const [stepBuffers, setStepBuffers] = useState(
    new Map<string, StepLogBufferInfo>(),
  );

  const stagesRef = useRef<StageInfo[]>([]);
  const stepsRef = useRef<StepInfo[]>([]);

  const updateStepConsoleOffset = useCallback(
    async (stepId: string, forceUpdate: boolean, startByte: number) => {
      let stepBuffer = stepBuffers.get(stepId) ?? {
        lines: [],
        startByte: 0 - LOG_FETCH_SIZE,
        endByte: -1,
        stepId,
      };
      if (stepBuffer.startByte > 0 && !forceUpdate) return;
      const response = await getConsoleTextOffset(stepId, startByte);
      if (!response) return;

      const newLogLines = response.text.trim().split("\n") || [];

      if (stepBuffer.endByte > 0 && stepBuffer.endByte <= startByte) {
        stepBuffer.lines = [...stepBuffer.lines, ...newLogLines];
      } else {
        stepBuffer.lines = newLogLines;
        stepBuffer.startByte = response.startByte;
      }

      stepBuffer.endByte = response.endByte;

      setStepBuffers((prev) => new Map(prev).set(stepId, stepBuffer));
    },
    [stepBuffers],
  );

  const parseUrlParams = useCallback(
    (steps: StepInfo[], stages: StageInfo[]): boolean => {
      const params = new URLSearchParams(document.location.search.substring(1));
      let selected = params.get("selected-node") || "";
      if (!selected) return false;

      const step = steps.find((s) => s.id === selected);
      const expanded: string[] = [];

      if (step) {
        selected = step.stageId;
        expanded.push(step.id);

        updateStepConsoleOffset(
          step.id,
          false,
          parseInt(params.get("start-byte") || `${0 - LOG_FETCH_SIZE}`),
        );
      }

      setOpenStage(selected);
      setExpandedSteps(expanded);
      return true;
    },
    [updateStepConsoleOffset],
  );

  const selectDefaultNode = useCallback(
    (steps: StepInfo[], stages: StageInfo[]) => {
      const step = steps.find((s) => s !== undefined);
      if (!step) return;
      setOpenStage(step.stageId);
      setExpandedSteps([step.id]);

      setTimeout(() => {
        document
          .getElementById(`stage-tree-icon-${step.stageId}`)
          ?.scrollIntoView();
      }, 0);
    },
    [],
  );

  // TODO - refine
  function isEqual(idk: any, idk2: any) {
    return JSON.stringify(idk) === JSON.stringify(idk2);
  }

  function mergeStages(
    prevStages: StageInfo[],
    newStages: StageInfo[],
  ): StageInfo[] {
    const prevMap = new Map(prevStages.map((s) => [s.id, s]));

    const merged = newStages.map((newStage) => {
      const prevStage = prevMap.get(newStage.id);

      // If we have a previous stage, compare deeply
      if (prevStage) {
        const children = mergeStages(
          prevStage.children,
          newStage.children || [],
        );

        const changed =
          !isEqual(
            { ...prevStage, children: undefined },
            { ...newStage, children: undefined },
          ) || children !== prevStage.children;

        if (changed) {
          return { ...newStage, children };
        } else {
          return prevStage; // reuse previous ref to skip re-render
        }
      }

      // New stage
      return newStage;
    });

    return merged;
  }

  useEffect(() => {
    getStateUpdate().then((data) => {
      setStages(data.stages);
      setSteps(data.steps);
      stagesRef.current = data.stages;
      stepsRef.current = data.steps;

      const usedUrl = parseUrlParams(data.steps, data.stages);
      if (!usedUrl && !openStage) {
        selectDefaultNode(data.steps, data.stages);
      }

      if (!data.isComplete) {
        startPollingPipeline({
          getStateUpdateFn: getStateUpdate,
          onData: (data) => {
            const hasNewStages =
              JSON.stringify(stagesRef.current) !== JSON.stringify(data.stages);
            const hasNewSteps =
              JSON.stringify(stepsRef.current) !== JSON.stringify(data.steps);

            if (hasNewStages) {
              setStages((prev) => {
                const merged = mergeStages(prev, data.stages);
                if (merged === prev) return prev; // no change, no re-render
                stagesRef.current = merged;
                console.log("Setting stages!", merged[-1]);
                return merged;
              });
              stagesRef.current = data.stages;
            }

            if (hasNewSteps) {
              setSteps(data.steps);
              stepsRef.current = data.steps;
            }
          },
          checkComplete: (data) => data.isComplete ?? false,
          interval: POLL_INTERVAL,
        });
      }
    });
  }, [parseUrlParams, openStage, selectDefaultNode]);

  const handleStageSelect = useCallback(
    (nodeId: string) => {
      if (!nodeId) return;
      if (nodeId === openStage) return; // skip if already selected

      const stepsForStage = steps.filter((step) => step.stageId === nodeId);
      const lastStep = stepsForStage[stepsForStage.length - 1];
      const newlyExpandedSteps = lastStep ? [lastStep.id] : [];

      setOpenStage(nodeId);
      setExpandedSteps((prev) => [...prev, ...newlyExpandedSteps]);

      if (lastStep) {
        updateStepConsoleOffset(lastStep.id, false, 0 - LOG_FETCH_SIZE);
      }
    },
    [openStage, steps, updateStepConsoleOffset],
  );

  return {
    openStage,
    expandedSteps,
    setExpandedSteps,
    stages,
    steps,
    stepBuffers,
    updateStepConsoleOffset,
    handleStageSelect,
  };
}

export interface PipelineStatusInfo extends RunStatus {
  steps: StepInfo[];
  stages: StageInfo[];
}

/**
 * Fetches the latest pipeline state from the API.
 */
export const getStateUpdate = async (): Promise<PipelineStatusInfo> => {
  const [runStatus, runSteps] = await Promise.all([
    getRunStatus(),
    getRunSteps(),
  ]);

  return {
    ...(runStatus ?? { isComplete: false, stages: [] }),
    ...(runSteps ?? { steps: [] }),
  } as PipelineStatusInfo;
};

/**
 * Starts polling a function until a complete condition is met.
 */
export const startPollingPipeline = ({
  getStateUpdateFn,
  onData,
  checkComplete,
  interval = 1000,
}: {
  getStateUpdateFn: () => Promise<PipelineStatusInfo>;
  onData: (data: PipelineStatusInfo) => void;
  checkComplete: (data: PipelineStatusInfo) => boolean;
  interval?: number;
}): (() => void) => {
  let polling = true;

  const poll = async () => {
    while (polling) {
      const data = await getStateUpdateFn();
      onData(data);

      if (checkComplete(data)) {
        polling = false;
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  };

  poll();

  return () => {
    polling = false;
  };
};
