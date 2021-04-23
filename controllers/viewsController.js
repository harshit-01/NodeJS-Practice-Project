const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
    // 1) Get tour data from collection
    const tours = await Tour.find();
  
    // 2) Build template
    // 3) Render that template using tour data from 1)
    res.status(200).render('overview', {
      title: 'All Tours',
      tours
    });
  });
exports.getTourDetail =  catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
 const tour = await Tour.findOne({slug:req.params.slug}).populate({
     path:'reviews',
     fields: 'reviews rating user'
 });

  // 2) Build template
  // 3) Render that template using tour data from 1)
  res.status(200).render('tour', {
    title:`${tour.name}`,
    tour
  });
});

exports.getLoginForm = (req,res)=>{
        res.status(200).render('login',{
          title:'Login into your account'
        })
}

exports.getAccount = (req,res)=>{
  res.status(200).render('account',{
    title:'Login out your account'
  })
}