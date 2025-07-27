'use strict';

import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';

import sessions from './sessions.js';
import authRouter from './routes/auth.js';
import ingredientsRouter from './routes/ingredients.js';
import recipesRouter from './routes/recipes.js';
import adminRouter from './routes/admin.js';
import communityRouter from './routes/community.js';

const PORT = 3000;

// Replace with your actual OpenAI API key
export const OPENAI_API_KEY = 'INPUT_YOUR_OPENAI_API_KEY_HERE';

const app = express();

app.use(cookieParser());
app.use(express.json());

// Authentication Middleware
app.use((req, res, next) => {
  const sid = req.cookies.sid;
  if (!sid) {
    req.user = null;
    return next();
  }

  const session = sessions.getSession(sid);
  if (!session) {
    res.clearCookie('sid');
    req.user = null;
    return next();
  }

  req.user = { 
      userId: session.userId, 
      username: session.username, 
      isAdmin: session.isAdmin
  };
  next();
});

// API Routers
app.use('/api', authRouter);
app.use('/api/ingredients', ingredientsRouter);
app.use('/api/recipes', recipesRouter);
app.use('/api/admin', adminRouter);
app.use('/api/community', communityRouter);

// Static files and SPA serving
const __dirname = path.dirname(new URL(import.meta.url).pathname);
app.use(express.static(path.join(__dirname, 'dist')));

// SPA Fallback
app.get('*', (req, res) => {
  if (req.path.includes('.') && !req.path.endsWith('.html') && !req.path.startsWith('/api')) {
    res.status(404).send('Not found');
  } else {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  }
});

// Error Handling
app.use((err, req, res, next) => {
    if (!res.headersSent) {
        res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});