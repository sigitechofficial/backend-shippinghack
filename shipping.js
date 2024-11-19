require('dotenv').config();
const express = require('express');
const app = express();
const db = require('./models');
const cors = require('cors');
const error = require('./middleware/error');
//const { Server } = require("socket.io");
const server = require('http').createServer(app);
var bodyParser = require('body-parser')



// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:3000",
//     methods: ["GET", "POST"],
//   },
// });

// Importing routes
const customerRouter = require('./routes/customer');
const businessRouter = require('./routes/business');
const adminRouter = require('./routes/admin');
const driverRouter = require('./routes/driver');
const merchnatRouter=require('./routes/merchant');
const warehouseRouter = require('./routes/warehouse');
const webhooks = require('./routes/webhooks');


app.use('/webhooks', bodyParser.raw({ type: 'application/json' }), webhooks);

app.use(cors());
app.use(express.json());

// Middleware which tells the server the format to send data

app.use(bodyParser.urlencoded({ extended: true }));

// routes
app.use('/customer', customerRouter);
app.use('/admin', adminRouter);
app.use('/driver', driverRouter);
app.use('/warehouse', warehouseRouter);
app.use('/business',businessRouter)
app.use('/merchant',merchnatRouter)




// To make the folder Public
app.use('/Public', express.static('./Public'));

app.use(error);
// io.on("connection", async (socket) => {
//   console.log(`User Connected: ${socket.id}`);
//   socket.on("ping", (data, callBack)=>{
//     socket.emit('pong');
//     socket.emit('message', "This is a message through socket")
//   })
  
//   // * If error in connection
//   socket.on("connect_error", (err) => {
//     console.log(`connect_error due to ${err.message}`);
//   });

//   // * Showing the disconnet message
//   socket.on("disconnect", (err) => {
//     console.log("User Disconnected", socket.id, err);
//   });
// });

// Initializing Server along with creating all the tables that exist in the models folder
var server_port = process.env.PORT || 3000;
let syncDb = 0;
if(syncDb){
  db.sequelize.sync({alter:true})
  .then(() => {
    //app.listen(process.env.PORT, ()=> {console.log(`Starting the server at port ${process.env.PORT} ...`)});
    server.listen(server_port, function (err) {
      if (err) throw err
      console.log('Listening on port %d', server_port);
    });
  });
}
else{
  server.listen(server_port, function (err) {
    if (err) throw err
    console.log('Listening on port %d', server_port);
  });
}


