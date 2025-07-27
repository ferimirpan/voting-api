import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';
const { Schema } = mongoose;
import encrypt from 'cf-encrypt';

const userSchema = new Schema({
  fullName: {
    type: String,
    required: [true, 'fullName is required'],
  },
  email: {
    type: String,
    required: [true, 'email is required'],
    validate: {
      validator: validator.isEmail,
      message: 'input must be in email format',
    },
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'password is required'],
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
  },
  isActived: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: String,
    default: 'From Registration Menu',
  },
  updatedBy: String,
}, {
  timestamps: true
});

userSchema.pre('save', async function () {
  const key = process.env.SECRET_KEY;
  this.password = encrypt.encrypt(this.password, key, 'hex');
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
}

userSchema.methods.cfDecrypt = async function (password) {
  const key = process.env.SECRET_KEY;
  const decypted = encrypt.decrypt(password, key, 'hex');
  return decypted;
}

const User = mongoose.model('User', userSchema);
export default User;
