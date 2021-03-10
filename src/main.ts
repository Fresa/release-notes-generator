import * as core from '@actions/core';
import { generateNotes } from '@semantic-release/release-notes-generator';
import { context, getOctokit } from '@actions/github';

async function run(): Promise<void> {
  try {
    const version = core.getInput('version');
    const fromTag = core.getInput('from_tag_exclusive');
    const toTag = core.getInput('to_tag_inclusive');
    const githubToken = core.getInput('github_token');

    const octokit = getOctokit(githubToken);
    const fromTagResponse = await octokit.git.getRef({
      ...context.repo,
      ref: `tags/${fromTag}`
    });
    const toTagResponse = await octokit.git.getRef({
      ...context.repo,
      ref: `tags/${toTag}`
    });

    const commits = (
      await octokit.repos.compareCommits({
        ...context.repo,
        base: fromTagResponse.data.object.sha,
        head: toTagResponse.data.object.sha
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
        lastRelease: { gitTag: fromTag },
        nextRelease: { gitTag: toTag, version: version }
      }
    );

    core.info(`Release notes: ${releaseNotes}`);
    core.setOutput('release_notes', releaseNotes);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
