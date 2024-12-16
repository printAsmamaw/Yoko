const express = require('express');
const router = express.Router();
const drugController = require('../controllers/drugController');
const multer = require('multer');
const path = require('path');

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/')); // Use path.join for consistent path handling
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

router.post('/uploadExcel', upload.single('file'), drugController.uploadExcelItems);
router.post('/uploadCategoryExcel', upload.single('file'), drugController.uploadCategoryExcel);



router.post('/add-drug', drugController.addDrug);
router.post('/add-seller', drugController.addSeller);
router.get('/drugs', drugController.getDrugs);
router.get('/drug/:id', drugController.getDrugById);
router.get('/expired-drugs-count', drugController.getExpiredDrugsCount);
router.post('/register-customer', drugController.registerCustomer);
router.post('/register-performa', drugController.registerperforma);


router.post('/place-order', drugController.placeOrder);
router.post('/place-performa', drugController.placePerformaDrug);


router.get('/orders', drugController.getCustomerOrders);
router.delete('/drug-remove-by-expired/:id', drugController.deleteDrug);
router.post('/approve-orders', drugController.approvedOrders);
router.get('/approved-orders', drugController.getApprovedOrders);
router.post('/update-payment-status', drugController.updatePaymentStatus);
router.post('/finish-payment', drugController.finishPayment);
router.get('/customers', drugController.getCustomers);
router.get('/performa', drugController.getCustomerforPerforma);

router.get('/daily-sales', drugController.getDailySales);
router.delete('/orders/:customerId', drugController.deleteOrdersByCustomerId);
router.delete('/approvals/:customerId', drugController.deleteApprovalsByCustomerId);
router.post('/update-drug-quantity', drugController.updateDrugsByQuantity);
// routes/drugRoutes.js
router.get('/payments/:customerId', drugController.getPaymentsByCustomerId);
router.put('/updatedrug/:id', drugController.updateDrug);

router.get('/sellers', drugController.getAllSellers);
router.get('/performa-requester', drugController.getAllPerformaRequester);


router.get('/stocks', drugController.getAllStocks);
router.get('/stocks/:sellerId', drugController.getStocksBySellerId);
router.get('/performa-with-requester-Id/:sellerId', drugController.getPerformaDrug);



// router.delete('/stocks/:stockId', drugController.deleteStockById);
router.get('/top-selling-items', drugController.getTopSellingItems);
router.get('/total-customers-today', drugController.getTotalCustomersForToday);
router.get('/customers-today', drugController.getCustomersForToday);
router.get('/total-outofstock-today', drugController.getTotalSuppliersForToday);
router.get('/total-medicine-today', drugController.getTotalMedicineForToday);
router.get('/total-expired-today',  drugController.getTotalExpiredForToday);
router.get('/expired-drugs', drugController.getExpiredForToday);
router.get('/total-out-of-stock/:userId', drugController.getTotalOutOfStockForToday);
// router.get('/selled-medicine', drugController.getSelledMedicine);
router.get('/selled-medicine', drugController.getSelledMedicine);

router.get('/selled-medicine-but-in-stock', drugController.getSelledMedicineButInStock);



router.get('/selled-medicine/:userId', drugController.getSelledMedicineByUserId);

router.get('/total-sales-today', drugController.getTotalSalesToday);
router.get('/total-sales-today/:userId', drugController.getTotalSalesTodayByUserId);
router.get('/total-sales-today-for-individualUser', drugController.getTotalSalesTodayForIndividualUser);

router.get('/total-purchases-today', drugController.getTotalPurchasesToday);
router.post('/registor', drugController.addEmployee);
router.get('/employees', drugController.getEmployees);
router.post('/add-role', drugController.addUserRole);
router.put('/outofstock/:id', drugController.updateOutOfStock);
router.get('/total-outofstock-today-list', drugController.getOutofStockMdicine);
router.get('/total-out-of-stock', drugController.getTotalSelledMedicineForToday);
router.get('/outof-stock-but-in-stock', drugController.getTotalOutofStockButInStock);

router.get('/total-outofstock', drugController.getTotalOutofStock);
router.get('/total-suppliers-today', drugController.getTotalSupplierForToday);
router.get('/payments', drugController.sellingReportPerDay);

router.get('/payments-with-range', drugController.sellingReportPerDayWithRange);
router.post('/addCategorie', drugController.addCategorie);
router.get('/categories', drugController.getCategorie);
router.get('/category-sales', drugController.getReportByCategorie);

router.get('/getAllDrugswith', drugController.getAllDrugswith);
router.get('/items', drugController.getItems);
router.post('/addItem', drugController.addItems);
router.get('/seller-by-id/:sellerId', drugController.getSellers);
router.get('/user-for-performa/:sellerId', drugController.getPerformaUser);


router.get('/drugs-by-category', drugController.getDrugsByCategory);
router.post('/save-settings', drugController.saveSettings);

router.get('/get-settings', drugController.getSettings);
router.put('/update-settings', drugController.updateSettings);


module.exports = router;
