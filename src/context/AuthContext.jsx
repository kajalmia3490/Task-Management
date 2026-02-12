import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Load logged user on app start
    useEffect(() => {
        const storedUser = localStorage.getItem("currentUser");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    // Register new user
    const register = (newUser) => {
        const users = JSON.parse(localStorage.getItem("users")) || [];

        // Check duplicate email
        const exists = users.find((u) => u.email === newUser.email);
        if (exists) {
            return { success: false, message: "Email already registered" };
        }

        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));

        // Auto login after register
        localStorage.setItem("currentUser", JSON.stringify(newUser));
        setUser(newUser);

        return { success: true };
    };

    // Login
    const login = (email, password) => {
        const users = JSON.parse(localStorage.getItem("users")) || [];

        const foundUser = users.find(
            (u) => u.email === email && u.password === password
        );

        if (foundUser) {
            localStorage.setItem("currentUser", JSON.stringify(foundUser));
            setUser(foundUser);
            return { success: true };
        }

        return { success: false, message: "Invalid email or password" };
    };

    // Logout
    const logout = () => {
        localStorage.removeItem("currentUser");
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                register,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
