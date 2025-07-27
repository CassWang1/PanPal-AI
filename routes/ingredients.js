'use strict';

import express from 'express';
import data from '../data.js';
import { SERVER } from '../src/constants.js';

const router = express.Router();

router.get('/common', (req, res) => {
    try {
        const commonIngredients = data.getCommonIngredients();
        res.status(200).json(commonIngredients);
    } catch (error) {
        res.status(500).json({ error: SERVER.INTERNAL_ERROR, message: 'Failed to retrieve common ingredients.' });
    }
});

router.use((req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: SERVER.LOGIN_REQUIRED, message: 'Unauthorized. Please login.' });
  }
  next();
});

router.get('/', (req, res) => {
  const userIngredients = data.getUserIngredients(req.user.userId);
  res.status(200).json(userIngredients);
});

router.post('/', (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: SERVER.INGREDIENT_INVALID_NAME, message: 'Invalid ingredient name provided.' });
  }

  const newIngredient = data.addIngredient(req.user.userId, name.trim());
  if (!newIngredient) {
      const userIngredients = data.getUserIngredients(req.user.userId);
      const existing = userIngredients.find(ing => ing.name.toLowerCase() === name.trim().toLowerCase());
      if (existing) {
          return res.status(409).json({ error: SERVER.INGREDIENT_DUPLICATE, message: `Ingredient "${name.trim()}" already exists.` });
      }
      return res.status(500).json({ error: SERVER.INTERNAL_ERROR, message: 'Failed to add ingredient.' });
  }
  res.status(201).json(newIngredient);
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: SERVER.MISSING_ID, message: 'Missing ingredient ID.' });
  }

  const success = data.deleteIngredient(req.user.userId, id);

  if (!success) {
    return res.status(404).json({ error: SERVER.INGREDIENT_NOT_FOUND, message: 'Ingredient not found.' });
  }

  res.status(200).json({ message: 'Ingredient deleted successfully.' });
});

export default router;