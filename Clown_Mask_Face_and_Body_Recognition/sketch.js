// *BodyPix*
// Funkcja, która umożliwia segmentowanie osób i części ciała. Wykorzystuje metodę grupowania pikseli i umożliwia wyodrębnienie osoby z tła lub podzielenie jej ciała na dwadzieścia
//  cztery części (lewa ręka, przednia prawa noga, przód głowy, tył tułowia). Model wyodrębnia piksele reprezentujące osobę i piksele tła.

// *Zastosowania dla Body Pix:*
// - zamiast green screenów można będzie wykorzystywać te funkcję, żeby zmienić tło za osobą
// - umożliwia usuwanie niechcianych osób w tle w zdjęciach
// - efekt artystyczny
// - pomoc w kamerach bezpieczeństwa – będzie w stanie znaleźć osobę i poinformować o włamaniu
// - w zakupach internetowych (nakładanie ubrań na osobę na żywo)

// *PoseNet*
// Model, który pozwala szacować pozycję człowieka w czasie rzeczywistym. szacuje gdzie znajduja się kluczowe elementy ciała człowieka.  Wykorzystuje uczenie maszynowe. 
// Pozwala znaleźć jedna pozycje ciała z pośród wielu.

// *Zastosowanie PoseNet:*
// - just dance
// - poprawne wykonywanie ćwiczeń
// - w wirtualnej rzeczywistości umożliwia odtworzenie sylwetki człowieka i zaprogramowanie jej rzeczywistych ruchów wewnątrz
// - przymierzanie ubrań online w domu
// - filtry  

let canvas;
let video;
let poseNet;
let bodypix;
let img;
let pose;
let skeleton;
let noseX = 0;
let noseY = 0;
let eyelX = 0;
let eyelY = 0;
let eyelX1 = 0;
let eyelY1 = 0;
let img1;
let segmentation;
let img2;
let img4;
let RGBPalet;

// tworzenie argumentow do oszacowania segmentacji osoby
const options = {
  outputStride: 8, // 8, 16, or 32, default is 16
  segmentationThreshold: 0.3, // 0 - 1, defaults to 0.5
};

function setup() {
  // tworzenie kanwy
  canvas = createCanvas(640, 480);
  canvas.parent('sketch_');
  canvas.position(0, 50)
  // aktywowanie kamery
  video = createCapture(VIDEO, videoReady);
  video.hide();
  // aktywowanie modelu PoseNet
  poseNet = ml5.poseNet(video);
  // aktywuje model BodyPix
  bodypix = ml5.bodyPix(options, videoReady);
  // funkcja, ktora określa wspolrzedne elementow ciala
  poseNet.on('pose', gotPoses);
  // obraz rekawicy
  img = loadImage('data/rekawica.png');
  img1 = loadImage('data/usta.png');
  img2 = loadImage('data/kwaty.jpg');
    
  // tworzy palete barw do BodyPix 
  createRGBPalette();
}

// funkcja zwracajaca segmentacje ciala
function videoReady() {
  bodypix.segmentWithParts(video, options, gotResults);
  bodypix.segment(video, options, gotResults);
  }

// zwraca polozenie elementow ciala 
function gotPoses(poses) {
  // console.log(poses);
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
    // okreslenie wspolrzednych nosa i prawego oka
    let nX = poses[0].pose.keypoints[0].position.x;
    let nY = poses[0].pose.keypoints[0].position.y;
    let eX = poses[0].pose.keypoints[1].position.x;
    let eY = poses[0].pose.keypoints[1].position.y;
    // okreslanie wektora laczacego nos i oko po wspolrzednych X i Y zaczynajac od srodka punktu
    noseX = lerp(noseX, nX, 0.5);
    noseY = lerp(noseY, nY, 0.5);
    eyelX = lerp(eyelX, eX, 0.5);
    eyelY = lerp(eyelY, eY, 0.5);
  }
}

function draw() {
  // rysowanie kamery
  image(video, 0, 0)
  
  if (pose) {
    //  odleglosc miedzy nosem a okiem
    let d = dist(noseX, noseY, eyelX, eyelY);

    // gdy myszla kliknieta na twarzy klaun
    if (mouseIsPressed) {
      fill(0,0,255);
      textSize(40)
      text("MASKA KLAUNA", width/4, 50);
      //kolor i grubosc linii 
      stroke(200);
      // obwodka dookola napisow
      strokeWeight(2);
      fill(255,0,0);
      // rysowanie wspolrzednych nosa
      textSize(15);
      text(noseX, 50, height-50);
      text(noseY, 50, height-30);
      // rysowanie maski na srodku nosa, ktora zmienia dostosowuje sie do wielkosci twarzy
      image(img1, noseX- 2*d, noseY-5*d, 5*d, 9*d);
    }

    else if (keyIsDown(RIGHT_ARROW)) {
      // rysowanie rękawic na nadgarstkach
      fill(0,0,255);
      textSize(40);
      text("SZKIELET Z REKAWICAMI", width/10, 50);
      image(img, pose.leftWrist.x-d, pose.leftWrist.y-d, 3*d, 4*d);
      image(img, pose.rightWrist.x-d, pose.rightWrist.y-d, 3*d, 4*d);

      //  rysowanie  punktow na ciele
      for (let i = 0; i < pose.keypoints.length; i++) {
        let x = pose.keypoints[i].position.x;
        let y = pose.keypoints[i].position.y;
        // kolorowanie punktow na rozne kolory
        fill(random(255), random(255), random(255));
        // tworzenie punktow 
        ellipse(x,y,16,16);
      }
      
      // rysowanie szkieletu przez pętle przechodzaca przez kazda wspolrzedna ciala
      for (let j = 0; j < skeleton.length; j++) {
        let partA = skeleton[j][0];
        let partB = skeleton[j][1];
        //kolor i grubosc linii 
        stroke(200);
        // obwodka dookola napisow
        strokeWeight(2);
        // rysowanie linii
        line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
      }}
  
    else if (keyIsDown(LEFT_ARROW)) {
           // oddzielenie tla od postaci
          //  bodypix.segment(video, options, gotResults);
          //  bodypix.segmentWithParts(video, options, gotResults);
      if (segmentation) {
        // tworzenie tla z obrazu
        background(img2);
        // opis modelu
        fill(0,0,255);
        textSize(40)
        text("KWIATOWE TŁO", width/4, 50);
        // //kolor i grubosc linii 
        stroke(200);
        // obwodka dookola napisow
        strokeWeight(2);
        image(segmentation.backgroundMask, 0, 0, 640, 480);
        // bodypix.segment(video, options, gotResults);
        // bodypix.segmentWithParts(video, options, gotResults);
        // opis modelu
        fill(0,0,255);
        textSize(40)
        text("KWIATOWE TŁO", width/4, 50);
        }
     }
     else if (keyIsDown(DOWN_ARROW)) {
      // background(0, 0, 0);
      
      // malowanie segmentow ciala 
      if (segmentation) {
        image(segmentation.partMask, 0, 0, 640, 480);
        // bodypix.segmentWithParts(video, gotResults, options);
        }
        // opis modelu
        fill(0,0,255);
        textSize(40);
        text("SEGMENTY", width/4, 50);
        //kolor i grubosc linii 
        stroke(200);
        // obwodka dookola napisow
        strokeWeight(2);
      
    }
    } 
}

// funkcja sprawdzajaca blad lub pozwala na klasyfikacjie 
function gotResults(error, result) {
  if (error) {
    console.log(error);
    return;
  }
  segmentation = result;
  
  // bodypix.segment(video, gotResults, options);
  // bodypix.segmentWithParts(video, gotResults, options);

  
}
// funkcja tworzaca kolory do 
function createRGBPalette() {
  colorMode(RGB);
  options.palette = bodypix.config.palette;
  Object.keys(options.palette).forEach(part => {
    const r = floor(random(255));
    const g = floor(random(255));
    const b = floor(random(255));
    const c = color(r, g, b);
    options.palette[part].color = c;
  });
}