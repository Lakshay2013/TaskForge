require('dotenv').config();
const { Worker } = require('bullmq');
const connectDB = require('../config/database');
const redisClient = require('../config/redis');
const jobService = require('../services/jobService');

const jobProcessors = {
  email: async (job) => {
    const { data } = job;
    console.log(` Sending email to: ${data.to}`);
    
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    return { sent: true, recipient: data.to, timestamp: new Date() };
  },

  'file-upload': async (job) => {
    const { data } = job;
    console.log(` Uploading file: ${data.filename}`);
    
   
    await new Promise((resolve) => setTimeout(resolve, 3000));
    
    return { uploaded: true, filename: data.filename, size: data.size };
  },

  'image-process': async (job) => {
    const { data } = job;
    console.log(`  Processing image: ${data.imageName}`);
    
    // Simulate image processing
    await new Promise((resolve) => setTimeout(resolve, 4000));
    
    return { processed: true, imageName: data.imageName, resolution: data.resolution };
  },

  'report-generation': async (job) => {
    const { data } = job;
    console.log(` Generating report: ${data.reportName}`);
    
    // Simulate report generation
    await new Promise((resolve) => setTimeout(resolve, 5000));
    
    return { generated: true, reportName: data.reportName, pages: data.pages };
  },
};

// Create worker
const createWorker = async () => {
  await connectDB();

  const worker = new Worker(
    'taskforge-jobs',
    async (job) => {
      console.log(`\n  Processing job: ${job.id} [${job.name}]`);

      try {
        // Update status to processing
        await jobService.updateJobStatus(job.data.jobId, 'processing');

        // Process the job
        const processor = jobProcessors[job.name];
        if (!processor) {
          throw new Error(`No processor found for job type: ${job.name}`);
        }

        const result = await processor(job);

        // Update status to completed
        await jobService.updateJobStatus(job.data.jobId, 'completed', { result });

        console.log(` Job completed: ${job.id}`);
        return result;
      } catch (error) {
        console.error(` Job failed: ${job.id}`, error.message);

        // Update status to failed
        await jobService.updateJobStatus(job.data.jobId, 'failed', {
          error: error.message,
        });

        throw error;
      }
    },
    {
      connection: redisClient,
      concurrency: parseInt(process.env.MAX_CONCURRENT_JOBS) || 5,
    }
  );

  // Worker events
  worker.on('completed', (job) => {
    console.log(` Job ${job.id} has been completed`);
  });

  worker.on('failed', (job, err) => {
    console.log(` Job ${job.id} has failed with error: ${err.message}`);
  });

  console.log(' Worker started and waiting for jobs...');
};

createWorker().catch((error) => {
  console.error('Failed to start worker:', error);
  process.exit(1);
});