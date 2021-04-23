const express = require('express');
const viewsController = require('../controllers/viewsController.js');
const authController = require('../controllers/authController.js');
const router = express.Router();

//router.use(authController.isLoggedIn());
router.get('/', authController.isLoggedIn, viewsController.getOverview);
// router.get('/',(req,res)=>{
//     res.status(200).render('base',{
//       tour:'The Forest Hiker',
//       user : 'Bonus'
//     });
// });
router.get('/overview',authController.isLoggedIn,viewsController.getOverview);
router.get('/login',authController.isLoggedIn,viewsController.getLoginForm);
router.get('/me',viewsController.getAccount);

router.get('/tour',(req,res)=>{
res.status(200).render('tour',{
title:"The Forest Hiker Tour"
});
});

router.get('/tour/:slug',viewsController.getTourDetail);

module.exports = router;