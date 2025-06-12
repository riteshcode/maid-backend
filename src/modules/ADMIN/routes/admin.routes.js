const express = require('express');
const router = express.Router();

// controller
const AdminController = require('../controllers/admin.controller');
const UserController = require('../controllers/user.controller');
const CleaningServiceController = require('../controllers/cleaning-service.controller');
const CleanerController = require('../controllers/cleaner.controller');
const CleanerProfile = require('../controllers/cleaner-profile.controller');
const CleanerDashboard = require('../controllers/cleaner-dashboard.controller');
const BannerController = require('../controllers/banner.controller')
const SubscriptionPlanController = require('../controllers/subscription.controller');
const CleaningCategoryController = require('../controllers/cleaning-category.controller');
const dashboardController = require('../controllers/user-dashboard.controller');


//----------------------Cleaner verification By Admin-----------------------------------//
const AdminCleanerVerification = require('../../ADMIN/controllers/cleaner.controller')

// -------------- Validater -------------------- 
const { validateRegister, validateLogin } = require('../validators/admin.validator');
const { validateUserRegister, validateUserUpdate } = require('../validators/user.validator');
const { validateCleaningService } = require("../validators/cleaning-service.validator");
const { validateCleaner, validateCleanerUpdate, validateCleanerLogin } = require("../validators/cleaner.validator");
const { checkFileExist } = require('../validators/fileUpload.validator');
const { validateSubscriptionCreate, validateSubscriptionUpdate } = require('../validators/subcription-plan.validator');
const { validateCleaningCategory } = require('../validators/cleaning-category.validator');


// ---------------  Middleware -----------------------
const { AdminAuthMiddleware } = require('../../../middlewares/admin-auth.middleware');
const CleanerMiddleware = require('../../ADMIN/middleware/cleaner.middleware');
const { upload_image } = require('../controllers/fileUpload.controller');

// ----------------- All public routes ----------------- 
router.post('/upload_image', checkFileExist, upload_image);

//Routes of Admin
router.post('/register', validateRegister, AdminController.register);
router.post('/login', validateLogin, AdminController.login);
router.post('/cleaners-verification/:id',AdminAuthMiddleware,AdminCleanerVerification.cleanerVerification  );


// User CRUD Routes
router.get("/users", AdminAuthMiddleware, UserController.getRecords);
router.post("/users/store", AdminAuthMiddleware, validateUserRegister, UserController.createRecord);
router.get("/users/:id", AdminAuthMiddleware, UserController.getRecordById);
router.put("/users/:id", AdminAuthMiddleware, validateUserUpdate, UserController.updateRecord); // making status change in this api too.
router.delete("/users/:id", AdminAuthMiddleware, UserController.softDeleteRecord); // Soft delete
router.patch("/users/:id/restore", AdminAuthMiddleware, UserController.restoreRecord); // Restore

// Cleaning-service CRUD Routes
router.get("/cleaning-service", AdminAuthMiddleware, CleaningServiceController.getRecords);
router.post("/cleaning-service/store", AdminAuthMiddleware, validateCleaningService, CleaningServiceController.createRecord);
router.get("/cleaning-service/:id", AdminAuthMiddleware, CleaningServiceController.getRecordById);
router.put("/cleaning-service/:id", AdminAuthMiddleware, CleaningServiceController.updateRecord); // making status change in this api too.
router.delete("/cleaning-service/:id", AdminAuthMiddleware, CleaningServiceController.softDeleteRecord); // Soft delete
router.patch("/cleaning-service/:id/restore", AdminAuthMiddleware, CleaningServiceController.restoreRecord); // Restore

// Cleaner CRUD Routes
router.get("/cleaners", CleanerMiddleware, CleanerController.getRecords);
router.get("/cleaners/create-cleaners-filter", CleanerController.createCleanersFilter);
router.post("/cleaners/signUp", validateCleaner, CleanerController.register);
router.post("/cleaners-login", validateCleanerLogin, CleanerController.login);
router.get("/cleaners/:id", CleanerController.getRecordById);
router.put("/cleaners/:id", validateCleanerUpdate, CleanerController.updateRecord); // making status change in this api too.
router.delete("/cleaners/:id", CleanerController.softDeleteRecord); // Soft delete
router.patch("/cleaners/:id/restore", CleanerController.restoreRecord); // Restore the soft deleted
router.post("/cleaners-forgot-password", CleanerController.forgotPasswordCleaner); // forgot for cleaner
router.post("/cleaners-verify-email-otp", CleanerController.verifyEmailOtpCleaner); // verify the cleaner
router.post("/cleaners-reset-password/:id", CleanerController.resetPasswordCleaner); // reset password for cleaner
router.get("/cleaners-profile",CleanerMiddleware,  CleanerProfile.getCleanerProfile); // view  cleaner profile
router.post("/cleaners-change-password",CleanerMiddleware,  CleanerController.changePassword); // change password for cleaner
router.post("/cleaners-create-Cleaner-Dashboard",CleanerMiddleware,  CleanerDashboard.createCleanerDashboard); // change password for cleaner
router.get("/cleaners-get-cleaner-dashboard/:id",CleanerMiddleware,  CleanerDashboard.getCleanerDashboard); // cleaner dashboard

//banners Crud Routes
router.get("/banners", AdminAuthMiddleware, BannerController.getRecords);
router.post('/banners/create', BannerController.createRecord);
router.get("/banners/:id", AdminAuthMiddleware, BannerController.getRecordById);
router.put('/banners/:id', AdminAuthMiddleware, BannerController.updateRecord);
router.delete('/banners/:id', AdminAuthMiddleware, BannerController.softDeleteRecord);
router.patch('/banners/:id', AdminAuthMiddleware, BannerController.restoreRecord);


// subcription CRUD
router.get("/subcription-plan", AdminAuthMiddleware, SubscriptionPlanController.getSubscriptions);
router.post("/subcription-plan/store", AdminAuthMiddleware, validateSubscriptionCreate, SubscriptionPlanController.createSubscriptions);
router.get("/subcription-plan/:id", AdminAuthMiddleware, SubscriptionPlanController.getSubscriptionsById);
router.put("/subcription-plan/:id", AdminAuthMiddleware, validateSubscriptionUpdate, SubscriptionPlanController.updateSubscriptions); // making status change in this api too.
router.delete("/subcription-plan/:id", AdminAuthMiddleware, SubscriptionPlanController.softDeleteSubscriptions); // Soft delete
router.patch("/subcription-plan/:id/restore", AdminAuthMiddleware, SubscriptionPlanController.restoreSubscriptions); // Restore

// Cleaning-service CRUD Routes
router.get("/cleaning-category", AdminAuthMiddleware, CleaningCategoryController.getRecords);
router.post("/cleaning-category/store", AdminAuthMiddleware, validateCleaningCategory, CleaningCategoryController.createRecord);
router.get("/cleaning-category/:id", AdminAuthMiddleware, CleaningCategoryController.getRecordById);
router.put("/cleaning-category/:id", AdminAuthMiddleware, CleaningCategoryController.updateRecord); // making status change in this api too.
router.delete("/cleaning-category/:id", AdminAuthMiddleware, CleaningCategoryController.softDeleteRecord); // Soft delete
router.patch("/cleaning-category/:id/restore", AdminAuthMiddleware, CleaningCategoryController.restoreRecord); // Restore

//------------------------------  status   -------------------------------------------
///user dashboard status---- ,Active , Inactive ,Pending ,Total count  -------------
router.get('/dashboard-status', AdminAuthMiddleware, dashboardController.getDasboardCounts);

//---------------------------Get all Lissting Of jobs------------------------------
router.get("/jobs-listing", AdminAuthMiddleware, dashboardController.getAllJobListing);



module.exports = router;