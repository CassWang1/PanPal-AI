'use strict';

import { randomUUID } from 'crypto';

// Pre-populate the admin user
const users = {
  'admin': { userId: 'admin-builtin', isAdmin: true, isBanned: false, registeredAt: Date.now() - 99999999 },
  'dog':   { userId: 'user-dog-banned', isAdmin: false, isBanned: true, registeredAt: Date.now() - 55555555 } 
};

// Initialize other data structures for the admin user
const ingredients = { 'admin-builtin': [] };
const recipeHistory = { 'admin-builtin': [] };
const savedRecipes = { 'admin-builtin': [] };

// --- Sample Community Recipes ---
const sampleRecipe1 = {
    sharedRecipeId: `comm-sample-1`,
    originalRecipeData: { 
        title: "Classic Tomato Pasta", 
        description: "A simple yet delicious pasta dish.", 
        main_ingredients: ["Pasta", "Tomato Sauce", "Garlic", "Olive Oil"],
        other_ingredients_needed: ["Basil", "Parmesan Cheese"],
        estimated_prep_time: "10 minutes",
        difficulty: "Easy",
        steps: ["Boil pasta.", "Sauté garlic in olive oil.", "Add tomato sauce and simmer.", "Mix pasta with sauce.", "Top with basil and cheese."]
    },
    userId: 'user-sample-1',
    username: 'PastaPete',
    sharedAt: Date.now() - 86400000 * 2, 
    note: 'My go-to weeknight meal!', 
    likes: ['liked-by-1', 'liked-by-2', 'liked-by-3', 'liked-by-4', 'liked-by-5'], 
};

const sampleRecipe2 = {
    sharedRecipeId: `comm-sample-2`,
    originalRecipeData: { 
        title: "Spicy Chicken Stir-Fry", 
        description: "Quick and flavorful stir-fry.", 
        main_ingredients: ["Chicken Breast", "Broccoli", "Bell Pepper", "Soy Sauce"],
        other_ingredients_needed: ["Rice", "Sesame Oil", "Sriracha"],
        estimated_prep_time: "20 minutes",
        difficulty: "Medium",
        steps: ["Cook chicken.", "Stir-fry vegetables.", "Add sauce.", "Serve over rice."]
    },
    userId: 'user-sample-2',
    username: 'KitchenNinja88',
    sharedAt: Date.now() - 3600000 * 5, 
    note: 'Adjust Sriracha to your taste!', 
    likes: ['liked-by-6', 'liked-by-7'], 
};

const sampleRecipe3 = {
    sharedRecipeId: `comm-sample-3`,
    originalRecipeData: { 
        title: "Vegetarian Chili", 
        description: "Hearty and healthy chili.", 
        main_ingredients: ["Kidney Beans", "Black Beans", "Canned Tomatoes", "Onion", "Chili Powder"],
        other_ingredients_needed: ["Corn", "Bell Pepper", "Sour Cream"],
        estimated_prep_time: "15 minutes",
        difficulty: "Easy",
        steps: ["Sauté onions.", "Add beans, tomatoes, and spices.", "Simmer for 30 minutes.", "Serve with toppings."]
    },
    userId: 'user-sample-3',
    username: 'GreenEatsGal',
    sharedAt: Date.now() - 86400000 * 1, 
    note: 'Great for meal prep.', 
    likes: ['liked-by-1', 'liked-by-8', 'liked-by-9', 'liked-by-10'], 
};

const communityRecipes = [sampleRecipe1, sampleRecipe2, sampleRecipe3]; 

// --- Common Ingredients State ---
let commonIngredientsState = {
    'Veggies': [
        'Onion', 'Garlic', 'Tomato', 'Potato', 'Carrot', 'Bell Pepper', 'Broccoli', 'Spinach', 'Lettuce', 'Celery', 'Cucumber', 'Mushroom', 'Zucchini', 'Eggplant', 'Corn',
        'Scallions', 'Ginger', 'Bok Choy', 'Napa Cabbage', 'Snow Peas', 'Water Chestnuts', 'Bamboo Shoots', 'Shiitake Mushroom',
        'Jalapeño', 'Poblano Pepper', 'Avocado',
        'Artichoke', 'Olives', 'Kale', 'Arugula',
    ],
    'Fruits': [
        'Lemon', 'Lime', 'Apple', 'Banana', 'Berries', 'Orange', 'Avocado'
    ],
    'Proteins': [
        'Chicken Breast', 'Chicken Thigh', 'Ground Beef', 'Steak', 'Pork Chop', 'Bacon', 'Sausage', 'Eggs',
        'Shrimp', 'Salmon', 'Tuna (canned)', 'Cod',
        'Tofu', 'Tempeh', 'Chickpeas', 'Black Beans', 'Kidney Beans', 'Lentils', 'Edamame',
    ],
    'Grains/Starches': [
        'Rice (White)', 'Rice (Brown)', 'Pasta', 'Bread', 'Quinoa', 'Oats', 'Flour (All-Purpose)', 'Cornstarch', 'Tortillas (Flour)', 'Tortillas (Corn)', 'Potatoes', 'Sweet Potato',
    ],
    'Dairy/Fats': [
        'Milk', 'Butter', 'Cheese (Cheddar)', 'Cheese (Mozzarella)', 'Parmesan Cheese', 'Yogurt (Plain)', 'Sour Cream', 'Cream Cheese',
        'Feta Cheese', 'Greek Yogurt',
        'Olive Oil', 'Vegetable Oil', 'Sesame Oil', 'Coconut Milk', 'Peanut Butter', 'Almonds', 'Walnuts',
    ],
    'Pantry/Spices/Condiments': [
        'Salt', 'Black Pepper', 'Sugar', 'Honey', 'Maple Syrup',
        'Paprika', 'Oregano', 'Thyme', 'Rosemary', 'Bay Leaves', 'Mustard (Dijon)', 'Ketchup', 'Mayonnaise',
        'Soy Sauce', 'Hoisin Sauce', 'Oyster Sauce', 'Rice Vinegar', 'Mirin', 'Sriracha', 'Gochujang', 'Curry Powder', 'Five Spice Powder', 'Star Anise', 'Sesame Seeds',
        'Cumin', 'Chili Powder', 'Cayenne Pepper', 'Smoked Paprika', 'Salsa',
        'Balsamic Vinegar', 'Red Wine Vinegar', 'Tahini',
        'Stock (Chicken)', 'Stock (Vegetable)', 'Worcestershire Sauce', 'Canned Tomatoes', 'Tomato Paste',
    ],
    'Herbs (Fresh)': [
        'Parsley', 'Cilantro', 'Basil', 'Mint', 'Dill', 'Rosemary', 'Thyme', 'Scallions', 'Chives'
    ]
};

function getCommonIngredients() {
    return JSON.parse(JSON.stringify(commonIngredientsState));
}

function addCommonIngredient(category, name) {
    const trimmedName = name?.trim();
    if (!trimmedName || !category || !commonIngredientsState[category]) {
        return false;
    }
    if (commonIngredientsState[category].some(item => item.toLowerCase() === trimmedName.toLowerCase())) {
        return false;
    }
    commonIngredientsState[category].push(trimmedName);
    commonIngredientsState[category].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    return true;
}

function deleteCommonIngredient(category, name) {
    const trimmedName = name?.trim();
     if (!trimmedName || !category || !commonIngredientsState[category]) {
        return false;
    }
    const initialLength = commonIngredientsState[category].length;
    commonIngredientsState[category] = commonIngredientsState[category].filter(item => item.toLowerCase() !== trimmedName.toLowerCase());
    return commonIngredientsState[category].length < initialLength;
}

// --- User Functions ---

function isValidUsername(username) {
  if (!username || typeof username !== 'string') {
    return false;
  }
  const trimmedUsername = username.trim();
  const isValid = /^[a-zA-Z0-9_-]+$/.test(trimmedUsername) && trimmedUsername.length > 0;
  return isValid;
}

function findUser(username) {
  if (!username) return null;
  const user = users[username.toLowerCase()] || null;
  if (user && typeof user.isBanned === 'undefined') {
      user.isBanned = false;
  }
  return user;
}

function getAllUsers() {
    return Object.entries(users)
        .filter(([_, user]) => user.userId !== 'admin-builtin')
        .map(([username, user]) => ({
            ...user,
            username,
            isBanned: user.isBanned || false 
        }));
}

function toggleUserBanStatus(userId) {
    const userToUpdate = Object.values(users).find(user => user.userId === userId);
    if (!userToUpdate || userToUpdate.userId === 'admin-builtin') {
        return false;
    }
    userToUpdate.isBanned = !(userToUpdate.isBanned || false);
    return true;
}

function addUser(username) {
  const lowerCaseUsername = username.toLowerCase();
  if (!isValidUsername(lowerCaseUsername) || findUser(lowerCaseUsername)) {
    return null;
  }
  const userId = `user-${randomUUID()}`;
  const isAdmin = false;
  const registeredAt = Date.now();
  users[lowerCaseUsername] = { userId, isAdmin, isBanned: false, registeredAt };
  ingredients[userId] = [];
  recipeHistory[userId] = [];
  savedRecipes[userId] = [];
  return users[lowerCaseUsername];
}

function getUserId(username) {
    const user = findUser(username);
    return user ? user.userId : null;
}

// --- Ingredient Functions (User Specific) ---

function getUserIngredients(userId) {
  return ingredients[userId] || [];
}

function addIngredient(userId, ingredientName) {
  if (!userId || !ingredientName || typeof ingredientName !== 'string' || !ingredients[userId]) {
    return null;
  }
  const trimmedName = ingredientName.trim();
  if (!trimmedName) {
      return null;
  }

  const existing = ingredients[userId].find(ing => ing.name.toLowerCase() === trimmedName.toLowerCase());
  if (existing) {
    return existing;
  }

  const newIngredient = {
    id: `ing-${randomUUID()}`,
    name: trimmedName
  };
  ingredients[userId].push(newIngredient);
  return newIngredient;
}

function deleteIngredient(userId, ingredientId) {
  if (!userId || !ingredientId || !ingredients[userId]) {
    return false;
  }
  const initialLength = ingredients[userId].length;
  ingredients[userId] = ingredients[userId].filter(ing => ing.id !== ingredientId);
  return ingredients[userId].length < initialLength;
}

// --- Recipe History Functions (User Specific) ---

function getUserRecipeHistory(userId) {
  return recipeHistory[userId] || [];
}

function addRecipeToHistory(userId, title) {
  if (!userId || !title || !recipeHistory[userId]) {
    return null;
  }
  
  const newHistoryEntry = {
    id: `history-${randomUUID()}`,
    title,
    timestamp: Date.now()
  };
  
  recipeHistory[userId].unshift(newHistoryEntry);
  
  if (recipeHistory[userId].length > 20) { 
    recipeHistory[userId] = recipeHistory[userId].slice(0, 20);
  }
  
  return newHistoryEntry;
}

function clearRecipeHistory(userId) {
  if (!userId || !recipeHistory[userId]) {
    return false;
  }
  
  recipeHistory[userId] = [];
  return true;
}

// --- Saved Recipes Functions (User Specific) ---

function getUserSavedRecipes(userId) {
  return savedRecipes[userId] || [];
}

function saveRecipe(userId, recipeData) {
  if (!userId || !recipeData || !recipeData.title || !savedRecipes[userId]) {
    return null;
  }
  
  const existingIndex = savedRecipes[userId].findIndex(recipe => 
    recipe.recipeData.title.toLowerCase() === recipeData.title.toLowerCase()
  );
  
  if (existingIndex >= 0) { 
    savedRecipes[userId][existingIndex].recipeData = recipeData;
    savedRecipes[userId][existingIndex].savedAt = Date.now();
    return savedRecipes[userId][existingIndex];
  }
  
  const newSavedRecipe = {
    id: `saved-${randomUUID()}`,
    recipeData,
    savedAt: Date.now()
  };
  
  savedRecipes[userId].push(newSavedRecipe);
  return newSavedRecipe;
}

function deleteSavedRecipe(userId, recipeId) {
  if (!userId || !recipeId || !savedRecipes[userId]) {
    return false;
  }
  
  const initialLength = savedRecipes[userId].length;
  savedRecipes[userId] = savedRecipes[userId].filter(recipe => recipe.id !== recipeId);
  return savedRecipes[userId].length < initialLength;
}

function updateSavedRecipe(userId, recipeId, updateData) {
  if (!userId || !recipeId || !savedRecipes[userId] || !updateData) {
    return null;
  }
  
  const recipeIndex = savedRecipes[userId].findIndex(recipe => recipe.id === recipeId);
  
  if (recipeIndex === -1) {
    return null;
  }
  
  const updatedRecipe = {
    ...savedRecipes[userId][recipeIndex],
    recipeData: {
      ...savedRecipes[userId][recipeIndex].recipeData,
      ...updateData 
    },
    savedAt: Date.now()
  };
  
  savedRecipes[userId] = [
      ...savedRecipes[userId].slice(0, recipeIndex),
      updatedRecipe,
      ...savedRecipes[userId].slice(recipeIndex + 1)
  ];
  
  return updatedRecipe;
}

// --- Community Recipe Functions ---

function shareRecipe(userId, username, recipeData, note) {
    if (!userId || !username || !recipeData || !recipeData.title) {
        return null; 
    }
    const newSharedRecipe = {
        sharedRecipeId: `comm-${randomUUID()}`,
        originalRecipeData: JSON.parse(JSON.stringify(recipeData)), 
        userId,
        username,
        sharedAt: Date.now(),
        note: note || '', 
        likes: [], 
    };
    communityRecipes.unshift(newSharedRecipe); 
    return newSharedRecipe;
}

function getCommunityRecipes() {
    return JSON.parse(JSON.stringify(communityRecipes));
}

function findSharedRecipeIndex(sharedRecipeId) {
    return communityRecipes.findIndex(r => r.sharedRecipeId === sharedRecipeId);
}

function likeRecipe(userId, sharedRecipeId) {
    const index = findSharedRecipeIndex(sharedRecipeId);
    if (index === -1 || !userId) {
        return false; 
    }
    const recipe = communityRecipes[index];
    if (!recipe.likes.includes(userId)) {
        recipe.likes.push(userId);
        return true;
    }
    return false; 
}

function unlikeRecipe(userId, sharedRecipeId) {
     const index = findSharedRecipeIndex(sharedRecipeId);
    if (index === -1 || !userId) {
        return false;
    }
    const recipe = communityRecipes[index];
    const likeIndex = recipe.likes.indexOf(userId);
    if (likeIndex !== -1) {
        recipe.likes.splice(likeIndex, 1);
        return true;
    }
    return false;
}

export default {
  // User
  isValidUsername,
  findUser,
  addUser,
  getUserId,
  getAllUsers,
  toggleUserBanStatus,
  // User Ingredients
  getUserIngredients,
  addIngredient,
  deleteIngredient,
  // User Recipe History
  getUserRecipeHistory,
  addRecipeToHistory,
  clearRecipeHistory,
  // User Saved Recipes
  getUserSavedRecipes,
  saveRecipe,
  deleteSavedRecipe,
  updateSavedRecipe,
  // Common Ingredients (Admin)
  getCommonIngredients,
  addCommonIngredient,
  deleteCommonIngredient,
  // Community Recipes
  shareRecipe,
  getCommunityRecipes,
  likeRecipe,
  unlikeRecipe
};