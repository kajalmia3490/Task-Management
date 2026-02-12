import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [error, setError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        const newUser = {
            id: Date.now(),
            name: form.name,
            email: form.email,
            password: form.password,
        };

        const result = register(newUser);

        if (result.success) {
            navigate("/dashboard"); // auto-login after register
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-800 px-6">
            <form
                onSubmit={handleSubmit}
                className="bg-white/5 backdrop-blur-xl p-8 rounded-2xl shadow-xl w-full max-w-md"
            >
                <h2 className="text-3xl font-bold text-white mb-6 text-center">
                    Create Account
                </h2>

                {error && (
                    <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
                )}

                <input
                    type="text"
                    placeholder="Full Name"
                    required
                    className="w-full mb-4 p-3 rounded-lg bg-slate-800 text-white outline-none"
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                />

                <input
                    type="email"
                    placeholder="Email"
                    required
                    className="w-full mb-4 p-3 rounded-lg bg-slate-800 text-white outline-none"
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                />

                <input
                    type="password"
                    placeholder="Password"
                    required
                    className="w-full mb-6 p-3 rounded-lg bg-slate-800 text-white outline-none"
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                />

                <button className="w-full bg-indigo-500 py-3 rounded-lg hover:bg-indigo-600 transition">
                    Register
                </button>

                <div className="text-gray-400 mt-4 text-center">
                    Already have an account?{" "}
                    <Link to="/" className="text-indigo-400 hover:underline">
                        Login
                    </Link>
                </div>
            </form>
        </div>
    );
}
