declare interface JawrOptions {
  configLocation: string;
  webappLocation: string;
  targetLocation: string;

  // optional locale config location for jawr i18n generator
  localeConfigLocation?: string;
}

declare interface JawrContext {
  jawrOptions: JawrOptions; //original jawrOptions in karma.conf
  jawrProperties: JawrProperties; // jawr.properties raw data
  jawrBundles: JawrBundles; //parsed jawr.properties bundle raw data
  jawrBundleFlattenMappings: JawrBundleFlattenMappings; // handled jawrBundleMappings
  messageBundles?: JawrMessageBundles;
  messageBundleFlattenMappings?: JawrMessageBundleFlattenMappings;

  getRegisteredJsBundleKeys?(): Array;

  getLocaleJsBundles?(): Array;
}


/**
 * for raw jawr.properties parsed object
 * */

declare interface JawrProperties {
  jawr: {
    charset?: string;
    debug?: {
      on: boolean;
    };
    gzip?: {
      on: boolean;
    };
    js: {
      use?: {
        cache: boolean;
      },
      bundle: JawrBundles
    };
    css: {
      use?: {
        cache: boolean;
      },
      bundle: Object;
    };
    locale?: {
      resolver: string;
    };
  }
}


declare interface JawrBundles {
  names: string;

  [jawrBundleKey: string]: {
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
}

declare interface JawrBundleFlattenMappings {
  [jawrBundleKey: string]: {
    id?: string;
    global?: boolean;
    mappings: Array<string>,
  }
}


declare interface JawrMessageBundles {
  [jawrMessageBundleKey: string]: {
    id?: string;
    global?: boolean;
    mappings: string;
  }
}

declare interface JawrMessageBundleFlattenMappings {
  [jawrBundleKey: string]: {
    id?: string;
    global?: boolean;
    mappings?: Array<string>;
    generators: Array<string>;
  }
}


declare interface JawrLocaleMessageProperties {
  location: string;
  namespace: string;
}
