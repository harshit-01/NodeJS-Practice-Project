const { query } = require('express');
const fs = require('fs');
const Tour= require('./../models/tourModel.js');
const APIFeatures = require('../utils/apiFeatures.js');
const catchAsync = require('./../utils/catchAsync.js');
const AppError = require('./../utils/appError.js');
const factory = require('./handlerFactory.js')
/*
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)// .. go up
);
*/
// MIDDLEWARE
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = factory.getAll(Tour);
exports.checkID = (req, res, next, val) => {
  console.log(`Tour id is: ${val}`);

  /*if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID'
    });*/
 // }
  next();
};



exports.getTour = factory.getOne(Tour,{path:'reviews'});

exports.createTour = factory.createOne(Tour);

exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

// exports.deleteTour = catchAsync(async(req, res, next) => {

//    const tour= await Tour.findByIdAndDelete(req.params.id) // wait for deletion to happen
//    if(!tour){
//     return next(new AppError(`No tour found with the given id ${req.params.id}`,404))
//   }
//    res.status(204).json({
//     status: 'success',
//      data: null
//   });  
//    }
// );

exports.getTourStats = catchAsync (async (req, res, next) => {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5} }
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      },
      {
        $sort: { avgPrice: 1 }
      }
      // {
      //   $match: { _id: { $ne: 'EASY' } }
      // }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  } 
);

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1; // 2021

    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates'
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
         tours: { $push: '$name' }
        }
      },
      {
        $addFields: { month: '$_id' }
      },
      {
        $project: {
          _id: 0
        }
      },
      {
        $sort: { numTourStarts: -1 }
      },
      {
        $limit: 12
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        plan
      }
    });
  } 
);

// /tours-within/:distance/center/:latlng/unit/:unit
// /tours-within/233/center/34.111745,-118.113491/unit/mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitutr and longitude in the format lat,lng.',
        400
      )
    );
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours
    }
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitutr and longitude in the format lat,lng.',
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances
    }
  });
});


//  exports.getTourStats = async (req, res) => {
//         try{
//              const stats = await Tour.aggregate([
//               {
//                  $match: { ratingsAverage: { $gte: 4.5 } }
//               },
//                {
//                  $group: {
//                   _id: null,
//                    avgRating: { $avg: '$ratingsAverage' },
//                    avgPrice: { $avg: '$price' },
//                    minPrice: { $min: '$price' },
//                    maxPrice: { $max: '$price' }
//                  }
//                }, 
//              ]);
//              res.status(200).json({
//                status: 'success',
//                data: {
//                  stats
//                }
//              });
//         }
//         catch(err){
//          res.status(404).json({
//            status:"Fail",
//            message:err
//        });
//         }
//  }



// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing name or price'
//     });
//   }
//   next();
// };
// exports.getAllTours = async (req, res) => {
// //   console.log(req.requestTime);
//      // query selector
// //   console.log(req.query);
//       try{
//         // 1st BUILD QUERY and API filtering
//         const queryObj = {...req.query};
//         const exculdedFields = ['sort','page','limit','fields'];
//         exculdedFields.forEach(el=> delete queryObj[el]);
//         //console.log(req.query,queryObj);
//         //const query =  Tour.find(queryObj);
//           //const tour = await Tour.find().where('duration').equals(5).where('difficulty').equals('easy');
//        //const tour = await Tour.find();
//        // 2nd ADVANCED QUERY and API Filtering
//          let queryString = JSON.stringify(queryObj);
//          queryString = queryString.replace(/\b(gte|gt|lt|lte)\b/g,match =>`$${match}`);
//          let query =  Tour.find(JSON.parse(queryString));
//          // SORTING
//          if(req.query.sort){
//            query = query.sort(req.query.sort);
//          }
//          else{
//           query = query.sort('-createdAt');
//          }
//        // Execute query
//        const tour = await query;
//        res.status(200).json({
//        status: 'success',
//       // requestedAt: req.requestTime,
//        results: tour.length,
//        data: {
//        tour
//      }
//      });
//       }
//       catch(err){
//         res.status(404).json({
//         status: "fail",
//         message: err
//       });
// }
// };

//exports.createTour =async (req, res) => {
  //   // console.log(req.body);
  //    // const newTour = new Tour();
  //     // newTour.save().then().catch();
  //     try{
  //      const newTour = await Tour.create(req.body);
  //       res.status(201).json({
  //         status: 'success',
  //         data: {
  //           tour: newTour
  //         }
  //       });
  //      }
  //      catch(err){
  //        res.status(404).json({
  //            status:"Fail",
  //            message:"Invalid data sent"
  //        });
  //      }
   
  
  //    /*
  //   const newId = tours[tours.length - 1].id + 1;
  //   const newTour = Object.assign({ id: newId }, req.body);
  
  //   tours.push(newTour);
  
  //   fs.writeFile(
  //     `${__dirname}/dev-data/data/tours-simple.json`,
  //     JSON.stringify(tours),
  //     err => {
  //       res.status(201).json({
  //         status: 'success',
  //         data: {
  //           tour: newTour
  //         }
  //       });
  //     }
  //   );*/
  // };
