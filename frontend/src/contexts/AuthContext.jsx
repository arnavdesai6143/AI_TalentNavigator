import { createContext, useContext, useState, useEffect } from 'react';
import { initializeUserData, updateStreak, clearUserData as clearUserServiceData } from '../services/userDataService';

const AuthContext = createContext(null);

// Mock user data for demo - used for pre-filled user info only
const DEMO_USERS = {
    employee: {
        id: 1,
        email: 'john.doe@company.com',
        name: 'John Doe',
        role: 'employee',
        title: 'Senior Software Engineer',
        department: 'Engineering',
        avatar: null,
        joinDate: '2024-01-15',
        skills: ['JavaScript', 'React', 'Python', 'SQL', 'System Design'],
        currentSkills: {
            'JavaScript': 85,
            'React': 80,
            'Python': 60,
            'SQL': 70,
            'System Design': 65,
            'Communication': 75
        },
        targetRole: 'Senior Software Engineer',
        careerGoal: 'Senior Software Engineer'
    }
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing session
        const savedUser = localStorage.getItem('ai_talent_user');
        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            // Enforce employee role for existing sessions if they were something else
            if (parsedUser.role !== 'employee') {
                parsedUser.role = 'employee';
            }
            setUser(parsedUser);
            // Update streak on app load for existing users
            if (parsedUser?.id) {
                updateStreak(parsedUser.id);
            }
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        const response = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }

        const userData = { ...data.user, token: data.token, role: 'employee' };
        localStorage.setItem('ai_talent_user', JSON.stringify(userData));
        setUser(userData);

        // Initialize user data
        if (userData.id) {
            initializeUserData(userData.id);
            updateStreak(userData.id);
        }

        return userData;
    };

    const register = async (userData) => {
        // Map frontend fields to backend expectation (backend expects username, password, name)
        // We'll use email as username for simplicity as per common pattern
        const payload = {
            username: userData.email,
            password: userData.password,
            name: userData.name
        };

        const response = await fetch('http://localhost:3001/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
        }

        const newUser = {
            ...data.user,
            token: data.token,
            email: userData.email,
            title: userData.title,
            department: userData.department,
            role: 'employee',
            skills: Object.keys(userData.currentSkills || {}),
            currentSkills: userData.currentSkills || {},
            targetRole: userData.targetRole || '',
            careerGoal: userData.targetRole || '',
            joinDate: new Date().toISOString().split('T')[0]
        };

        localStorage.setItem('ai_talent_user', JSON.stringify(newUser));
        setUser(newUser);

        // Initialize user data
        if (newUser.id) {
            initializeUserData(newUser.id);
            updateStreak(newUser.id);
        }

        return newUser;
    };

    const logout = () => {
        localStorage.removeItem('ai_talent_user');
        setUser(null);
    };

    const updateUser = (updates) => {
        const updatedUser = { ...user, ...updates };
        localStorage.setItem('ai_talent_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            register,
            logout,
            updateUser,
            deleteAccount: async () => {
                if (!user?.token) return;

                const response = await fetch('http://localhost:3001/api/auth/me', {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to delete account');
                }

                logout();
            },
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
