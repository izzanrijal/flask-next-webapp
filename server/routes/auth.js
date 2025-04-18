import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Login attempts tracker
const loginAttempts = new Map();

// Reset login attempts after 24 hours
function resetLoginAttempts() {
  const now = Date.now();
  for (const [ip, data] of loginAttempts.entries()) {
    if (now - data.timestamp > 24 * 60 * 60 * 1000) {
      loginAttempts.delete(ip);
    }
  }
}

// Run cleanup every hour
setInterval(resetLoginAttempts, 60 * 60 * 1000);

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const ip = req.ip;

  // Check login attempts
  const attempts = loginAttempts.get(ip) || { count: 0, timestamp: Date.now() };
  
  if (attempts.count >= 5) {
    const timeSinceFirstAttempt = Date.now() - attempts.timestamp;
    if (timeSinceFirstAttempt < 24 * 60 * 60 * 1000) {
      return res.status(429).json({
        error: 'Too many login attempts',
        message: 'Please try again after 24 hours'
      });
    } else {
      // Reset after 24 hours
      loginAttempts.set(ip, { count: 0, timestamp: Date.now() });
    }
  }

  // Case-sensitive comparison
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    // Reset login attempts on successful login
    loginAttempts.delete(ip);
    
    // Generate JWT token
    const token = jwt.sign(
      { email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({ token });
  } else {
    // Increment login attempts
    attempts.count += 1;
    loginAttempts.set(ip, attempts);
    
    res.status(401).json({
      error: 'Authentication failed',
      message: 'Invalid email or password',
      attemptsLeft: 5 - attempts.count
    });
  }
});

export default router;