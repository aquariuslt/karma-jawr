declare interface JawrOptions {
  configLocation: string;
  webappLocation: string;
  targetLocation: string;

  // optional locale config location for jawr i18n generator
  localeConfigLocation?: string;
}

declare interface JawrContext {
  jawrOptions: JawrOptions;

}
