import "./single-run.scss";

import { RunStatus } from "../../common/RestClient.tsx";
import { useUserPreferences } from "../../common/user/user-preferences-provider.tsx";
import StatusIcon from "../../common/components/status-icon.tsx";

export default function SingleRun({ run, currentRunPath }: SingleRunProps) {
  const { showNames, showDurations } = useUserPreferences();

  function getCompactLayout() {
    return !showNames && !showDurations ? "pgv-single-run--compact" : "";
  }

  return (
    <div className={`pgv-single-run ${getCompactLayout()}`}>
      {run.stages.map(e => {
        return (
          <a href={currentRunPath + e.id} key={e.id}>
            <StatusIcon status={e.state} />
            <span>{e.name}</span>
          </a>
        );
      })}
    </div>
  );
}

interface SingleRunProps {
  run: RunStatus;
  currentRunPath: string;
}
