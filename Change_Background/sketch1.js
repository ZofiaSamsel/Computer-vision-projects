let bodypix;
let video;
let segmentation;
let img;

const options = {
  outputStride: 32, // 8, 16, or 32, default is 16
  segmentationThreshold: 0.3, // 0 - 1, defaults to 0.5
};

function preload() {
  bodypix = ml5.bodyPix(options);
}

function setup() {
  createCanvas(700,600);
  // load up your video
  video = createCapture(VIDEO, videoReady);
  video.size(width, height);
  video.hide();
  img = loadImage('data/kwaty.jpg');
  
}

function videoReady() {
  bodypix.segment(video, gotResults);
  
}

function draw() {
  background(img)
  if (segmentation) {
    image(segmentation.backgroundMask, 0, 0, width, height);
  }
}

function gotResults(error, result) {
  if (error) {
    console.log(error);
    return;
  }
  segmentation = result;
  bodypix.segment(video, gotResults);
}



