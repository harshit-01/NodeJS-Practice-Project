const fs= require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour= require('./../../models/tourModel.js');// . -> data/current folder, .. ->dev-data , .. -> natours
const User= require('./../../models/userModel.js');// . -> data/current folder, .. ->dev-data , .. -> natours
const Review= require('./../../models/reviewModel.js');// . -> data/current folder, .. ->dev-data , .. -> natours



dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose.connect(process.env.DATABASE_LOCAL,{
         useNewUrlParser: true,
         useCreateIndex: true,
         useFindAndModify: false
}).then(() => {console.log('DB connection Successful')});

// 2 READ THE JSON DOCUMENT
const tours = JSON.parse(fs.readFileSync("./dev-data/data/tours.json", "utf-8"));// array of objects
const users = JSON.parse(fs.readFileSync("./dev-data/data/users.json", "utf-8"));// array of objects
const reviews = JSON.parse(fs.readFileSync("./dev-data/data/reviews.json", "utf-8"));// array of objects

// 3 Importing document/ data into db


const importData = async ()=>{
    try{
         await Tour.create(tours);
         await User.create(users,{ validateBeforeSave:false });
         await Review.create(reviews); 
         console.log("Data successfully loaded");
    }
    catch(err){
        console.log(err);
    }
    process.exit();
};

// 4. Deleting previous data present int DB
const deleteData = async ()=>{
  try{
         await Tour.deleteMany();
         await User.deleteMany();
         await Review.deleteMany();


         console.log("Data successfully deleted");
    }
    catch(err){
        console.log(err);
    }
    process.exit();
};

if(process.argv[2] === '--import'){
    importData();
}
else if(process.argv[2] === '--delete'){
    deleteData();
}