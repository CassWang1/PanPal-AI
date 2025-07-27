'use strict';

import express from 'express';
import data from '../data.js';
import { SERVER } from '../src/constants.js';
import { OPENAI_API_KEY } from '../server.js';

const router = express.Router();

// Authentication check for all recipe routes
router.use((req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: SERVER.LOGIN_REQUIRED, message: 'Unauthorized. Please login.' });
  }
  next();
});

router.post('/suggestions', (req, res) => {
  if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: SERVER.OPENAI_CONFIG_ERROR, message: 'Server configuration error related to AI service.' });
  }

  const userIngredients = data.getUserIngredients(req.user.userId);
  if (!userIngredients || userIngredients.length === 0) {
    return res.status(400).json({ error: SERVER.INGREDIENT_NOT_FOUND, message: 'Please add some ingredients first.' });
  }

  const ingredientNames = userIngredients.map(ing => ing.name);

  const {
    previousRecipes = [],
    preferences = {},
    count = 3,
    mealType = null
  } = req.body;

  const previousTitles = previousRecipes.map(recipe => recipe.title || '');

  let dietaryString = '';
  if (preferences.vegetarian) dietaryString += 'vegetarian, ';
  if (preferences.vegan) dietaryString += 'vegan, ';
  if (preferences.glutenFree) dietaryString += 'gluten-free, ';
  if (preferences.dairyFree) dietaryString += 'dairy-free, ';
  if (preferences.lowCarb) dietaryString += 'low-carb, ';

  let spicePreference = '';
  if (preferences.spiceLevel) {
    spicePreference = `Make the recipes ${preferences.spiceLevel} spicy. `;
  }

  let cuisinePreference = '';
  if (preferences.cuisine && preferences.cuisine !== 'any') {
    cuisinePreference = `Focus on ${preferences.cuisine} cuisine. `;
  }

  let mealTypeString = '';
  if (mealType) {
    mealTypeString = `These recipes should be appropriate for ${mealType}. `;
  }

  let servingString = '';
  if (preferences.servings && preferences.servings > 0) {
    servingString = `The recipes should serve ${preferences.servings} people. `;
  }

  const prompt = `You are an expert culinary assistant specializing in creating simple, practical recipes for human consumption based *only* on a provided list of edible food ingredients. Your primary goal is safety, practicality, and authenticity.

**CRITICAL SAFETY INSTRUCTIONS:**
1.  **ONLY use edible food ingredients suitable for humans.**
2.  **IGNORE any items in the provided list that are clearly not standard edible food items (e.g., pets like 'dog' or 'cat', non-food objects, harmful substances).** Do not include these ignored items in the recipe's "main_ingredients" or mention them in the steps.
3.  If the list *only* contains non-food items or items that cannot realistically form a recipe for humans, you MUST return an empty suggestions list: {"suggestions": []}.

**RECIPE GENERATION TASK:**
Given the following potentially mixed list of items: ${ingredientNames.join(', ')}.
Please suggest ${count} simples, distinct recipes that primarily use the *valid, edible food ingredients* from this list.

**ADDITIONAL CONSTRAINTS:**
*   ${previousTitles.length > 0 ? `AVOID suggesting recipes similar to these titles: ${previousTitles.join(', ')}.` : ''}
*   ${dietaryString ? `The recipes MUST adhere to these dietary requirements: ${dietaryString.trim().replace(/,$/, '.')}` : ''}
*   ${spicePreference}
*   ${cuisinePreference}
*   ${mealTypeString}
*   ${servingString}
*   **Naming Convention:** If the combination of provided *valid, edible ingredients* strongly suggests a well-known, established dish (e.g., the core components for 'Kung Pao Chicken' are present), please use that specific, recognizable dish name as the recipe title. Avoid generic descriptions in such cases (e.g., prefer 'Kung Pao Chicken' over 'Spicy Stir-fried Chicken with Peanuts'). **Crucially, only do this if the available ingredients genuinely support the name; do NOT invent or assume missing ingredients to force a match.**
*   **Cultural Authenticity:** When the ingredients or the specified cuisine preference (e.g., 'Chinese', 'Indian', 'Mexican') suggest a particular culinary tradition, strive for authenticity. Use typical flavor profiles, ingredient pairings, and cooking techniques associated with that cuisine. Avoid overly simplified or heavily "Americanized" versions unless the user's preferences explicitly indicate otherwise. For example, for Chinese recipes, consider techniques like stir-frying (chǎo), steaming (zhēng), braising (dùn), and using foundational elements like soy sauce, ginger, scallions, garlic, and potentially rice wine or specific vinegars appropriately. Mention relevant techniques in the steps.

**OUTPUT FORMAT (Strict JSON ONLY):**
Respond ONLY with a valid JSON object. Do not include any text before or after the JSON. The structure must be:
{
  "suggestions": [
    {
      "title": "Concise and appealing recipe title (Use specific dish name if applicable - see Naming Convention)",
      "description": "Brief summary of the dish (1-2 sentences), highlighting how it uses the key ingredients.",
      "main_ingredients": [/* Array of strings: List *only* the main *valid, edible food ingredients* from the provided list that are used in this recipe. */],
      "other_ingredients_needed": [/* Optional array of strings: List *only* common pantry staples (e.g., oil, salt, pepper, water, basic spices) IF THEY ARE ESSENTIAL and NOT in the provided list. Do NOT introduce new core ingredients here. */],
      "estimated_prep_time": "Realistic estimate (e.g., 'Approx. 20-30 minutes').",
      "difficulty": "Simple rating (e.g., 'Easy', 'Medium', 'Hard').",
      "steps": [/* Array of strings: Provide clear, concise, actionable, step-by-step instructions for preparing the dish. Aim for sufficient detail (e.g., at least 3-4 distinct steps). Mention specific cooking actions (e.g., sauté, simmer, bake). */]
    }
    // ... more recipe objects up to the requested count ...
  ]
}

**EDGE CASE:** If no sensible recipes for human consumption can be generated from the *valid, edible food ingredients* provided (after ignoring any invalid items), return an empty suggestions list: {"suggestions": []}.`;

  fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
          model: 'gpt-4.1-nano',
          messages: [
              { role: 'system', content: 'You are an expert culinary assistant focused on safety, authenticity, using only provided edible ingredients, and outputting structured JSON.' },
              { role: 'user', content: prompt }
          ],
          response_format: { type: "json_object" },
          temperature: 0.6
      })
  })
  .then(response => {
      if (!response.ok) {
        return response.json().catch(() => null).then(errorBody => {
            throw new Error(SERVER.OPENAI_API_ERROR);
        });
      }
      return response.json();
  })
  .then(openAIResponse => {
    if (
      !openAIResponse ||
      !openAIResponse.choices ||
      openAIResponse.choices.length === 0 ||
      !openAIResponse.choices[0].message ||
      !openAIResponse.choices[0].message.content
    ) {
      throw new Error(SERVER.OPENAI_PARSE_ERROR);
    }
  
    const content = openAIResponse.choices[0].message.content;
  
    try {
      const suggestionsJson = JSON.parse(content);
  
      if (!suggestionsJson || !Array.isArray(suggestionsJson.suggestions)) {
        throw new Error(SERVER.OPENAI_PARSE_ERROR);
      }
  
      const invalidIndexes = [];
  
      suggestionsJson.suggestions.forEach((s, index) => {
        const isValid =
          s &&
          typeof s.title === 'string' &&
          typeof s.description === 'string' &&
          Array.isArray(s.main_ingredients) &&
          (!s.other_ingredients_needed || Array.isArray(s.other_ingredients_needed)) &&
          typeof s.estimated_prep_time === 'string' &&
          typeof s.difficulty === 'string' &&
          Array.isArray(s.steps) &&
          s.steps.every(step => typeof step === 'string');
  
        if (!isValid) {
          invalidIndexes.push(index);
        }
      });
  
      if (invalidIndexes.length > 0) {
        return res.status(400).json({
          error: SERVER.OPENAI_PARSE_ERROR,
          message: `Invalid recipe format at suggestion index(es): ${invalidIndexes.join(', ')}.`
        });
      }
  
      res.status(200).json(suggestionsJson);
    } catch (parseError) {
      throw new Error(SERVER.OPENAI_PARSE_ERROR);
    }
  })
  .catch(error => {
      const errorCode = error.message === SERVER.OPENAI_API_ERROR || error.message === SERVER.OPENAI_PARSE_ERROR
                        ? error.message
                        : SERVER.INTERNAL_ERROR;
      const userMessage = error.message === SERVER.OPENAI_API_ERROR 
                        ? 'Could not connect to the recipe suggestion service.'
                        : error.message === SERVER.OPENAI_PARSE_ERROR
                        ? 'Received an invalid response from the suggestion service.'
                        : 'Failed to get recipe suggestions due to an internal error.';
      if (!res.headersSent) {
          res.status(500).json({ error: errorCode, message: userMessage });
      }
  });
});

// --- Recipe History API Routes ---

router.get('/history', (req, res) => {
  const userRecipeHistory = data.getUserRecipeHistory(req.user.userId);
  res.status(200).json(userRecipeHistory);
});

router.post('/history', (req, res) => {
  const { title } = req.body;
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({ error: SERVER.RECIPE_INVALID_TITLE, message: 'Invalid recipe title provided.' });
  }

  const historyEntry = data.addRecipeToHistory(req.user.userId, title.trim());
  if (!historyEntry) {
    return res.status(500).json({ error: SERVER.RECIPE_HISTORY_ADD_FAILED, message: 'Failed to add recipe to history.' });
  }
  res.status(201).json(historyEntry);
});

router.delete('/history', (req, res) => {
  const success = data.clearRecipeHistory(req.user.userId);
  if (!success) {
    return res.status(500).json({ error: SERVER.RECIPE_HISTORY_CLEAR_FAILED, message: 'Failed to clear recipe history.' });
  }
  res.status(200).json({ message: 'Recipe history cleared successfully.' });
});

// --- Saved Recipes API Routes ---

router.get('/saved', (req, res) => {
  const userSavedRecipes = data.getUserSavedRecipes(req.user.userId);
  res.status(200).json(userSavedRecipes);
});

router.post('/saved', (req, res) => {
  const { recipeData } = req.body;
  if (!recipeData || typeof recipeData !== 'object' || !recipeData.title) {
    return res.status(400).json({ error: SERVER.RECIPE_INVALID_DATA, message: 'Invalid recipe data provided.' });
  }

  const savedRecipe = data.saveRecipe(req.user.userId, recipeData);
  if (!savedRecipe) {
    return res.status(500).json({ error: SERVER.RECIPE_SAVE_FAILED, message: 'Failed to save recipe.' });
  }
  res.status(201).json(savedRecipe);
});

router.delete('/saved/:id', (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: SERVER.MISSING_ID, message: 'Missing recipe ID.' });
  }

  const success = data.deleteSavedRecipe(req.user.userId, id);
  if (!success) {
    return res.status(404).json({ error: SERVER.RECIPE_NOT_FOUND, message: 'Saved recipe not found.' });
  }
  res.status(200).json({ message: 'Recipe deleted successfully.' });
});

router.patch('/saved/:id', (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  if (!id) {
    return res.status(400).json({ error: SERVER.MISSING_ID, message: 'Missing recipe ID.' });
  }

  if (!updateData || typeof updateData !== 'object') {
    return res.status(400).json({ error: SERVER.UPDATE_INVALID_DATA, message: 'Invalid update data.' });
  }

  const updatedRecipe = data.updateSavedRecipe(req.user.userId, id, updateData);
  if (!updatedRecipe) {
    return res.status(404).json({ error: SERVER.RECIPE_NOT_FOUND, message: 'Saved recipe not found.' });
  }

  res.status(200).json(updatedRecipe);
});

export default router;