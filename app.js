const express = require('express')
const cors = require('cors')
const authen = require('./middleware/authen')
const router = require('./router.js')
const util = require('./util')

const app = express()
app.use(cors(), express.json())
app.use('/uploads', express.static('uploads'))
app.use('/api', authen, router)
app.use((err, req, res, next) => {
  res.status(500).send(util.getError(err))
})
const port = 8000;
const host = '10.0.19.196';
app.listen(port, host, (err) => {
  if (err) {
    console.log('Error running server', err);
  }
  console.log(`Server is running on http://${host}:${port}`);
});
//app.listen(8000)