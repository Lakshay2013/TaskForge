const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

router.post('/jobs', jobController.createJob);

router.get('/jobs', jobController.getJobs);

router.get('/jobs/stats', jobController.getStats);

router.get('/jobs/:jobId', jobController.getJobById);

module.exports = router;