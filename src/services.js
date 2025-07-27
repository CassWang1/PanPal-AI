// Centralized API service functions

function handleResponse(response) {
    if (!response.ok) {
        return response.json()
            .catch(() => {
                return { message: response.statusText || 'Request failed' }; 
            })
            .then(errBody => {
                const errorMessage = errBody.message || errBody.error || `HTTP error ${response.status}`; 
                const error = new Error(errorMessage); 
                error.status = response.status;
                if (errBody.error) {
                    error.code = errBody.error;
                }
                throw error;
            });
    }
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json();
    }
    if (response.status === 200 || response.status === 201 || response.status === 204) {
        return Promise.resolve({ success: true });
    }
    return response.text();
}

// --- Session / Auth Services ---

export function fetchLogin(username) {
    return fetch('/api/sessions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
    })
    .then(handleResponse);
}

export function fetchLogout() {
    return fetch('/api/sessions', {
        method: 'DELETE',
    })
    .then(handleResponse);
}

export function fetchRegister(username) {
    return fetch('/api/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
    })
    .then(handleResponse);
}

export function checkSessionStatus() {
    return fetch('/api/session/status')
    .then(handleResponse)
    .catch(err => {
        if (err.status === 401) {
            return Promise.resolve({ isLoggedIn: false });
        }
        throw err;
    });
}


// --- Ingredient Services (User) ---

export function fetchIngredients() {
    return fetch('/api/ingredients')
    .then(handleResponse);
}

export function fetchPublicCommonIngredients() {
    return fetch('/api/ingredients/common')
        .then(handleResponse);
}

export function addIngredient(name) {
    return fetch('/api/ingredients', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
    })
    .then(handleResponse);
}

export function deleteIngredient(id) {
    return fetch(`/api/ingredients/${id}`, {
        method: 'DELETE',
    })
    .then(handleResponse);
}


// --- Recipe Services ---

export function fetchRecipeSuggestions(previousRecipes = [], preferences = {}, count = 3, mealType = null) {
    return fetch('/api/recipes/suggestions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            previousRecipes,
            preferences,
            count,
            mealType
        })
    })
    .then(handleResponse);
}

// --- Recipe History Services ---

export function fetchRecipeHistory() {
    return fetch('/api/recipes/history')
    .then(handleResponse);
}

export function addRecipeToHistory(title) {
    return fetch('/api/recipes/history', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
    })
    .then(handleResponse);
}

export function clearRecipeHistory() {
    return fetch('/api/recipes/history', {
        method: 'DELETE',
    })
    .then(handleResponse);
}

// --- Saved Recipes Services ---

export function fetchSavedRecipes() {
    return fetch('/api/recipes/saved')
    .then(handleResponse);
}

export function saveRecipe(recipeData) {
    return fetch('/api/recipes/saved', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipeData }),
    })
    .then(handleResponse);
}

export function deleteSavedRecipe(id) {
    return fetch(`/api/recipes/saved/${id}`, {
        method: 'DELETE',
    })
    .then(handleResponse);
}

export function updateSavedRecipe(recipeId, updateData) {
  return fetch(`/api/recipes/saved/${recipeId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  })
  .then(handleResponse);
}

// --- Admin Services ---

export function addCommonIngredient(category, name) {
    return fetch('/api/admin/common-ingredients', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category, name }),
    })
    .then(handleResponse);
}

export function deleteCommonIngredient(category, name) {
    const encodedCategory = encodeURIComponent(category);
    const encodedName = encodeURIComponent(name);
    return fetch(`/api/admin/common-ingredients/${encodedCategory}/${encodedName}`, {
        method: 'DELETE',
    })
    .then(handleResponse);
}

export function fetchAdminUserList() {
    return fetch('/api/admin/users')
        .then(handleResponse);
}

export function fetchToggleUserBan(userId) {
    return fetch(`/api/admin/users/${userId}/ban`, {
        method: 'PATCH',
    })
    .then(handleResponse);
}

// --- Community Services ---

export function fetchCommunityRecipes() {
    return fetch('/api/community')
        .then(handleResponse);
}

export function fetchShareRecipe(recipeData, note) {
    return fetch('/api/community/share', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipeData, note }),
    })
    .then(handleResponse);
}

export function fetchLikeRecipe(sharedRecipeId) {
    return fetch(`/api/community/${sharedRecipeId}/like`, {
        method: 'POST',
    })
    .then(handleResponse);
}

export function fetchUnlikeRecipe(sharedRecipeId) {
    return fetch(`/api/community/${sharedRecipeId}/like`, {
        method: 'DELETE',
    })
    .then(handleResponse);
}