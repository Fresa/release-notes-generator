const fs = require('fs');
const https = require('https');
const os = require('os');
const spawn = require('child_process').spawn;

const core = new (class {
  setFailed(message) {
    process.exitCode = 1;
    this.error(message);
  }

  debug(message) {
    process.stdout.write(`::debug::${message}` + os.EOL);
  }

  info(message, eol = true) {
    process.stdout.write(message + (eol ? os.EOL : ''));
  }

  error(message, eol = true) {
    process.stdout.write(`::error::${message}` + (eol ? os.EOL : ''));
  }
})();

const getEnvironmentVariable = (name) => {
  const value = process.env[name];
  if (['', null, undefined].includes(value)) {
    throw new Error(`${name} is not set`);
  }
  core.debug(`${name}: ${value}`);
  return value;
};

try {
  const artifact_name = 'artifacts.zip';
  core.debug(`Artifact name: ${artifact_name}`);
  const action_repository = getEnvironmentVariable('GITHUB_ACTION_REPOSITORY');
  const action_ref = getEnvironmentVariable('GITHUB_ACTION_REF');
  const server_url = getEnvironmentVariable('GITHUB_SERVER_URL');
  const api_url = getEnvironmentVariable('GITHUB_API_URL');
  const token = getEnvironmentVariable('INPUT_GITHUB_TOKEN');

  const getAsync = async (url, asStream = false) => {
    const getAsyncCalback = (url, resolve, reject) => {
      https.get(
        url,
        {
          headers: {
            Accept: asStream ? 'text/html' : 'application/vnd.github.v3+json',
            'User-Agent': 'artifact-downloader',
            Authorization: `Bearer ${token}`
          }
        },
        (res) => {
          if (res.statusCode === 301 || res.statusCode === 302) {
            return getAsyncCalback(res.headers.location, resolve, reject);
          }

          if (asStream) {
            return resolve({
              status: res.statusCode,
              statusText: res.statusMessage,
              data: res
            });
          }

          let rawData = '';
          res.on('data', (chunk) => {
            rawData += chunk;
          });
          res.on('end', () => {
            resolve({
              status: res.statusCode,
              statusText: res.statusMessage,
              data: JSON.parse(rawData)
            });
          });
          res.on('error', (err) => {
            reject({
              error: {
                status: res.statusCode,
                statusText: res.statusMessage,
                data: err
              }
            });
          });
        }
      );
    };

    return new Promise((resolve, reject) =>
      getAsyncCalback(url, resolve, reject)
    );
  };

  const ensureSuccessStatusCode = (response) => {
    if (response.status !== 200) {
      throw Error(
        `${response.status} ${response.statusText}: (${response.data})`
      );
    }
  };

  const getReleaseArtifact = async (releaseTag) => {
    const url = `${server_url}/${action_repository}/releases/download/${releaseTag}/${artifact_name}`;
    core.info(`Getting release artifact from ${url}`);

    return getAsync(url, true);
  };

  const getReleaseTagFromAnnotatedTag = async (tag) => {
    const url = `${api_url}/repos/${action_repository}/git/refs/tags/${tag}`;
    core.info(`Getting release tag from ${url}`);
    const tagResponse = await getAsync(url);

    ensureSuccessStatusCode(tagResponse);

    if (tagResponse.data.object.type === 'tag') {
      const commitUrl = tagResponse.data.object.url;
      core.info(`Tag found, getting commit from ${commitUrl}`);
      const refTagResponse = await getAsync(commitUrl);

      var releaseTag = refTagResponse.data.message.trim();
      core.info(`Tag ${tag} is pointing at release ${releaseTag}`);
      return releaseTag;
    }

    throw Error(`${tag} is not an annotated tag`);
  };

  (async () => {
    try {
      let getReleaseArtifactResponse;
      getReleaseArtifactResponse = await getReleaseArtifact(action_ref);
      if (getReleaseArtifactResponse.status === 404) {
        core.info('Artifact was not found, searching for release');
        const releaseTag = await getReleaseTagFromAnnotatedTag(action_ref);
        getReleaseArtifactResponse = await getReleaseArtifact(releaseTag);
      }

      ensureSuccessStatusCode(getReleaseArtifactResponse);
      const dir = `${__dirname}/dist`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const artifactPath = `${dir}/${artifact_name}`;
      core.debug(`Writing script to ${artifactPath}`);
      const artifactWriter = fs.createWriteStream(artifactPath);
      getReleaseArtifactResponse.data.pipe(artifactWriter);
      artifactWriter.on('error', (err) => {
        core.setFailed(`Could not write artifact to disk. ${err}`);
      });
      artifactWriter.on('finish', () => {
        var unzip = spawn('unzip', ['-o', '-d', dir, artifactPath]);
        unzip.stdout.on('data', (data) => {
          core.info(data, false);
        });
        unzip.stderr.on('data', function (data) {
          core.error(data, false);
        });
        unzip.on('exit', function (code) {
          if (code !== 0) {
            core.setFailed(`Could not unzip artifacts. Error code: ${code}`);
          }
        });
      });
    } catch (error) {
      core.setFailed(`Action failed. ${error.stack}`);
    }
  })();
} catch (error) {
  core.setFailed(`Action failed. ${error.stack}`);
}
