const mongoose=require('mongoose');

const jobSchema= new mongoose.Schema({
  jobId:{
    type:String,
    required:true,
    unique:true,
    index:true
  },
  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
    required:true,
    index:true
  },
  type:{
    type:String,
    required:true,
    enum: ['email', 'file-upload', 'image-process', 'report-generation']
  },
  status:{
    type:String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default:'pending',
    index:true
  },
  data:{
    type:mongoose.Schema.Types.Mixed,
    required:true
  },
  result:{
    type:mongoose.Schema.Types.Mixed,
    default:null
  },
  error:{
    type:String,
    default:null
  },
  attempts:{
    type:Number,
    default:0
  },
  createdAt:{
    type:Date,
    default:Date.now,
    index:true
  },
  startedAt:{
    type:Date,
    default:null
  }
});

jobSchema.index({ status: 1, createdAt: 1 });
jobSchema.index({ userId: 1, createdAt: 1 });

module.exports=mongoose.model('Job',jobSchema);