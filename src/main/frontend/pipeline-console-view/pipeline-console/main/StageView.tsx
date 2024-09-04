import React from "react";

import {
  StepInfo,
  StageInfo,
  StepLogBufferInfo,
  LOG_FETCH_SIZE,
} from "./PipelineConsoleModel";
import { ConsoleLogCard } from "./ConsoleLogCard";
import {
  HourglassOutline,
  InformationCircleOutline,
  LinkOutline,
  TimeOutline,
  TimerOutline
} from "react-ionicons";

export interface StageSummaryProps {
  stage: StageInfo;
  failedSteps: StepInfo[];
}

// Tree Item for stages
const StageSummary = (props: StageSummaryProps) => (
  <React.Fragment>
    <div className={'jenkins-card__title'}>
      Stage '{props.stage.name}'
    </div>
    <div
      className="jenkins-card__content"
      key={`stage-detail-root-${props.stage.id}`}
    >
      <div className={'pgv-details-card'}>
        <p
          className="pgv-details__item"
          key={`stage-detail-start-time-container-${props.stage.id}`}
        >
          {props.stage.startTimeMillis && (
            <TimeOutline />
          )}
          {props.stage.startTimeMillis}
        </p>
        <p
          className="pgv-details__item"
          key={`stage-detail-pause-duration-container-${props.stage.id}`}
        >
          <HourglassOutline />
          {props.stage.pauseDurationMillis}
        </p>
        <p
          className="pgv-details__item"
          key={`stage-detail-duration-container-${props.stage.id}`}
        >
          <TimerOutline />
          {props.stage.totalDurationMillis}
        </p>
        <p
          className="pgv-details__item"
          key={`stage-detail-status-container-${props.stage.id}`}
        >
          <InformationCircleOutline />
          <span
            className="capitalize"
            key={`stage-detail-status-text-${props.stage.id}`}
          >
            {props.stage.state}
          </span>
        </p>
        {props.failedSteps.map((value: StepInfo) => {
          console.debug(`Found failed step ${value}`);
          return (
            <FailedStepLink
              step={value}
              key={`stage-detail-failed-step-link-${props.stage.id}-${value.id}`}
            />
          );
        })}
        <p className="pgv-details__item">
          <LinkOutline />
          <a href={`log?nodeId=${props.stage.id}`}>
            View as plain text
          </a>
        </p>
      </div>
    </div>
  </React.Fragment>
);

export interface FailedStepLinkProps {
  step: StepInfo;
}

const FailedStepLink = (props: FailedStepLinkProps) => (
  <div className="pgv-details__item">
    <LinkOutline />
    <a href={`?selected-node=${props.step.id}`}>
      Failed step: {props.step.name}
    </a>
  </div>
);

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

export default class StageView extends React.Component {
  props!: StageViewProps;

  constructor(props: StageViewProps) {
    super(props);
  }
  renderStageDetails() {
    if (this.props.stage) {
      let failedSteps = [] as StepInfo[];
      for (let step of this.props.steps) {
        if (step.stageId === this.props.selectedStage) {
          // We seem to get a mix of upper and lower case states, so normalise on lowercase.
          if (step.state.toLowerCase() === "unstable") {
            failedSteps.push(step);
          }
        }
      }
      return (
        <div className={"jenkins-card"} id={`console-root-${this.props.stage ? this.props.stage.id : "unk"}`}>
          <StageSummary stage={this.props.stage} failedSteps={failedSteps} />
        </div>
      );
    }
    return null;
  }

  getTreeItemsFromStepList = (stepsItems: StepInfo[]) => {
    return stepsItems.map((stepItemData, index) => {
      return (
        <ConsoleLogCard
          step={stepItemData}
          stepBuffer={
            this.props.stepBuffers.get(stepItemData.id) ??
            ({
              lines: [] as string[],
              startByte: 0 - LOG_FETCH_SIZE,
              endByte: -1,
            } as StepLogBufferInfo)
          }
          handleStepToggle={this.props.handleStepToggle}
          isExpanded={this.props.expandedSteps.includes(stepItemData.id)}
          handleMoreConsoleClick={this.props.handleMoreConsoleClick}
          key={`step-console-card-${stepItemData.id}`}
          scrollParentId={this.props.scrollParentId}
        />
      );
    });
  };

  render() {
    return (
      <React.Fragment>
        <div
          key={`stage-summary-${
            this.props.stage ? this.props.stage.id : "unk"
          }`}
        >
          {this.renderStageDetails()}
        </div>
        <div
          key={`stage-steps-container-${
            this.props.stage ? this.props.stage.id : "unk"
          }`}
        >
          {this.getTreeItemsFromStepList(this.props.steps)}
        </div>
      </React.Fragment>
    );
  }
}
