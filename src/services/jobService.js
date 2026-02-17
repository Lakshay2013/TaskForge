const { v4: uuidv4 } = require('uuid');
const Job = require('../models/Job');
const jobQueue = require('../queues/jobQueue');

class JobService {
  // Create a new job
  async createJob(userId, type, data, priority = 0) {
    try {
      const jobId = uuidv4();

      // Save to MongoDB
      const job = await Job.create({
        jobId,
        userId,
        type,
        data,
        priority,
        status: 'pending',
      });

      // Add to queue with priority
      await jobQueue.add(
        type,
        {
          jobId,
          userId,
          type,
          data,
        },
        {
          jobId,
          priority: -priority, 
        }
      );

      return job;
    } catch (error) {
      throw new Error(`Failed to create job: ${error.message}`);
    }
  }


  async getJobById(jobId, userId, isAdmin = false) {
    const query = { jobId };
    if (!isAdmin) {
      query.userId = userId;
    }

    const job = await Job.findOne(query).populate('userId', 'name email');
    if (!job) {
      throw new Error('Job not found');
    }
    return job;
  }

  async getJobs(userId, filters = {}, isAdmin = false) {
    const { status, type, limit = 50, skip = 0 } = filters;
    
    const query = {};
    if (!isAdmin) {
      query.userId = userId;
    }
    if (status) query.status = status;
    if (type) query.type = type;

    const jobs = await Job.find(query)
      .populate('userId', 'name email')
      .sort({ priority: -1, createdAt: -1 }) 
      .limit(limit)
      .skip(skip);

    const total = await Job.countDocuments(query);

    return { jobs, total };
  }

  async getStats(userId, isAdmin = false) {
    const matchStage = isAdmin ? {} : { userId };

    const stats = await Job.aggregate([
      { $match: matchStage },
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

  // Update job status
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