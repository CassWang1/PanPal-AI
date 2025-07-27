import React, { useState, useEffect } from 'react';
import {
    fetchRecipeSuggestions,
    fetchRecipeHistory,
    addRecipeToHistory,
    saveRecipe,
    fetchShareRecipe
} from '../services';
import RecipeCard from './RecipeCard';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import ConfirmationModal from './ConfirmationModal';
import './RecipeSuggestions.css';
import { VIEWS } from '../constants';

const RECIPES_PER_PAGE = 3;

function RecipeSuggestions({ userId, onError, onNavigate, preferences }) {
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [visibleCount, setVisibleCount] = useState(RECIPES_PER_PAGE);
    const [recipeHistory, setRecipeHistory] = useState([]);
    const [saveStates, setSaveStates] = useState({}); 
    const [showShareModal, setShowShareModal] = useState(false);
    const [recipeToShare, setRecipeToShare] = useState(null);
    const [shareNote, setShareNote] = useState('');
    const [isSharing, setIsSharing] = useState(false);
    const [shareError, setShareError] = useState('');
    const [shareSuccess, setShareSuccess] = useState('');
    const [shareStatePerCard, setShareStatePerCard] = useState({});

    useEffect(() => {
        fetchRecipeHistory()
            .then(history => {
                setRecipeHistory(history);
            })
            .catch(() => {
                setError('Could not load recipe history. Please try again.');
            });
    }, []);

    useEffect(() => {
        fetchSuggestions();
    }, []); 

    const fetchSuggestions = () => {
        setIsLoading(true);
        setError('');
        onError(''); 
        setVisibleCount(RECIPES_PER_PAGE); 
        setSaveStates({}); 
        setShareStatePerCard({});

        const previousRecipes = recipeHistory.map(entry => ({ title: entry.title }));

        fetchRecipeSuggestions(
            previousRecipes,
            preferences.preferences,
            preferences.count,
            preferences.mealType
        )
            .then(data => {
                if (data && data.suggestions) {
                    const suggestionsWithIds = data.suggestions.map((s, idx) => ({ ...s, tempId: `sugg-${idx}` }));
                    setSuggestions(suggestionsWithIds); 
                    
                    if (suggestionsWithIds.length > 0) {
                        addRecipeToHistory(suggestionsWithIds[0].title)
                            .then(newHistory => {
                                setRecipeHistory(prevHistory => [newHistory, ...prevHistory]);
                            })
                            .catch(() => {
                            });
                    }
                    
                    if (suggestionsWithIds.length === 0) {
                        setError("Couldn't find specific recipes. Try adding more/different ingredients!");
                    }
                } else {
                    setError('Received an unexpected format for recipe suggestions.');
                    setSuggestions([]);
                }
            })
            .catch(err => {
                const message = `Please try again later. Failed to get recipe suggestions: ${err.message}`;
                setError(message);
                onError(message); 
                setSuggestions([]);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const handleGoBack = () => {
        onNavigate(VIEWS.INGREDIENTS);
    };

    const handleTryAgain = () => {
        fetchSuggestions();
    };

    const handleLoadMore = () => {
        setVisibleCount(prevCount => prevCount + RECIPES_PER_PAGE);
    };

    const handleSaveRecipe = (recipeId, recipe) => {
        setSaveStates(prev => ({
            ...prev,
            [recipeId]: { isLoading: true, error: '', success: false }
        }));

        saveRecipe(recipe)
            .then(() => {
                setSaveStates(prev => ({
                    ...prev,
                    [recipeId]: { isLoading: false, error: '', success: true }
                }));
                setTimeout(() => {
                    setSaveStates(prev => ({ ...prev, [recipeId]: { ...prev[recipeId], success: false } }));
                }, 3000);
            })
            .catch(err => {
                setSaveStates(prev => ({
                    ...prev,
                    [recipeId]: { isLoading: false, error: `Failed to save: ${err.message}`, success: false }
                }));
                setTimeout(() => {
                    setSaveStates(prev => ({ ...prev, [recipeId]: { ...prev[recipeId], error: '' } }));
                }, 3000);
            });
    };

    const openShareModal = (recipe) => {
        setRecipeToShare(recipe);
        setShareNote('');
        setShareError('');
        setShareSuccess('');
        setShowShareModal(true);
    };

    const closeShareModal = () => {
        setShowShareModal(false);
        setRecipeToShare(null);
    };

    const handleConfirmShare = () => {
        if (!recipeToShare) return;
        const cardId = recipeToShare.tempId;

        setIsSharing(true);
        setShareError('');
        setShareSuccess('');
        setShareStatePerCard(prev => ({ ...prev, [cardId]: { isLoading: true, error: null } }));
        onError(''); 

        fetchShareRecipe(recipeToShare, shareNote)
            .then(() => {
                setShareSuccess(`Successfully shared "${recipeToShare.title}"!`);
                setTimeout(() => {
                   closeShareModal();
                   setShareSuccess(''); 
                }, 2000);
            })
            .catch(err => {
                const errorMsg = `Failed to share: ${err.message}`;
                setShareError(errorMsg);
                setShareStatePerCard(prev => ({ ...prev, [cardId]: { isLoading: false, error: errorMsg } }));
                onError(errorMsg);
                
                setTimeout(() => setShareStatePerCard(prev => ({ ...prev, [cardId]: { ...prev[cardId], error: null } })), 3000);
            })
            .finally(() => {
                setIsSharing(false);
                setShareStatePerCard(prev => ({ ...prev, [cardId]: { ...prev[cardId], isLoading: false } }));
            });
    };

    const visibleSuggestions = suggestions.slice(0, visibleCount);
    const canLoadMore = visibleCount < suggestions.length;

    return (
        <div className="recipe-suggestions">
            <h2>Recipe Suggestions</h2>

            <div className="suggestions-controls">
                <button onClick={handleGoBack} className="button--outline">Back to Ingredients</button>
                {(error || suggestions.length === 0) && !isLoading && (
                    <button onClick={handleTryAgain} disabled={isLoading} className="button--secondary">
                        {isLoading ? <LoadingSpinner size={20} /> : 'Try Again'}
                    </button>
                )}
            </div>

            {isLoading && visibleSuggestions.length === 0 ? (
                <LoadingSpinner />
            ) : error && visibleSuggestions.length === 0 ? (
                <ErrorMessage message={error} />
            ) : (
                <>
                    <div className="suggestions-list">
                        {visibleSuggestions.map((recipe) => {
                            const cardId = recipe.tempId;
                            const saveState = saveStates[cardId] || { isLoading: false, error: '', success: false };
                            const shareState = shareStatePerCard[cardId] || { isLoading: false, error: null };
                            
                            const actionButton = {
                                onClick: () => handleSaveRecipe(cardId, recipe),
                                disabled: saveState.isLoading || saveState.success,
                                isLoading: saveState.isLoading,
                                text: saveState.success ? 'Saved ✓' : 'Save Recipe',
                                error: saveState.error,
                                className: `save-button ${saveState.success ? 'saved' : ''}`
                            };
                            
                            return (
                                <RecipeCard 
                                    key={cardId}
                                    recipe={recipe}
                                    actionButton={actionButton}
                                    showShareButton={true}
                                    onShare={() => openShareModal(recipe)}
                                    isSharing={shareState.isLoading}
                                    shareError={shareState.error}
                                />
                            );
                        })}
                    </div>

                    {canLoadMore && (
                        <div className="load-more-action">
                            <button onClick={handleLoadMore} disabled={isLoading}>
                                Load More Recipes
                            </button>
                        </div>
                    )}

                    {!isLoading && !error && suggestions.length === 0 && (
                        <p className="no-suggestions-message">No suggestions generated. Try adding more ingredients!</p>
                    )}
                </>
            )}
            
            {showShareModal && recipeToShare && (
                <ConfirmationModal
                    title={`Share "${recipeToShare.title}"?`}
                    confirmText="Share Now"
                    cancelText="Cancel"
                    onConfirm={handleConfirmShare}
                    onCancel={closeShareModal}
                    isLoading={isSharing}
                    error={shareError}
                    successMessage={shareSuccess}
                >
                    <div className="share-note-input">
                        <label htmlFor="share-note">Add an optional note:</label>
                        <textarea 
                            id="share-note"
                            value={shareNote}
                            onChange={(e) => setShareNote(e.target.value)}
                            rows="3"
                            placeholder="Why did you like this recipe?"
                        />
                    </div>
                </ConfirmationModal>
            )}
        </div>
    );
}

export default RecipeSuggestions;