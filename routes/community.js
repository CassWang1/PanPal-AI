'use strict';

import express from 'express';
import data from '../data.js';
import { SERVER } from '../src/constants.js';

const router = express.Router();

router.use((req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: SERVER.LOGIN_REQUIRED, message: 'Login required for community actions.' });
  }
  next();
});

router.get('/', (req, res) => {
    try {
        const recipes = data.getCommunityRecipes();
        res.status(200).json(recipes);
    } catch (error) {
        res.status(500).json({ error: SERVER.INTERNAL_ERROR, message: 'Failed to retrieve community recipes.' });
    }
});

router.post('/share', (req, res) => {
    const { recipeData, note } = req.body;
    if (!recipeData || !recipeData.title) {
         return res.status(400).json({ error: SERVER.RECIPE_INVALID_DATA, message: 'Valid recipe data is required to share.' });
    }

    try {
        const shared = data.shareRecipe(req.user.userId, req.user.username, recipeData, note);
        if (!shared) {
             return res.status(400).json({ error: SERVER.RECIPE_SHARE_FAILED, message: 'Failed to share recipe due to invalid data.' }); 
        }
        res.status(201).json(shared);
    } catch (error) {
        res.status(500).json({ error: SERVER.INTERNAL_ERROR, message: 'Failed to share recipe.' });
    }
});

router.post('/:sharedRecipeId/like', (req, res) => {
    const { sharedRecipeId } = req.params;
    try {
        const success = data.likeRecipe(req.user.userId, sharedRecipeId);
        if (success) {
            res.status(200).json({ message: 'Recipe liked.' });
        } else {
            res.status(409).json({ error: SERVER.RECIPE_LIKE_FAILED, message: 'Recipe not found or already liked.' });
        }
    } catch (error) {
         res.status(500).json({ error: SERVER.INTERNAL_ERROR, message: 'Failed to like recipe.' });
    }
});

router.delete('/:sharedRecipeId/like', (req, res) => {
    const { sharedRecipeId } = req.params;
     try {
        const success = data.unlikeRecipe(req.user.userId, sharedRecipeId);
        if (success) {
            res.status(200).json({ message: 'Recipe unliked.' });
        } else {
            res.status(404).json({ error: SERVER.RECIPE_UNLIKE_FAILED, message: 'Recipe not found or not liked by user.' });
        }
    } catch (error) {
         res.status(500).json({ error: SERVER.INTERNAL_ERROR, message: 'Failed to unlike recipe.' });
    }
});

export default router;