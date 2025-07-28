import mongoose from 'mongoose';
import validator from 'validator';
const { Schema } = mongoose;
import 'dotenv/config';
import CryptoJS from 'crypto-js';

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
  this.password = CryptoJS.AES.encrypt(this.password, key).toString();
});


userSchema.methods.decrypt = async function (password) {
  const key = process.env.SECRET_KEY;
  const bytes = CryptoJS.AES.decrypt(password, key);
  const decypted = bytes.toString(CryptoJS.enc.Utf8);
  return decypted;
}

const User = mongoose.model('User', userSchema);
export default User;
