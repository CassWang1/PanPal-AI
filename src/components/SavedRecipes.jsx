import React, { useState, useEffect } from 'react';
import {
  fetchSavedRecipes,
  deleteSavedRecipe,
  updateSavedRecipe,
  fetchShareRecipe
} from '../services';
import RecipeCard from './RecipeCard';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import ConfirmationModal from './ConfirmationModal';
import './SavedRecipes.css';
import { VIEWS } from '../constants';

function SavedRecipes({ onNavigate, currentUser, onError }) {
    const [savedRecipes, setSavedRecipes] = useState([]);
    const [filteredRecipes, setFilteredRecipes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteStates, setDeleteStates] = useState({});
    const [filterStatus, setFilterStatus] = useState('all'); 
    const [showShareModal, setShowShareModal] = useState(false);
    const [recipeToShare, setRecipeToShare] = useState(null);
    const [shareNote, setShareNote] = useState('');
    const [isSharing, setIsSharing] = useState(false);
    const [shareError, setShareError] = useState('');
    const [shareSuccess, setShareSuccess] = useState('');

    useEffect(() => {
        fetchSavedRecipes()
            .then(recipes => {
                setSavedRecipes(recipes);
                setFilteredRecipes(recipes);
            })
            .catch(err => {
                setError(`Failed to load saved recipes: ${err.message}`);
                onError(`Failed to load saved recipes: ${err.message}`);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [onError]);

    useEffect(() => {
        filterRecipes(filterStatus);
    }, [savedRecipes, filterStatus]);

    const filterRecipes = (status) => {
        let filtered = [...savedRecipes];
        
        if (status === 'completed') {
            filtered = filtered.filter(recipe => recipe.recipeData.completed);
        } else if (status === 'uncompleted') {
            filtered = filtered.filter(recipe => !recipe.recipeData.completed);
        }
        
        setFilteredRecipes(filtered);
    };

    const handleFilterChange = (status) => {
        setFilterStatus(status);
    };

    const handleDeleteRecipe = (recipeId) => {
        if (window.confirm(`Are you sure you want to remove this recipe from your saved recipes?`)) {
            setDeleteStates(prev => ({
                ...prev,
                [recipeId]: { isLoading: true, error: '' }
            }));

            deleteSavedRecipe(recipeId)
                .then(() => {
                    setSavedRecipes(prevRecipes => 
                        prevRecipes.filter(recipe => recipe.id !== recipeId)
                    );
                })
                .catch(err => {
                    setDeleteStates(prev => ({
                        ...prev,
                        [recipeId]: { isLoading: false, error: `Failed to delete: ${err.message}` }
                    }));
                    
                    setTimeout(() => {
                        setDeleteStates(prev => {
                            if (!prev[recipeId]) return prev;
                            return {
                                ...prev,
                                [recipeId]: { ...prev[recipeId], error: '' }
                            };
                        });
                    }, 3000);
                })
                .finally(() => {
                    setDeleteStates(prev => ({
                        ...prev,
                        [recipeId]: { ...prev[recipeId], isLoading: false }
                    }));
                });
        }
    };

    const handleToggleCompleted = (recipeId) => {
        const recipe = savedRecipes.find(r => r.id === recipeId);
        if (!recipe) return;
        
        const updatedRecipe = {
            ...recipe,
            recipeData: {
                ...recipe.recipeData,
                completed: !recipe.recipeData.completed
            }
        };
        
        setSavedRecipes(prevRecipes => 
            prevRecipes.map(r => r.id === recipeId ? updatedRecipe : r)
        );
        
        updateSavedRecipe(recipeId, { completed: updatedRecipe.recipeData.completed })
            .catch(err => {
                setSavedRecipes(prevRecipes => 
                    prevRecipes.map(r => r.id === recipeId ? recipe : r)
                );
                onError(`Failed to update completion status: ${err.message}`);
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

        setIsSharing(true);
        setShareError('');
        setShareSuccess('');
        onError('');

        fetchShareRecipe(recipeToShare.recipeData, shareNote)
            .then(() => {
                setShareSuccess(`Successfully shared "${recipeToShare.recipeData.title}"!`);
                setTimeout(() => {
                    closeShareModal();
                    setShareSuccess('');
                }, 2000);
            })
            .catch(err => {
                setShareError(`Failed to share recipe: ${err.message}`);
                onError(`Failed to share recipe: ${err.message}`);
            })
            .finally(() => {
                setIsSharing(false);
            });
    };

    const handleGoBack = () => {
        onNavigate(VIEWS.INGREDIENTS);
    };

    const handleGetNewSuggestions = () => {
        onNavigate(VIEWS.SUGGESTIONS);
    };

    return (
        <div className="saved-recipes">
            <h2>My Saved Recipes</h2>

            <div className="saved-recipes-controls">
                <button onClick={handleGoBack} className="button--outline">Back to Ingredients</button>
                <button onClick={handleGetNewSuggestions} className="button--primary">Get New Suggestions</button>
            </div>

            {isLoading ? (
                <LoadingSpinner />
            ) : error ? (
                <ErrorMessage message={error} />
            ) : savedRecipes.length > 0 ? (
                <>
                    <div className="recipe-filter">
                        <span className="filter-label">Filter:</span>
                        <div className="filter-buttons">
                            <button 
                                className={`filter-button ${filterStatus === 'all' ? 'active' : ''}`} 
                                onClick={() => handleFilterChange('all')}
                            >
                                All
                            </button>
                            <button 
                                className={`filter-button ${filterStatus === 'completed' ? 'active' : ''}`} 
                                onClick={() => handleFilterChange('completed')}
                            >
                                Cooked
                            </button>
                            <button 
                                className={`filter-button ${filterStatus === 'uncompleted' ? 'active' : ''}`} 
                                onClick={() => handleFilterChange('uncompleted')}
                            >
                                Not Cooked
                            </button>
                        </div>
                    </div>

                    {filteredRecipes.length === 0 ? (
                        <p className="no-results-message">No recipes match the current filter.</p>
                    ) : (
                        <div className="saved-recipes-list">
                            {filteredRecipes.map(recipe => {
                                const deleteState = deleteStates[recipe.id] || { isLoading: false, error: '' };
                                
                                const actionButton = {
                                    onClick: () => handleDeleteRecipe(recipe.id),
                                    disabled: deleteState.isLoading,
                                    isLoading: deleteState.isLoading,
                                    text: 'Remove Recipe',
                                    error: deleteState.error,
                                    className: 'delete-button'
                                };
                                
                                const metadata = (
                                    <div className="recipe-saved-info">
                                        <span className="saved-date">
                                            Saved on: {new Date(recipe.savedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                );
                                
                                return (
                                    <RecipeCard 
                                        key={recipe.id} 
                                        recipe={recipe.recipeData}
                                        actionButton={actionButton}
                                        metadata={metadata}
                                        isSaved={true}
                                        onToggleCompleted={() => handleToggleCompleted(recipe.id)}
                                        showShareButton={true}
                                        onShare={() => openShareModal(recipe)}
                                    />
                                );
                            })}
                        </div>
                    )}
                </>
            ) : (
                <div className="no-saved-recipes">
                    <p>You haven't saved any recipes yet.</p>
                    <button onClick={handleGetNewSuggestions} className="button--primary">
                        Get Recipe Suggestions
                    </button>
                </div>
            )}

            {showShareModal && recipeToShare && (
                <ConfirmationModal
                    title={`Share "${recipeToShare.recipeData.title}"?`}
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

export default SavedRecipes;