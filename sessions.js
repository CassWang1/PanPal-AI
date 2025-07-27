'use strict';

import { randomUUID } from 'crypto';

const sessions = {}; 

function addSession(userId, username, isAdmin) {
  const sid = randomUUID();
  sessions[sid] = { userId, username, isAdmin, timestamp: Date.now() };
  return sid;
}

function getSession(sid) {
  const sessionData = sessions[sid];
  if (sessionData) {
     sessionData.timestamp = Date.now(); 
  }
  return sessionData;
}

function deleteSession(sid) {
  if (sessions[sid]) {
    delete sessions[sid];
    return true;
  }
  return false;
}

export default {
  addSession,
  getSession,
  deleteSession,
};