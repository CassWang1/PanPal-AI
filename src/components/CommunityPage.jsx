import React, { useState, useEffect, useMemo } from 'react';
import {
    fetchCommunityRecipes,
    fetchLikeRecipe,
    fetchUnlikeRecipe
} from '../services';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import CommunityRecipeCard from './CommunityRecipeCard';
import './CommunityPage.css'; 

function CommunityPage({ onError, currentUser }) {
    const [recipes, setRecipes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorState, setErrorState] = useState('');
    const [likeStates, setLikeStates] = useState({});
    const [sortOrder, setSortOrder] = useState('mostLiked');

    const loadCommunityRecipes = () => {
        fetchCommunityRecipes()
            .then(data => setRecipes(data || []))
            .catch(() => {});
    };

    useEffect(() => {
        setIsLoading(true);
        setErrorState('');
        onError('');

        fetchCommunityRecipes() 
            .then(data => {
                setRecipes(data || []);
            })
            .catch(err => {
                setErrorState(`Failed to load community recipes: ${err.message}`);
                onError(`Failed to load community recipes: ${err.message}`);
            })
            .finally(() => {
                setIsLoading(false);
            });

        const pollInterval = setInterval(loadCommunityRecipes, 3000);

        return () => clearInterval(pollInterval);

    }, [onError]);

    const sortedRecipes = useMemo(() => {
        const recipesToSort = [...recipes];
        if (sortOrder === 'newest') {
            recipesToSort.sort((a, b) => b.sharedAt - a.sharedAt);
        } else if (sortOrder === 'mostLiked') {
            recipesToSort.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
        }
        return recipesToSort;
    }, [recipes, sortOrder]);

    const handleLikeToggle = (sharedRecipeId, currentlyLiked) => {
        const action = currentlyLiked ? fetchUnlikeRecipe : fetchLikeRecipe;
        const optimisticUpdate = (prevRecipes) => prevRecipes.map(recipe => {
            if (recipe.sharedRecipeId === sharedRecipeId) {
                const currentLikes = recipe.likes || [];
                const newLikes = currentlyLiked
                    ? currentLikes.filter(uid => uid !== currentUser.userId)
                    : [...currentLikes, currentUser.userId];
                return { ...recipe, likes: newLikes };
            }
            return recipe;
        });
        const originalRecipes = [...recipes];

        setLikeStates(prev => ({ ...prev, [sharedRecipeId]: { isLoading: true, error: null } }));
        setRecipes(optimisticUpdate);

        action(sharedRecipeId)
            .catch(err => {
                setRecipes(originalRecipes);
                setLikeStates(prev => ({ 
                    ...prev, 
                    [sharedRecipeId]: { isLoading: false, error: `Failed to ${currentlyLiked ? 'unlike' : 'like'}` }
                }));
                setTimeout(() => setLikeStates(prev => ({ ...prev, [sharedRecipeId]: { ...prev[sharedRecipeId], error: null } })), 3000);
            })
            .finally(() => {
                setLikeStates(prev => ({ ...prev, [sharedRecipeId]: { ...prev[sharedRecipeId], isLoading: false } }));
            });
    };

    return (
        <div className="community-page">
            <h2>Community Recipes</h2>
            <p className="community-description">Discover recipes shared by other PanPal AI users!</p>
            
            <div className="community-controls">
                <label htmlFor="sort-order">Sort by:</label>
                <select 
                    id="sort-order"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="sort-select"
                >
                    <option value="newest">Newest First</option>
                    <option value="mostLiked">Most Liked</option>
                </select>
            </div>

            {isLoading ? (
                <LoadingSpinner />
            ) : errorState ? (
                <ErrorMessage message={errorState} />
            ) : sortedRecipes.length > 0 ? (
                <div className="community-recipes-list">
                    {sortedRecipes.map(sharedRecipe => (
                        <CommunityRecipeCard 
                            key={sharedRecipe.sharedRecipeId} 
                            sharedRecipe={sharedRecipe}
                            currentUser={currentUser} 
                            onLikeToggle={handleLikeToggle}
                            likeStatus={likeStates[sharedRecipe.sharedRecipeId] || { isLoading: false, error: null }}
                        />
                    ))}
                </div>
            ) : (
                <p className="no-recipes-message">No recipes have been shared yet. Be the first!</p>
            )}
        </div>
    );
}

export default CommunityPage; 