let hasToneInit = false;

// Set up Tone
let osc = new Tone.AMOscillator(600, 'sine', 'sine').start()
let gain = new Tone.Gain().toDestination();
let pan = new Tone.Panner().connect(gain);
let ampEnv = new Tone.AmplitudeEnvelope({
  attack: 0.1,
  decay: 0.2,
  sustain: 1.0,
  release: 0.8
}).connect(pan);
osc.connect(ampEnv);

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
}

function keyPressed(){
  if (keyCode === 32 && hasToneInit === false){
    console.log('Starting tone...');
    Tone.start();
    hasToneInit = true;
  }
}

function mousePressed() {
  console.log('pressed');

  osc.frequency.value = 600;
  ampEnv.triggerAttackRelease('4n');
  osc.frequency.setValueAtTime(800, '+1');
  ampEnv.triggerAttackRelease('4n', '+1');
}