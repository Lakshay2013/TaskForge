const jobService = require('../services/jobService');

class JobController {
  async createJob(req, res, next) {  // ✅ Add 'next'
    try {
      const { type, data, priority } = req.body;
      const userId = req.user._id;

      if (!type || !data) {
        return res.status(400).json({
          success: false,
          message: 'Type and data are required',
        });
      }

      const validTypes = ['email', 'file-upload', 'image-process', 'report-generation'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: `Invalid job type. Must be one of: ${validTypes.join(', ')}`,
        });
      }

      const job = await jobService.createJob(userId, type, data, priority || 0);

      res.status(201).json({
        success: true,
        message: 'Job created successfully',
        data: job,
      });
    } catch (error) {
      next(error);  // ✅ Pass to error handler
    }
  }

  async getJob(req, res, next) {  // ✅ Add 'next'
    try {
      const { jobId } = req.params;
      const userId = req.user._id;
      const isAdmin = req.user.role === 'admin';

      const job = await jobService.getJobById(jobId, userId, isAdmin);

      res.json({
        success: true,
        data: job,
      });
    } catch (error) {
      next(error);  // ✅ Pass to error handler
    }
  }

  async getJobs(req, res, next) {  // ✅ Add 'next'
    try {
      const { status, type, limit, skip } = req.query;
      const userId = req.user._id;
      const isAdmin = req.user.role === 'admin';

      const result = await jobService.getJobs(
        userId,
        {
          status,
          type,
          limit: parseInt(limit) || 50,
          skip: parseInt(skip) || 0,
        },
        isAdmin
      );

      res.json({
        success: true,
        data: result.jobs,
        total: result.total,
      });
    } catch (error) {
      next(error);  // ✅ Pass to error handler
    }
  }

  async getStats(req, res, next) {  // ✅ Add 'next'
    try {
      const userId = req.user._id;
      const isAdmin = req.user.role === 'admin';

      const stats = await jobService.getStats(userId, isAdmin);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);  // ✅ Pass to error handler
    }
  }
}

module.exports = new JobController();