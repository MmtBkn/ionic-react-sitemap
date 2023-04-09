#!/usr/bin/env node
import path from "path";
import { program } from "commander";
import readline from "readline";
import { buildSitemap } from "./lib.mjs";
import fs from "fs";

const DEFAULT_BUILD_PATH = "./build";
const DEFAULT_APP_PATHS = ["./src/App.js", "./src/App.tsx"];

program
  .version("1.0.0")
  .description("Generate a sitemap for a Ionic React, and React apps")
  .option("-u, --url <url>", "base URL for your app")
  .option("-a, --app-path <appPath>", "path to your app's main entry file")
  .option(
    "-b, --build-path <buildPath>",
    "path to the build directory for your app"
  )
  .option(
    "-p, --paths [paths...]",
    "paths (experimental, calculates dynamic routes based off a map/url array. ['AppPage', 'page'] + 'route/page/:pageName' + 'type AppPage { url:string }' + 'const pages: AppPage[] = []' generates correct site maps.  )"
  )
  .option(
    "-e, --elements [elements...]",
    "JSX Elements, defaults to 'Route', 'IonRoute', 'Redirect'"
  )
  .option("-t, --last-mod <lastMod>", "Include <lastmod> tag, defaults to true")

  .parse(process.argv);

let { url, appPath, buildPath, paths, elements, lastMod } =
  program._optionValues;

if (paths) {
  paths = arrayToObject(paths);
}

let resolvedAppPath = appPath ? path.resolve(appPath) : null;
let resolvedBuildPath = buildPath ? path.resolve(buildPath) : null;

if (!url) {
  if (!resolvedAppPath) {
    for (const appPath of DEFAULT_APP_PATHS) {
      if (fs.existsSync(appPath)) {
        resolvedAppPath = path.resolve(appPath);
        break;
      }
    }
    if (!resolvedAppPath) {
      console.error(
        "(ionic-react-sitemap) ❌: Please specify the app path with the --app-path option."
      );
      process.exit(1);
    }
  }

  if (!resolvedBuildPath) {
    resolvedBuildPath = path.resolve(DEFAULT_BUILD_PATH);
  }

  if (!fs.existsSync(resolvedBuildPath)) {
    fs.mkdirSync(resolvedBuildPath, { recursive: true });
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(
    `What is the base URL for your app? (${
      url || "https://mohamedturco.com"
    }) `,
    (answer) => {
      const resolvedUrl =
        answer.trim() || url || "https://mohamedturco.com" + "";

      rl.close();
      generateSitemap(
        resolvedAppPath,
        resolvedBuildPath,
        resolvedUrl,
        paths,
        elements,
        lastMod
      );
    }
  );
} else {
  if (!resolvedAppPath) {
    for (const appPath of DEFAULT_APP_PATHS) {
      if (fs.existsSync(appPath)) {
        resolvedAppPath = path.resolve(appPath);
        break;
      }
    }
    if (!resolvedAppPath) {
      console.error(
        "(ionic-react-sitemap) ❌: Please specify the app path with the --app-path option."
      );
      process.exit(1);
    }
  }

  if (!resolvedBuildPath) {
    resolvedBuildPath = path.resolve(DEFAULT_BUILD_PATH);
  }

  if (!fs.existsSync(resolvedBuildPath)) {
    fs.mkdirSync(resolvedBuildPath, { recursive: true });
  }

  generateSitemap(
    resolvedAppPath,
    resolvedBuildPath,
    url,
    paths,
    elements,
    lastMod
  );
}

function generateSitemap(appPath, buildPath, url, paths, elements, lastMod) {
  try {
    buildSitemap(appPath, buildPath, url, paths, elements, lastMod);
    console.log(
      `\n(ionic-react-sitemap) ✅ : Sitemap generated successfully at ${buildPath}/sitemap.xml`,
      `\n(ionic-react-sitemap) 🍀 : Good luck!\n\n`
    );
  } catch (error) {
    console.error("(ionic-react-sitemap) ❌: Error generating sitemap:", error);
    process.exit(1);
  }
}

function arrayToObject(arr) {
  if (arr.length % 2 !== 0) {
    throw new Error("Array must contain an even number of elements");
  }

  const obj = {};

  for (let i = 0; i < arr.length; i += 2) {
    const key = arr[i];
    const value = arr[i + 1];
    obj[key] = value;
  }

  return obj;
}
