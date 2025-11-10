const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    required: true
  },
  caption: {
    type: String,
    maxlength: 150,
    default: ''
  },
  duration: {
    type: Number,
    required: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  shares: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  sound: {
    name: String,
    url: String
  },
  tags: [String],
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Virtual for likes count
videoSchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

// Virtual for comments count
videoSchema.virtual('commentsCount').get(function() {
  return this.comments.length;
});

module.exports = mongoose.model('Video', videoSchema);
