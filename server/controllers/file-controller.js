const User = require("../models/user-model");
const Subregion = require("../models/subregion-model");
const MapProject = require("../models/mapproject-model");
const ReconnectingWebSocket = require('reconnecting-websocket');
const WebSocket = require('ws');
const sharedb = require('sharedb/lib/client')
const json1 = require('ot-json1');
sharedb.types.register(json1.type);

getAllSubregions = async (req, res) => {
  try{
    const mapProject = await MapProject.findById(req.params.mapId);
    const subregions = await Subregion.find({ _id: { $in: mapProject.map}}).exec();
    return res.status(200).json({
      subregions: subregions
    })
  } catch (err) {
    return res.status(400).json({
      error: 'Error occured loading subregions'
    })
  }
}

const options = {
  WebSocket: WebSocket,
  connectionTimeout: 1000,
  maxRetries: 10,
};

const socketURL = process.env.SOCKET_URL;
let socket = new ReconnectingWebSocket(socketURL, [], options);
let connection = new sharedb.Connection(socket);

let projectDict = {};
let doc = null;
let version = 1;
sendOp = (project) => {
  const op = json1.replaceOp(["properties", "NAME"], "ALABAMA", "TEST_STATE");
  project.submitOp(op);
}

connectNewClient = async (req, res) => {
  const headers = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache, no-transform'
  };
  res.writeHead(200, headers);
  
  const test = `data: ${JSON.stringify({payload : "Test Connected!"})}\n\n`;
  res.write(test);
  
  const {userId, mapId} = req.params;
  let project = projectDict[mapId];
  if(!project) {
    const temp = await MapProject.findById(mapId);
    if(!temp) {
      res.status(400).json({
        error: "Map Project doesn't exist"
      })
    }

    project = connection.get('sub', mapId);
    project.subscribe((error) => {
      if (error) throw error;
      // If project.type is undefined, the project has not been created, so let's create it
      if (!project.type) {
            const doc = json1.type.create({'coordinates':[], 'properties': {'NAME' : "Alabama", 'STATE': '01'}, 'type' : 'Multipolgyon'})
            project.create(doc, json1.type.uri,  (error) => {
              if (error) console.error(error);
              sendOp(project);
         });
      };
    });

    project.on('op', function(op, source) {
      console.log(op, source);
      // const local = `data: ${JSON.stringify({ack : op.ops})}\n\n`;
      // const remote = `data: ${JSON.stringify(op.ops)}\n\n`;
      // const uid = source[0];
      // const docid = source[1];
      // //console.log("[Received OP] op: " + op  + " from uid: " + uid + " on docid: " + docid);
      // const clients = docDict[docid].clients;
      // clients.forEach(client => client.id === uid ? client.res.write(local) : client.res.write(remote));
    });
    // projectDict[mapId] = {"shareDB" : project, "version" : 1, "clients" : []};

    req.on('close', () => {
      res.end();
    });
  }
};


  // doc = connection.get('documents', "testdocument");
  // doc.subscribe((error) => {
  //   if (error) throw error;
  //   // If doc.type is undefined, the document has not been created, so let's create it
  //   if (!doc.type) {
  //      doc.create([], (error) => {
  //         if (error) console.error(error);
  //      });
  //   };
  // });


//   if(version === req.body.version) {
//      version++;
//      res.json({status : "ok"});
//      doc.submitOp(new Delta(req.body.op), {source: req.params.uid });
//   } else {
//      res.json({status : "retry"});
//   }
// }



// connectNewClient(req, res, next) {
//   const headers = {
//      'Content-Type': 'text/event-stream',
//      'Connection': 'keep-alive',
//      'Cache-Control': 'no-cache, no-transform'
//   };
//   res.writeHead(200, headers);
  
//   const uid = req.params.uid;
//   clients.push({uid: uid, res: res});
//   //console.log(clients)
//   if(!doc) {
//      doc = connection.get('documents', "testdocument");
     
//      doc.subscribe((error) => {
//         if (error) throw error;
//         // If doc.type is undefined, the document has not been created, so let's create it
//         if (!doc.type) {
//            doc.create([], 'rich-text', (error) => {
//               if (error) console.error(error);
//            });
//         };
//      });

//      doc.on('op', function(op, source) {
//         const local = `data: ${JSON.stringify({ack : op.ops})}\n\n`;
//         const remote = `data: ${JSON.stringify(op.ops)}\n\n`;
//         const uid = source;
//         clients.forEach(client => client.uid === uid ? client.res.write(local) : client.res.write(remote));
//      });
//   }

//   doc.fetch(function(err) {
//      if (err) console.error(err);
//      if(doc.data) {
//         //console.log(version)
//         const initial = {content : doc.data.ops, version : version};
//         const data = `data: ${JSON.stringify(initial)}\n\n`;
//         res.write(data);
//      } else {
//         const initial = {content : [], version : version};
//         const data = `data: ${JSON.stringify(initial)}\n\n`;
//         res.write(data);
//      }
//   });

//   req.on('close', () => {
//      clients = clients.filter(client => client.uid !== uid);
//   });
// }

// sendOp(req, res) {
//   if(version === req.body.version) {
//      version++;
//      res.json({status : "ok"});
//      doc.submitOp(new Delta(req.body.op), {source: req.params.uid });
//   } else {
//      res.json({status : "retry"});
//   }
// }

module.exports = {
  getAllSubregions,
  connectNewClient,
};