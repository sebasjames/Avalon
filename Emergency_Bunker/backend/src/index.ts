import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// import * as admin from 'firebase-admin'; // To be implemented with GCP transition

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Mock state (In production, this would be in Firestore for real-time sync)
let globalPause = false;
let killSwitches = {
  apis: false,
  sales: false,
  backups: false,
  cronjobs: false
};

// Middleware to verify the "Two-Man Rule" or at least a strong secret for now
const verifyEmergencyAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.headers['x-emergency-token'];
  if (token !== process.env.EMERGENCY_SECRET && token !== 'TEST_SECRET_123') {
    return res.status(403).json({ error: 'Unauthorized: Protocol Defcon 1 requires valid credentials.' });
  }
  next();
};

app.get('/api/status', (req, res) => {
  res.json({
    globalPause,
    killSwitches,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/pause', verifyEmergencyAuth, (req, res) => {
  const { pause } = req.body;
  globalPause = !!pause;
  res.json({ message: `Global pause set to ${globalPause}`, globalPause });
});

app.post('/api/switch', verifyEmergencyAuth, (req, res) => {
  const { key, state } = req.body;
  if (key in killSwitches) {
    killSwitches[key as keyof typeof killSwitches] = !!state;
    res.json({ message: `Switch ${key} set to ${state}`, killSwitches });
  } else {
    res.status(400).json({ error: 'Invalid switch key' });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`[BUNKER] Emergency API running on port ${PORT}`);
});
