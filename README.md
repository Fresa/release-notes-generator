# Semantic Release Notes Generator

A Github Action for [semantic-release/release-notes-generator](https://github.com/semantic-release/release-notes-generator)

[![Build](https://github.com/Fresa/release-notes-generator/actions/workflows/ci.yml/badge.svg)](https://github.com/Fresa/release-notes-generator/actions/workflows/ci.yml)

## Installation

```yaml
name: Generate release notes
on: push
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
        with:
          # Fetches entire history, so we can analyze commits
          fetch-depth: 0
      - name: Generate release notes
        id: release_notes
        uses: fresa/release-notes-generator@master
        with:
          version: v2.0.0
          last_release_ref: v1.0.1
          release_ref: v2.0.0
          path_to_commits: ./commits.json
      - run: echo "${{ steps.release_notes.outputs.release_notes }}"
```

### Inputs / Outputs

See [actions.yml](action.yml)

### Update from v0 -> v1

In v0 commits was automatically gathered through Github's [compare api](https://docs.github.com/en/rest/commits/commits#compare-two-commits), however this API does not fully support all the traversing options that for example `git log` exposes which caused limitations. This has been removed in v1. It now instead acts as a pure facade of [semantic-release/release-notes-generator](https://github.com/semantic-release/release-notes-generator). Use `git log $last_release_ref...$release_ref` to get the same behaviour as in v0. For an example how to fetch commit logs for releases for a [trunk based branching model](https://trunkbaseddevelopment.com/), see `Determine Release Info` in [.github/workflows/ci.yml](.github/workflows/ci.yml).
