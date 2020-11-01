#!/usr/bin/env node

// @ts-check
const path = require('path');
const fs = require('fs');

const { collectContent } = require('./collectContent');

const translationsSrc = path.resolve(__dirname, '../content');
const translationsDst = path.resolve(__dirname, '../dist/articles');

const articleTemplate = fs.readFileSync(path.resolve(__dirname, '../dist/article.html'), 'utf-8');

collectContent(translationsSrc, translationsDst, articleTemplate);
