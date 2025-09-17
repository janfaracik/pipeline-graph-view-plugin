package io.jenkins.plugins.pipelinegraphview.multipipelinegraphview;

public final class TestResult {

    private final String url;

    private final int passingCount;

    private final int skippedCount;

    private final int failingCount;

    public TestResult(String url, int passingCount, int skippedCount, int failingCount) {
        this.url = url;
        this.passingCount = passingCount;
        this.skippedCount = skippedCount;
        this.failingCount = failingCount;
    }

    public String getUrl() {
        return url;
    }

    public int getPassingCount() {
        return passingCount;
    }

    public int getSkippedCount() {
        return skippedCount;
    }

    public int getFailingCount() {
        return failingCount;
    }
}
