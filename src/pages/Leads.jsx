import { useEffect, useState } from "react"
import api from "../api"
import Navbar from "../components/Navbar"

// Matches leadModel.js
const STATUS_OPTIONS = ["new", "contacted", "qualified", "converted", "dormant"]
const SOURCE_OPTIONS = ["website", "referral", "linkedin", "cold call", "other"]

const emptyForm = {
    name: "",
    email: "",
    phone: "",
    company: "",
    status: "new",
    source: "other",
    notes: "",
    followUpDate: ""
}

const statusColor = {
    new: "bg-blue-500/20 text-blue-300",
    contacted: "bg-yellow-500/20 text-yellow-300",
    qualified: "bg-purple-500/20 text-purple-300",
    converted: "bg-green-500/20 text-green-300",
    dormant: "bg-gray-500/30 text-gray-300"
}

const inputClass =
    "w-full bg-page border border-white/10 text-white placeholder-gray-500 p-2 rounded focus:outline-none focus:border-brand transition-colors duration-200"

export default function Leads() {
    const [leads, setLeads] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [filter, setFilter] = useState("all")

    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState(emptyForm)
    const [editingId, setEditingId] = useState(null)
    const [saving, setSaving] = useState(false)
    const [formError, setFormError] = useState("")

    const [emailModal, setEmailModal] = useState(null)

    const loadLeads = async () => {
        try {
            const res = await api.get("/leads",{params:{limit:100}})
            setLeads(res.data.leads)
            setError("")
        } catch (err) {
            setError(err.response?.data?.message || "Could not load leads")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadLeads()
    }, [])

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSave = async (e) => {
        e.preventDefault()
        setFormError("")
        setSaving(true)

        try {
            const payload = { ...form, followUpDate: form.followUpDate || null }

            if (editingId) {
                await api.put("/leads/" + editingId, payload)
            } else {
                await api.post("/leads", payload)
            }

            setForm(emptyForm)
            setEditingId(null)
            setShowForm(false)
            await loadLeads()
        } catch (err) {
            setFormError(err.response?.data?.message || "Could not save lead")
        } finally {
            setSaving(false)
        }
    }

    const handleEdit = (lead) => {
        setForm({
            name: lead.name || "",
            email: lead.email || "",
            phone: lead.phone || "",
            company: lead.company || "",
            status: lead.status || "new",
            source: (lead.source || "other").toLowerCase(),
            notes: lead.notes || "",
            followUpDate: lead.followUpDate ? lead.followUpDate.slice(0, 10) : ""
        })
        setEditingId(lead._id)
        setShowForm(true)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const toggleForm = () => {
        if (showForm) {
            setEditingId(null)
            setForm(emptyForm)
        }
        setShowForm(!showForm)
    }

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this lead?")) return

        try {
            await api.delete("/leads/" + id)
            await loadLeads()
        } catch (err) {
            setError(err.response?.data?.message || "Could not delete lead")
        }
    }

    const handleConvert = async (lead) => {
    if (!window.confirm("Convert " + lead.name + " to a customer?")) return

    try {
        await api.post("/customers/convert/" + lead._id)
        await loadLeads()
    } catch (err) {
        setError(err.response?.data?.message || "Could not convert lead")
    }
}

    const handleEmail = async (lead) => {
        setEmailModal({ lead, text: "", loading: true, error: "" })

        try {
            const res = await api.post("/ai/follow-up-email/" + lead._id)
            setEmailModal({ lead, text: res.data.email, loading: false, error: "" })
        } catch (err) {
            setEmailModal({
                lead,
                text: "",
                loading: false,
                error: err.response?.data?.message || "Could not generate email"
            })
        }
    }

    const visibleLeads = filter === "all" ? leads : leads.filter((l) => l.status === filter)

    return (
        <div className="min-h-screen bg-page text-white">
            <Navbar />

            <div className="p-8 max-w-6xl mx-auto">
                <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                    <h2 className="text-2xl font-bold">Leads</h2>

                    <div className="flex gap-3">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="bg-card border border-white/10 text-white p-2 rounded"
                        >
                            <option value="all">All statuses</option>
                            {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>

                        <button
                            onClick={toggleForm}
                            className="bg-brand px-4 py-2 rounded transition duration-200 hover:bg-brand-dark hover:-translate-y-0.5"
                        >
                            {showForm ? "Close" : "+ Add Lead"}
                        </button>
                    </div>
                </div>

                {showForm && (
                    <form
                        onSubmit={handleSave}
                        className="bg-card border border-white/10 p-6 rounded-xl mb-6 grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                        {formError && (
                            <p className="md:col-span-2 bg-red-500/10 border border-red-500/30 text-red-400 p-2 rounded text-sm">
                                {formError}
                            </p>
                        )}

                        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} className={inputClass} required />
                        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className={inputClass} required />
                        <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} className={inputClass} />
                        <input name="company" placeholder="Company" value={form.company} onChange={handleChange} className={inputClass} />

                        <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
                            {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>

                        <select name="source" value={form.source} onChange={handleChange} className={inputClass}>
                            {SOURCE_OPTIONS.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>

                        <div>
                            <label className="text-xs text-gray-400 block mb-1">Follow-up date</label>
                            <input
                                name="followUpDate"
                                type="date"
                                value={form.followUpDate}
                                onChange={handleChange}
                                className={inputClass}
                            />
                        </div>

                        <textarea
                            name="notes"
                            placeholder="Notes"
                            value={form.notes}
                            onChange={handleChange}
                            rows="3"
                            className={inputClass + " md:col-span-2"}
                        />

                        <button
                            type="submit"
                            disabled={saving}
                            className="md:col-span-2 bg-brand p-2 rounded transition duration-200 hover:bg-brand-dark disabled:opacity-50"
                        >
                            {saving ? "Saving..." : editingId ? "Update Lead" : "Save Lead"}
                        </button>
                    </form>
                )}

                {error && <p className="text-red-400 mb-4">{error}</p>}

                {loading ? (
                    <p className="text-gray-400">Loading leads...</p>
                ) : visibleLeads.length === 0 ? (
                    <p className="text-gray-400">No leads found.</p>
                ) : (
                    <div className="bg-card border border-white/10 rounded-xl overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-nav text-gray-300">
                                <tr>
                                    <th className="p-3">Name</th>
                                    <th className="p-3">Company</th>
                                    <th className="p-3">Source</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visibleLeads.map((lead) => (
                                    <tr key={lead._id} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                                        <td className="p-3">
                                            <p className="font-medium">{lead.name}</p>
                                            <p className="text-gray-400 text-xs">{lead.email}</p>
                                        </td>
                                        <td className="p-3">{lead.company || "-"}</td>
                                        <td className="p-3">{lead.source}</td>
                                        <td className="p-3">
                                            <span className={"px-2 py-1 rounded text-xs " + (statusColor[lead.status] || "")}>
                                                {lead.status}
                                            </span>
                                        </td>
                                        <td className="p-3 flex gap-2">
                                            <button
                                                onClick={() => handleEmail(lead)}
                                                className="bg-brand/20 text-brand px-3 py-1 rounded transition duration-200 hover:bg-brand hover:text-white"
                                            >
                                                AI Email
                                            </button>
                                            <button
                                                onClick={() => handleEdit(lead)}
                                                className="bg-white/10 text-white px-3 py-1 rounded transition duration-200 hover:bg-white/20"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(lead._id)}
                                                className="bg-red-500/20 text-red-400 px-3 py-1 rounded transition duration-200 hover:bg-red-500 hover:text-white"
                                            >
                                                Delete
                                            </button>

                                            {lead.status === "qualified" && (
                                            <button
                                                onClick={() => handleConvert(lead)}
                                                className="bg-green-500/20 text-green-300 px-3 py-1 rounded transition duration-200 hover:bg-green-500 hover:text-white"
                                            >
                                                Convert
                                            </button>
                                        )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {emailModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
                    <div className="bg-card border border-white/10 rounded-xl p-6 w-full max-w-lg">
                        <h3 className="text-lg font-bold mb-4">
                            Follow-up email for {emailModal.lead.name}
                        </h3>

                        {emailModal.loading && <p className="text-gray-400">Generating email...</p>}
                        {emailModal.error && <p className="text-red-400">{emailModal.error}</p>}

                        {emailModal.text && (
                            <pre className="bg-page border border-white/10 p-4 rounded text-sm whitespace-pre-wrap max-h-80 overflow-y-auto">
                                {emailModal.text}
                            </pre>
                        )}

                        <div className="flex justify-end gap-3 mt-4">
                            {emailModal.text && (
                                <button
                                    onClick={() => navigator.clipboard.writeText(emailModal.text)}
                                    className="bg-brand px-4 py-2 rounded transition duration-200 hover:bg-brand-dark"
                                >
                                    Copy
                                </button>
                            )}
                            <button
                                onClick={() => setEmailModal(null)}
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