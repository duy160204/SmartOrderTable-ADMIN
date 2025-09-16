let socket = null
let listeners = new Set()

export function connectSocket(url = 'ws://localhost:8080/ws') {
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) return socket
  socket = new WebSocket(url)
  socket.onopen = () => console.log('[Admin] WS connected')
  socket.onclose = () => setTimeout(() => connectSocket(url), 2000)
  socket.onmessage = (e) => {
    let data = null
    try { data = JSON.parse(e.data) } catch { data = e.data }
    listeners.forEach(cb => cb(data))
  }
  return socket
}

export function subscribe(cb) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}


