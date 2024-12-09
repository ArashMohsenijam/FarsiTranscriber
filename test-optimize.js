import { optimizeAudioForWhisper } from './server/utils/audioProcessor.js';
import path from 'path';

const inputFile = "E:\\Downloads\\جلسه1- ترم اول.mp3";

console.log('Starting audio optimization...');
console.time('Optimization completed in');

optimizeAudioForWhisper(inputFile)
  .then(outputPath => {
    console.timeEnd('Optimization completed in');
    console.log('Optimized file saved to:', outputPath);
  })
  .catch(error => {
    console.error('Error during optimization:', error);
  });
