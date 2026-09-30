const axios = require('axios');
const User = require('../models/User');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// @desc    Register face embedding
// @route   POST /api/ai/register-face
exports.registerFace = async (req, res, next) => {
  try {
    const { studentId, imageData } = req.body;

    if (!imageData) {
      return res.status(400).json({ success: false, message: 'Image data is required' });
    }

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    try {
      // Send to AI service for face detection and embedding generation
      const aiResponse = await axios.post(`${AI_SERVICE_URL}/api/detect-and-embed`, {
        image: imageData
      }, { timeout: 30000 });

      if (!aiResponse.data.success) {
        return res.status(400).json({
          success: false,
          message: aiResponse.data.message || 'Face detection failed'
        });
      }

      const { embedding, faceDetected, quality } = aiResponse.data;

      if (!faceDetected) {
        return res.status(400).json({ success: false, message: 'No face detected in the image' });
      }

      if (quality && quality < 0.5) {
        return res.status(400).json({ success: false, message: 'Image quality too low. Please try again with better lighting.' });
      }

      // Store embedding in MongoDB
      student.faceEmbedding = embedding;
      student.faceRegistered = true;
      await student.save();

      res.json({
        success: true,
        message: 'Face registered successfully',
        data: {
          faceDetected: true,
          quality: quality || 0.9,
          registered: true
        }
      });
    } catch (aiError) {
      // If AI service is unavailable, use a fallback
      if (aiError.code === 'ECONNREFUSED' || aiError.code === 'ENOTFOUND') {
        // Generate a mock embedding for demo purposes
        const mockEmbedding = Array.from({ length: 128 }, () => Math.random() * 2 - 1);
        student.faceEmbedding = mockEmbedding;
        student.faceRegistered = true;
        await student.save();

        return res.json({
          success: true,
          message: 'Face registered successfully (demo mode - AI service offline)',
          data: {
            faceDetected: true,
            quality: 0.85,
            registered: true,
            demoMode: true
          }
        });
      }
      throw aiError;
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Recognize face
// @route   POST /api/ai/recognize-face
exports.recognizeFace = async (req, res, next) => {
  try {
    const { imageData, sessionId } = req.body;

    if (!imageData) {
      return res.status(400).json({ success: false, message: 'Image data is required' });
    }

    // Get all students with face embeddings
    const students = await User.find({
      role: 'student',
      faceRegistered: true,
      faceEmbedding: { $exists: true, $ne: [] }
    });

    if (students.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No registered faces found. Students need to register their faces first.'
      });
    }

    try {
      // Send to AI service
      const knownFaces = students.map(s => ({
        id: s._id.toString(),
        name: s.name,
        userId: s.userId,
        embedding: s.faceEmbedding
      }));

      const aiResponse = await axios.post(`${AI_SERVICE_URL}/api/recognize`, {
        image: imageData,
        knownFaces
      }, { timeout: 30000 });

      if (!aiResponse.data.success) {
        return res.status(400).json({
          success: false,
          message: aiResponse.data.message || 'Face recognition failed'
        });
      }

      res.json({
        success: true,
        data: aiResponse.data.data
      });
    } catch (aiError) {
      if (aiError.code === 'ECONNREFUSED' || aiError.code === 'ENOTFOUND') {
        // Demo mode: simulate recognition
        const threshold = parseFloat(process.env.CONFIDENCE_THRESHOLD) || 0.70;

        // Randomly pick a registered student for demo
        if (students.length > 0) {
          const randomIndex = Math.floor(Math.random() * students.length);
          const matched = students[randomIndex];
          const confidence = 0.75 + Math.random() * 0.2; // 0.75-0.95

          if (confidence >= threshold) {
            return res.json({
              success: true,
              data: {
                recognized: true,
                student: {
                  _id: matched._id,
                  name: matched.name,
                  userId: matched.userId,
                  profileImage: matched.profileImage
                },
                confidence: parseFloat(confidence.toFixed(2)),
                faceDetected: true,
                demoMode: true
              }
            });
          }
        }

        return res.json({
          success: true,
          data: {
            recognized: false,
            faceDetected: true,
            confidence: 0,
            message: 'Face detected but could not be recognized',
            demoMode: true
          }
        });
      }
      throw aiError;
    }
  } catch (error) {
    next(error);
  }
};
