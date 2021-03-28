declare module '@open-wc/create/dist/core.js' {
  interface Options {
    override?: boolean;
    ask?: boolean;
  }

  function writeFileToPathOnDisk(toPath: string, fileContent: string, obj: Options): void;
}
