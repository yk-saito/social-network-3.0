const path = require('path');

const buildFormatCommand = (filenames) =>
  `yarn dlx @biomejs/biome format ${filenames
    .map((f) => path.relative(process.cwd(), f))
    .join(' ')} `;

const buildLintCommand = (filenames) =>
  `biome lint ${filenames
    .map((f) => path.relative(process.cwd(), f))
    .join(' ')}`;

const buildSolhintCommand = (filenames) =>
  `solhint --max-warnings 0 ${filenames
    .map((f) => path.relative(process.cwd(), f))
    .join(' ')} `;

module.exports = {
  '**/*.{js,jsx,ts,tsx}': [buildFormatCommand, buildLintCommand],
  '**/*.sol': [buildSolhintCommand],
};
