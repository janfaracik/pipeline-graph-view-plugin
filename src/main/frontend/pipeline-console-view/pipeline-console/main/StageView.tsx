import React from "react";

import { StepInfo, StageInfo, StepLogBufferInfo } from "./PipelineConsoleModel";
import StageDetails from "./StageDetails";
import StageSteps from "./StageSteps";

export default function StageView(props: StageViewProps) {
  return (
    <>
      <StageDetails stage={props.stage} />
      <StageSteps
        stage={props.stage}
        steps={props.steps}
        stepBuffers={props.stepBuffers}
        selectedStage={props.selectedStage}
        expandedSteps={props.expandedSteps}
        handleStepToggle={props.handleStepToggle}
        handleMoreConsoleClick={props.handleMoreConsoleClick}
        scrollParentId={props.scrollParentId}
      />
    </>
  );
}

export interface StageViewProps {
  stage: StageInfo | null;
  steps: Array<StepInfo>;
  stepBuffers: Map<string, StepLogBufferInfo>;
  selectedStage: string;
  expandedSteps: string[];
  handleStepToggle: (event: React.SyntheticEvent<{}>, nodeId: string) => void;
  handleMoreConsoleClick: (nodeId: string, startByte: number) => void;
  // Id of the element whose scroll bar we wish to use.
  scrollParentId: string;
}
