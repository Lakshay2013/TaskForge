const jwt= require('jsonwebtoken');

const JWT_SECRET= process.env.JWT_SECRET || 'your_jwt_secret_key';
const JWT_EXPIRES_IN= process.env.JWT_EXPIRES_IN || '1h';

const generateToken= (user)=>{
  return jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const verifyToken= (token)=>{
  try{
    return jwt.verify(token, JWT_SECRET);
  }catch(err){
    return null;
  }
};

module.exports= { generateToken, verifyToken };