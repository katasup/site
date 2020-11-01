// @ts-check
const fs = require('fs');
const path = require('path');

const Prism = require('prismjs');
const { JSDOM } = require('jsdom');
const MarkdownIt = require('markdown-it');

const md = new MarkdownIt({
  html: true,
  highlight: function (str, lang) {
    lang = lang || 'markup';
    return Prism.highlight(str, Prism.languages[lang], lang);
  }
});

function collectContent(source, destination, template) {
  getFilesList(source).forEach(name => {
    const content = getFileContent(source, name);
    writeFile(name, destination, applyTemplate(content, template));
  });
}

function getFilesList(source) {
  return fs.readdirSync(source);
}

function getFileContent(source, name) {
  const filePath = path.join(source, name);

  return fs.readFileSync(filePath, 'utf-8');
}

function applyTemplate(content, template) {
  const contentHTML = md.render(content);
  const templateDOM = new JSDOM(template);

  templateDOM.window.document.querySelector('article').innerHTML = contentHTML;

  const title = templateDOM.window.document.querySelector('h1').textContent;
  templateDOM.window.document.querySelector('title').textContent = title;

  return templateDOM.serialize();
}

function writeFile(name, destination, content) {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination);
  }

  const [title] = name.split('.');

  fs.writeFileSync(path.join(destination, `${title}.html`), content, 'utf-8');
}

module.exports = {
  collectContent,
};
