const audioCtx = new AudioContext();
const analyzer = audioCtx.createAnalyser();
let stream;
const source = audioCtx.createMediaStreamSource(stream);
source.connect(analyzer);
analyser.connect(distortion);
distortion.connect(audioCtx.destination)