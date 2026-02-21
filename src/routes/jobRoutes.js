const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/jobs', jobController.createJob);

router.get('/jobs', jobController.getJobs);

router.get('/jobs/stats', jobController.getStats);

router.get('/jobs/:jobId', jobController.getJob);

module.exports = router;