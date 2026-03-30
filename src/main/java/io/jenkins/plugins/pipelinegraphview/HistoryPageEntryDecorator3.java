/*
 * The MIT License
 *
 * Copyright (c) 2026, Jan Faracik
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

package io.jenkins.plugins.pipelinegraphview;

import hudson.Extension;
import hudson.model.Run;
import hudson.tasks.test.AbstractTestResultAction;
import hudson.widgets.HistoryWidget;
import jenkins.model.HistoricalBuild;
import jenkins.model.Jenkins;
import jenkins.widgets.HistoryPageEntryDecorator;
import org.jspecify.annotations.NonNull;

/**
 * TODO - remove this, this is purely for POCing
 */
@Extension
public class HistoryPageEntryDecorator3 extends HistoryPageEntryDecorator {

    private int failCount;

    private int skipCount;

    private int totalCount;

    private int passCount;

    @Override
    public boolean isApplicable(@NonNull HistoryWidget<?, ?> widget, @NonNull HistoricalBuild build) {
        if (!(build instanceof Run<?, ?> run)) {
            return false;
        }

        boolean junitInstalled = Jenkins.get().getPlugin("junit") != null;
        if (!junitInstalled) {
            return false;
        }

        AbstractTestResultAction<?> action = run.getAction(AbstractTestResultAction.class);

        if (action == null) {
            return false;
        }

        this.failCount = action.getFailCount();
        this.skipCount = action.getSkipCount();
        this.totalCount = action.getTotalCount();
        this.passCount = action.getTotalCount() - action.getFailCount() - action.getSkipCount();

        return true;
    }

    @SuppressWarnings("unused")
    public int getFailCount() {
        return failCount;
    }

    @SuppressWarnings("unused")
    public int getSkipCount() {
        return skipCount;
    }

    @SuppressWarnings("unused")
    public int getTotalCount() {
        return totalCount;
    }

    @SuppressWarnings("unused")
    public int getPassCount() {
        return passCount;
    }
}
