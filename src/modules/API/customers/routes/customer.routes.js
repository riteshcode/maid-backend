const express = require('express');

// controller
var AuthController = require('../controller/AuthController');
const HomeController = require('../controller/HomeController');
const checkJobsController = require ('../controller/jobsController')
const profileController = require ('../controller/profileController')


// auth check
// ---------------  Middleware -----------------------
const { AdminAuthMiddleware } = require('../../../../middlewares/admin-auth.middleware');
const { semiAuthMiddleware } = require('../../../../middlewares/semiauth.middleware');
const  UserAuthMiddleware  = require('../middleware/middleware');

// / validator
const customerValidator = require('../validation/auth.validator');
const jobValidator = require("../validation/job.validator");
const otpValidator = require("../validation/otp.validator");

//--------------------------Routes---------------------------------------------
const router = express.Router();

/* Auth : - Login + Forgot Password + Reset Password customer Routes */
router.post('/send-mobile-otp',  AuthController.sendMobileOtp);
router.post('/verify-otp',otpValidator.verifyOtp, AuthController.verifyOtp);

router.post('/register',customerValidator.validateRegistration, AuthController.register);

router.post('/login', customerValidator.validateLogin,AuthController.login);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/change-password',UserAuthMiddleware, AuthController.changePassword);
router.post('/reset-password/:id', AuthController.resetPassword);
router.post('/verify-email', AuthController.verifyEmailOtp);

//user Profile crud 
router.get('/profile', UserAuthMiddleware,profileController.getUserProfile);


// public + protected route
router.get("/home", semiAuthMiddleware, HomeController.getHomeData);
router.get("/worker-bees-filter", semiAuthMiddleware, HomeController.getWorkerBeesFilterList);
router.post("/worker-bees", semiAuthMiddleware, HomeController.getWorkerBeesList);
router.post("/worker-bees/:beesId", semiAuthMiddleware, HomeController.getWorkerBeesDetails);

router.get("/common-list", semiAuthMiddleware, HomeController.getCommonListApi);     // Load all commong and used function to all once.



router.post('/job-create',jobValidator.validateJob,checkJobsController.createJob);// jobs-create           
router.get('/getall-jobs', checkJobsController.getAllJobs);// Get all jobs			        
router.get('/job-getId/:id', checkJobsController.getJobById);// find single job by ID			        
router.put('/job-update/:id',jobValidator.validateJob, checkJobsController.updateJob);// Update job by ID			
router.delete('/job-soft-delete/:id', checkJobsController.deleteJob);// soft delete availability by ID		
router.patch('/job-restore/:id',checkJobsController.restoreJob)		
router.delete('/job-delete/:id',checkJobsController.permanentDeleteJob);// soft delete availability by ID	


//-----------------------------verify email and mobile -------------------------------------------
router.post('/verify-details',customerValidator.verifyDetail, AuthController.verifyDetails);




// protected route



module.exports = router;