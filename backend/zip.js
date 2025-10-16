import archiver from 'archiver';
import fs from 'fs';
import path from 'path';

const output = fs.createWriteStream('../backend-deploy.zip');
const archive = archiver('zip', { zlib: { level: 9 } });

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);

// Add files, excluding node_modules
archive.glob('**/*', {
  cwd: '.',
  ignore: ['node_modules/**', '.git/**', '*.log', '**/.DS_Store', 'npm-debug.log*']
});

archive.finalize();