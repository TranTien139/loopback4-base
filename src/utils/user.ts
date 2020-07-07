const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const privateKey = 'user'

export const generatePassWord = async (password?: string)=>{
  const salt = await bcrypt.genSaltSync(saltRounds)
  const hash = await bcrypt.hashSync(password, salt)
  return hash
}

export const comparePassWord = async (password?: string, hash?: string)=>{
  const compare = await bcrypt.compareSync(password, hash)
  return compare
}

export const generateToken = (user?: object) : string =>{
  return jwt.sign(user, privateKey, { expiresIn: 86400 })
}

export const verifyToken = (token?: string) : boolean =>{
  return jwt.verify(token, privateKey)
}

