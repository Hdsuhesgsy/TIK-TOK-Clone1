const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Video = require('../models/Video');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for video upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/videos';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'video-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'), false);
    }
  }
});

// Upload video
router.post('/upload', auth, upload.single('video'), async (req, res) => {
  try {
    const { caption, duration, sound } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No video file uploaded' });
    }

    const video = new Video({
      userId: req.user._id,
      videoUrl: `/uploads/videos/${req.file.filename}`,
      thumbnail: `/uploads/thumbnails/${req.file.filename}.jpg`, // You'll need to generate this
      caption,
      duration: duration || 0,
      sound: sound ? JSON.parse(sound) : null
    });

    await video.save();

    // Populate user data
    await video.populate('userId', 'username profilePicture');

    res.status(201).json({
      message: 'Video uploaded successfully',
      video
    });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

// Get all videos (For You page)
router.get('/feed', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const videos = await Video.find({ isPublic: true })
      .populate('userId', 'username profilePicture isVerified')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      videos,
      currentPage: page,
      hasNextPage: videos.length === limit
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get trending videos
router.get('/trending', async (req, res) => {
  try {
    const videos = await Video.aggregate([
      { $match: { isPublic: true } },
      {
        $addFields: {
          engagement: {
            $add: [
              { $size: '$likes' },
              { $size: '$comments' },
              '$shares'
            ]
          }
        }
      },
      { $sort: { engagement: -1, createdAt: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userId'
        }
      },
      { $unwind: '$userId' }
    ]);

    res.json({ videos });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Like/Unlike video
router.post('/:videoId/like', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const hasLiked = video.likes.includes(req.user._id);

    if (hasLiked) {
      // Unlike
      video.likes = video.likes.filter(
        like => like.toString() !== req.user._id.toString()
      );
    } else {
      // Like
      video.likes.push(req.user._id);
    }

    await video.save();

    res.json({
      message: hasLiked ? 'Video unliked' : 'Video liked',
      likesCount: video.likes.length,
      hasLiked: !hasLiked
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get video by ID
router.get('/:videoId', async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId)
      .populate('userId', 'username profilePicture isVerified followers following')
      .populate('comments');

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Increment views
    video.views += 1;
    await video.save();

    res.json({ video });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
