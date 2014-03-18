var connect = require('connect'),
    http = require('http'),
    path = require('path'),
    app = connect(),
    root = path.dirname(path.dirname(__filename));
    connections = [];

function register(req, res) {
  req.socket.setTimeout(Infinity);

  connections.push(res);

  process.stdout.write(connections.length + " connections\n");
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  res.write('\n');

  req.on('close', function() {
    var idx = connections.indexOf(res);
    connections.splice(idx, 1);
    process.stdout.write("Closing connection\n");
  });
}

function notify(req, res) {
  var form;
  if (req.method.toLowerCase() === 'post') {
    form = new require('formidable').IncomingForm();
    form.parse(req, function(err, fields) {
      var data = { message: fields.message, timestamp: Math.floor(Date.now() / 1000) };
      connections.forEach(function(connection) {
        connection.write('event: ' + fields.channel + '\n');
        connection.write('data: ' + JSON.stringify(data) + '\n\n');
      });
    });
    res.writeHead(201, {});
    res.end('');
  } else {
    res.writeHead(404, {});
    res.end('');
  }
}

app.use(connect.static(path.join(root, 'public')));
app.use(function(req, res) {
  switch (true) {
    case /\/register/i.test(req.url):
      register(req, res);
      break;
    case /\/notify/i.test(req.url):
      notify(req, res);
      break;
    default:
      res.writeHead(404, {});
      res.end('');
  }
});

http.createServer(app).listen(8000);

