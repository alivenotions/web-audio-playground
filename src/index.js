import './styles.css'
let audioContext = null
let unlocked = false
let isPlaying = false
// let startTime
let current16thNote
let bpm = 120.0
const lookAhead = 25.0
const scheduleAheadTime = 0.1
let nextNoteTime = 0.0
let noteResolution = 0 // 0 == 16th, 1 == 8th, 2 == quarter note
let noteLength = 0.05
let notesInQueue = []
let timerWorker
function init() {
  console.log('Hey?')
  audioContext = new AudioContext()
  timerWorker = new Worker('/worker.js')
  timerWorker.onmessage = function(e) {
    if (e.data === 'tick') {
      scheduler()
    } else {
      console.log('message: ', e.data)
    }
    timerWorker.postMessage({ interval: lookAhead })
  }
}

const playButton = document.getElementById('play')
playButton.addEventListener('click', () => {
  playButton.innerText = play()
})
init()

function nextNote() {
  const secondsPerBeat = 60.0 / bpm

  nextNoteTime += 0.25 * secondsPerBeat

  current16thNote++
  if (current16thNote === 16) {
    current16thNote = 0
  }
}

function scheduleNote(beatNumber, time) {
  notesInQueue.push({ note: beatNumber, time })

  if (noteResolution === 1 && beatNumber % 2) {
    return
  }
  if (noteResolution === 2 && beatNumber % 4) {
    return
  }

  const oscillator = audioContext.createOscillator()
  oscillator.connect(audioContext.destination)
  if (beatNumber % 16 === 0) {
    oscillator.frequency.value = 880.0
  } else if (beatNumber % 8 === 0) {
    oscillator.frequency.value = 440.0
  } else {
    oscillator.frequency.value = 220.0
  }

  oscillator.start(time)
  oscillator.stop(time + noteLength)
}

function scheduler() {
  while (nextNoteTime < audioContext.currentTime + scheduleAheadTime) {
    scheduleNote(current16thNote, nextNoteTime)
    nextNote()
  }
}

function play() {
  if (!unlocked) {
    const buffer = audioContext.createBuffer(1, 1, 22050)
    const node = audioContext.createBufferSource()
    node.buffer = buffer
    node.start(0)
    unlocked = true
  }

  isPlaying = !isPlaying

  if (isPlaying) {
    current16thNote = 0
    nextNoteTime = audioContext.currentTime
    timerWorker.postMessage('start')
    return 'stop'
  } else {
    timerWorker.postMessage('stop')
    return 'play'
  }
}
