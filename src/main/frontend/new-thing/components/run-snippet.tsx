import "./run-snippet.scss";

import StatusIcon from "../../common/components/status-icon.tsx";
import Tooltip from "../../common/components/tooltip.tsx";
import { RunStatus } from "../../common/RestClient.tsx";
import LiveTotal from "../../common/utils/live-total.tsx";
import { StageInfo } from "../../pipeline-graph-view/pipeline-graph/main/PipelineGraphModel.tsx";

export default function RunSnippet({
  run,
  currentRunPath,
}: {
  run: RunStatus;
  currentRunPath: string;
}) {
  // const containerRef = useRef<HTMLDivElement>(null);
  // const [availableWidth, setAvailableWidth] = useState<number | null>(null);
  //
  // useEffect(() => {
  //   const container = containerRef.current;
  //   if (!container) {
  //     return;
  //   }
  //
  //   const updateWidth = (nextWidth?: number) => {
  //     const width = Math.floor(nextWidth ?? container.getBoundingClientRect().width);
  //     setAvailableWidth((currentWidth) =>
  //       currentWidth === width ? currentWidth : width,
  //     );
  //   };
  //
  //   updateWidth();
  //
  //   if (typeof ResizeObserver !== "undefined") {
  //     const observer = new ResizeObserver((entries) => {
  //       updateWidth(entries[0]?.contentRect.width);
  //     });
  //     observer.observe(container);
  //     return () => observer.disconnect();
  //   }
  //
  //   const handleWindowResize = () => updateWidth();
  //   window.addEventListener("resize", handleWindowResize);
  //   return () => window.removeEventListener("resize", handleWindowResize);
  // }, []);
  //
  // const items = collapseTopLevelStages(
  //   run.stages,
  //   getVisibleRunItemLimit(run.stages.length, availableWidth ?? Number.POSITIVE_INFINITY),
  // );

  function flattenParallelStage(parallelStage: StageInfo): StageInfo[] {
    if (!parallelStage.children?.length) {
      return [];
    }

    return parallelStage.children.map((branch) => {
      const flattenedChildren: StageInfo[] = [];

      let current: StageInfo | undefined = branch;
      while (current) {
        flattenedChildren.push(current);
        current = current.nextSibling;
      }

      return {
        ...branch,
        children: flattenedChildren,
        nextSibling: undefined,
      };
    });
  }

  return (
    <div className="pgv-run-snippet" ref={null}>
      {run.stages.map((e) => {
        // if (item.kind === "collapsed") {
        //   return (
        //     <Tooltip
        //       key={item.id}
        //       content={`${item.hiddenCount} hidden stage${item.hiddenCount === 1 ? "" : "s"}`}
        //     >
        //       <div className="pgv-run-snippet__collapsed">
        //         {item.hiddenCount}
        //       </div>
        //     </Tooltip>
        //   );
        // }

        // const e = item.stage;

        // if (true) {
        //   return <div>{JSON.stringify(e, null, 2)}</div>;
        // }

        if (true) {
          return <div>{JSON.stringify(e, null, 2)}</div>;
        }

        if (e.synthetic) {
          return null;
        }

        if (e.children.length) {
          return (
            <div key={e.id} className={"parallelwrapper"}>
              {e.children.map((item) => (
                <Stage
                  e={item}
                  key={item.id}
                  currentRunPath={currentRunPath}
                  parent={e}
                />
              ))}
              <p className="shell">{e.name}</p>
            </div>
          );
        }

        return <Stage e={e} key={e.id} currentRunPath={currentRunPath} />;
      })}
    </div>
  );
}

function Stage({e, currentRunPath, parent }: {e: any, currentRunPath: string, parent?: any }) {
  return (
    <Tooltip
      content={
        <div style={{ textAlign: "center" }}>
          {parent && (
            <div className={"jenkins-!-text-color-secondary"}>
              {parent.name}
            </div>
          )}
          <div>{e.name}</div>
          <div className={"jenkins-!-text-color-secondary"}>
            <LiveTotal
              total={e.totalDurationMillis}
              start={e.startTimeMillis}
            />
          </div>
        </div>
      }
      key={e.id}
    >
      <a href={currentRunPath + e.id}>
        <StatusIcon status={e.state} percentage={50} />
      </a>
    </Tooltip>
  );
}