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
    host: '10.0.0.3',
    port: 3306,
    user: 'root',
    password: '@Wch123456',
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
    { 
      title: 'ข้อมูลผู้ป่วย', 
      path: 'patient', 
      roles: 'ADMIN,USER', 
      show: true,
      subMenu: [
        { subtitle: 'เมนูย่อย 1', subpath: 'patient/subMenu1', roles: 'ADMIN,USER', show: true },
        { subtitle: 'เมนูย่อย 2', subpath: 'patient/subMenu2', roles: 'ADMIN,USER', show: true },
        { subtitle: 'เมนูย่อย 3', subpath: 'patient/subMenu3', roles: 'ADMIN,USER', show: true },
        { subtitle: 'เมนูย่อย 4', subpath: 'patient/subMenu4', roles: 'ADMIN,USER', show: true },
        { subtitle: 'เมนูย่อย 5', subpath: 'patient/subMenu5', roles: 'ADMIN,USER', show: true },
        { subtitle: 'เมนูย่อย 6', subpath: 'patient/subMenu6', roles: 'ADMIN,USER', show: true },
        { subtitle: 'เมนูย่อย 7', subpath: 'patient/subMenu7', roles: 'ADMIN,USER', show: true },
        { subtitle: 'เมนูย่อย 8', subpath: 'patient/subMenu8', roles: 'ADMIN,USER', show: true },
        { subtitle: 'เมนูย่อย 9', subpath: 'patient/subMenu9', roles: 'ADMIN,USER', show: true },
        { subtitle: 'เมนูย่อย 10', subpath: 'patient/subMenu10', roles: 'ADMIN,USER', show: true }
      ]
    },
    { title: 'กิจกรรมการพยาบาล', path: 'patientActivity', roles: 'ADMIN,USER', show: true },
    { title: 'ข้อมูลทรัพยากร', path: 'resource', roles: 'ADMIN,USER', show: true },
    { title: 'ข้อมูลการบริหาร', path: 'clinic', roles: 'ADMIN,USER', show: true },
    { title: 'คลังข้อมูล', path: 'management', roles: 'ADMIN,USER', show: true },
    { title: 'Order Detail', path: 'orderDetail', roles: 'ADMIN', show: false },
    { title: 'Order', path: 'orderHeader', roles: 'ADMIN', show: true },
    { title: 'Product', path: 'product', roles: 'ADMIN', show: true },
    { title: 'User Account', path: 'userAccount', roles: 'ADMIN', show: true },
    { title: 'Hosxp Account', path: 'hosxpOfficer', roles: 'ADMIN', show: true },
    { title: 'HOSXP', path: 'hosxp', roles: 'ADMIN,USER', show: true },
    { title: 'OPD Confirm', path: 'opdConfirm', roles: 'ADMIN,AUDITOR', show: true },
    { title: 'แจ้งซ่อม IT', path: 'ma', roles: 'ADMIN,USER', show: true },
    { title: 'Ma Department', path: 'maDepartment', roles: 'ADMIN', show: true },
    { title: 'Ma Provider', path: 'maProvider', roles: 'ADMIN', show: true },
    { title: 'Ma Status Type', path: 'maStatusType', roles: 'ADMIN', show: true },
    { title: 'Ma Type', path: 'maType', roles: 'ADMIN', show: true },
  ],
  jwtSecret: '@SDPY@15012@MIS@2024'
}