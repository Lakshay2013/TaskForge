const { v4: uuidv4 } = require('uuid');
const Job = require('../models/Job');
const jobQueue = require('../queues/jobQueue');

class JobService {
  async createJob(type, data, priority = 0) {
    try {
      const jobId = uuidv4();

      const job = await Job.create({
        jobId,
        type,
        data,
        priority,
        status: 'pending',
      });

      await jobQueue.add(
        type,
        {
          jobId,
          type,
          data,
        },
        {
          jobId,
          priority,
        }
      );

      return job;
    } catch (error) {
      throw new Error(`Failed to create job: ${error.message}`);
    }
  }

  async getJobById(jobId) {
    const job = await Job.findOne({ jobId });
    if (!job) {
      throw new Error('Job not found');
    }
    return job;
  }

  async getJobs(filters = {}) {
    const { status, type, limit = 50, skip = 0 } = filters;
    
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Job.countDocuments(query);

    return { jobs, total };
  }

  async getStats() {
    const stats = await Job.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
    };

    stats.forEach((stat) => {
      result[stat._id] = stat.count;
    });

    return result;
  }

  async updateJobStatus(jobId, status, updates = {}) {
    const updateData = { status, ...updates };
    
    if (status === 'processing') {
      updateData.startedAt = new Date();
    } else if (status === 'completed' || status === 'failed') {
      updateData.completedAt = new Date();
      
      const job = await Job.findOne({ jobId });
      if (job && job.startedAt) {
        updateData.processingTime = Date.now() - job.startedAt.getTime();
      }
    }

    return await Job.findOneAndUpdate(
      { jobId },
      { $set: updateData, $inc: { attempts: 1 } },
      { new: true }
    );
  }
}

module.exports = new JobService();

