require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Poll Schema
const pollSchema = new mongoose.Schema({
  question: String,
  options: [
    {
      text: String,
      votes: { type: Number, default: 0 }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

const Poll = mongoose.model('Poll', pollSchema);

// Routes

// Get all polls
app.get('/polls', async (req, res) => {
  const polls = await Poll.find();
  res.json(polls);
});

// Create a new poll
app.post('/polls', async (req, res) => {
  const { question, options } = req.body;
  const poll = new Poll({ question, options });
  await poll.save();
  res.status(201).json(poll);
});

// Vote for an option
app.post('/polls/:id/vote', async (req, res) => {
  const { optionIndex } = req.body;
  const poll = await Poll.findById(req.params.id);

  if (!poll || optionIndex >= poll.options.length) {
    return res.status(400).json({ error: 'Invalid poll or option' });
  }

  poll.options[optionIndex].votes += 1;
  await poll.save();
  res.json(poll);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
