export const VIEWS = {
  INGREDIENTS: 'ingredients',
  SUGGESTIONS: 'suggestions',
  SAVED_RECIPES: 'saved_recipes',
  ADMIN: 'admin',
  COMMUNITY: 'community',
};

export const SERVER = {
  AUTH_MISSING: 'auth-missing',
  AUTH_INSUFFICIENT: 'auth-insufficient',
  REQUIRED_USERNAME: 'required-username',
  USERNAME_ALREADY_EXISTS: 'username-already-exists',
  INVALID_USERNAME: 'invalid-username',
  LOGIN_REQUIRED: 'login-required',
  ADMIN_REQUIRED: 'admin-required',
  INGREDIENT_INVALID_NAME: 'ingredient-invalid-name',
  INGREDIENT_DUPLICATE: 'ingredient-duplicate',
  INGREDIENT_NOT_FOUND: 'ingredient-not-found',
  INGREDIENT_ADD_FAILED: 'ingredient-add-failed',
  RECIPE_INVALID_TITLE: 'recipe-invalid-title',
  RECIPE_HISTORY_ADD_FAILED: 'recipe-history-add-failed',
  RECIPE_HISTORY_CLEAR_FAILED: 'recipe-history-clear-failed',
  RECIPE_SAVE_FAILED: 'recipe-save-failed',
  RECIPE_INVALID_DATA: 'recipe-invalid-data',
  RECIPE_NOT_FOUND: 'recipe-not-found',
  RECIPE_SHARE_FAILED: 'recipe-share-failed',
  RECIPE_LIKE_FAILED: 'recipe-like-failed',
  RECIPE_UNLIKE_FAILED: 'recipe-unlike-failed',
  MISSING_ID: 'missing-id',
  UPDATE_INVALID_DATA: 'update-invalid-data',
  INVALID_INPUT: 'invalid-input',
  OPENAI_CONFIG_ERROR: 'openai-config-error',
  OPENAI_API_ERROR: 'openai-api-error',
  OPENAI_PARSE_ERROR: 'openai-parse-error',
  INTERNAL_ERROR: 'internal-error',
};

export const CLIENT = {
  NETWORK_ERROR: 'networkError',
  NO_SESSION: 'noSession',
};

export const LOGIN_STATUS = {
  PENDING: 'pending',
  NOT_LOGGED_IN: 'notLoggedIn',
  IS_LOGGED_IN: 'loggedIn',
};