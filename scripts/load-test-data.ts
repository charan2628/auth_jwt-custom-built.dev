import * as path from 'path';
import * as fs from 'fs';

global["testData"] = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "../test-data/test-data.json"), {encoding: 'utf-8'})
    );
console.log('TEST DATA LOADED');