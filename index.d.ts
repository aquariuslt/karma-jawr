declare interface JawrOptions {
  configLocation: string;
  webappLocation: string;
  targetLocation: string;

  // optional locale config location for jawr i18n generator
  localeConfigLocation?: string;
}

declare interface JawrContext {
  jawrOptions: JawrOptions;                                       //original jawrOptions in karma.conf
  jawrProperties: JawrProperties;                                 //jawr.properties raw data

  /* sub component */
  jsBundles: JawrJsBundles;                                       //parsed jawr.properties bundle raw data
  jsBundleFlattenMappings: JawrJsBundleFlattenMappings;           //handled jawrBundleMappings
  cssBundles?: JawrCssBundles;                                    //jawr css bundles
  cssBundleFlattenMappings?: JawrCssBundleFlattenMappings;        //jawr css flatten mappings
  messageBundles?: JawrMessageBundles;                            //jawr locale generator messages bundles
  messageBundleFlattenMappings?: JawrMessageBundleFlattenMappings;//jawr locale messages flatten mappings


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
      bundle: JawrJsBundles
    };
    css: {
      use?: {
        cache: boolean;
      },
      bundle: JawrCssBundles;
    };
    locale?: {
      resolver: string;
    };
  }
}


declare interface JawrJsBundles {
  names: string;

  [jawrJsBundleKey: string]: {
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

declare interface JawrJsBundleFlattenMappings {
  [jawrJsBundleKey: string]: {
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
  [jawrMessageBundleKey: string]: {
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


declare interface JawrCssBundles {
  names: string;

  [jawrCssBundleKey: string]: {
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

declare interface JawrCssBundleFlattenMappings {
  [jawrCssBundleKey: string]: {
    id?: string;
    global?: boolean;
    mappings: Array<string>;
  }
}
