import * as core from '@actions/core';
import { generateNotes } from '@semantic-release/release-notes-generator';
import { readFileSync } from 'fs';

async function run(): Promise<void> {
  try {
    const version = core.getInput('version');
    const fromRef = core.getInput('from_ref_exclusive');
    const toRef = core.getInput('to_ref_inclusive');
  } catch (error: any) {
    core.setFailed(`Action failed with error ${error}`);
  }
}

run();
