import mongoose from 'mongoose';

const NodeSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['folder', 'todo'],
    required: true
  },
  name: {
    type: String,
    trim: true,
    default: ''
  },
  text: {
    type: String,
    trim: true,
    default: ''
  },
  parentId: {
    type: String,
    default: null,
    index: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

NodeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.Node || mongoose.model('Node', NodeSchema);
