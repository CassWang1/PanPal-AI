import React from 'react';
import RecipeCard from './RecipeCard';
import LoadingSpinner from './LoadingSpinner';
import './CommunityRecipeCard.css';

function CommunityRecipeCard({ 
    sharedRecipe, 
    currentUser, 
    onLikeToggle, 
    likeStatus 
}) {
    const { 
        sharedRecipeId, 
        originalRecipeData, 
        userId, 
        username,
        sharedAt, 
        note, 
        likes 
    } = sharedRecipe;

    const formattedDate = new Date(sharedAt).toLocaleDateString();
    const likeCount = likes ? likes.length : 0;
    const userHasLiked = currentUser && likes && likes.includes(currentUser.userId);

    const handleLikeClick = () => {
        if (onLikeToggle) {
            onLikeToggle(sharedRecipeId, userHasLiked);
        }
    };

    return (
        <div className="community-recipe-card-wrapper">
            <div className="community-card-header-info">
                <span className="sharer-info">Shared by: <strong>{username || 'Unknown User'}</strong></span>
                <span className="shared-date"> on {formattedDate}</span>
            </div>
            
            {note && <p className="shared-note-standalone">{note}</p>}
            
            <RecipeCard 
                recipe={originalRecipeData} 
                isSaved={false} 
                onToggleCompleted={null}
                hideActions={true} 
            />
            
            <div className="community-card-footer">
                <button 
                    onClick={handleLikeClick}
                    disabled={likeStatus?.isLoading}
                    className={`like-button ${userHasLiked ? 'liked' : ''}`}
                    aria-pressed={userHasLiked}
                >
                    {likeStatus?.isLoading ? (
                        <LoadingSpinner size={16} /> 
                    ) : (
                         userHasLiked ? 'Unlike' : 'Like'
                    )}
                </button>
                <span className="like-count">{likeCount} {likeCount === 1 ? 'Like' : 'Likes'}</span>
                {likeStatus?.error && <span className="action-error like-error">{likeStatus.error}</span>}
            </div>
        </div>
    );
}

export default CommunityRecipeCard; 