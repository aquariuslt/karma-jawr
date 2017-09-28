declare interface JawrOptions {
  configLocation: string;
  webappLocation: string;
  targetLocation: string;

  // optional locale config location for jawr i18n generator
  localeConfigLocation?: string;
}

declare interface JawrContext {
  jawrOptions: JawrOptions;
  jawrBundles: JawrBundles;
  jawrBundleMappings: JawrBundleMappings;


  getRegisteredJsBundleKeys(): Array;

  getLocaleJsBundles(): Array;
}

/**
 * for raw jawr.properties parsed object
 * */
declare interface JawrBundles {
  id?: string;

  composite?: boolean;
  child?: {
    names: string
  };

  global?: boolean;
  debugnever?: boolean
  debugonly?: boolean;

  mappings?: string;
  dependencies?: string;
}

declare interface JawrBundleMappings {
  [jawrBundleKey: string]: {
    id?: string;
    mappings: Array<string>,
  }
}

