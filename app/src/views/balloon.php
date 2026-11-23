<script>
// Create a new WebSocket instance
const socket = new WebSocket('wss://asr.iitm.ac.in/demo/ws/tts/hindi/male');

// Set the necessary headers
socket.onopen = function(event) {
  socket.send('Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImlpdG5ldHBoZW5peEBnbWFpbC5jb20iLCJ1c2VyIjo1MiwiZXhwIjoxNzE3MzM0NjA5fQ.g7A6Djd_s7SeNLQp6tlOv81_ZqWgcOI5Sghi7qs7FwQ');
  socket.send('Accept-Encoding: gzip, deflate, br, zstd');
  socket.send('Accept-Language: en-US,en;q=0.9,te;q=0.8');
  socket.send('Cache-Control: no-cache');
  socket.send('Pragma: no-cache');
  socket.send('User-Agent: Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36');

  console.log('WebSocket connection opened');
  
  // Send a message to the server
  const message = 'Hello, server!';
  socket.send(message);
  console.log('Sent message:', message);
  console.log(event);
};

// Handle the WebSocket message event
socket.onmessage = function(event) {
  console.log('Received message:', event.data);
  // Handle the received message as needed
};

// Handle the WebSocket close event
socket.onclose = function(event) {
  console.log('WebSocket connection closed');
  // Perform any necessary cleanup or handle the connection closure
};

// Handle the WebSocket error event
socket.onerror = function(event) {
  console.error('WebSocket error occurred:', event);
  // Handle any errors that occur during the WebSocket connection
};
</script>