import "./single-run.scss";

import { Fragment, useContext } from "react";

import StatusIcon from "../../../common/components/status-icon.tsx";
import {
  FAILING,
  PASSING,
  SKIPPED,
} from "../../../common/components/symbols.tsx";
import {
  I18NContext,
  LocalizedMessageKey,
} from "../../../common/i18n/index.ts";
import useRunPoller from "../../../common/tree-api.ts";
import { useUserPreferences } from "../../../common/user/user-preferences-provider.tsx";
import { time, Total } from "../../../common/utils/timings.tsx";
import { PipelineGraph } from "../../../pipeline-graph-view/pipeline-graph/main/PipelineGraph.tsx";
import {
  defaultLayout,
  LayoutInfo,
} from "../../../pipeline-graph-view/pipeline-graph/main/PipelineGraphModel.tsx";
import { RunInfo } from "./MultiPipelineGraphModel.ts";

export default function SingleRun({ run, currentJobPath }: SingleRunProps) {
  const { run: runInfo } = useRunPoller({
    currentRunPath: currentJobPath + run.id + "/",
  });

  function Changes() {
    const messages = useContext(I18NContext);

    if (run.changesCount === 0) {
      return;
    }

    return (
      <>
        {" - "}
        {messages.format(LocalizedMessageKey.changesSummary, {
          0: run.changesCount,
        })}
      </>
    );
  }

  const { showNames, showDurations } = useUserPreferences();

  function getLayout() {
    const layout: LayoutInfo = { ...defaultLayout };

    if (!showNames && !showDurations) {
      layout.nodeSpacingH = 45;
    } else {
      layout.nodeSpacingH = 90;
    }

    return layout;
  }

  function getCompactLayout() {
    return !showNames && !showDurations ? "pgv-single-run--compact" : "";
  }

  return (
    <>
      <div className={`pgv-single-run ${getCompactLayout()}`}>
        <a href={currentJobPath + run.id} className="pgv-user-specified-text">
          <StatusIcon status={run.result} />
          {run.displayName}
        </a>
        <div>
          <PipelineGraph
            stages={runInfo?.stages || []}
            layout={getLayout()}
            collapsed
          />
        </div>
        {run.tests && (
          <a href={currentJobPath + run.id + '/' + run.tests?.url} className="pgv-single-run__tests">
          <span className={'jenkins-!-success-color'}>
            {PASSING}
            {run.tests?.passingCount}
          </span>
            <span className={'jenkins-!-skipped-color'}>
            {SKIPPED}
              {run.tests?.skippedCount}
          </span>
            <span className={'jenkins-!-error-color'}>
            {FAILING}
              {run.tests?.failingCount}
          </span>
          </a>
        )}
      </div>
      <div className={'idk'}>
        {[
          run.timestamp && time(run.timestamp),
          run.duration != null && <Total ms={run.duration} />,
          Changes(),
          run.description
        ]
          .filter(Boolean) // removes null/undefined/false
          .map((item, index, array) => (
            <Fragment key={index}>
              {item}
              {index < array.length - 1 && <span className="dot">•</span>}
            </Fragment>
          ))}
      </div>
    </>
  );
}

interface SingleRunProps {
  run: RunInfo;
  currentJobPath: string;
}
