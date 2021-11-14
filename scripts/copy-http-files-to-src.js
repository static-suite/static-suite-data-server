/**
 * Script to run after npm install
 *
 * Copy selected files to assets directory
 */

const fs = require('fs');

// Copy files from Bulma to assets directory
const bulmaSrcDir = 'node_modules/bulma/css/';
const bulmaTargetDir = `${process.env.INIT_CWD}/src/http/public/assets/bulma/`;
fs.mkdirSync(bulmaTargetDir, { recursive: true });
fs.copyFileSync(
  `${bulmaSrcDir}/bulma.min.css`,
  `${bulmaTargetDir}/bulma.min.css`,
);

// Copy files from Bulma tooltip to assets directory
const bulmaTooltipSrcDir = 'node_modules/@creativebulma/bulma-tooltip/dist/';
fs.copyFileSync(
  `${bulmaTooltipSrcDir}/bulma-tooltip.min.css`,
  `${bulmaTargetDir}/bulma-tooltip.min.css`,
);

// Copy files from Clipboard to assets directory
const clipboardSrcDir = 'node_modules/clipboard/dist/';
const clipboardTargetDir = `${process.env.INIT_CWD}/src/http/public/assets/clipboard/`;
fs.mkdirSync(clipboardTargetDir, { recursive: true });
fs.copyFileSync(
  `${clipboardSrcDir}/clipboard.min.js`,
  `${clipboardTargetDir}/clipboard.min.js`,
);

// Copy files from datatables to assets directory
const dataTablesSrcDir = 'node_modules/simple-datatables/dist/';
const dataTablesTargetDir = `${process.env.INIT_CWD}/src/http/public/assets/simple-datatables/`;
fs.mkdirSync(dataTablesTargetDir, { recursive: true });
fs.copyFileSync(
  `${dataTablesSrcDir}/umd/simple-datatables.js`,
  `${dataTablesTargetDir}/index.js`,
);
fs.copyFileSync(
  `${dataTablesSrcDir}/style.css`,
  `${dataTablesTargetDir}/style.css`,
);
