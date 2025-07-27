'use strict';

import express from 'express';
import data from '../data.js';
import sessions from '../sessions.js';
import { SERVER } from '../src/constants.js';

const router = express.Router();

router.post('/users', (req, res) => {
  const { username } = req.body;
  const lowerCaseUsername = username?.toLowerCase().trim();

  if (!username || typeof username !== 'string' || !lowerCaseUsername) {
    return res.status(400).json({ error: SERVER.REQUIRED_USERNAME, message: 'Username is required.' });
  }
  
  if (lowerCaseUsername === 'admin') {
    return res.status(409).json({ error: SERVER.USERNAME_ALREADY_EXISTS, message: 'Username \'admin\' is reserved.' });
  }

  if (data.findUser(lowerCaseUsername)) {
    const message = lowerCaseUsername === 'dog' 
                    ? 'Username \'dog\' already exists and is banned.'
                    : 'Username already exists.';
    return res.status(409).json({ error: SERVER.USERNAME_ALREADY_EXISTS, message });
  }

  if (!data.isValidUsername(username)) {
    return res.status(400).json({ error: SERVER.INVALID_USERNAME, message: 'Invalid username format. Usernames must be alphanumeric.' });
  }

  const newUser = data.addUser(username);
  if (!newUser) {
    return res.status(500).json({ error: SERVER.INTERNAL_ERROR, message: 'Failed to register user.' });
  }

  res.status(201).json({ message: `User ${username} registered successfully.` });
});

router.post('/sessions', (req, res) => {
  const { username } = req.body;
  const lowerCaseUsername = username?.toLowerCase().trim();

  if (!username || !lowerCaseUsername) {
     return res.status(400).json({ error: SERVER.REQUIRED_USERNAME, message: 'Username is required.' });
  }

  const user = data.findUser(username);

  if (!user) {
    return res.status(401).json({ error: SERVER.AUTH_MISSING, message: 'Invalid login credentials.' }); 
  }
  
  if (user.isBanned) {
    return res.status(403).json({ error: SERVER.ACCOUNT_BANNED, message: 'Your account has been banned.' });
  }

  const sid = sessions.addSession(user.userId, username, user.isAdmin);
  if (!sid) {
    return res.status(500).json({ error: SERVER.INTERNAL_ERROR, message: 'Failed to create session.' });
  }

  res.cookie('sid', sid, { httpOnly: true });
  res.status(200).json({ userId: user.userId, username: username, isAdmin: user.isAdmin });
});

router.delete('/sessions', (req, res) => {
  const sid = req.cookies.sid;
  if (!sid || !req.user) {
    return res.status(401).json({ error: SERVER.AUTH_MISSING, message: 'You must be logged in to logout.' });
  }

  sessions.deleteSession(sid);
  res.clearCookie('sid');
  res.status(200).json({ message: 'Logged out successfully.' }); 
});

router.get('/session/status', (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: SERVER.AUTH_MISSING, isLoggedIn: false });
    }
    res.status(200).json({ 
        isLoggedIn: true, 
        userId: req.user.userId, 
        username: req.user.username, 
        isAdmin: req.user.isAdmin
    });
});

export default router;