# release-notes-generator

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
          from_ref_exclusive: v1.0.1
          to_ref_inclusive: v2.0.0
      - run: echo "${{ steps.release_notes.outputs.release_notes }}"
```

### Inputs

- **github_token** _(required)_ - The Github token used to query this repository.(default: `${{ github.token }}`)
- **version** _(required)_ - The version of the release.
  Example: 2.4.0
- **from_ref_exclusive** _(required)_ - The reference where to start gather commits. The referenced commit is not included.
  Examples:
  - tags/v1.0.1
  - v1.0.1
  - heads/my-branch
  - my-branch
  - 431880b
- **to_ref_inclusive** _(required)_ - The reference where to stop gather commits. The referenced commit is included.
  Examples:
  - tags/v2.0.0
  - v2.0.0
  - heads/master
  - master
  - 531c800
