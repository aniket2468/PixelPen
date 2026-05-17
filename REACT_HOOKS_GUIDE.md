# React Hooks Guide - Using PixelPen Examples

This guide teaches you all React hooks using **real examples from your PixelPen project**. Each hook is explained simply with actual code from your codebase.

---

## Table of Contents
1. [useState - Managing Component State](#1-usestate)
2. [useEffect - Side Effects & Lifecycle](#2-useeffect)
3. [useRef - Direct DOM Access](#3-useref)
4. [useCallback - Memoized Functions](#4-usecallback)
5. [useMemo - Memoized Values](#5-usememo)
6. [useContext - Consuming Context](#6-usecontext)
7. [useReducer - Complex State Management](#7-usereducer)
8. [Custom Hooks - Reusable Logic](#8-custom-hooks)
9. [Next.js Hooks - Router & Session](#9-nextjs-hooks)

---

## 1. useState - Managing Component State

**What it does:** Stores and updates data that changes over time in your component.

### Simple Example from Your Code

```61:69:src/app/write/page.jsx
  const [file, setFile] = useState(null);
  const [media, setMedia] = useState("");
  const [title, setTitle] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [uploading, setUploading] = useState(false);
  const [addButtonUploading, setAddButtonUploading] = useState(false);
  const [showHeadingDropdown, setShowHeadingDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
```

**How it works:**
- `useState(initialValue)` returns an array: `[currentValue, setterFunction]`
- First value is the current state
- Second value is a function to update it
- When you call the setter, React re-renders the component

### Real Usage Example

```34:34:src/components/comments/Comments.jsx
  const [desc, setDesc] = useState('');
```

**Updating state:**
```javascript
setDesc('New comment text'); // Updates state and triggers re-render
```

### Using Initializer Function (Lazy Initialization)

```15:17:src/context/ThemeContext.jsx
    const [theme, setTheme] = useState(() => {
        return getFromLocalStorage();
    })
```

**Why use a function?** If getting the initial value is expensive, wrap it in a function. It only runs once.

---

## 2. useEffect - Side Effects & Lifecycle

**What it does:** Runs code after render, like API calls, subscriptions, or DOM manipulation.

### Basic Syntax
```javascript
useEffect(() => {
  // Code to run
}, [dependencies]); // Optional dependency array
```

### Real Examples from Your Code

#### Example 1: Authentication Check
```61:74:src/app/settings/page.jsx
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user) {
      setFormData({
        name: session.user.name || '',
        username: session.user.username || '',
        email: session.user.email || '',
        image: session.user.image || ''
      });
      setPreviewImage(session.user.image || '');
      fetchUserStats();
    }
  }, [status, session, router]);
```

**What happens:**
- Runs after every render
- Checks if user is authenticated
- Updates form data if user exists
- `[status, session, router]` - only re-runs if these change

#### Example 2: Cleanup Function (Event Listeners)
```84:96:src/components/authLinks/AuthLinks.jsx
  useEffect(() => {
    if (dropdownOpen) {
      const added = safeAddEventListener(document, 'click', handleClickOutside);
      if (!added) {
        // Fallback: close dropdown if we can't add listener
        setDropdownOpen(false);
      }
    }

    return () => {
      safeRemoveEventListener(document, 'click', handleClickOutside);
    };
  }, [dropdownOpen, handleClickOutside]);
```

**The cleanup function (`return`):**
- Runs when component unmounts OR before the effect runs again
- Prevents memory leaks by removing event listeners
- Always clean up subscriptions, timers, and event listeners!

#### Example 3: Run Once on Mount
```11:11:src/components/chatBot/ChatBot.jsx
  useEffect(() => {
```

**Empty dependency array `[]`:**
```javascript
useEffect(() => {
  // This runs ONCE when component mounts
}, []); // Empty array = only run once
```

#### Example 4: Save to LocalStorage
```23:25:src/context/ThemeContext.jsx
    useEffect (() => {
        localStorage.setItem("theme", theme)
    },[theme])
```

**Every time `theme` changes, save it to localStorage.**

---

## 3. useRef - Direct DOM Access

**What it does:** Gives you a reference to a DOM element or stores a mutable value that doesn't cause re-renders.

### Key Differences from useState:
- ✅ Changing `ref.current` does NOT trigger re-render
- ✅ Perfect for DOM elements, timers, previous values
- ✅ Persists across renders

### Real Examples

#### Example 1: DOM Element Reference
```70:72:src/app/write/page.jsx
  const dropdownRef = useRef(null);
  const categoryDropdownRef = useRef(null);
  const menuBarRef = useRef(null);
```

**Using it in JSX:**
```jsx
<div ref={dropdownRef}>Content</div>
```

**Accessing the element:**
```javascript
dropdownRef.current.focus(); // Access the DOM element
dropdownRef.current.contains(event.target); // Check if clicked inside
```

#### Example 2: Storing Timers/Abort Controllers
```32:33:src/components/searchDropdown/SearchDropdown.jsx
  const debounceRef = useRef(null);
  const abortControllerRef = useRef(null);
```

**Why use ref for timers?**
```66:80:src/components/searchDropdown/SearchDropdown.jsx
  const debouncedSearch = useCallback((searchQuery) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery);
      } else {
        setResults([]);
        setSuggestions([]);
        setShowResults(false);
      }
    }, 300);
  }, []);
```

**If you used `useState` for the timer, it would re-render every time you clear/set it!**

#### Example 3: Previous Value Storage
```javascript
const prevValue = useRef();
useEffect(() => {
  prevValue.current = someValue; // Store without re-render
}, [someValue]);
```

---

## 4. useCallback - Memoized Functions

**What it does:** Returns a memoized (cached) version of a function that only changes if dependencies change.

**Why use it?** Prevents unnecessary re-renders of child components and avoids recreating functions on every render.

### Real Example from Your Code

```72:82:src/components/authLinks/AuthLinks.jsx
  const handleClickOutside = useCallback((event) => {
    try {
      if (dropdownRef.current && 
          isElementInDOM(dropdownRef.current) && 
          !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    } catch (error) {
      // Silently ignore errors
    }
  }, []);
```

**What this does:**
- Creates `handleClickOutside` function once
- Only recreates if dependencies change (empty array = never changes)
- Used in `useEffect` dependency array safely

### Without useCallback (Bad):
```javascript
const handleClick = (event) => { /* ... */ };
// This function is recreated on EVERY render!
// If passed to child component, it will re-render every time
```

### With useCallback (Good):
```javascript
const handleClick = useCallback((event) => { /* ... */ }, []);
// Function is created once and reused
// Child components won't re-render unnecessarily
```

### Example with Dependencies

```122:132:src/app/write/page.jsx
  const handleCategoryClickOutside = useCallback((event) => {
    try {
      if (categoryDropdownRef.current && 
          isElementInDOM(categoryDropdownRef.current) && 
          !categoryDropdownRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
    } catch (error) {
      // Silently ignore errors
    }
  }, []);
```

**When dependencies matter:**
```javascript
const handleSubmit = useCallback(() => {
  submitForm(userId, formData);
}, [userId, formData]); // Recreates if userId or formData changes
```

---

## 5. useMemo - Memoized Values

**What it does:** Memoizes (caches) the result of an expensive calculation. Only recalculates when dependencies change.

**Note:** While not heavily used in your PixelPen codebase, here's how it works:

### Basic Syntax
```javascript
const expensiveValue = useMemo(() => {
  // Expensive calculation
  return computeSomething(a, b);
}, [a, b]); // Only recalculate if a or b changes
```

### When to Use:
- ✅ Expensive calculations (loops, filtering, sorting)
- ✅ Preventing unnecessary object/array creation
- ✅ Optimizing expensive renders

### Example (Not in your code, but useful):
```javascript
// Without useMemo - recalculates every render
const filteredPosts = posts.filter(post => 
  post.category === selectedCategory
);

// With useMemo - only recalculates when dependencies change
const filteredPosts = useMemo(() => {
  return posts.filter(post => 
    post.category === selectedCategory
  );
}, [posts, selectedCategory]);
```

### When NOT to Use:
- ❌ Simple calculations (no performance benefit)
- ❌ Overuse can actually slow things down
- ❌ Only use when you have a performance problem

---

## 6. useContext - Consuming Context

**What it does:** Accesses values from a React Context without prop drilling.

### Your Theme Context Example

#### Step 1: Create Context (Provider)
```2:30:src/context/ThemeContext.jsx
import { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext()

const getFromLocalStorage = () => {
    if (typeof window !== "undefined") {
        const value = localStorage.getItem('theme')
        return value || "light"
    }
    
}

export const ThemeContextProvider = ({children}) => {
    const [theme, setTheme] = useState(() => {
        return getFromLocalStorage();
    })

    const toggle = () => {
        setTheme(theme === "light" ? "dark" : "light");
    }

    useEffect (() => {
        localStorage.setItem("theme", theme)
    },[theme])
    return (
        <ThemeContext.Provider value={{theme, toggle}}>
            {children}
        </ThemeContext.Provider>
    )
}
```

#### Step 2: Use Context in Components
```2:14:src/components/themeToggle/ThemeToggle.jsx
import React, { useContext } from 'react'
import { ThemeContext } from '@/context/ThemeContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons'
import styles from './themeToggle.module.css'

const ThemeToggle = () => {
  const {toggle, theme} = useContext(ThemeContext)
```

**How it works:**
1. Wrap your app with `ThemeContextProvider`
2. Any child component can use `useContext(ThemeContext)`
3. No need to pass props through every component!

### Another Example from Your Code
```12:12:src/components/featured/Featured.jsx
  const { theme } = useContext(ThemeContext);
```

**Benefits:**
- ✅ No prop drilling (passing props through many components)
- ✅ Global state accessible anywhere
- ✅ Cleaner component code

---

## 7. useReducer - Complex State Management

**What it does:** Alternative to `useState` for managing complex state logic. Similar to Redux pattern.

**Note:** While not used in your PixelPen codebase, here's how it works:

### Basic Syntax
```javascript
const [state, dispatch] = useReducer(reducer, initialState);
```

### When to Use:
- ✅ Complex state with multiple sub-values
- ✅ Next state depends on previous state
- ✅ Multiple ways to update state

### Example:
```javascript
// Reducer function
function counterReducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'reset':
      return { count: 0 };
    default:
      return state;
  }
}

// In component
const [state, dispatch] = useReducer(counterReducer, { count: 0 });

// Usage
<button onClick={() => dispatch({ type: 'increment' })}>
  Count: {state.count}
</button>
```

### When to Use useReducer vs useState:
- `useState`: Simple state (strings, numbers, booleans)
- `useReducer`: Complex state (objects with multiple fields, complex update logic)

---

## 8. Custom Hooks - Reusable Logic

**What it does:** Extract component logic into reusable functions. Custom hooks start with `use`.

### Your Code Uses Custom Hooks from Libraries:
- `useSession()` from `next-auth/react`
- `useRouter()` from `next/navigation`
- `useEditor()` from `@tiptap/react`

### Example: Create Your Own Custom Hook

```javascript
// hooks/useAuth.js
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  return { session, status, isAuthenticated: status === 'authenticated' };
}

// Use in component
function SettingsPage() {
  const { session, isAuthenticated } = useAuth();
  // ... rest of component
}
```

### Benefits:
- ✅ Reusable logic across components
- ✅ Cleaner component code
- ✅ Easier to test

---

## 9. Next.js Hooks - Router & Session

These are Next.js specific hooks used throughout your PixelPen project.

### useRouter - Navigation
```29:29:src/components/searchDropdown/SearchDropdown.jsx
  const router = useRouter();
```

**Usage:**
```javascript
router.push('/login'); // Navigate to page
router.push(`/profile/${username}`); // Dynamic route
router.refresh(); // Refresh current page
router.back(); // Go back
```

### useSession - Authentication
```17:17:src/components/authLinks/AuthLinks.jsx
  const { data: session, status } = useSession();
```

**Returns:**
- `session`: User data (name, email, image, etc.)
- `status`: 'authenticated' | 'unauthenticated' | 'loading'

### useSearchParams - URL Query Parameters
```29:29:src/components/searchDropdown/SearchDropdown.jsx
  const searchParams = useSearchParams();
```

**Usage:**
```javascript
const query = searchParams.get('query'); // Get ?query=something from URL
```

---

## Hook Rules (Important!)

### 1. Only Call Hooks at the Top Level
```javascript
// ❌ BAD - Don't call hooks inside conditions
if (condition) {
  const [state, setState] = useState();
}

// ✅ GOOD - Always at top level
const [state, setState] = useState();
if (condition) {
  // Use state here
}
```

### 2. Only Call Hooks from React Functions
- ✅ Call from React components
- ✅ Call from custom hooks
- ❌ Don't call from regular functions
- ❌ Don't call from class components

### 3. Dependencies Matter
Always include all values from component scope that change over time:
```javascript
useEffect(() => {
  // Uses: query, userId, session
}, [query, userId, session]); // Include all dependencies!
```

---

## Quick Reference Cheat Sheet

| Hook | Purpose | When to Use |
|------|---------|-------------|
| `useState` | Store component state | Any data that changes |
| `useEffect` | Side effects after render | API calls, subscriptions, DOM manipulation |
| `useRef` | DOM reference or mutable value | Accessing DOM, storing timers, previous values |
| `useCallback` | Memoized function | Functions passed to child components |
| `useMemo` | Memoized value | Expensive calculations |
| `useContext` | Access context values | Avoiding prop drilling |
| `useReducer` | Complex state management | Complex state logic |
| `useRouter` | Next.js navigation | Page navigation |
| `useSession` | Next.js auth | Check user session |

---

## Common Patterns in Your PixelPen Project

### Pattern 1: Form State Management
```javascript
const [formData, setFormData] = useState({
  name: '',
  email: '',
  image: ''
});
```

### Pattern 2: Loading States
```javascript
const [loading, setLoading] = useState(false);
const [uploading, setUploading] = useState(false);
```

### Pattern 3: Modal/Dropdown State
```javascript
const [showModal, setShowModal] = useState(false);
const modalRef = useRef(null);
```

### Pattern 4: Click Outside Handler
```javascript
const handleClickOutside = useCallback((event) => {
  if (ref.current && !ref.current.contains(event.target)) {
    setOpen(false);
  }
}, []);

useEffect(() => {
  document.addEventListener('click', handleClickOutside);
  return () => document.removeEventListener('click', handleClickOutside);
}, [handleClickOutside]);
```

---

## Practice Exercise

Try modifying your PixelPen code:

1. **Add a counter** in `Comments.jsx` using `useState`
2. **Add a cleanup** in an `useEffect` that clears a timer
3. **Create a custom hook** `useDebounce` for search functionality
4. **Use `useMemo`** to memoize filtered posts in `CardList.jsx`

---

## Summary

- **useState**: Store changing data
- **useEffect**: Run code after render (with cleanup!)
- **useRef**: Access DOM or store mutable values
- **useCallback**: Memoize functions to prevent re-renders
- **useMemo**: Memoize expensive calculations
- **useContext**: Access global state without props
- **useReducer**: Manage complex state (not used in your project yet)
- **Custom Hooks**: Extract reusable logic

**Remember:** Hooks make functional components powerful. They're just functions that let you "hook into" React features!

---

*This guide uses real examples from your PixelPen project. Explore the codebase to see these patterns in action!*

