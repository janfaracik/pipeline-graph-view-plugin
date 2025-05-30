import "./single-run.scss";

import { useContext } from "react";

import StatusIcon from "../../../common/components/status-icon.tsx";
import {
  I18NContext,
  LocalizedMessageKey,
} from "../../../common/i18n/index.ts";
import useRunPoller from "../../../common/tree-api.ts";
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

  const layout: LayoutInfo = {
    ...defaultLayout,
    nodeSpacingH: 45,
  };

  function Changes() {
    if (run.changes === 0) {
      return;
    }

    const messages = useContext(I18NContext);

    return (
      <>
        {" - "}
        {messages.format(LocalizedMessageKey.changesSummary, {
          0: run.changes,
        })}
      </>
    );
  }

  return (
    <div className="pgv-single-run">
      <div>
        <a href={currentJobPath + run.id} className="pgw-user-specified-text">
          <div className={"testestets"}>
            <StatusIcon status={run.result} />

            <div className={"jenkins-avatar"}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="70"
                  d="M112 244l144-144 144 144M256 120v292"
                />
              </svg>
            </div>

            {/*<svg*/}
            {/*  className={"jenkins-avatar"}*/}
            {/*  xmlns="http://www.w3.org/2000/svg"*/}
            {/*  viewBox="0 0 512 512"*/}
            {/*>*/}
            {/*  <path d="M256 48C141.13 48 48 141.13 48 256s93.13 208 208 208 208-93.13 208-208S370.87 48 256 48zm91.36 212.65a16 16 0 01-22.63.09L272 208.42V342a16 16 0 01-32 0V208.42l-52.73 52.32A16 16 0 11164.73 238l80-79.39a16 16 0 0122.54 0l80 79.39a16 16 0 01.09 22.65z" />*/}
            {/*</svg>*/}
            {/*<img src="http://localhost:8080/jenkins/user/jan/avatar/image" alt="" className={"jenkins-avatar"} />*/}
          </div>
          {run.displayName}
          <span>
            {time(run.timestamp)} - <Total ms={run.duration} />
            <Changes />
          </span>
        </a>
      </div>
      <PipelineGraph stages={runInfo?.stages || []} layout={layout} collapsed />
    </div>
  );
}

interface SingleRunProps {
  run: RunInfo;
  currentJobPath: string;
}
