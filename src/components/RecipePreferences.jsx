import React, { useState, useEffect } from 'react';
import './RecipePreferences.css';

function RecipePreferences({ preferences, onChange, activeTab = 'dietary' }) {
  const [veganDairyConflictError, setVeganDairyConflictError] = useState('');

  useEffect(() => {
    const { vegan, dairyFree } = preferences.preferences;
    if (vegan && !dairyFree) {
      setVeganDairyConflictError('Note: Vegan preference selected, but Dairy-Free is not. Consider selecting Dairy-Free.');
    } else {
      setVeganDairyConflictError('');
    }
  }, [preferences.preferences.vegan, preferences.preferences.dairyFree]);

  const handlePreferenceChange = (e) => {
    const { name, value, type, checked } = e.target;
    const isCheckbox = type === 'checkbox';
    
    onChange({
      ...preferences,
      preferences: {
        ...preferences.preferences,
        [name]: isCheckbox ? checked : value
      }
    });
  };

  const handleMealTypeChange = (e) => {
    onChange({
      ...preferences,
      mealType: e.target.value === 'any' ? null : e.target.value
    });
  };

  const handleCountChange = (e) => {
    onChange({
      ...preferences,
      count: parseInt(e.target.value, 10)
    });
  };

  const renderDietaryTab = () => (
    <div className="preference-section dietary-section">
      {veganDairyConflictError && (
        <p className="preference-validation-error">{veganDairyConflictError}</p>
      )}
      <h4>Dietary Restrictions</h4>
      <div className="checkbox-group">
        <label className="preference-label">
          <input
            type="checkbox"
            name="vegetarian"
            checked={preferences.preferences.vegetarian}
            onChange={handlePreferenceChange}
          />
          <span>Vegetarian</span>
        </label>
        <label className="preference-label">
          <input
            type="checkbox"
            name="vegan"
            checked={preferences.preferences.vegan}
            onChange={handlePreferenceChange}
          />
          <span>Vegan</span>
        </label>
        <label className="preference-label">
          <input
            type="checkbox"
            name="glutenFree"
            checked={preferences.preferences.glutenFree}
            onChange={handlePreferenceChange}
          />
          <span>Gluten-Free</span>
        </label>
        <label className="preference-label">
          <input
            type="checkbox"
            name="dairyFree"
            checked={preferences.preferences.dairyFree}
            onChange={handlePreferenceChange}
          />
          <span>Dairy-Free</span>
        </label>
        <label className="preference-label">
          <input
            type="checkbox"
            name="lowCarb"
            checked={preferences.preferences.lowCarb}
            onChange={handlePreferenceChange}
          />
          <span>Low-Carb</span>
        </label>
      </div>

      <div className="preference-item">
        <h4>Cuisine</h4>
        <select 
          name="cuisine" 
          value={preferences.preferences.cuisine || 'any'}
          onChange={handlePreferenceChange}
          className="preference-select"
        >
          <option value="any">Any Cuisine</option>
          <option value="Italian">Italian</option>
          <option value="Mexican">Mexican</option>
          <option value="Asian">Asian</option>
          <option value="Chinese">Chinese</option>
          <option value="Indian">Indian</option>
          <option value="Mediterranean">Mediterranean</option>
          <option value="American">American</option>
        </select>
      </div>

      <div className="preference-item">
        <h4>Spice Level</h4>
        <select 
          name="spiceLevel" 
          value={preferences.preferences.spiceLevel || 'mild'}
          onChange={handlePreferenceChange}
          className="preference-select"
        >
          <option value="mild">Mild</option>
          <option value="medium">Medium</option>
          <option value="hot">Hot</option>
        </select>
      </div>
    </div>
  );

  const renderMealTab = () => (
    <div className="preference-section meal-section">
      <div className="preference-item">
        <h4>Meal Type</h4>
        <select 
          value={preferences.mealType || 'any'} 
          onChange={handleMealTypeChange}
          className="preference-select"
        >
          <option value="any">Any Meal</option>
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="snack">Snack</option>
          <option value="dessert">Dessert</option>
        </select>
      </div>

      <div className="preference-item">
        <h4>Servings</h4>
        <div className="serving-counter">
          <button 
            type="button" 
            onClick={() => onChange({
              ...preferences,
              preferences: {
                ...preferences.preferences,
                servings: Math.max(1, (preferences.preferences.servings || 1) - 1)
              }
            })}
            className="counter-button"
          >
            -
          </button>
          <span className="serving-count">{preferences.preferences.servings || 1}</span>
          <button 
            type="button" 
            onClick={() => onChange({
              ...preferences,
              preferences: {
                ...preferences.preferences,
                servings: Math.min(10, (preferences.preferences.servings || 1) + 1)
              }
            })}
            className="counter-button"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );

  const renderOptionsTab = () => (
    <div className="preference-section options-section">
      <div className="preference-item">
        <h4>Number of Recipes</h4>
        <div className="range-control">
          <input
            type="range"
            min="1"
            max="5"
            value={preferences.count || 3}
            onChange={handleCountChange}
            className="recipe-count-slider"
          />
          <span className="count-value">{preferences.count || 3} recipes</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="recipe-preferences-content">
      {activeTab === 'dietary' && renderDietaryTab()}
      {activeTab === 'meal' && renderMealTab()}
      {activeTab === 'options' && renderOptionsTab()}
    </div>
  );
}

export default RecipePreferences; 