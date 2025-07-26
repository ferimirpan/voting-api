import mongoose from 'mongoose';
const { Schema } = mongoose;

const tokenSchema = new Schema({
  token: {
    type: String,
    required: [true, 'token is required'],
  },
  isActived: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: String,
    required: [true, 'createdBy is required'],
  },
  updatedBy: String,
}, {
  timestamps: true
});

const Token = mongoose.model('Token', tokenSchema);
export default Token;