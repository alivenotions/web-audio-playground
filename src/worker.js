let timerId = null
let interval = 100

onmessage = function(e) {
  if (e.data === 'start') {
    console.log('starting')
    timerId = setInterval(function() {
      postMessage('tick')
    }, interval)
  } else if (e.data.interval) {
    this.console.log('setting interval')
    interval = e.data.interval
    this.console.log('interval: ', interval)
    if (timerId) {
      this.clearInterval(timerId)
      timerId = this.setInterval(function() {
        postMessage('tick')
      }, interval)
    }
  } else if (e.data === 'stop') {
    this.console.log('stopping')
    this.clearInterval(timerId)
    timerId = null
  }
}

postMessage('yo, what is up')
