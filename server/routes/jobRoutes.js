const express = require('express');
const Job = require('../models/Job');
const router = express.Router();

// Get all jobs
// GET /api/jobs
// Optional query param: near=lat,lng to filter by location
router.get('/', async (req, res) => {
  try {
    let query = { status: 'open' };
    
    // If near parameter is provided, find jobs nearby
    if (req.query.near) {
      const [lat, lng] = req.query.near.split(',').map(parseFloat);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        // In a real app, you'd use geospatial queries
        // This is a simplified version
        console.log(`Finding jobs near lat: ${lat}, lng: ${lng}`);
      }
    }
    
    const jobs = await Job.find(query).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Get a specific job by ID
// GET /api/jobs/:id
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json(job);
  } catch (error) {
    console.error(`Error fetching job ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

// Create a new job
// POST /api/jobs
router.post('/', async (req, res) => {
  try {
    const newJob = new Job(req.body);
    await newJob.save();
    res.status(201).json(newJob);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(400).json({ error: 'Failed to create job' });
  }
});

// Apply for a job
// POST /api/jobs/:id/apply
router.post('/:id/apply', async (req, res) => {
  try {
    console.log('Received application request:', req.body);
    const { fixerId, fixerName, message, price, estimatedTime } = req.body;
    
    if (!fixerId || !fixerName || !message) {
      console.log('Missing required fields:', { fixerId, fixerName, message });
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const job = await Job.findById(req.params.id);
    console.log('Found job:', job ? 'yes' : 'no');
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    if (job.status !== 'open') {
      console.log('Job status is not open:', job.status);
      return res.status(400).json({ error: 'This job is not open for applications' });
    }
    
    // Check if fixer already applied
    const hasApplied = job.applications.some(app => app.fixerId === fixerId);
    if (hasApplied) {
      console.log('Fixer already applied:', fixerId);
      return res.status(400).json({ error: 'You have already applied for this job' });
    }
    
    // Add the application
    const application = {
      fixerId,
      fixerName,
      message,
      price,
      estimatedTime,
      createdAt: new Date()
    };
    
    job.applications.push(application);
    console.log('Added application to job');
    
    try {
      await job.save();
      console.log('Saved job successfully');
      return res.status(201).json(application);
    } catch (saveError) {
      console.error('Error saving job application:', saveError);
      return res.status(500).json({ error: 'Failed to save application' });
    }
  } catch (error) {
    console.error(`Error applying for job ${req.params.id}:`, error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Accept a fixer's application
// POST /api/jobs/:id/accept
router.post('/:id/accept', async (req, res) => {
  try {
    const { fixerId } = req.body;
    
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    if (job.status !== 'open') {
      return res.status(400).json({ error: 'This job is not open for acceptance' });
    }
    
    // Find the application
    const application = job.applications.find(app => app.fixerId === fixerId);
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    // Update job status
    job.status = 'assigned';
    job.assignedFixer = {
      fixerId,
      fixerName: application.fixerName
    };
    
    await job.save();
    
    res.json(job);
  } catch (error) {
    console.error(`Error accepting application for job ${req.params.id}:`, error);
    res.status(400).json({ error: 'Failed to accept application' });
  }
});

// Mark a job as complete
// POST /api/jobs/:id/complete
router.post('/:id/complete', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    if (job.status !== 'assigned') {
      return res.status(400).json({ error: 'Only assigned jobs can be marked as complete' });
    }
    
    // Update job status
    job.status = 'completed';
    job.completedAt = new Date();
    
    await job.save();
    
    res.json(job);
  } catch (error) {
    console.error(`Error completing job ${req.params.id}:`, error);
    res.status(400).json({ error: 'Failed to complete job' });
  }
});

// Get jobs posted by a specific homeowner
// GET /api/jobs/homeowner/:id
router.get('/homeowner/:id', async (req, res) => {
  try {
    const jobs = await Job.find({ homeownerId: req.params.id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.error(`Error fetching homeowner jobs:`, error);
    res.status(500).json({ error: 'Failed to fetch homeowner jobs' });
  }
});

// Get jobs for a specific fixer (assigned or applied to)
// GET /api/jobs/fixer/:id
router.get('/fixer/:id', async (req, res) => {
  try {
    const fixerId = req.params.id;
    
    // Find jobs where the fixer is assigned or has applied
    const jobs = await Job.find({
      $or: [
        { 'assignedFixer.fixerId': fixerId },
        { 'applications.fixerId': fixerId }
      ]
    }).sort({ createdAt: -1 });
    
    res.json(jobs);
  } catch (error) {
    console.error(`Error fetching fixer jobs:`, error);
    res.status(500).json({ error: 'Failed to fetch fixer jobs' });
  }
});

module.exports = router;
