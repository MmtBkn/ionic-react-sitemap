import babelParser from "@babel/parser";
import fs from "fs";
import PropTypes from "prop-types";
import glob from "glob";
import { findUpSync } from "find-up";
import path from "path";

const buildSitemap = (
  fileName,
  buildPath,
  url,
  paths2 = { AppPage: "page" },
  elements = ["Route", "IonRoute", "Redirect"],
  lastMod = true
) => {
  const plugins = ["jsx", "classProperties", "typescript"];

  const findRoutesAndRedirects = (json) => {
    const paths = [];

    let classes = Object.keys(paths2);

    const processNode = (node) => {
      if (node.type === "VariableDeclaration") {
        const className =
          node?.declarations?.[0]?.id?.typeAnnotation?.typeAnnotation
            ?.elementType?.typeName?.name;

        if (
          node.declarations[0].id.typeAnnotation &&
          node.declarations[0].id.typeAnnotation.typeAnnotation.type ===
            "TSArrayType" &&
          classes.includes(className)
        ) {
          node.declarations[0].init.elements.forEach((element) => {
            paths.push([paths2[className], element.properties[0].value.value]);
          });
        }
      }

      if (
        node.type === "JSXElement" &&
        elements.find((item) => item === node.openingElement.name.name)
      ) {
        node.openingElement.attributes.forEach((attr) => {
          // probably nulls will be parents some how
          if (attr.name.name === "path") {
            paths.push([null, attr.value.value]);
          }
          if (attr.name.name === "to") {
            paths.push([null, attr.value.value]);
          }
        });
      }

      if (
        node.type === "VariableDeclaration" &&
        (node.declarations[0].init?.type === "ArrowFunctionExpression" ||
          node.declarations[0].init?.type === "FunctionDeclaration")
      ) {
        if (node.declarations?.[0].init?.body?.body?.["0"]?.argument) {
          processNode(node.declarations[0].init?.body?.body?.["0"]?.argument);
        }
        if (Array.isArray(node.declarations?.[0]?.init?.body?.body)) {
          node.declarations?.[0]?.init?.body?.body.forEach(processNode);
        }
        if (
          Array.isArray(node.declarations?.[0]?.init?.declaration?.body?.body)
        ) {
          node.declarations?.[0]?.init?.declaration?.body?.body.forEach(
            processNode
          );
        }
      }

      if (node.children) {
        node.children.forEach(processNode);
      }
    };

    if (Array.isArray(json)) {
      json.forEach(processNode);
    } else {
      processNode(json);
    }

    return paths;
  };

  const packageJsonPath = findUpSync("package.json", { cwd: fileName });

  const files = glob.sync(`${packageJsonPath}/../**/*.{js,jsx,ts,tsx}`, {
    ignore: [
      "**/node_modules/**",
      "**/build/**",
      "**/*.test.js",
      "**/*.spec.js",
      "**d.ts",
    ],
  });
  const sitemapElements = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];

  files.forEach((file) => {
    const jsxFile = fs.readFileSync(file, "utf8");
    const jsxTree = babelParser.parse(jsxFile, {
      sourceType: "unambiguous",
      plugins,
    });

    const paths = findRoutesAndRedirects(jsxTree.program.body);

    paths.forEach(([route, pathValue]) => {
      const paramRegex = /\/:[^/]+/;
      const match = paramRegex.exec(pathValue);

      if (match) {
        const paramName = match[0].substring(2);
        let appPages; //= findAppPages(jsxTree.program.body);
        if (appPages) {
          appPages.forEach((page) => {
            const replacedPath = pathValue.replace(
              `:${paramName}`,
              page.url.split("/").pop()
            );
            let loc = `<loc>${url}/${
              route ? route + "/" : ""
            }${replacedPath}</loc>`;
            if (lastMod !== false) {
              loc += `<lastmod>${new Date().toISOString()}</lastmod>`;
            }
            if (sitemapElements.some((item) => !item.includes(loc)))
              sitemapElements.push(`<url>${loc}</url>`);
          });
        }
      } else {
        let loc = `<loc>${url}${
          route ? "/" + route + "/" : ""
        }${pathValue}</loc>`;
        if (lastMod !== false) {
          loc += `<lastmod>${new Date().toISOString()}</lastmod>`;
        }
        if (!sitemapElements.some((item) => item.includes(loc)))
          sitemapElements.push(`<url>${loc}</url>`);
      }
    });
  });

  sitemapElements.push("</urlset>");
  const xml = sitemapElements.join("");

  fs.writeFile(`${buildPath}/sitemap.xml`, xml, (err) => {
    if (err) {
      console.error(`ionic-sitemap > Error ❌: ${err}`);
    } else {
      // console.log(
      //   `ionic-sitemap > Success ✅: Sitemap successfully generated at ${buildPath}/sitemap.xml`
      // );
    }
  });
};

buildSitemap.propTypes = {
  fileName: PropTypes.string,
  buildPath: PropTypes.string,
  url: PropTypes.string,
};

export default buildSitemap;
export { buildSitemap };
