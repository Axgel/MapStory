// THESE ARE NODE APIs WE WISH TO USE
const app = require('./app')
const http = require("http");
const https = require("https");
const fs = require("fs");


// CREATE OUR SERVER
const PORT = 4000;
switch (process.env.ENVIRONMENT) {
  case "PRODUCTION":
    const httpServer = http.createServer(app);
    const httpsServer = https.createServer(
      {
        key: fs.readFileSync("/home/ubuntu/Keys/privkey.pem"),
        cert: fs.readFileSync("/home/ubuntu/Keys/fullchain.pem"),
      },
      app
    );

    httpServer.listen(80, () => console.log("HTTP Server running on port 80!"));
    httpsServer.listen(443, () =>
      console.log("HTTPS Server running on port 443!")
    );
    break;
  default:
    // server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    const httpSocketServer = http.createServer(app);
    httpSocketServer.listen(PORT, () => console.log(`Server listening on port ${PORT}`))
    break;
  }
