import { useState, useEffect } from 'react'
import './App.css'
import './index.css'
import Login from './components/Login'
import Header from './components/Header'
import IngredientManager from './components/IngredientManager'
import RecipeSuggestions from './components/RecipeSuggestions'
import SavedRecipes from './components/SavedRecipes'
import LoadingSpinner from './components/LoadingSpinner'
import ErrorMessage from './components/ErrorMessage'
import Footer from './components/Footer'
import AdminDashboard from './components/AdminDashboard'
import CommunityPage from './components/CommunityPage'

import {
  checkSessionStatus,
  fetchLogout,
  fetchLogin,
  fetchRegister
} from './services'

import { VIEWS, LOGIN_STATUS, CLIENT, SERVER } from './constants';

const PATHS = {
  LOGIN: '/',
  INGREDIENTS: '/ingredients',
  SUGGESTIONS: '/suggestions',
  SAVED_RECIPES: '/saved-recipes',
  ADMIN: '/admin',
  COMMUNITY: '/community',
};

const getViewFromPath = (path) => {
  for (const view in PATHS) {
    if (PATHS[view] === path) {
      const viewKey = Object.keys(VIEWS).find(key => key === view);
      return VIEWS[viewKey] || view;
    }
  }
  return VIEWS.INGREDIENTS;
};

function App() {
  const [loginStatus, setLoginStatus] = useState(LOGIN_STATUS.PENDING)
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentView, setCurrentView] = useState(() => getViewFromPath(window.location.pathname))
  const [loginMessage, setLoginMessage] = useState('')
  const [recipePreferences, setRecipePreferences] = useState({
    preferences: {},
    mealType: null,
    count: 3
  })

  useEffect(() => {
    const handlePopState = (event) => {
      const newPath = window.location.pathname;
      const targetView = getViewFromPath(newPath);
      if (loginStatus === LOGIN_STATUS.IS_LOGGED_IN && targetView !== currentView) {
         if (targetView === VIEWS.ADMIN && !currentUser?.isAdmin) {
             window.history.replaceState(null, '', PATHS.INGREDIENTS);
             setCurrentView(VIEWS.INGREDIENTS);
             setError('Access Denied: Admin privileges required.');
         } else {
             setCurrentView(targetView);
             setError('');
         }
      } else if (loginStatus !== LOGIN_STATUS.IS_LOGGED_IN && newPath !== PATHS.LOGIN) {
          window.history.replaceState(null, '', PATHS.LOGIN);
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [loginStatus, currentView, currentUser]);


  useEffect(() => {
    let isMounted = true;
    setError('');
    setLoginStatus(LOGIN_STATUS.PENDING);
    checkSessionStatus()
      .then(sessionInfo => {
        if (!isMounted) return;
        if (sessionInfo.isLoggedIn) {
          setLoginStatus(LOGIN_STATUS.IS_LOGGED_IN);
          setCurrentUser({ 
              userId: sessionInfo.userId, 
              username: sessionInfo.username, 
              isAdmin: sessionInfo.isAdmin
          });
          const currentPath = window.location.pathname;
          let targetView;
          
          if (currentPath === PATHS.LOGIN) {
              targetView = VIEWS.INGREDIENTS; 
          } else {
              targetView = getViewFromPath(currentPath);
          }
          
          if (targetView === VIEWS.ADMIN && !sessionInfo.isAdmin) {
              targetView = VIEWS.INGREDIENTS;
              setError('Access Denied: Admin privileges required.');
          }

          const targetPath = PATHS[Object.keys(VIEWS).find(key => VIEWS[key] === targetView)] || PATHS.INGREDIENTS;
          setCurrentView(targetView);
          
          if (currentPath !== targetPath) {
              window.history.replaceState({ view: targetView }, '', targetPath);
          }
        } else {
          setLoginStatus(LOGIN_STATUS.NOT_LOGGED_IN);
          setCurrentUser(null);
          if (window.location.pathname !== PATHS.LOGIN) {
             window.history.replaceState(null, '', PATHS.LOGIN);
          }
          setCurrentView(null);
        }
      })
      .catch(err => {
        if (!isMounted) return;
        if (err?.error === CLIENT.NO_SESSION || err?.error === SERVER.AUTH_MISSING) {
          setLoginStatus(LOGIN_STATUS.NOT_LOGGED_IN);
        } else {
          setError('Could not verify login status. Please try refreshing.');
          setLoginStatus(LOGIN_STATUS.NOT_LOGGED_IN);
        }
        setCurrentUser(null);
        setCurrentView(null);
        if (window.location.pathname !== PATHS.LOGIN) {
            window.history.replaceState(null, '', PATHS.LOGIN);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
      
      return () => { isMounted = false; };
  }, []);


  const navigateTo = (view) => {
    const targetPath = PATHS[Object.keys(VIEWS).find(key => VIEWS[key] === view)];
    if (targetPath && (view !== VIEWS.ADMIN || currentUser?.isAdmin) && targetPath !== window.location.pathname) {
      window.history.pushState({ view: view }, '', targetPath);
      setCurrentView(view);
      setError('');
    } else if (view === VIEWS.ADMIN && !currentUser?.isAdmin) {
        setError('Access Denied: Admin privileges required.');
    }
  };

  const handleLogin = (username) => {
    setIsLoading(true)
    setError('')
    setLoginMessage('')
    fetchLogin(username)
      .then(userInfo => {
        setLoginStatus(LOGIN_STATUS.IS_LOGGED_IN)
        setCurrentUser(userInfo)
        const defaultView = VIEWS.INGREDIENTS;
        const targetPath = PATHS.INGREDIENTS;
        window.history.pushState({ view: defaultView }, '', targetPath);
        setCurrentView(defaultView)
        setError('')
        setLoginMessage('')
      })
      .catch(err => {
        setError('')
        setLoginMessage(err?.message || 'Login failed. Please try again.')
        setLoginStatus(LOGIN_STATUS.NOT_LOGGED_IN)
        setCurrentUser(null)
        if (window.location.pathname !== PATHS.LOGIN) {
           window.history.replaceState(null, '', PATHS.LOGIN);
        }
        setCurrentView(null);
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const handleRegister = (username) => {
    setIsLoading(true)
    setError('')
    setLoginMessage('')
    fetchRegister(username)
      .then(response => {
        setError('')
        setLoginMessage(response.message || 'Registration successful! Please log in.')
        if (window.location.pathname !== PATHS.LOGIN) {
           window.history.replaceState(null, '', PATHS.LOGIN);
        }
        setCurrentView(null);
      })
      .catch(err => {
        setError('')
        setLoginMessage(err?.message || 'Registration failed. Please try again.')
        if (window.location.pathname !== PATHS.LOGIN) {
           window.history.replaceState(null, '', PATHS.LOGIN);
        }
        setCurrentView(null);
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const handleLogout = () => {
    setIsLoading(true)
    setError('')
    fetchLogout()
      .then(() => {
        setLoginStatus(LOGIN_STATUS.NOT_LOGGED_IN)
        setCurrentUser(null)
        window.history.pushState(null, '', PATHS.LOGIN);
        setCurrentView(null)
        setError('')
        setLoginMessage('')
      })
      .catch(err => {
        setError(err?.message || 'Logout failed. Please try again.')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }


  let content;
  if (loginStatus === LOGIN_STATUS.PENDING) {
    content = <div className="app__loading"><LoadingSpinner size="large" /></div>;
  } else if (loginStatus === LOGIN_STATUS.NOT_LOGGED_IN) {
    content = (
      <main className="app__main app__main--login">
        <Login
          onLogin={handleLogin}
          onRegister={handleRegister}
          isLoading={isLoading}
          message={loginMessage || error}
          clearMessage={() => { setError(''); setLoginMessage(''); }}
        />
      </main>
    );
  } else if (loginStatus === LOGIN_STATUS.IS_LOGGED_IN) {
    content = (
      <>
        <Header
          username={currentUser?.username}
          isAdmin={currentUser?.isAdmin}
          onLogout={handleLogout}
          currentView={currentView}
          onNavigate={navigateTo}
          VIEWS={VIEWS}
          PATHS={PATHS}
        />
        <main className="app__main">
          {error && <ErrorMessage message={error} />}
          {currentView === VIEWS.INGREDIENTS && (
            <IngredientManager
              userId={currentUser?.userId}
              onError={setError}
              onNavigate={navigateTo}
              VIEWS={VIEWS}
              recipePreferences={recipePreferences}
              setRecipePreferences={setRecipePreferences}
            />
          )}
          {currentView === VIEWS.SUGGESTIONS && (
            <RecipeSuggestions
              userId={currentUser?.userId}
              onError={setError}
              onNavigate={navigateTo}
              VIEWS={VIEWS}
              preferences={recipePreferences}
            />
          )}
          {currentView === VIEWS.SAVED_RECIPES && (
            <SavedRecipes
                userId={currentUser?.userId}
                onError={setError}
                onNavigate={navigateTo}
                VIEWS={VIEWS}
                currentUser={currentUser}
             />
          )}
          {currentView === VIEWS.ADMIN && currentUser?.isAdmin && (
            <AdminDashboard onError={setError} />
          )}
          {currentView === VIEWS.COMMUNITY && (
            <CommunityPage 
                onError={setError} 
                currentUser={currentUser}
            />
          )}
           { ![VIEWS.INGREDIENTS, VIEWS.SUGGESTIONS, VIEWS.SAVED_RECIPES, VIEWS.ADMIN, VIEWS.COMMUNITY].includes(currentView) &&
              loginStatus === LOGIN_STATUS.IS_LOGGED_IN &&
              !isLoading && (
             <div>Page not found</div> 
           )}
        </main>
      </>
    );
  }

  return (
    <div className="app">
      {content}
      <Footer />
    </div>
  )
}

export default App