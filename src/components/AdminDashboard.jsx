import React, { useState, useEffect } from 'react';
import {
    fetchPublicCommonIngredients,
    addCommonIngredient,
    deleteCommonIngredient,
    fetchAdminUserList,
    fetchToggleUserBan
} from '../services';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import SuccessMessage from './SuccessMessage';
import './AdminDashboard.css';

function formatDateTime(timestamp) {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString(); 
}

function formatDuration(timestamp) {
    if (!timestamp) return '';
    const now = new Date();
    const registeredDate = new Date(timestamp);
    const diffTime = Math.abs(now - registeredDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 0) {
        return `(${diffDays} day${diffDays > 1 ? 's' : ''} ago)`;
    } else if (diffHours > 0) {
        return `(${diffHours} hour${diffHours > 1 ? 's' : ''} ago)`;
    } else if (diffMinutes > 0) {
        return `(${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago)`;
    } else {
        return '(Just now)';
    }
}

function AdminDashboard({ onError }) {
    const [commonIngredients, setCommonIngredients] = useState({});
    const [isLoadingIngredients, setIsLoadingIngredients] = useState(true);
    const [addIngredientData, setAddIngredientData] = useState({ category: '', name: '' });
    const [isAddingIngredient, setIsAddingIngredient] = useState(false);
    const [isDeletingIngredient, setIsDeletingIngredient] = useState({}); 
    const [ingredientError, setIngredientError] = useState('');
    const [ingredientSuccess, setIngredientSuccess] = useState('');

    const [users, setUsers] = useState([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);
    const [userError, setUserError] = useState('');
    const [userActionState, setUserActionState] = useState({}); 

    const clearMessages = () => {
        setIngredientError('');
        setIngredientSuccess('');
        setUserError('');
        onError(''); 
    };

    const loadCommonIngredients = () => {
        setIsLoadingIngredients(true);
        fetchPublicCommonIngredients()
            .then(data => {
                setCommonIngredients(data || {});
            })
            .catch(err => {
                setIngredientError(`Failed to load common ingredients: ${err.message}`);
                onError(`Failed to load common ingredients: ${err.message}`);
            })
            .finally(() => {
                setIsLoadingIngredients(false);
            });
    };

    const loadUsers = () => {
        fetchAdminUserList()
            .then(data => {
                setUsers(data || []);
            })
            .catch(err => {
                setUserError(`Failed to load users: ${err.message}`);
            })
            .finally(() => {
            });
    }

    useEffect(() => {
        clearMessages();
        loadCommonIngredients();

        setIsLoadingUsers(true);
        loadUsers(); 
        setIsLoadingUsers(false); 

        const userPollInterval = setInterval(loadUsers, 15000);

        return () => {
            clearInterval(userPollInterval);
        };
    }, [onError]); 

    const handleAddIngredientFormChange = (e) => {
        clearMessages();
        const { name, value } = e.target;
        setAddIngredientData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddIngredientSubmit = (e) => {
        e.preventDefault();
        clearMessages();
        const { category, name } = addIngredientData;
        if (!category || !name.trim()) {
            setIngredientError('Both category and ingredient name are required.');
            return;
        }
        setIsAddingIngredient(true);
        addCommonIngredient(category, name.trim())
            .then(() => {
                setIngredientSuccess(`Ingredient '${name.trim()}' added to ${category}.`);
                setAddIngredientData({ category: '', name: '' });
                loadCommonIngredients(); 
            })
            .catch(err => {
                setIngredientError(`Failed to add ingredient: ${err.message}`);
                onError(`Failed to add ingredient: ${err.message}`);
            })
            .finally(() => {
                setIsAddingIngredient(false);
            });
    };

    const handleDeleteIngredient = (category, name) => {
        clearMessages();
        if (!window.confirm(`Are you sure you want to delete ${name} from ${category}?`)) {
            return;
        }
        const deleteKey = `${category}-${name}`;
        setIsDeletingIngredient(prev => ({ ...prev, [deleteKey]: true }));
        deleteCommonIngredient(category, name)
            .then(() => {
                setIngredientSuccess(`Ingredient '${name}' deleted from ${category}.`);
                loadCommonIngredients(); 
            })
            .catch(err => {
                setIngredientError(`Failed to delete ingredient: ${err.message}`);
                onError(`Failed to delete ingredient: ${err.message}`);
            })
            .finally(() => {
                setIsDeletingIngredient(prev => ({ ...prev, [deleteKey]: false }));
            });
    };

    const handleToggleBan = (userId) => {
        clearMessages();
        setUserActionState(prev => ({ ...prev, [userId]: { isLoading: true, error: null } }));
        fetchToggleUserBan(userId)
            .then(updatedUsers => {
                setUsers(updatedUsers || []); 
                setUserActionState(prev => ({ ...prev, [userId]: { isLoading: false, error: null } }));
            })
            .catch(err => {
                setUserActionState(prev => ({ ...prev, [userId]: { isLoading: false, error: err.message || 'Action failed' } }));
                setTimeout(() => {
                    setUserActionState(prev => ({ ...prev, [userId]: { ...prev[userId], error: null } }));
                }, 3000);
            });
    };

    return (
        <div className="admin-dashboard">
            <h2>Admin Dashboard</h2>

            <div className="admin-section common-ingredients">
                <h3>Manage Common Ingredients</h3>
                
                {ingredientSuccess && <SuccessMessage message={ingredientSuccess} />}
                {ingredientError && <ErrorMessage message={ingredientError} />}

                <div className="admin-subsection add-ingredient-section">
                    <h4>Add New Common Ingredient</h4>
                    <form onSubmit={handleAddIngredientSubmit} className="admin-add-form">
                        <div className="form-group">
                            <label htmlFor="category-select">Category:</label>
                            <select 
                                id="category-select"
                                name="category"
                                value={addIngredientData.category}
                                onChange={handleAddIngredientFormChange}
                                required
                                disabled={isAddingIngredient}
                            >
                                <option value="" disabled>Select Category</option>
                                {Object.keys(commonIngredients).sort().map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="ingredient-name-input">Ingredient Name:</label>
                            <input 
                                id="ingredient-name-input"
                                type="text"
                                name="name"
                                value={addIngredientData.name}
                                onChange={handleAddIngredientFormChange}
                                placeholder="e.g., Avocado"
                                required
                                disabled={isAddingIngredient}
                            />
                        </div>
                        <button type="submit" disabled={isAddingIngredient} className="button--primary">
                            {isAddingIngredient ? <LoadingSpinner size={20} /> : 'Add Ingredient'}
                        </button>
                    </form>
                </div>

                <div className="admin-subsection common-ingredients-list">
                    <h4>Current Common Ingredients</h4>
                    {isLoadingIngredients ? (
                        <LoadingSpinner />
                    ) : Object.keys(commonIngredients).length > 0 ? (
                        Object.entries(commonIngredients).sort(([catA], [catB]) => catA.localeCompare(catB)).map(([category, items]) => (
                            <div key={category} className="category-group">
                                <h5>{category}</h5>
                                {items && items.length > 0 ? (
                                    <ul className="ingredient-list-admin">
                                        {items.map(item => {
                                            const deleteKey = `${category}-${item}`;
                                            const isItemDeleting = isDeletingIngredient[deleteKey];
                                            return (
                                                <li key={deleteKey} className="ingredient-item-admin">
                                                    <span className="ingredient-name-admin">{item}</span>
                                                    <button 
                                                        onClick={() => handleDeleteIngredient(category, item)}
                                                        disabled={isItemDeleting}
                                                        className="delete-button-admin"
                                                        aria-label={`Delete ${item} from ${category}`}
                                                    >
                                                        {isItemDeleting ? <LoadingSpinner size={16} /> : '×'}
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                 ) : (
                                     <p className="empty-category-message">No items in this category.</p>
                                 )}
                             </div>
                        ))
                    ) : (
                        <p>No common ingredient categories found.</p>
                    )}
                </div>
            </div>

            <div className="admin-section user-management">
                <h3>User Management</h3>
                {isLoadingUsers && <LoadingSpinner />}
                {userError && <ErrorMessage message={userError} />}
                {!isLoadingUsers && users.length === 0 && !userError && <p>No users found.</p>}
                {!isLoadingUsers && users.length > 0 && (
                    <ul className="user-list">
                        {users.map(user => (
                            <li key={user.userId} className={`user-item ${user.isBanned ? 'user-item--banned' : ''}`}>
                                <div className="user-content-wrapper">
                                    <span className="user-info">
                                        <span className="user-username">{user.username}</span>
                                        {user.isAdmin && <span className="user-tag user-tag--admin">Admin</span>}
                                        {user.isBanned && <span className="user-tag user-tag--banned">Banned</span>}
                                    </span>
                                    <span className="user-registration-info">
                                        Registered: <span className="user-registered-at">{formatDateTime(user.registeredAt)}</span> <span className="user-duration">{formatDuration(user.registeredAt)}</span>
                                    </span>
                                </div>
                                <div className="user-actions">
                                    <button 
                                        onClick={() => handleToggleBan(user.userId)}
                                        disabled={userActionState[user.userId]?.isLoading}
                                        className={`button button--small ${user.isBanned ? 'button--success' : 'button--danger'}`}
                                    >
                                        {userActionState[user.userId]?.isLoading ? <LoadingSpinner size={12} /> : (user.isBanned ? 'Unban' : 'Ban')}
                                    </button>
                                    {userActionState[user.userId]?.error && (
                                        <span className="user-action-error">{userActionState[user.userId].error}</span>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            
        </div>
    );
}

export default AdminDashboard; 