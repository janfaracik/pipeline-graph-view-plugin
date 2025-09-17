package io.jenkins.plugins.pipelinegraphview.cards.items;

import hudson.tasks.test.AbstractTestResultAction;
import jenkins.model.Jenkins;
import net.sf.json.JSONObject;
import org.jenkinsci.plugins.workflow.job.WorkflowRun;

import java.util.Optional;

public class TodoTest {

    public static Optional<JSONObject> get(WorkflowRun run) {
        boolean junitInstalled = Jenkins.get().getPlugin("junit") != null;

        if (!junitInstalled) {
            return Optional.empty();
        }

        AbstractTestResultAction<?> action = run.getAction(AbstractTestResultAction.class);

        if (action == null) {
            return Optional.empty();
        }

        JSONObject testsJson = new JSONObject();
        testsJson.element("url", action.getUrlName());
        testsJson.element("passingCount", action.getTotalCount() - action.getFailCount() - action.getSkipCount());
        testsJson.element("skippedCount", action.getSkipCount());
        testsJson.element("failingCount", action.getFailCount());
        return Optional.of(testsJson);
    }
}
