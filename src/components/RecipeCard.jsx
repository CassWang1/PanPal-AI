import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import './RecipeCard.css';

function RecipeCard({ 
  recipe, 
  actionButton = null,
  metadata = null,
  isSaved = false,
  onToggleCompleted = null,
  showShareButton = false,
  onShare = null,
  isSharing = false,
  shareError = null,
  hideActions = false
}) {
  const handleToggleCompleted = () => {
    if (onToggleCompleted) {
      onToggleCompleted();
    }
  };

  const handleShareClick = () => {
    if (onShare) {
      onShare();
    }
  };

  const hasActions = actionButton || (showShareButton && onShare);

  return (
    <div className="recipe-card">
      <div className="recipe-card__header">
        <h3 className="recipe-title">{recipe.title}</h3>
        <div className="recipe-tags">
          {recipe.difficulty && <span className="tag tag--difficulty">{recipe.difficulty}</span>}
          {recipe.estimated_prep_time && <span className="tag tag--time">{recipe.estimated_prep_time}</span>}
        </div>
      </div>
      
      <p className="recipe-description">{recipe.description}</p>

      <div className="recipe-card__content">
        {metadata && (
          <div className="recipe-meta">
            {metadata}
            {isSaved && onToggleCompleted && (
              <div className="recipe-completion">
                <label className="completion-label">
                  <input 
                    type="checkbox" 
                    checked={recipe.completed || false} 
                    onChange={handleToggleCompleted}
                  />
                  <span>{recipe.completed ? "Cooked ✓" : "Mark as cooked"}</span>
                </label>
              </div>
            )}
          </div>
        )}

        {recipe.main_ingredients && recipe.main_ingredients.length > 0 && (
          <div className="recipe-section recipe-ingredients">
            <h4>Main Ingredients:</h4>
            <ul>
              {recipe.main_ingredients.map((ing, i) => (
                <li key={`main-${i}`}>{ing}</li>
              ))}
            </ul>
          </div>
        )}

        {recipe.other_ingredients_needed && recipe.other_ingredients_needed.length > 0 && (
          <div className="recipe-section recipe-ingredients-other">
            <h4>Other Common Ingredients Needed:</h4>
            <ul>
              {recipe.other_ingredients_needed.map((ing, i) => (
                <li key={`other-${i}`}>{ing}</li>
              ))}
            </ul>
          </div>
        )}

        {recipe.steps && recipe.steps.length > 0 && (
          <div className="recipe-section recipe-steps">
            <h4>Steps:</h4>
            <ol className="steps-list">
              {recipe.steps.map((step, i) => (
                <li key={`step-${i}`}>{step}</li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {!hideActions && hasActions && (
        <div className="recipe-actions">
          {actionButton && (
            <button 
              onClick={actionButton.onClick}
              disabled={actionButton.disabled}
              className={`action-button ${actionButton.className || ''}`}
            >
              {actionButton.isLoading ? <LoadingSpinner size={16} /> : actionButton.text}
            </button>
          )}
          {actionButton && actionButton.error && <span className="action-error">{actionButton.error}</span>}

          {showShareButton && onShare && (
            <button 
              onClick={handleShareClick}
              disabled={isSharing}
              className="action-button button--secondary share-button"
            >
              {isSharing ? <LoadingSpinner size={16} /> : 'Share to Community'}
            </button>
          )}
          {showShareButton && shareError && <span className="action-error share-error">{shareError}</span>}
        </div>
      )}
    </div>
  );
}

export default RecipeCard; 