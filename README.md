# Ionic React Sitemap

Ionic React Sitemap is a tool for generating a sitemap for an Ionic/React apps. It's based off lanierc's react-build-sitemap. Supports typescript. 

This package is far from perfect, but it gets the job done! If you notice any issues or have suggestions for improvements, you are welcome to submit pull requests. Your contribution is appreciated in making this package better for everyone.

## Installation

You can install this tool using npm:

`npm install ionic-react-sitemap`

Or you may use `ionic-react-sitemap` package via with npx:

## Usage

### NPX
You may use it easily on your CI;

``` bash
npx ionic-react-sitemap ./src/App.js ./build http://yoururl.com
```

This command generates a sitemap for an Ionic/React app with the main entry file located at `./src/App.js`, the build directory located at `./build`, and the base URL set to `http://yoururl.com`.

If you don't specify the `--url`, `--app-path`, or `--build-path` options, the tool will prompt you to enter the values interactively. For example:

`npx ionic-react-sitemap`

This command will prompt you to enter the app path, build path, and base URL for your app.

### JS
You can use Ionic React Sitemap in your plain JavaScript code:

```javascript
const generateSitemap = require('ionic-react-sitemap');

const appPath = './src/App.js';
const buildPath = './build';
const url = 'http://yoururl.com';

generateSitemap(appPath, buildPath, url)
  .then(() => {
    console.log(`Sitemap generated successfully at ${buildPath}/sitemap.xml`);
  })
  .catch((error) => {
    console.error('Error generating sitemap:', error);
  });
```
### Build Process
Or you can use it in your build process:

```javascript
const generateSitemap = require('ionic-react-sitemap');
const path = require('path');
const webpack = require('webpack');

const appPath = './src/App.js';
const buildPath = './build';
const url = 'http://yoururl.com';

generateSitemap(appPath, buildPath, url)
  .then(() => {
    const config = {
      entry: appPath,
      output: {
        path: path.resolve(__dirname, buildPath),
        filename: 'bundle.js',
      },
      // ...
    };

    webpack(config, (err, stats) => {
      // ...
    });
  })
  .catch((error) => {
    console.error('Error generating sitemap:', error);
  });
```  

# API
| Method Signature | Description |
| ---------------- | ----------- |
| `generateSitemap(appPath: string, buildPath: string, url: string): Promise<void>` | Generate a sitemap for an Ionic/React app. |

### Parameters
| Parameter | Type | Default | Description                                                       |
| --------- | ---- | ------- |-------------------------------------------------------------------|
| `appPath` | `string` | `./src/App.js` or `./src/App.tsx` | The path to the app's main entry file (e.g. `./src/App.tsx`).     |
| `buildPath` | `string` | `./build` | The path to the build directory for the app (e.g. `./build`).     |
| `url` | `string` | `null` | The base URL for the app.                                         |
| `paths` | `string[]` | `["page", "AppPages"]` | (Experimental) Paths for dynamic routes based on a map/url array. |
| `elements` | `string[]` | `["Route","IonRoute", "Redirect"]` | JSX elements used to generate the sitemap.                        |
| `lastMod` | `boolean` | `true` | Include `<lastmod>` tag.                                          |

### Known issues
1. It may or may not work with class components.
2. Nested Routes May or May not be Supported


# License
MIT

