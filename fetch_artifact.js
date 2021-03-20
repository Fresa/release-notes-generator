import { get } from 'axios';
import fs from 'fs';

const artifact_name = 'main.js';
const action_repository = process.env.GITHUB_ACTION_REPOSITORY;
const action_ref = process.env.GITHUB_ACTION_REF;
const action_path = process.env.GITHUB_ACTION_PATH;
const server_url = process.env.GITHUB_SERVER_URL;
const api_url = process.env.GITHUB_API_URL;

const ensureSuccessStatusCode = (response) => {
  if (response.status !== 200) {
    throw Error(`${reponse.status} ${response.statusText}: (${response.data})`);
  }
};

const getReleaseArtifact = async (releaseTag) =>
  get(
    `${server_url}/${action_repository}/releases/download/${releaseTag}/${artifact_name}`
  );

const getReleaseTagFromAnnotatedTag = async (tag) => {
  const tagResponse = await get(
    `${api_url}/repos/${action_repository}/git/refs/tags/${tag}`
  );

  ensureSuccessStatusCode(tagResponse);

  if (tagResponse.data.object.type === 'tag') {
    const refTagResponse = await get(tagResponse.object.url);

    return refTagResponse.data.message.trim();
  }

  throw Error(`${tag} is not an annotated tag`);
};

let getReleaseArtifactResponse = await getReleaseArtifact(action_ref);

if (getReleaseArtifactResponse.status === 404) {
  const releaseTag = await getReleaseTagFromAnnotatedTag(action_ref);
  getReleaseArtifactResponse = await getReleaseArtifact(releaseTag);
}

ensureSuccessStatusCode(getReleaseArtifactResponse);

const file = fs.createWriteStream(`${action_path}/${artifact_name}`);
getReleaseArtifactResponse.data.pipe(file);
