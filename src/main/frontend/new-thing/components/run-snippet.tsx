import "./run-snippet.scss";

import StatusIcon from "../../common/components/status-icon.tsx";
import Tooltip from "../../common/components/tooltip.tsx";
import { RunStatus } from "../../common/RestClient.tsx";
import { Result } from "../../pipeline-graph-view/pipeline-graph/main/PipelineGraphModel.tsx";
import { collapseTopLevelStages } from "./utils.ts";

export default function RunSnippet({
  run,
  currentRunPath,
}: {
  run: RunStatus;
  currentRunPath: string;
}) {
  const items = collapseTopLevelStages(run.stages, 8);

  return (
    <div className="pgv-run-snippet">
      {items.map((item) => {
        if (item.kind === "collapsed") {
          return (
            <Tooltip
              content={`${item.hiddenCount} hidden stage${item.hiddenCount === 1 ? "" : "s"}`}
              key={item.id}
              delay={[200, 0]}
            >
              <div className="pgv-run-snippet__collapsed">
                <StatusIcon status={Result.not_built} />
              </div>
            </Tooltip>
          );
        }

        const e = item.stage;

        return (
          <Tooltip content={e.name} key={e.id} delay={[200, 0]}>
            <a href={currentRunPath + e.id} className="status-with-arc">
              <div className={"status-icon"}>
                <StatusIcon status={e.state} />
              </div>

              <svg
                className="status-label-svg"
                viewBox="0 0 64 64"
                aria-hidden="true"
              >
                <path
                  id="status-arc"
                  d="M 18 64 A 14 14 0 0 0 46 64"
                  fill="none"
                />
                <text className="status-arc-label">
                  <textPath
                    href="#status-arc"
                    startOffset="50%"
                    textAnchor="middle"
                  >
                    {e.state}
                  </textPath>
                </text>
              </svg>
            </a>
          </Tooltip>
        );
      })}
    </div>
  );
}
