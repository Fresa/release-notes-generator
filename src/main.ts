import * as core from '@actions/core';
import { generateNotes } from '@semantic-release/release-notes-generator';
import { readFileSync } from 'fs';

async function run(): Promise<void> {
  try {
    core.debug('test');
  } catch (error: any) {
    core.setFailed(`Action failed with error ${error}`);
  }
}

run();
