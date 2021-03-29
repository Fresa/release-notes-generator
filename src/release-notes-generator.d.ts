declare module '@semantic-release/release-notes-generator' {
  export function generateNotes(
    config: {
      preset?: string;
      config?: string;
      parserOpts?: any;
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
      logger: { log: (args: any) => void };
      options: {
        repositoryUrl: string;
      };
      lastRelease: { gitTag: string };
      nextRelease: { gitTag: string; version: string };
    }
  ): Promise<string>;
}
