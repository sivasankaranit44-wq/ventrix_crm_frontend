import { useEffect, useState } from "react"
import api from "../api"
import Navbar from "../components/Navbar"

const inputClass =
    "w-full bg-page border border-white/10 text-white placeholder-gray-500 p-2 rounded focus:outline-none focus:border-brand transition-colors duration-200"

export default function Customers() {
    const [customers, setCustomers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [search, setSearch] = useState("")

    const [editing, setEditing] = useState(null)
    const [editError, setEditError] = useState("")
    const [saving, setSaving] = useState(false)

    const [notesModal, setNotesModal] = useState(null)
    const [noteText, setNoteText] = useState("")
    const [noteError, setNoteError] = useState("")

    const loadCustomers = async () => {
        try {
            const res = await api.get("/customers", {
                params: { search, limit: 100 }
            })
            setCustomers(res.data.customers)
            setError("")
        } catch (err) {
            setError(err.response?.data?.message || "Could not load customers")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
        loadCustomers()
    }, [search])

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this customer?")) return

        try {
            await api.delete("/customers/" + id)
            await loadCustomers()
        } catch (err) {
            setError(err.response?.data?.message || "Could not delete customer")
        }
    }

    const handleEditChange = (e) => {
        setEditing({ ...editing, [e.target.name]: e.target.value })
    }

    const handleEditSave = async (e) => {
        e.preventDefault()
        setEditError("")
        setSaving(true)

        try {
            await api.put("/customers/" + editing._id, {
                name: editing.name,
                email: editing.email,
                phone: editing.phone,
                company: editing.company
            })
            setEditing(null)
            await loadCustomers()
        } catch (err) {
            setEditError(err.response?.data?.message || "Could not save customer")
        } finally {
            setSaving(false)
        }
    }

    const handleAddNote = async (e) => {
        e.preventDefault()
        setNoteError("")

        try {
            const res = await api.post("/customers/" + notesModal._id + "/notes", {
                text: noteText
            })
            setNotesModal(res.data.customer)
            setNoteText("")
            await loadCustomers()
        } catch (err) {
            setNoteError(err.response?.data?.message || "Could not add note")
        }
    }

    return (
        <div className="min-h-screen bg-page text-white">
            <Navbar />

            <div className="p-8 max-w-6xl mx-auto">
                <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                    <h2 className="text-2xl font-bold">Customers</h2>

                    <input
                        type="text"
                        placeholder="Search name, email or company"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-card border border-white/10 text-white placeholder-gray-500 p-2 rounded w-full max-w-xs focus:outline-none focus:border-brand"
                    />
                </div>

                {error && <p className="text-red-400 mb-4">{error}</p>}

                {loading ? (
                    <p className="text-gray-400">Loading customers...</p>
                ) : customers.length === 0 ? (
                    <p className="text-gray-400">
                        No customers yet. Convert a qualified lead from the Leads page.
                    </p>
                ) : (
                    <div className="bg-card border border-white/10 rounded-xl overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-nav text-gray-300">
                                <tr>
                                    <th className="p-3">Name</th>
                                    <th className="p-3">Company</th>
                                    <th className="p-3">Phone</th>
                                    <th className="p-3">Notes</th>
                                    <th className="p-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map((c) => (
                                    <tr key={c._id} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                                        <td className="p-3">
                                            <p className="font-medium">{c.name}</p>
                                            <p className="text-gray-400 text-xs">{c.email}</p>
                                        </td>
                                        <td className="p-3">{c.company || "-"}</td>
                                        <td className="p-3">{c.phone || "-"}</td>
                                        <td className="p-3">{c.notes?.length || 0}</td>
                                        <td className="p-3">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setNotesModal(c)
                                                        setNoteText("")
                                                        setNoteError("")
                                                    }}
                                                    className="bg-brand/20 text-brand px-3 py-1 rounded transition duration-200 hover:bg-brand hover:text-white"
                                                >
                                                    Notes
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditing({ ...c })
                                                        setEditError("")
                                                    }}
                                                    className="bg-white/10 text-white px-3 py-1 rounded transition duration-200 hover:bg-white/20"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(c._id)}
                                                    className="bg-red-500/20 text-red-400 px-3 py-1 rounded transition duration-200 hover:bg-red-500 hover:text-white"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {editing && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
                    <form
                        onSubmit={handleEditSave}
                        className="bg-card border border-white/10 rounded-xl p-6 w-full max-w-md grid gap-4"
                    >
                        <h3 className="text-lg font-bold">Edit customer</h3>

                        {editError && (
                            <p className="bg-red-500/10 border border-red-500/30 text-red-400 p-2 rounded text-sm">
                                {editError}
                            </p>
                        )}

                        <input name="name" placeholder="Name" value={editing.name || ""} onChange={handleEditChange} className={inputClass} required />
                        <input name="email" type="email" placeholder="Email" value={editing.email || ""} onChange={handleEditChange} className={inputClass} required />
                        <input name="phone" placeholder="Phone" value={editing.phone || ""} onChange={handleEditChange} className={inputClass} />
                        <input name="company" placeholder="Company" value={editing.company || ""} onChange={handleEditChange} className={inputClass} />

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setEditing(null)}
                                className="bg-page border border-white/10 px-4 py-2 rounded transition duration-200 hover:border-brand"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-brand px-4 py-2 rounded transition duration-200 hover:bg-brand-dark disabled:opacity-50"
                            >
                                {saving ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {notesModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
                    <div className="bg-card border border-white/10 rounded-xl p-6 w-full max-w-lg">
                        <h3 className="text-lg font-bold mb-4">Notes for {notesModal.name}</h3>

                        <div className="max-h-64 overflow-y-auto mb-4 grid gap-2">
                            {notesModal.notes?.length === 0 && (
                                <p className="text-gray-400 text-sm">No notes yet.</p>
                            )}
                            {notesModal.notes?.map((n) => (
                                <div key={n._id} className="bg-page border border-white/10 p-3 rounded">
                                    <p className="text-sm">{n.text}</p>
                                    <p className="text-gray-500 text-xs mt-1">
                                        {new Date(n.date).toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {noteError && <p className="text-red-400 text-sm mb-2">{noteError}</p>}

                        <form onSubmit={handleAddNote} className="flex gap-2">
                            <input
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                placeholder="Add a note"
                                className={inputClass}
                                required
                            />
                            <button
                                type="submit"
                                className="bg-brand px-4 py-2 rounded transition duration-200 hover:bg-brand-dark"
                            >
                                Add
                            </button>
                        </form>

                        <div className="flex justify-end mt-4">
                            <button
                                onClick={() => setNotesModal(null)}
                                className="bg-page border border-white/10 px-4 py-2 rounded transition duration-200 hover:border-brand"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}