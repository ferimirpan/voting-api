import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';
const { Schema } = mongoose;

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
  const saltRounds = 10;
  this.password = await bcrypt.hash(this.password, saltRounds);
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
}

const User = mongoose.model('User', userSchema);
export default User;
