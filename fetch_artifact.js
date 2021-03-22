import axios from 'axios';
import fs from 'fs';

const artifact_name = 'main.js';
console.log(`Artifact name: ${artifact_name}`);
const action_repository = process.env.GITHUB_ACTION_REPOSITORY;
console.log(`Action repository: ${action_repository}`);
const action_ref = process.env.GITHUB_ACTION_REF;
console.log(`Action ref: ${action_ref}`);
const action_path = process.env.GITHUB_ACTION_PATH;
console.log(`Action path: ${action_path}`);
const server_url = process.env.GITHUB_SERVER_URL;
console.log(`Server url: ${server_url}`);
const api_url = process.env.GITHUB_API_URL;
console.log(`Api url: ${api_url}`);

const ensureSuccessStatusCode = (response) => {
  if (response.status !== 200) {
    throw Error(`${reponse.status} ${response.statusText}: (${response.data})`);
  }
};

const getReleaseArtifact = async (releaseTag) => {
  const url = `${server_url}/${action_repository}/releases/download/${releaseTag}/${artifact_name}`;
  console.log(`Getting release artifact from ${url}`);
  return axios.get(url, { responseType: 'stream' });
};

const getReleaseTagFromAnnotatedTag = async (tag) => {
  const url = `${api_url}/repos/${action_repository}/git/refs/tags/${tag}`;
  console.log(`Fetching release tag from ${url}`);
  const tagResponse = await axios.get(url);

  ensureSuccessStatusCode(tagResponse);

  if (tagResponse.data.object.type === 'tag') {
    const commitUrl = tagResponse.data.object.url;
    console.log(`Tag found, getting commit from ${commitUrl}`);
    const refTagResponse = await axios.get(commitUrl);

    var releaseTag = refTagResponse.data.message.trim();
    console.log(`Tag ${tag} is pointing at release ${releaseTag}`);
    return releaseTag;
  }

  throw Error(`${tag} is not an annotated tag`);
};

const run = async () => {
  let getReleaseArtifactResponse;
  try {
    getReleaseArtifactResponse = await getReleaseArtifact(action_ref);
  } catch (error) {
    if (error.response.status !== 404) {
      throw error;
    }

    const releaseTag = await getReleaseTagFromAnnotatedTag(action_ref);
    getReleaseArtifactResponse = await getReleaseArtifact(releaseTag);
  }

  ensureSuccessStatusCode(getReleaseArtifactResponse);

  const artifactPath = `${action_path}/lib/${artifact_name}`;
  console.log(`Writing script to ${artifactPath}`);
  const artifactWriter = fs.createWriteStream(artifactPath);
  getReleaseArtifactResponse.data.pipe(artifactWriter);
};

run();
