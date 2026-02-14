const jobService = require('../services/jobService');

class JobController {
  async createJob(req, res) {
    try{
      const{type,data,priority}=req.body;
      if(!type || !data){
      return res.status(400).json({
        success:false,
        message:'Job type and data are required'
      });
    }

    const validTypes=['email','file-upload','image-process','report-generation'];
    if(!validTypes.includes(type)){
      return res.status(400).json({
        success:false,
        message:`Invalid job type. Valid types are: ${validTypes.join(', ')}`
      });
    }

    const job= await jobService.createJob(type,data,priority);
    res.status(201).json({
      success:true,
      message:'Job created successfully',
      data:job,
    });
  }catch(error){
    res.status(500).json({
      success:false,
      message:error.message,
    });
  }
  }

  async getJobById(req,res){
    try{
      const{jobId}=req.params;
      const job =await jobService.getJobById(jobId);
      res.json({
        success:true,
        data:job,
      });
    }catch(err){
      res.status(404).json({
        success:false,
        message:err.message,
      });
    }
  }

  async getJobs(req,res){
    try{
      const {status,type,limit,skip}=req.query;
      const result= await jobService.getJobs({
        status,
        type,
        limit:parseInt(limit) || 50,
        skip:parseInt(skip) || 0,
      });

      res.json({
        success:true,
        data:result.jobs,
        total:result.total,
      });     
    }catch(err){
      res.status(500).json({
        success:false,
        message:err.message,
      });
    }
  }

  async getStats(req,res){
    try{
      const stats= await jobService.getStats();
      res.json({
        success:true,
        data:stats,
      });
    }catch(err){
      res.status(500).json({
        success:false,
        message:err.message,
      });
    }  
  }
}

module.exports = new JobController();