import { useState } from "react"
import {Link, useNavigate} from 'react-router-dom'
import api from '../api'
import {useAuth} from '../context/AuthContext'

export default function Register() {
    const [name,setName] = useState("")
    const [email,setEmail] = useState("")
    const [password,setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const {login} = useAuth()
    const navigate =useNavigate()

    // handling the submit
    const handleSubmit = async(e)=>{
        e.preventDefault()
        setError("")
        setLoading(true)

        try{
            const res = await api.post("/auth/register",{name,email,password})
            login(res.data.token, res.data.user)
            navigate("/dashboard")
        } catch(error){
            setError(error.response?.data?.message | "Registration failed, Try again.")
        } finally{
            setLoading(false)
        }
    }

    return(
        <>
        <div className="min-h-screen flex items-center justify-center bg-page px-4">
            <form onSubmit={handleSubmit} className="bg-card border border-white/10 p-8 rounded-xl shadow-lg w-full max-w-sm"> 
                <h1 className="text-2xl font-bold mb-6 text-center text-white"> Register </h1>

                {error && (
                    <p className="bg-red-500/10 border border-red-500/30 text-red-400 p-2 rounded mb-4 text-sm"> {error} </p>
                )}

                <input 
                    type="text"
                    placeholder="Enter your Name"
                    value={name}
                    onChange={(e)=>setName(e.target.value)}
                    className="w-full bg-page border border-white/10 text-white placeholder-gray-500 p-2 rounded mb-4 focus:outline-none focus:border-brand transition-colors duration-200"
                    required
                /> 

                <input 
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e)=>setEmail(e.target.value)}
                    className="w-full bg-page border border-white/10 text-white placeholder-gray-500 p-2 rounded mb-4 focus:outline-none focus:border-brand transition-colors duration-200"
                    required
                />

                <input 
                    type="password"
                    placeholder="Set Password"
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                    className="w-full bg-page border border-white/10 text-white placeholder-gray-500 p-2 rounded mb-4 focus:outline-none focus:border-brand transition-colors duration-200"
                    required
                />
                
                <button type="submit" disabled={loading}
                    className="w-full bg-brand text-white p-2 rounded transition duration-200 hover:bg-brand-dark hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0"
                > 
                    {loading ? "Creating Account...":"Register"}
                </button>

                <p> 
                    Already having an account?{" "} 
                    <Link to='/login' className="text-brand hover:underline">Login</Link>
                </p>
            </form>
        </div>
        </>
    )
}