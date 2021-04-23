const dotenv = require("dotenv");
const mongoose = require('mongoose');

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});


dotenv.config({ path: './config.env' });
const app = require('./app.js');
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose.connect(process.env.DATABASE_LOCAL,{
         useNewUrlParser: true,
         useCreateIndex: true,
         useFindAndModify: false
}).then(() => {console.log('DB connection Successful')});


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on("unhandledRejection",err=>{
       console.log(err.name,err.message);
       console.log("Boooooooom");
       server.close(() => {
        process.exit(1);
      })
});
