import * as core from '@actions/core';
import { generateNotes } from '@semantic-release/release-notes-generator';
import { context, getOctokit } from '@actions/github';

async function run(): Promise<void> {
  try {
    const version = core.getInput('version');
    const fromRef = core.getInput('from_ref_exclusive');
    const toRef = core.getInput('to_ref_inclusive');
    const githubToken = core.getInput('github_token');

    const octokit = getOctokit(githubToken);

    const commits = (
      await octokit.repos.compareCommits({
        ...context.repo,
        base: fromRef,
        head: toRef
      })
    ).data.commits
      .filter((commit) => !!commit.commit.message)
      .map((commit) => ({
        message: commit.commit.message,
        hash: commit.sha
      }));

    const releaseNotes = await generateNotes(
      {},
      {
        commits,
        logger: { log: core.info },
        options: {
          repositoryUrl: `https://github.com/${process.env.GITHUB_REPOSITORY}`
        },
        lastRelease: { gitTag: fromRef },
        nextRelease: { gitTag: toRef, version: version }
      }
    );

    core.info(`Release notes: ${releaseNotes}`);
    core.setOutput('release_notes', releaseNotes);
  } catch (error) {
    core.setFailed(`Action failed with error ${error}`);
  }
}

run();
