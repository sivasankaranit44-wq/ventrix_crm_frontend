import { NavLink } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function Navbar() {
    const { user, logout } = useAuth()

    const linkClass = ({ isActive }) =>
        "px-3 py-2 rounded text-sm transition duration-200 " +
        (isActive ? "bg-brand text-white" : "text-gray-300 hover:text-white hover:bg-white/10")

    return (
        <nav className="bg-nav border-b border-white/10 px-8 py-4 flex justify-between items-center">
            <div className="flex items-center gap-6">
                <h1 className="text-xl font-bold text-white">Ventrix AI Powered CRM</h1>
                <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
                <NavLink to="/leads" className={linkClass}>Leads</NavLink>
                <NavLink to="/customers" className={linkClass}>Customers</NavLink>
            </div>

            <div className="flex items-center gap-4">
                <span className="text-gray-300 text-sm">{user.name}</span>
                <button
                    onClick={logout}
                    className="bg-card border border-white/10 px-4 py-2 rounded text-sm text-white transition duration-200 hover:border-brand hover:-translate-y-0.5"
                >
                    Logout
                </button>
            </div>
        </nav>
    )
}
