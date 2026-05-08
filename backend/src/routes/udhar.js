const express = require('express');
const router = express.Router();
const udharController = require('../controllers/udharController');

router.get('/customers/search', udharController.searchCustomers);
router.get('/customers', udharController.getCustomers);
router.post('/customers', udharController.createCustomer);
router.put('/customers/:id', udharController.updateCustomer);
router.delete('/customers/:id', udharController.deleteCustomer);

router.get('/customers/:id/ledger', udharController.getCustomerLedger);
router.post('/transactions', udharController.addTransaction);
router.post('/ledger/add-udhar', udharController.addUdhar);
router.post('/customers/create-with-udhar', udharController.createWithUdhar);



router.get('/summary', udharController.getSummary);

module.exports = router;
