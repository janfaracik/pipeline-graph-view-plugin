import { Result } from "../../../pipeline-graph-view/pipeline-graph/main/PipelineGraphModel.tsx";

// PipelineRun.java
export interface RunInfo {
  id: string;
  displayName: string;
  timestamp: number;
  duration: number;
  changesCount: number;
  result: Result;
  description: string;
}
