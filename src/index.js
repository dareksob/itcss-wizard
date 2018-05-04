#!/usr/bin/env node

const layers = [
  {
    name: 'Settings',
    description: 'Settings - used with preprocessors and contain font, colors definitions, etc.',
  },
  {
    name: 'Tools',
    description: 'Tools - globally used mixins and functions. It-s important not to output any CSS in the first 2 layers.',
  },
  {
    name: 'Generic',
    description: 'Generic - reset and/or normalize styles, box-sizing definition, etc. This is the first layer which generates actual CSS.',
  },
  {
    name: 'Elements',
    description: 'Elements - styling for bare HTML elements (like H1, A, etc.). These come with default styling from the browser so we can redefine them here.',
  },
  {
    name: 'Objects',
    description: 'Objects - class-based selectors which define undecorated design patterns, for example media object known from OOCSS',
  },
  {
    name: 'Components',
    description: 'Components - specific UI components. This is where majority of our work takes place and our UI components are often composed of Objects and Components',
  },
  {
    name: 'Trumps',
    description: 'Trumps - utilities and helper classes with ability to override anything which goes before in the triangle, eg. hide helper class',
  },
];

const templates = {
  fileExtention: 'scss',
  importFile: '@import "%filePath"',
  padPattern: '00',
  layerName: '%index1Pad-%name',
  comment: '/** %comment **/',
  rootFileName: 'application.%fileExtention',
  rootComment: `Project setup based on iticss structure @see https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture/`,
};
const fs = require('fs');

/**
 * replace placeholders
 *
 * @param template
 * @param params
 * @returns {*}
 */
function templateReplace (template, params) {
  for (let name in params) {
    template = template.replace(`%${name}`, params[name]);
  }
  return template;
}

// init setup
let layerImports = [];

layers.forEach((layer, index) => {
  const index1 = String(index + 1);
  const layerName = templateReplace(templates.layerName, {
    name: layer.name.toLowerCase(),
    // convert 1 to 01 aso.
    index1Pad: templates.padPattern.substring(0, templates.padPattern.length -
      index1.length) + index1,
    index1: index1,
    index,
  });
  const content = templateReplace(templates.comment, {
    comment: layer.description,
  });
  const filePath = `${layerName}/__index.${templates.fileExtention}`;

  console.log('Create index level file,', filePath);

  // add to import list
  layerImports.push(templateReplace(templates.importFile, {
    filePath,
  }));

  new Promise(resolve => {
    if (!fs.existsSync(layerName)) {
      fs.mkdir(layerName, resolve);
    } else {
      resolve();
    }
  }).then(() => {
    if ( ! fs.existsSync(filePath)) {
      fs.writeFile(filePath, content, () => {});
    }
  });

});

// create root
const rootFileName = templateReplace(templates.rootFileName, {
  fileExtention: templates.fileExtention,
});
let contentLines = [
  templateReplace(templates.comment, { comment: templates.rootComment }),
  '',
  layerImports.join('\n'),
];
fs.writeFile(rootFileName, contentLines.join('\n'), () => {});