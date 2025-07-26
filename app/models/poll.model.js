import mongoose from 'mongoose';
const { Schema } = mongoose;

const pollSchema = new Schema({
  name: {
    type: String,
    required: [true, 'name is required'],
  },
  question: {
    type: String,
    required: [true, 'question is required'],
  },
  options: {
    type: Array,
    required: [true, 'options is required'],
  },
  voted: {
    type: Array,
  },
  isActived: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: String,
  },
  updatedBy: String,
}, {
  timestamps: true
});

const Poll = mongoose.model('Poll', pollSchema);
export default Poll;