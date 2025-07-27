import React, { useState, useEffect } from 'react';
import {
    fetchIngredients,
    addIngredient,
    deleteIngredient,
    fetchPublicCommonIngredients
} from '../services';
import RecipePreferences from './RecipePreferences';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import './IngredientManager.css';
import { VIEWS } from '../constants';

function IngredientManager({ userId, onError, onNavigate, recipePreferences, setRecipePreferences }) {
    const [ingredients, setIngredients] = useState([]);
    const [newIngredientName, setNewIngredientName] = useState('');
    const [isListLoading, setIsListLoading] = useState(false);
    const [listError, setListError] = useState('');
    const [isAddingLoading, setIsAddingLoading] = useState(false);
    const [addError, setAddError] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [quickAddStatus, setQuickAddStatus] = useState({});
    const [showPreferences, setShowPreferences] = useState(false);
    const [preferencesTab, setPreferencesTab] = useState('dietary');
    const [categorizedCommonIngredients, setCategorizedCommonIngredients] = useState({});
    const [activeCategory, setActiveCategory] = useState(null);
    const [commonIngredientsLoading, setCommonIngredientsLoading] = useState(false);
    const [commonIngredientsError, setCommonIngredientsError] = useState('');

    useEffect(() => {
        if (!userId) return;

        setIsListLoading(true);
        setCommonIngredientsLoading(true);
        setListError('');
        setCommonIngredientsError('');
        setDeleteError('');
        setAddError('');
        setQuickAddStatus({});
        onError('');

        Promise.all([
            fetchIngredients(),
            fetchPublicCommonIngredients()
        ])
            .then(([userIngData, commonIngData]) => {
                setIngredients(userIngData || []);
                setCategorizedCommonIngredients(commonIngData || {});
                const categories = Object.keys(commonIngData || {});
                if (categories.length > 0 && !activeCategory) {
                    setActiveCategory(categories[0]);
                }
            })
            .catch(err => {
                setListError(`Failed to load some page data. User ingredients might be missing or common items unavailable: ${err.message}.`);
                setCommonIngredientsError('Could not load common items.');
                onError(`Failed to load some page data: ${err.message}`);
            })
            .finally(() => {
                setIsListLoading(false);
                setCommonIngredientsLoading(false);
            });
    }, [userId, onError]);

    const allCommonIngredientNames = React.useMemo(() => 
        Object.values(categorizedCommonIngredients).flat(), 
        [categorizedCommonIngredients]
    );

    const doesIngredientExist = (name) => {
        return ingredients.some(ing => ing.name.toLowerCase() === name.toLowerCase());
    };

    const performAddIngredient = (nameToAdd) => {
        const trimmedName = nameToAdd.trim();
        if (!trimmedName) {
            setAddError('Please enter an ingredient name.');
            return Promise.reject(new Error('Empty name'));
        }

        if (doesIngredientExist(trimmedName)) {
             setAddError(`Ingredient "${trimmedName}" already exists.`);
             if (allCommonIngredientNames.includes(trimmedName)) {
                 setQuickAddStatus(prev => ({ ...prev, [trimmedName]: { error: 'Already added' } }));
                 setTimeout(() => setQuickAddStatus(prev => ({ ...prev, [trimmedName]: null })), 2000);
             }
             return Promise.reject(new Error('Already exists'));
        }

        const isCommon = allCommonIngredientNames.includes(trimmedName);
        if (isCommon) {
             setQuickAddStatus(prev => ({ ...prev, [trimmedName]: { loading: true } }));
        } else {
            setIsAddingLoading(true);
        }
        setAddError('');
        setDeleteError('');
        onError('');

        return addIngredient(trimmedName)
            .then(newIngredient => {
                setIngredients(prevIngredients => [...prevIngredients, newIngredient]);
                if (!isCommon) {
                    setNewIngredientName('');
                }
                setQuickAddStatus(prev => ({ ...prev, [trimmedName]: { success: true } }));
                setTimeout(() => setQuickAddStatus(prev => ({ ...prev, [trimmedName]: null })), 1500);
            })
            .catch(err => {
                const errorMsg = `Failed to add: ${err.message}`;
                if (isCommon) {
                     setQuickAddStatus(prev => ({ ...prev, [trimmedName]: { error: errorMsg } }));
                     setTimeout(() => setQuickAddStatus(prev => ({ ...prev, [trimmedName]: null })), 3000);
                } else {
                    setAddError(errorMsg);
                }
                 throw err;
            })
            .finally(() => {
                 if (isCommon) {
                     setQuickAddStatus(prev => ({ ...prev, [trimmedName]: { ...prev[trimmedName], loading: false } }));
                 } else {
                     setIsAddingLoading(false);
                 }
            });
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        performAddIngredient(newIngredientName);
    };

    const handleQuickAdd = (name) => {
        performAddIngredient(name);
    };

    const handleDeleteIngredient = (idToDelete) => {
        setDeleteError('');
        setAddError('');
        setQuickAddStatus({});
        onError('');

        deleteIngredient(idToDelete)
            .then(() => {
                setIngredients(prev => prev.filter(ing => ing.id !== idToDelete));
            })
            .catch(err => {
                const msg = `Failed to delete ingredient: ${err.message}`;
                setDeleteError(msg);
            });
    };

    const handleGetSuggestions = () => {
        if (ingredients.length === 0) {
            setListError("Please add at least one ingredient before getting suggestions.");
            return;
        }

        const { vegan, dairyFree } = recipePreferences.preferences;
        if (vegan && !dairyFree) {
            onError('Validation Error: Vegan preference requires Dairy-Free to also be selected.');
            return;
        }

        setListError('');
        onError('');
        onNavigate(VIEWS.SUGGESTIONS);
    };

    const handleTogglePreferences = () => {
        setShowPreferences(!showPreferences);
    };

    const handlePreferenceChange = (prefsUpdate) => {
        setRecipePreferences(prefsUpdate);
    };

    const handleSelectPreferenceTab = (tab) => {
        setPreferencesTab(tab);
    };

    return (
        <div className={`ingredient-manager ${showPreferences ? 'with-preferences' : ''}`}>
            <div className="ingredient-column">
                <h2>My Ingredients</h2>

                {listError && <ErrorMessage message={listError} />}
                {deleteError && <ErrorMessage message={deleteError} />}

                <form onSubmit={handleFormSubmit} className="ingredient-add-form">
                    <label htmlFor="ingredient-name" className="visually-hidden">Add Ingredient Manually</label>
                    <input
                        id="ingredient-name"
                        type="text"
                        value={newIngredientName}
                        onChange={(e) => {
                            setNewIngredientName(e.target.value);
                            if (addError) setAddError('');
                            if (listError) setListError('');
                        }}
                        placeholder="Type ingredient name & press Enter or Add"
                        disabled={isAddingLoading}
                    />
                    <button type="submit" disabled={isAddingLoading || !newIngredientName.trim()}>
                        {isAddingLoading ? <LoadingSpinner size={20} /> : 'Add'}
                    </button>
                </form>
                {addError && <ErrorMessage message={addError} />}

                <div className="quick-add-section">
                    <h3 className="quick-add-title">Quick Add Common Items:</h3>
                    {commonIngredientsLoading ? (
                        <LoadingSpinner />
                    ) : commonIngredientsError ? (
                        <ErrorMessage message={commonIngredientsError} />
                    ) : Object.keys(categorizedCommonIngredients).length > 0 ? (
                        <>
                            <div className="quick-add-categories">
                                {Object.keys(categorizedCommonIngredients).sort().map(category => (
                                    <button
                                        key={category}
                                        type="button"
                                        className={`category-tab-button ${activeCategory === category ? 'active' : ''}`}
                                        onClick={() => setActiveCategory(category)}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>

                            {activeCategory && categorizedCommonIngredients[activeCategory] && (
                                <>
                                    <p className="quick-add-info">Showing common {activeCategory.toLowerCase()}:</p>
                                    <div className="quick-add-tags">
                                        {categorizedCommonIngredients[activeCategory].map(item => {
                                            const exists = doesIngredientExist(item);
                                            const status = quickAddStatus[item] || {};
                                            const isLoading = status.loading;
                                            const hasError = !!status.error;

                                            return (
                                                <button
                                                    key={item}
                                                    type="button"
                                                    className={`quick-add-tag ${exists ? 'exists' : ''} ${hasError ? 'error' : ''}`}
                                                    onClick={() => handleQuickAdd(item)}
                                                    disabled={exists || isLoading}
                                                    aria-label={exists ? `${item} (already added)` : `Add ${item}`}
                                                >
                                                    {isLoading ? <LoadingSpinner size={16} /> : item}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                         </>
                    ) : (
                        <p>Could not load common ingredients.</p>
                    )}
                </div>

                {isListLoading ? (
                    <LoadingSpinner />
                ) : ingredients.length > 0 ? (
                    <div className="ingredients-container">
                        <ul className="ingredient-list">
                            {ingredients.map(ingredient => (
                                <li key={ingredient.id} className="ingredient-item">
                                    <span className="ingredient-name">{ingredient.name}</span>
                                    <button
                                        onClick={() => handleDeleteIngredient(ingredient.id)}
                                        className="delete-button"
                                        aria-label={`Delete ${ingredient.name}`}
                                    >
                                        ×
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    !listError && <p className="ingredients-empty-message">Your ingredient list is empty. Add some items above!</p>
                )}

                <div className="recipe-options">
                    <button
                        onClick={handleTogglePreferences}
                        className={`preferences-button ${showPreferences ? 'active' : ''}`}
                        disabled={isListLoading}
                    >
                        {showPreferences ? 'Hide Preferences' : 'Set Recipe Preferences'}
                    </button>

                    <button
                        onClick={handleGetSuggestions}
                        disabled={isListLoading || ingredients.length === 0}
                        className="suggestions-button"
                    >
                        Get Recipe Suggestions
                    </button>
                </div>
            </div>

            {showPreferences && (
                <div className="preferences-sidebar">
                    <div className="preferences-header">
                        <h3>Recipe Preferences</h3>
                        <div className="preferences-tabs">
                            <button
                                className={`tab-button ${preferencesTab === 'dietary' ? 'active' : ''}`}
                                onClick={() => handleSelectPreferenceTab('dietary')}
                            >
                                Dietary
                            </button>
                            <button
                                className={`tab-button ${preferencesTab === 'meal' ? 'active' : ''}`}
                                onClick={() => handleSelectPreferenceTab('meal')}
                            >
                                Meal
                            </button>
                            <button
                                className={`tab-button ${preferencesTab === 'options' ? 'active' : ''}`}
                                onClick={() => handleSelectPreferenceTab('options')}
                            >
                                Options
                            </button>
                        </div>
                    </div>

                    <RecipePreferences
                        preferences={recipePreferences}
                        onChange={handlePreferenceChange}
                        activeTab={preferencesTab}
                    />
                </div>
            )}
        </div>
    );
}

export default IngredientManager;