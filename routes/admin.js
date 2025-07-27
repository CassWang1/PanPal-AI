'use strict';

import express from 'express';
import data from '../data.js';
import { SERVER } from '../src/constants.js';

const router = express.Router();

const isAdminMiddleware = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: SERVER.ADMIN_REQUIRED, message: 'Administrator privileges required.' });
  }
  next();
};

router.use(isAdminMiddleware);

router.get('/common-ingredients', (req, res) => {
    try {
        const commonIngredients = data.getCommonIngredients();
        res.status(200).json(commonIngredients);
    } catch (error) {
        res.status(500).json({ error: SERVER.INTERNAL_ERROR, message: 'Failed to retrieve common ingredients.' });
    }
});

router.post('/common-ingredients', (req, res) => {
    const { category, name } = req.body;
    if (!category || !name) {
        return res.status(400).json({ error: SERVER.INVALID_INPUT, message: 'Category and name are required.' });
    }

    try {
        const success = data.addCommonIngredient(category, name);
        if (success) {
            res.status(201).json({ message: `Ingredient \'${name}\' added to category \'${category}\'.` });
        } else {
            res.status(409).json({ error: SERVER.INGREDIENT_ADD_FAILED, message: `Ingredient \'${name}\' might already exist in category \'${category}\' or category is invalid.` });
        }
    } catch (error) {
        res.status(500).json({ error: SERVER.INTERNAL_ERROR, message: 'Failed to add common ingredient.' });
    }
});

router.delete('/common-ingredients/:category/:name', (req, res) => {
    const { category, name } = req.params;
    if (!category || !name) {
        return res.status(400).json({ error: SERVER.INVALID_INPUT, message: 'Category and name parameter are required.' });
    }
    const decodedCategory = decodeURIComponent(category);
    const decodedName = decodeURIComponent(name);

    try {
        const success = data.deleteCommonIngredient(decodedCategory, decodedName);
        if (success) {
            res.status(200).json({ message: `Ingredient \'${decodedName}\' deleted from category \'${decodedCategory}\'.` });
        } else {
            res.status(404).json({ error: SERVER.INGREDIENT_NOT_FOUND, message: `Ingredient \'${decodedName}\' not found in category \'${decodedCategory}\'.` });
        }
    } catch (error) {
        res.status(500).json({ error: SERVER.INTERNAL_ERROR, message: 'Failed to delete common ingredient.' });
    }
});

router.get('/users', (req, res) => {
    try {
        const users = data.getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: SERVER.INTERNAL_ERROR, message: 'Failed to retrieve users.' });
    }
});

router.patch('/users/:userId/ban', (req, res) => {
    const { userId } = req.params;
    if (!userId) {
        return res.status(400).json({ error: SERVER.MISSING_ID, message: 'Missing user ID.' });
    }

    try {
        const success = data.toggleUserBanStatus(userId);
        if (success) {
            const updatedUsers = data.getAllUsers();
            res.status(200).json(updatedUsers);
        } else {
            res.status(404).json({ error: SERVER.USER_NOT_FOUND, message: 'User not found or cannot be banned.' });
        }
    } catch (error) {
        res.status(500).json({ error: SERVER.INTERNAL_ERROR, message: 'Failed to update user ban status.' });
    }
});

export default router;