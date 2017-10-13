# Karma JAWR

[![npm](https://img.shields.io/npm/v/karma-jawr.svg)](https://www.npmjs.com/package/karma-jawr)
[![Build Status](https://travis-ci.org/Aquariuslt/karma-jawr.svg?branch=master)](https://travis-ci.org/Aquariuslt/karma-jawr)
[![Coverage Status](https://coveralls.io/repos/github/Aquariuslt/karma-jawr/badge.svg?branch=master)](https://coveralls.io/github/Aquariuslt/karma-jawr?branch=master)


Karma + JAWR Integration.

### Concert & Situations

When you are using J2EE for your web application and using server-render template engine (JSP,JSF,Freemarker,Velocity), you might using some web resource bundling solution.

`JAWR` used to be a JavaEE official web resource packing solution in Java way.

But how can we setup a universal unittest way for JAWR style loading resource way?

If you are noticed `karma` is popular with managing frontend javascript side and easily integrated with reporters and CI.

Here is a karma-plugin to help you generate some `commonjs` style temp file by parsing `jawr.properties`.
So that you can use webpack or other preprocessor for writing frontend unittest in a graceful way.



### JAWR Options

- **configLocation**: Absolute path, point to `jawr.properties` or `spring-jawr-context.xml`
- **webappLocation**: Absolute path, point to your maven war project `webapp` folder
- **targetLocation**: Absolute path, point to a temp build folder, for require syntax
- **localeConfigLocation**: Absolute path, optional, if using jawr message generator and using `messages:` 
syntax in jawr properties file, suppose to pre-generate by resources bundle and add as global serving files in the karma config.files.


### Usage

#### Installation

```bash
$ yarn add -D karma-jawr
```


#### Karma Configuration
1. Add `karma-jawr` as loaded plugin and framework

```
plugins:[
  ....,
  'karma-jawr'
],
frameworks: [
  ...,
  'jawr'
],
```

2. Add `jawr` for `karma-jawr` options
to spec the location for your `jawr.properties`, `webapp` folder for building war, template generate folder for you customize gitignore path.
using mandatory fields `configLocation`,`webappLocation`,`targetLocation`.

the value must be absolute path.
```
jawr: {
  configLocation: pathUtil.resolve('src/main/resources/jawr/') + 'jawr.properties',
  webappLocation: pathUtil.resolve('src/main/webapp'),
  targetLocation: pathUtil.resolve('src/test/js/build')
}
```

> If you are using jawr provided locale generator for frontend locale string
> You can also add `localeConfigLocation` for locating your locale bundle resources.

#### Sample Project 

You can refer to this sample project.
It using last generation J2EE way web application.

Using `SpringMVC` + `JSF` + `JAWR` + `ExtJs` for building a deployable war file.

And Integrated with travis.ci and coveralls.io for CI.

[Spring-Jawr-Ext3](https://github.com/Aquariuslt/spring-jawr-ext)



### Change Log

#### 0.1.7
- New features: Add css bundle support, for better requiring style file for debug in browser.
- Change log level to `debug` when generating flatten mapping files for ignoring more files.
- Mini refactor JawrContext design.

#### 0.1.6
- Fix non-primitive value in locale message properties can not be parse defects.

#### 0.1.5
- Fix non-composite child key calculate not including itself defects.

#### 0.1.4

- Fix locale generator generate function key-value duplicate error.
- Fix locale message mapping detect and filter function.
