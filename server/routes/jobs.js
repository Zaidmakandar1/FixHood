const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const Job = require('../models/Job');

// Get all jobs (for fixers)
router.get('/', auth, checkRole(['fixer']), async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'open' })
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs' });
  }
});

// Get homeowner's jobs
router.get('/homeowner', auth, checkRole(['homeowner']), async (req, res) => {
  try {
    const jobs = await Job.find({ homeownerId: req.user.userId })
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs' });
  }
});

// Get fixer's jobs (applications) - matches frontend call to /my-applications
router.get('/my-applications', auth, checkRole(['fixer']), async (req, res) => {
  try {
    const jobs = await Job.find({
      $or: [
        { 'assignedFixer': req.user.userId },
        { 'applications.fixerId': req.user.userId }
      ]
    }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs' });
  }
});

// Get fixer's jobs (alternative endpoint)
router.get('/fixer', auth, checkRole(['fixer']), async (req, res) => {
  try {
    const jobs = await Job.find({
      $or: [
        { 'assignedFixer': req.user.userId },
        { 'applications.fixerId': req.user.userId }
      ]
    }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs' });
  }
});

// Get fixer's jobs (applications) - matches frontend call to /my-applications
router.get('/my-applications', auth, checkRole(['fixer']), async (req, res) => {
  try {
    const jobs = await Job.find({
      $or: [
        { 'assignedFixer': req.user.userId },
        { 'applications.fixerId': req.user.userId }
      ]
    }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs' });
  }
});

// Get fixer's jobs (alternative endpoint)
router.get('/fixer', auth, checkRole(['fixer']), async (req, res) => {
  try {
    const jobs = await Job.find({
      $or: [
        { 'assignedFixer': req.user.userId },
        { 'applications.fixerId': req.user.userId }
      ]
    }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs' });
  }
});

// Get a specific job by ID - matches frontend call to /jobs/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching job' });
  }
});

// Create a new job
router.post('/', auth, checkRole(['homeowner']), async (req, res) => {
  try {
    const job = new Job({
      ...req.body,
      homeownerId: req.user.userId
    });
    await job.save();
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error creating job' });
  }
});

// Apply for a job
router.post('/:id/apply', auth, checkRole(['fixer']), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.status !== 'open') {
      return res.status(400).json({ message: 'Job is no longer accepting applications' });
    }

    // Check if already applied
    const hasApplied = job.applications.some(app => app.fixerId.toString() === req.user.userId);
    if (hasApplied) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    job.applications.push({
      fixerId: req.user.userId,
      message: req.body.message,
      price: req.body.price
    });

    await job.save();
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error applying for job' });
  }
});

// Accept an application - matches frontend call to /jobs/:id/accept
router.post('/:id/accept', auth, checkRole(['homeowner']), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.homeownerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { fixerId } = req.body;
    if (!fixerId) {
      return res.status(400).json({ message: 'Fixer ID is required' });
    }

    // Find the application by fixerId
    const application = job.applications.find(app => app.fixerId.toString() === fixerId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Update job status and assigned fixer
    job.status = 'assigned';
    job.assignedFixer = application.fixerId;

    // Update application status
    application.status = 'accepted';

    // Reject other applications
    job.applications.forEach(app => {
      if (app.fixerId.toString() !== fixerId) {
        app.status = 'rejected';
      }
    });

    await job.save();
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error accepting application' });
  }
});

// Accept an application (alternative endpoint with applicationId in URL)
router.post('/:id/accept/:applicationId', auth, checkRole(['homeowner']), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.homeownerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const application = job.applications.id(req.params.applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Update job status and assigned fixer
    job.status = 'assigned';
    job.assignedFixer = application.fixerId;

    // Update application status
    application.status = 'accepted';

    // Reject other applications
    job.applications.forEach(app => {
      if (app._id.toString() !== req.params.applicationId) {
        app.status = 'rejected';
      }
    });

    await job.save();
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error accepting application' });
  }
});

// Accept an application - matches frontend call to /jobs/:id/accept
router.post('/:id/accept', auth, checkRole(['homeowner']), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.homeownerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { fixerId } = req.body;
    if (!fixerId) {
      return res.status(400).json({ message: 'Fixer ID is required' });
    }

    // Find the application by fixerId
    const application = job.applications.find(app => app.fixerId.toString() === fixerId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Update job status and assigned fixer
    job.status = 'assigned';
    job.assignedFixer = application.fixerId;

    // Update application status
    application.status = 'accepted';

    // Reject other applications
    job.applications.forEach(app => {
      if (app.fixerId.toString() !== fixerId) {
        app.status = 'rejected';
      }
    });

    await job.save();
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error accepting application' });
  }
});

// Get homeowner's jobs
router.get('/homeowner', auth, checkRole(['homeowner']), async (req, res) => {
  try {
    const jobs = await Job.find({ homeownerId: req.user.userId })
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs' });
  }
});

// Get fixer's jobs (applications) - matches frontend call to /my-applications
router.get('/my-applications', auth, checkRole(['fixer']), async (req, res) => {
  try {
    const jobs = await Job.find({
      $or: [
        { 'assignedFixer': req.user.userId },
        { 'applications.fixerId': req.user.userId }
      ]
    }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs' });
  }
});

// Get fixer's jobs (alternative endpoint)
router.get('/fixer', auth, checkRole(['fixer']), async (req, res) => {
  try {
    const jobs = await Job.find({
      $or: [
        { 'assignedFixer': req.user.userId },
        { 'applications.fixerId': req.user.userId }
      ]
    }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs' });
  }
});

// Get a specific job by ID - matches frontend call to /jobs/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching job' });
  }
});

// Create a new job
router.post('/', auth, checkRole(['homeowner']), async (req, res) => {
  try {
    const job = new Job({
      ...req.body,
      homeownerId: req.user.userId
    });
    await job.save();
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error creating job' });
  }
});

// Apply for a job
router.post('/:id/apply', auth, checkRole(['fixer']), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.status !== 'open') {
      return res.status(400).json({ message: 'Job is no longer accepting applications' });
    }

    // Check if already applied
    const hasApplied = job.applications.some(app => app.fixerId.toString() === req.user.userId);
    if (hasApplied) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    job.applications.push({
      fixerId: req.user.userId,
      message: req.body.message,
      price: req.body.price
    });

    await job.save();
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error applying for job' });
  }
});

// Accept an application - matches frontend call to /jobs/:id/accept
router.post('/:id/accept', auth, checkRole(['homeowner']), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.homeownerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { fixerId } = req.body;
    if (!fixerId) {
      return res.status(400).json({ message: 'Fixer ID is required' });
    }

    // Find the application by fixerId
    const application = job.applications.find(app => app.fixerId.toString() === fixerId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Update job status and assigned fixer
    job.status = 'assigned';
    job.assignedFixer = application.fixerId;

    // Update application status
    application.status = 'accepted';

    // Reject other applications
    job.applications.forEach(app => {
      if (app.fixerId.toString() !== fixerId) {
        app.status = 'rejected';
      }
    });

    await job.save();
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error accepting application' });
  }
});

// Accept an application (alternative endpoint with applicationId in URL)
router.post('/:id/accept/:applicationId', auth, checkRole(['homeowner']), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.homeownerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const application = job.applications.id(req.params.applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Update job status and assigned fixer
    job.status = 'assigned';
    job.assignedFixer = application.fixerId;

    // Update application status
    application.status = 'accepted';

    // Reject other applications
    job.applications.forEach(app => {
      if (app._id.toString() !== req.params.applicationId) {
        app.status = 'rejected';
      }
    });

    await job.save();
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error accepting application' });
  }
});

// Reject an application - matches frontend expectation
router.post('/:id/reject', auth, checkRole(['homeowner']), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.homeownerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { fixerId } = req.body;
    if (!fixerId) {
      return res.status(400).json({ message: 'Fixer ID is required' });
    }

    // Find the application by fixerId
    const application = job.applications.find(app => app.fixerId.toString() === fixerId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Update application status
    application.status = 'rejected';

    await job.save();
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting application' });
  }
});

// Complete a job
router.post('/:id/complete', auth, checkRole(['homeowner']), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.homeownerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    job.status = 'completed';
    await job.save();
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error completing job' });
  }
});

// Complete a job
router.post('/:id/complete', auth, checkRole(['homeowner']), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.homeownerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    job.status = 'completed';
    await job.save();
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error completing job' });
  }
});

module.exports = router;
