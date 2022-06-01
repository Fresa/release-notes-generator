import * as core from '@actions/core';
import { generateNotes } from '@semantic-release/release-notes-generator';
import { readFileSync } from 'fs';

async function run(): Promise<void> {
  try {
    const version = core.getInput('version');
    const fromRef = core.getInput('from_ref_exclusive');
    const toRef = core.getInput('to_ref_inclusive');
    const path_to_commits = core.getInput('path_to_commits');

    const commits = JSON.parse(readFileSync(path_to_commits, 'utf-8'));

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
  } catch (error: any) {
    core.setFailed(`Action failed with error ${error}`);
  }
}

run();
