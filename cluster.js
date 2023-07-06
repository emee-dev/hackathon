const cluster = require('cluster');

if (cluster.isMaster) {
  // count the machine's cpu
  const cpuCount = require('os').cpus().length;

  // create a worker for each cpu
  for (let i = 0; i < cpuCount; i += 1) {
    cluster.fork();
  }

  // Listen for dying workers
  cluster.on('exit', function () {
    cluster.fork();
  });
} else {
  require('./server.js');
}
