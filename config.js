module.exports = {
  app: {
    url: 'http://localhost:5173',
    name: 'Project1'
  },
  smtp: {
    host: 'smtp.mailtrap.io',
    port: '587',
    user: '',
    password: ''
  },
  mail: {
    sender: 'admin@example.com',
    welcome: 'Welcome to {app_name},\n\nYour user has been created. The login information:\nLogin URL: {app_url}/#/login\nUser Name: {user}\n\nPlease click the link below to set your password.\n{app_url}/#/changePassword/{token}\n\nBest Regards,\nAdministrator',
    reset: 'Dear User,\n\nYou recently requested to reset the password for your {app_name} account. Please click the link below to proceed.\n{app_url}/#/changePassword/{token}\n\nBest Regards,\nAdministrator'
  },
  db: {
    host: '10.0.0.7',
    port: 3306,
    user: 'sa',
    password: 'sa',
    database: 'pjdb',
    dialect: 'mysql'
  },
  dbhos: {
    host: '10.0.0.7',
    port: '3306',
    user: 'sa',
    password: 'sa',
    database: 'wchhos',
    dialect: 'mysql'
  },
  menu: [
    { title: 'OverView', path: 'overView', roles: 'ADMIN,USER', show: true },
    { title: 'OPD', path: 'opd', roles: 'ADMIN,USER', show: true },
    { title: 'IPD', path: 'ipd', roles: 'ADMIN,USER', show: true },
    { title: 'Patient', path: 'patient', roles: 'ADMIN,USER', show: true },
    { title: 'Patient Activity', path: 'patientActivity', roles: 'ADMIN,USER', show: true },
    { title: 'Resource', path: 'resource', roles: 'ADMIN,USER', show: true },
    { title: 'Clinic', path: 'clinic', roles: 'ADMIN,USER', show: true },
    { title: 'Management', path: 'management', roles: 'ADMIN,USER', show: true },
    { title: 'Reference', path: 'reference ', roles: 'ADMIN,USER', show: true },
    { title: 'Order Detail', path: 'orderDetail', roles: 'ADMIN,USER', show: false },
    { title: 'Order', path: 'orderHeader', roles: 'ADMIN,USER', show: true },
    { title: 'Product', path: 'product', roles: 'ADMIN,USER', show: true },
    { title: 'User Account', path: 'userAccount', roles: 'ADMIN', show: true },
    { title: 'HOSXP', path: 'hosxp', roles: 'ADMIN', show: true }
  ],
  jwtSecret: '@SDPY@15012@MIS@2024'
}