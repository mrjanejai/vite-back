const express = require('express');
const util = require('./util');
const authorize = require('./middleware/authorize');
const system = require('./controllers/SystemController.js');
const authen = require('./controllers/LoginController.js');
const userAccount = require('./controllers/UserAccountController.js');
const product = require('./controllers/ProductController.js');
const brand = require('./controllers/BrandController.js');
const orderHeader = require('./controllers/OrderHeaderController.js');
const orderDetail = require('./controllers/OrderDetailController.js');
const hosxp = require('./controllers/HosxpController.js');
const patient = require('./controllers/PatientController.js');
const hosxpOfficer = require('./controllers/HosxpOfficerController.js');
const opdConfirm = require('./controllers/OpdConfirmController.js');
const maDepartment = require('./controllers/MaDepartmentController.js')
const maProvider = require('./controllers/MaProviderController.js')
const maStatusType = require('./controllers/MaStatusTypeController.js')
const maType = require('./controllers/MaTypeController.js')
const ma = require('./controllers/MaController.js')

const router = express.Router();

router
  .post('/login', authen.login)
  .get('/logout', authen.logout)
  .post('/resetPassword', authen.resetPassword)
  .get('/changePassword/:token', authen.getChangePassword)
  .post('/changePassword/:token', authen.changePassword)
  .get('/user', authen.user)
  .get('/profile', system.profile)
  .post('/updateProfile', system.updateProfile)
  .get('/stack', system.stack);

router
  .use('/userAccounts', authorize('ADMIN'), express.Router()
    .get('/', userAccount.index)
    .post('/', userAccount.create)
    .get('/create', userAccount.getCreate)
    .get('/:id', userAccount.get)
    .get('/:id/edit', userAccount.edit)
    .put('/:id', userAccount.update)
    .get('/:id/delete', userAccount.getDelete)
    .delete('/:id', userAccount.delete)
);
  
router
  .use('/hosxpOfficers', authorize('ADMIN'), express.Router()
    .get('/', hosxpOfficer.index)
    .get('/:id', hosxpOfficer.get)
    .get('/:id/edit',hosxpOfficer.edit)
);

router
  .use('/opdConfirm', authorize('ADMIN','AUDITOR'), express.Router()
    .get('/', opdConfirm.index)
    .get('/population-data', opdConfirm.getPopulationData) // Added new endpoint
  );

router
  .use('/products', authorize('ADMIN'), express.Router()
    .get('/', product.index)
    .post('/', util.getFile('products', 'image'), product.create)
    .get('/create', product.getCreate)
    .get('/:id', product.get)
    .get('/:id/edit', product.edit)
    .put('/:id', util.getFile('products', 'image'), product.update)
    .get('/:id/delete', product.getDelete)
    .delete('/:id', product.delete)
  );

router
  .use('/brands', authorize('ADMIN'), express.Router()
    .get('/', brand.index)
    .post('/', brand.create)
    .get('/create', brand.getCreate)
    .get('/:id', brand.get)
    .get('/:id/edit', brand.edit)
    .put('/:id', brand.update)
    .get('/:id/delete', brand.getDelete)
    .delete('/:id', brand.delete)
  );

router
  .use('/orderHeaders', authorize('ADMIN'), express.Router()
    .get('/', orderHeader.index)
    .post('/', orderHeader.create)
    .get('/create', orderHeader.getCreate)
    .get('/:id', orderHeader.get)
    .get('/:id/edit', orderHeader.edit)
    .put('/:id', orderHeader.update)
    .get('/:id/delete', orderHeader.getDelete)
    .delete('/:id', orderHeader.delete)
  );

router
  .use('/orderDetails', authorize('ADMIN'), express.Router()
    .post('/', orderDetail.create)
    .get('/create', orderDetail.getCreate)
    .get('/:orderId/:no/edit', orderDetail.edit)
    .put('/:orderId/:no', orderDetail.update)
    .get('/:orderId/:no/delete', orderDetail.getDelete)
    .delete('/:orderId/:no', orderDetail.delete)
  );

router
  .use('/hosxp', authorize('ADMIN','USER'), express.Router()
    .get('/', hosxp.index)
    .get('/population-data', hosxp.getPopulationData) // Added new endpoint
  );

  router
  .use('/patient', authorize('ADMIN','USER'), express.Router()
    .get('/', patient.index)
    .get('/population-sex', patient.getPopulationSex) // Added new endpoint
    .get('/population-nat', patient.getPopulationNationality) // Added new endpoint
    .get('/population-status', patient.getPopulationStatus) // Added new endpoint
    .get('/population-occ', patient.getPopulationOcc) // Added new endpoint
);
router
    .use('/maDepartments', authorize('ADMIN'), express.Router()
      .get('/', maDepartment.index)
      .post('/', maDepartment.create)
      .get('/create', maDepartment.getCreate)
      .get('/:id', maDepartment.get)
      .get('/:id/edit', maDepartment.edit)
      .put('/:id', maDepartment.update)
      .get('/:id/delete', maDepartment.getDelete)
      .delete('/:id', maDepartment.delete)
);
    router
  .use('/maProviders', authorize('ADMIN'), express.Router()
    .get('/', maProvider.index)
    .post('/', maProvider.create)
    .get('/create', maProvider.getCreate)
    .get('/:id', maProvider.get)
    .get('/:id/edit', maProvider.edit)
    .put('/:id', maProvider.update)
    .get('/:id/delete', maProvider.getDelete)
    .delete('/:id', maProvider.delete)
);
  router
  .use('/maStatusTypes', authorize('ADMIN'), express.Router()
    .get('/', maStatusType.index)
    .post('/', maStatusType.create)
    .get('/create', maStatusType.getCreate)
    .get('/:id', maStatusType.get)
    .get('/:id/edit', maStatusType.edit)
    .put('/:id', maStatusType.update)
    .get('/:id/delete', maStatusType.getDelete)
    .delete('/:id', maStatusType.delete)
);
  router
  .use('/maTypes', authorize('ADMIN'), express.Router()
    .get('/', maType.index)
    .post('/', maType.create)
    .get('/create', maType.getCreate)
    .get('/:id', maType.get)
    .get('/:id/edit', maType.edit)
    .put('/:id', maType.update)
    .get('/:id/delete', maType.getDelete)
    .delete('/:id', maType.delete)
);
  router
  .use('/mas', authorize('ADMIN,USER'), express.Router()
    .get('/', ma.index)
    .post('/', ma.create)
    .get('/create', ma.getCreate)
    .get('/:id', ma.get)
    .get('/:id/edit', ma.edit)
    .put('/:id', ma.update)
    .get('/:id/delete', ma.getDelete)
    .delete('/:id', ma.delete)
  );
module.exports = router;
