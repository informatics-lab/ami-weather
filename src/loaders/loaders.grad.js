/** * Imports ***/
const PAKO = require('pako');
const URL = require('url');

import LoadersBase from './loaders.base';
import ModelsSeries from '../../src/models/models.series';
import ModelsStack from '../../src/models/models.stack';
import ModelsFrame from '../../src/models/models.frame';


export default class LoadersGrad extends LoadersBase {
  load(dims=500, num_frames=20) {
    return new Promise(
        (resolve, reject) => {
          // create a series
          let series = new ModelsSeries();
          series.seriesInstanceUID = 'GRAD';
          series.numberOfFrames = num_frames;
          series.numberOfChannels = 1;
          series.modality = 'unknown';

          // Create stack
          let stack = new ModelsStack();
          stack.numberOfChannels = 1;
          stack.pixelRepresentation = 0;
          stack.pixelType = 0;
          stack.invert = () => false;
          stack.spacingBetweenSlices = null;
          stack.modality = 'unknown';
          series.stack.push(stack);

          // Create the data
          let data = new Uint8Array(dims * dims);
          let count = 0;
          for (var i = 0; i < dims; i++) {
            for (var j = 0; j < dims; j++) {
              data[count++] = Math.floor((255 * i * j)/(dims*dims));
              // data[count++] = Math.floor(255 * ((i + j)/2*dims));
            }
          }

          for (var k=0; k<num_frames; k++) {
            let frame = new ModelsFrame();
            frame.sopInstanceUID = k;
            frame.url = String(k);
            frame.index = k;
            frame.rows = dims;
            frame.columns = dims;
            frame.numberOfChannels = 1;
            frame.pixelRepresentation = 0;
            frame.pixelType = 0;
            frame.pixelData = data;
            frame.pixelSpacing = [0.1, 0.1, 1];
            frame.spacingBetweenSlices = null;
            frame.sliceThickness = null;
            frame.imageOrientation = [1, 0, 0, 0, 1, 0];
            frame.rightHanded = true;
            stack.rightHanded = frame.rightHanded;
            frame.imagePosition = [0, 0, k];

            frame.dimensionIndexValues = null;
            frame.bitsAllocated = 8;
            frame.instanceNumber = k;
            frame.windowCenter = null;
            frame.windowWidth = null;
            frame.rescaleSlope = 1;
            frame.rescaleIntercept = 0;
            frame.minMax = [0, 255];

            stack.frame.push(frame);
          }

          this.data = [series];
          resolve(series);
        });
      }
    }
