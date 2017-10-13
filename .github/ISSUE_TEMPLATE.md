## [Short Description]

- Spring Version :(Optional)
- JAWR Version: (Optional)
- WebApp folder structure:
- JawrConfig Content:

```
# JAWR Global Properties
jawr.charset.name=UTF-8
jawr.debug.on=true
jawr.gzip.on=true
jawr.js.use.cache=false
jawr.css.use.cache=false
# JAWR Url Based Properties
jawr.js.bundle.basedir=/js
# JAWR i18n Resolver with Spring MVC
jawr.locale.resolver=net.jawr.web.resource.bundle.locale.SpringLocaleResolver
jawr.js.bundle.i18n.id=/jsBundles/i18n.js
jawr.js.bundle.i18n.global=true
jawr.js.bundle.i18n.order=1
jawr.js.bundle.i18n.mappings=messages:i18n.i18n(locale)
# JAWR Global Bundle Names Definitions
jawr.js.bundle.names=i18n, extJs, home
jawr.css.bundle.names=extCss
# JAWR Bundle Definitions
jawr.js.bundle.extJs.id=/jsBundles/extJs.js
jawr.js.bundle.extJs.composite=true
jawr.js.bundle.extJs.child.names=\
  extDebug,\
  extProd
## ExtJS Debug Source
jawr.js.bundle.extDebug.debugonly=true
jawr.js.bundle.extDebug.mappings=/js/vendor/ext/ext-base-debug.js, /js/vendor/ext/ext-all-debug-w-comments.js
## ExtJS Prod Source
jawr.js.bundle.extProd.debugnever=true
jawr.js.bundle.extProd.mappings=/js/vendor/ext/ext-base.js, /js/vendor/ext/ext-all.js
```

- Node.js Version: v6.10.4
- Karma Configuration: 
```

```
