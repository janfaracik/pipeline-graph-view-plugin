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

  return (
    <>
      <div className={`pgv-single-run`}>
        <a href={currentJobPath + run.id} className="pgv-user-specified-text">
          <StatusIcon status={run.result} />
          {run.displayName}
        </a>
        <div className={'dontleavemehere'}>
          {(runInfo?.stages || []).map((stage) => (
            <>
              <StatusIcon status={stage.state} key={stage.id} />

              {stage.children.length > 0 && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 200" width="500" height="200">
                  <path d="M20 60
           H200
           C250 60 300 100 300 140
           C300 180 250 220 200 220
           H100
           C60 220 40 180 40 140
           C40 100 60 60 100 60
           H480"
                        fill="none"
                        stroke="black"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeLinejoin="round"/>
                </svg>
              )}
              {stage.children.length === 0 && (
                <div className='melodramatic' />
              )}

              {/*{(stage.children).map((stage) => (*/}
              {/*  <div key={stage.id} className={'dontleavemehere'}>*/}
              {/*    <StatusIcon status={stage.state} />*/}
              {/*    <div className='melodramatic' />*/}
              {/*  </div>*/}
              {/*))}*/}
            </>
          ))}
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
          'Started by Jan',
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
