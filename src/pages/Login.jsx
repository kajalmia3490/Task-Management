import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        const result = login(form.email, form.password);

        if (result.success) {
            navigate("/dashboard");
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-6">
            <form
                onSubmit={handleSubmit}
                className="bg-white/5 backdrop-blur-xl p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200"
            >
                <h2 className="text-3xl font-bold text-gray-500 mb-6 text-center">
                    Login
                </h2>

                {/* Error Message */}
                {error && (
                    <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
                )}

                <input
                    type="email"
                    placeholder="Email"
                    required
                    className="w-full mb-4 p-3 rounded-lg text-gray-400 outline-none border border-gray-300"
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                />

                <input
                    type="password"
                    placeholder="Password"
                    required
                    className="w-full mb-6 p-3 rounded-lg text-gray-400 outline-none border border-gray-300"
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                />

                <button className="w-full bg-indigo-500 py-3 rounded-lg hover:bg-indigo-600 transition text-white">
                    Login
                </button>

                <div className="text-gray-400 mt-4 text-center">
                    Don’t have an account?{" "}
                    <Link to="/register" className="text-indigo-400 hover:underline">
                        Register
                    </Link>
                </div>
            </form>
        </div>
    );
}
