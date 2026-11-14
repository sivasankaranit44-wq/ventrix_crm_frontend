
import { useEffect, useState } from "react"
import { NavLink } from "react-router-dom"
import api from "../api"
import { useAuth } from "../context/AuthContext"

export default function Dashboard() {
    const { user, logout } = useAuth()
    const [stats, setStats] = useState(null)
    const [error, setError] = useState("")

    useEffect(() => {
        const loadStats = async () => {
            try {
                const res = await api.get("/dashboard/stats")
                setStats(res.data.stats)
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    "Could not load stats at this moment"
                )
            }
        }

        loadStats()
    }, [])

    const navLinkClass = ({ isActive }) =>
        `transition-colors duration-200 ${
            isActive
                ? "text-brand font-semibold"
                : "text-gray-300 hover:text-white"
        }`

    return (
        <div className="min-h-screen bg-page text-white">

            {/* Navbar */}
            <nav className="bg-nav border-b border-white/10 px-8 py-4 flex justify-between items-center">

                <div className="flex items-center gap-10">
                    <h1 className="text-xl font-bold whitespace-nowrap">
                        Ventrix CRM - AI Powered
                    </h1>

                    <div className="flex items-center gap-6 text-sm">
                        <NavLink
                            to="/dashboard"
                            className={navLinkClass}
                        >
                            Dashboard
                        </NavLink>

                        <NavLink
                            to="/leads"
                            className={navLinkClass}
                        >
                            Leads
                        </NavLink>

                        <NavLink
                            to="/customers"
                            className={navLinkClass}
                        >
                            Customers
                        </NavLink>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-gray-300 text-sm">
                        {user.name}
                    </span>

                    <button
                        onClick={logout}
                        className="bg-card border border-white/10 px-4 py-2 rounded text-sm transition duration-200 hover:border-brand hover:-translate-y-0.5"
                    >
                        Logout
                    </button>
                </div>

            </nav>

            {/* Dashboard Content */}
            <div className="p-8">

                <h3 className="text-2xl font-bold mb-6">
                    Welcome, {user.name}
                </h3>

                {error && (
                    <p className="text-red-500 mb-4">
                        {error}
                    </p>
                )}

                {stats && (
                    <div className="grid grid-cols-2 gap-4 max-w-md">

                        {/* Total Leads */}
                        <div className="bg-card border border-white/10 p-4 rounded-xl transition duration-200 hover:border-brand hover:-translate-y-1">
                            <p className="text-gray-400 text-sm">
                                Total Leads
                            </p>

                            <p className="text-2xl font-bold">
                                {stats.totalLeads}
                            </p>
                        </div>

                        {/* Total Customers */}
                        <div className="bg-card border border-white/10 p-4 rounded-xl transition duration-200 hover:border-brand hover:-translate-y-1">
                            <p className="text-gray-400 text-sm">
                                Total Customers
                            </p>

                            <p className="text-2xl font-bold">
                                {stats.totalCustomers}
                            </p>
                        </div>

                    </div>
                )}

            </div>

        </div>
    )
}
