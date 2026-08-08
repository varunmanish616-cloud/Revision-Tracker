import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
import dns from 'node:dns';

// Force DNS to use IPv4 first and use public Google DNS
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB database successfully'))
  .catch(err => {
    console.error('Failed to connect to MongoDB, using local storage fallback. Error:', err.message);
  });

// Schema definition
const topicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  notes: String,
  initialDate: { type: String, required: true },
  revisions: [{
    stage: { type: Number, required: true },
    date: { type: String, required: true },
    completed: { type: Boolean, default: false }
  }]
}, {
  timestamps: true
});

// Allow virtual 'id' mapping to frontend
topicSchema.virtual('id').get(function() {
  return this._id.toHexString();
});
topicSchema.set('toJSON', { virtuals: true });

const Topic = mongoose.model('Topic', topicSchema);

app.get('/api/topics', async (req, res) => {
  try {
    const topics = await Topic.find().sort({ createdAt: -1 });
    res.json(topics);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch topics: ' + err.message });
  }
});

app.post('/api/topics', async (req, res) => {
  try {
    const { title, category, notes, initialDate, revisions } = req.body;
    const newTopic = new Topic({ title, category, notes, initialDate, revisions });
    await newTopic.save();
    res.status(201).json(newTopic);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create topic: ' + err.message });
  }
});

app.put('/api/topics/:id', async (req, res) => {
  try {
    const { title, category, notes, initialDate, revisions } = req.body;
    const updated = await Topic.findByIdAndUpdate(
      req.params.id,
      { title, category, notes, initialDate, revisions },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ error: 'Topic not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update topic: ' + err.message });
  }
});

app.delete('/api/topics/:id', async (req, res) => {
  try {
    const deleted = await Topic.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Topic not found' });
    }
    res.json({ message: 'Topic deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete topic: ' + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`RecallGrid API Server running on port ${PORT}`);
});
