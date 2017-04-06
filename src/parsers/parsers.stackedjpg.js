// use nifti-js and just parse header.???

// Slicer way to handle images
// should follow it...
 // 897   if ( (this->IndexSeriesInstanceUIDs[k] != idxSeriesInstanceUID && this->IndexSeriesInstanceUIDs[k] >= 0 && idxSeriesInstanceUID >= 0) ||
 // 898        (this->IndexContentTime[k] != idxContentTime && this->IndexContentTime[k] >= 0 && idxContentTime >= 0) ||
 // 899        (this->IndexTriggerTime[k] != idxTriggerTime && this->IndexTriggerTime[k] >= 0 && idxTriggerTime >= 0) ||
 // 900        (this->IndexEchoNumbers[k] != idxEchoNumbers && this->IndexEchoNumbers[k] >= 0 && idxEchoNumbers >= 0) ||
 // 901        (this->IndexDiffusionGradientOrientation[k] != idxDiffusionGradientOrientation  && this->IndexDiffusionGradientOrientation[k] >= 0 && idxDiffusionGradientOrientation >= 0) ||
 // 902        (this->IndexSliceLocation[k] != idxSliceLocation && this->IndexSliceLocation[k] >= 0 && idxSliceLocation >= 0) ||
 // 903        (this->IndexImageOrientationPatient[k] != idxImageOrientationPatient && this->IndexImageOrientationPatient[k] >= 0 && idxImageOrientationPatient >= 0) )
 // 904     {
 // 905       continue;
 // 906     }

// http://brainder.org/2012/09/23/the-nifti-file-format/

/** * Imports ***/
import ParsersVolume from './parsers.volume';

let jpgdecoder = require('./decoder');

/**
 * @module parsers/stackedjpg
 */
export default class ParsersStackedJPG extends ParsersVolume {
  constructor(data, id) {
    super();

    /**
      * @member
      * @type {arraybuffer}
    */
    this._id = id;
    let size = data.filename.split('.')[1].split('x');
    this._index = Number(data.filename.split('.')[2]);
    size = [Number(size[0]), Number(size[1]), Number(size[2])];
    this._jpg = jpgdecoder(data.buffer, size[0], size[1], size[2]);
    this._data = this._jpg.data;
    this._url = data.url;
    this._dataSet = {sizes: size, type: 'int'};
  }

  seriesInstanceUID() {
    // use filename + timestamp..?
    let filenameParts = this._url.split('.');
    let id = filenameParts[0] + filenameParts[1];
    return id;
  }

  numberOfFrames() {
    return this._dataSet.sizes[2];
  }

  numberOfChannels() {
    let numberOfChannels = 1;
    return numberOfChannels;
  }

  sopInstanceUID(frameIndex = 0) {
    return frameIndex;
  }

  rows(frameIndex = 0) {
    return this._dataSet.sizes[1];
  }

  columns(frameIndex = 0) {
    return this._dataSet.sizes[0];
  }

  pixelType(frameIndex = 0) {
    // 0 integer, 1 float
    return 0;
  }

  bitsAllocated(frameIndex = 0) {
    let bitsAllocated = 1;

    if(this._dataSet.type === 'int8' ||
       this._dataSet.type === 'uint8' ||
       this._dataSet.type === 'char') {
      bitsAllocated = 8;
    } else if(this._dataSet.type === 'int16' ||
      this._dataSet.type === 'uint16' ||
      this._dataSet.type === 'short') {
      bitsAllocated = 16;
    } else if(this._dataSet.type === 'int32' ||
      this._dataSet.type === 'uint32' ||
      this._dataSet.type === 'float') {
      bitsAllocated = 32;
    }

    return 8;
  }

  pixelSpacing(frameIndex = 0) {
    return [0.1, 0.1, 2];
  }

  sliceThickness() {
    // should be a string...
    return null;// this._dataSet.pixDims[3].toString();
  }

  imageOrientation(frameIndex = 0) {
    return null;
  }

  imagePosition(frameIndex = 0) {
    return [0, 0, 0.03 * (this._index * 3 + frameIndex)];
  }

  dimensionIndexValues(frameIndex = 0) {
    return null;
  }

  instanceNumber(frameIndex = 0) {
    return frameIndex;
  }

  windowCenter(frameIndex = 0) {
    // calc min and calc max
    return null;
  }

  windowWidth(frameIndex = 0) {
    // calc min and calc max
    return null;
  }

  rescaleSlope(frameIndex = 0) {
    return 1;// this._dataSet.scl_slope;
  }

  rescaleIntercept(frameIndex = 0) {
    return 0;// this._dataSet.scl_intercept;
  }

  minMaxPixelData(pixelData = []) {
    let minMax = [65535, -32768];
    let numPixels = pixelData.length;
    for (let index = 0; index < numPixels; index++) {
      let spv = pixelData[index];
      minMax[0] = Math.min(minMax[0], spv);
      minMax[1] = Math.max(minMax[1], spv);
    }

    return minMax;
  }

  extractPixelData(frameIndex = 0) {
    let offset = this.numberOfChannels() * frameIndex * this.columns() * this.rows();
    // return new Uint8Array(buffer, frameOffset, numPixels);
    let pxData = this._data.subarray(offset, offset + this.columns() * this.rows());
    // pxData = new Uint8Array(this._data.buffer, offset, this.columns() * this.rows());
    return pxData;
  }

}
