declare module '@semantic-release/release-notes-generator' {
  export function generateNotes(
    config: {
      preset?: string;
      config?: string;
      parserOpts?: Record<string, unknown>;
      releaseRules?:
        | string
        | {
            type: string;
            release: string;
            scope?: string;
          }[];
      presetConfig?: string;
    },
    args: {
      commits: { message: string; hash: string | null }[];
      logger: { log: (message: string) => void };
      options: {
        repositoryUrl: string;
      };
      lastRelease: { gitTag: string };
      nextRelease: { gitTag: string; version: string };
    }
  ): Promise<string>;
}
