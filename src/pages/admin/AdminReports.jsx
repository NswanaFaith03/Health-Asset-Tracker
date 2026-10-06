import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { FaFilePdf, FaUsers, FaClipboardList, FaChartBar, FaHospital, FaUserNurse, FaUserDoctor, FaPhone, FaCalendar, FaDownload, FaChartLine } from 'react-icons/fa6'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts'

const COLORS = ['#1f8a4c', '#2d9f5e', '#3cb472', '#4ac985', '#59de98', '#67f2aa']

export default function AdminReports() {
    const { currentUser } = useAuth()
    const [loading, setLoading] = useState(true)
    const [reportData, setReportData] = useState({
        totalStaff: 0,
        totalStudents: 0,
        totalConsultations: 0,
        totalEmergencyCalls: 0,
        staffByRole: {},
        studentsRegistered: 0,
        pendingApprovals: 0,
        completedConsultations: 0,
        todayConsultations: 0
    })
    const [chartData, setChartData] = useState({
        consultationTrends: [],
        staffDistribution: [],
        dailyActivity: [],
        consultationTypes: []
    })

    const reportTypes = [
        { id: 'staff', label: 'Staff Report', description: 'Complete staff directory with roles and departments', icon: FaUsers },
        { id: 'students', label: 'Student Report', description: 'Registered students, approvals, and activity summary', icon: FaUsers },
        { id: 'consultations', label: 'Consultations Report', description: 'All consultations by type, status, and timeline', icon: FaClipboardList },
        { id: 'emergency', label: 'Emergency Calls Report', description: 'Emergency call log with locations and timestamps', icon: FaPhone },
        { id: 'overview', label: 'System Overview', description: 'Comprehensive dashboard of all system metrics', icon: FaChartBar },
        { id: 'activity', label: 'Activity Report', description: 'Daily/monthly user activity and engagement', icon: FaCalendar }
    ]

    useEffect(() => {
        loadReportData()
    }, [])

    const loadReportData = async () => {
        try {
            // Load staff data
            const staffSnap = await getDocs(query(collection(db, 'staffData'), where('role', '!=', 'student')))
            const staffData = staffSnap.docs.map(doc => doc.data())

            // Load student data
            const studentSnap = await getDocs(query(collection(db, 'staffData'), where('role', '==', 'student')))
            const studentData = studentSnap.docs.map(doc => doc.data())

            // Load consultations
            const consultSnap = await getDocs(collection(db, 'appointments'))
            const consultData = consultSnap.docs.map(doc => doc.data())

            // Load emergency calls
            const emergencySnap = await getDocs(collection(db, 'emergencyAlerts'))

            // Calculate staff by role
            const staffByRole = {}
            staffData.forEach(staff => {
                const role = staff.role || 'unknown'
                staffByRole[role] = (staffByRole[role] || 0) + 1
            })

            const today = new Date().toISOString().split('T')[0]

            // Generate chart data
            // Consultation trends by date (last 7 days)
            const last7Days = []
            for (let i = 6; i >= 0; i--) {
                const date = new Date()
                date.setDate(date.getDate() - i)
                const dateStr = date.toISOString().split('T')[0]
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
                const count = consultData.filter(c => c.appointmentDate === dateStr).length
                last7Days.push({ date: dayName, consultations: count })
            }

            // Staff distribution for pie chart
            const staffDistribution = Object.entries(staffByRole).map(([role, count]) => ({
                name: role.charAt(0).toUpperCase() + role.slice(1),
                value: count
            }))

            // Consultation types
            const consultTypes = {}
            consultData.forEach(c => {
                const type = c.appointmentType || 'other'
                consultTypes[type] = (consultTypes[type] || 0) + 1
            })
            const consultationTypes = Object.entries(consultTypes).map(([type, count]) => ({
                name: type.charAt(0).toUpperCase() + type.slice(1),
                value: count
            }))

            // Daily activity (consultations by status)
            const statusCounts = {}
            consultData.forEach(c => {
                const status = c.status || 'unknown'
                statusCounts[status] = (statusCounts[status] || 0) + 1
            })
            const dailyActivity = Object.entries(statusCounts).map(([status, count]) => ({
                name: status.charAt(0).toUpperCase() + status.slice(1),
                value: count
            }))

            setReportData({
                totalStaff: staffData.length,
                totalStudents: studentData.length,
                totalConsultations: consultData.length,
                totalEmergencyCalls: emergencySnap.size,
                staffByRole,
                studentsRegistered: studentData.filter(s => s.approved === true).length,
                pendingApprovals: studentData.filter(s => s.approved !== true).length,
                completedConsultations: consultData.filter(c => c.status === 'completed').length,
                todayConsultations: consultData.filter(c => c.appointmentDate === today).length
            })

            setChartData({
                consultationTrends: last7Days,
                staffDistribution,
                dailyActivity,
                consultationTypes
            })

            setLoading(false)
        } catch (error) {
            console.error('Error loading report data:', error)
            setLoading(false)
        }
    }

    const generatePDF = (reportType) => {
        const doc = new jsPDF()
        const pageWidth = doc.internal.pageSize.getWidth()
        
        // Header
        doc.setFontSize(20)
        doc.setTextColor(31, 138, 76) // Green color
        doc.text('UNZA DIGIHEALTH', pageWidth / 2, 20, { align: 'center' })
        
        doc.setFontSize(16)
        doc.setTextColor(0, 0, 0)
        doc.text(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`, pageWidth / 2, 30, { align: 'center' })
        
        doc.setFontSize(10)
        doc.setTextColor(100, 100, 100)
        doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, 38, { align: 'center' })
        
        doc.setDrawColor(217, 31, 38)
        doc.line(20, 42, pageWidth - 20, 42)
        
        let startY = 50
        
        switch(reportType) {
            case 'staff':
                generateStaffReport(doc, startY)
                break
            case 'students':
                generateStudentReport(doc, startY)
                break
            case 'consultations':
                generateConsultationsReport(doc, startY)
                break
            case 'emergency':
                generateEmergencyReport(doc, startY)
                break
            case 'overview':
                generateOverviewReport(doc, startY)
                break
            case 'activity':
                generateActivityReport(doc, startY)
                break
            default:
                generateOverviewReport(doc, startY)
        }
        
        doc.save(`${reportType}-report-${new Date().toISOString().split('T')[0]}.pdf`)
    }

    const generateStaffReport = async (doc, startY) => {
        try {
            const staffSnap = await getDocs(query(collection(db, 'staffData'), where('role', '!=', 'student')))
            const staffData = staffSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            
            doc.setFontSize(14)
            doc.setTextColor(0, 0, 0)
            doc.text(`Total Staff: ${staffData.length}`, 20, startY)
            
            const tableData = staffData.map(staff => [
                staff.fullName || 'N/A',
                staff.email || 'N/A',
                staff.role || 'N/A',
                staff.phone || 'N/A',
                staff.department || 'N/A',
                staff.specialization || 'N/A',
                staff.approved ? 'Active' : 'Inactive'
            ])
            
            autoTable(doc, {
                startY: startY + 10,
                head: [['Name', 'Email', 'Role', 'Phone', 'Department', 'Specialization', 'Status']],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [31, 138, 76], textColor: 255 },
                alternateRowStyles: { fillColor: [245, 245, 245] }
            })
        } catch (error) {
            console.error('Error generating staff report:', error)
        }
    }

    const generateStudentReport = async (doc, startY) => {
        try {
            const studentSnap = await getDocs(query(collection(db, 'staffData'), where('role', '==', 'student')))
            const studentData = studentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            
            doc.setFontSize(14)
            doc.text(`Total Students: ${studentData.length}`, 20, startY)
            doc.text(`Registered: ${reportData.studentsRegistered}`, 20, startY + 8)
            doc.text(`Pending Approval: ${reportData.pendingApprovals}`, 20, startY + 16)
            
            const tableData = studentData.map(student => [
                student.fullName || 'N/A',
                student.email || 'N/A',
                student.studentNumber || 'N/A',
                student.approved ? 'Approved' : 'Pending',
                student.emergencyContact?.name || 'N/A',
                student.emergencyContact?.phone || 'N/A',
                student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'
            ])
            
            autoTable(doc, {
                startY: startY + 25,
                head: [['Name', 'Email', 'Student Number', 'Status', 'Emergency Contact', 'Emergency Phone', 'Registration Date']],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [31, 138, 76], textColor: 255 },
                alternateRowStyles: { fillColor: [245, 245, 245] }
            })
        } catch (error) {
            console.error('Error generating student report:', error)
        }
    }

    const generateConsultationsReport = async (doc, startY) => {
        try {
            const consultSnap = await getDocs(collection(db, 'appointments'))
            const consultData = consultSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            
            doc.setFontSize(14)
            doc.text(`Total Consultations: ${consultData.length}`, 20, startY)
            doc.text(`Completed: ${reportData.completedConsultations}`, 20, startY + 8)
            doc.text(`Today: ${reportData.todayConsultations}`, 20, startY + 16)
            
            const tableData = consultData.map(consult => [
                consult.patientName || 'N/A',
                consult.appointmentType || 'N/A',
                consult.status || 'N/A',
                consult.appointmentDate || 'N/A',
                consult.appointmentTime || 'N/A',
                consult.doctorName || 'Unassigned',
                consult.source || 'N/A'
            ])
            
            autoTable(doc, {
                startY: startY + 25,
                head: [['Patient Name', 'Type', 'Status', 'Date', 'Time', 'Assigned Doctor', 'Source']],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [31, 138, 76], textColor: 255 },
                alternateRowStyles: { fillColor: [245, 245, 245] }
            })
        } catch (error) {
            console.error('Error generating consultations report:', error)
        }
    }

    const generateEmergencyReport = async (doc, startY) => {
        try {
            const emergencySnap = await getDocs(collection(db, 'emergencyAlerts'))
            const emergencyData = emergencySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            
            doc.setFontSize(14)
            doc.text(`Total Emergency Calls: ${emergencyData.length}`, 20, startY)
            
            const tableData = emergencyData.map(alert => [
                alert.studentName || 'N/A',
                alert.emergencyPhone || 'N/A',
                alert.coordinates ? `${alert.coordinates.latitude?.toFixed(5)}, ${alert.coordinates.longitude?.toFixed(5)}` : 'N/A',
                alert.createdAt ? new Date(alert.createdAt).toLocaleString() : 'N/A',
                alert.status || 'N/A'
            ])
            
            autoTable(doc, {
                startY: startY + 10,
                head: [['Student', 'Emergency Line', 'Coordinates', 'Time', 'Status']],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [31, 138, 76], textColor: 255 },
                alternateRowStyles: { fillColor: [245, 245, 245] }
            })
        } catch (error) {
            console.error('Error generating emergency report:', error)
        }
    }

    const generateOverviewReport = (doc, startY) => {
        doc.setFontSize(14)
        doc.text('System Overview', 20, startY)
        
        const overviewData = [
            ['Metric', 'Value'],
            ['Total Staff', reportData.totalStaff.toString()],
            ['Total Students', reportData.totalStudents.toString()],
            ['Registered Students', reportData.studentsRegistered.toString()],
            ['Pending Approvals', reportData.pendingApprovals.toString()],
            ['Total Consultations', reportData.totalConsultations.toString()],
            ['Completed Consultations', reportData.completedConsultations.toString()],
            ['Today\'s Consultations', reportData.todayConsultations.toString()],
            ['Emergency Calls', reportData.totalEmergencyCalls.toString()]
        ]
        
        // Staff by role breakdown
        let roleStartY = startY + 60
        doc.setFontSize(12)
        doc.text('Staff by Role:', 20, roleStartY)
        
        const roleData = [['Role', 'Count'], ...Object.entries(reportData.staffByRole).map(([role, count]) => [role, count.toString()])]
        
        autoTable(doc, {
            startY: startY + 10,
            head: [overviewData[0]],
            body: overviewData.slice(1),
            theme: 'grid',
            headStyles: { fillColor: [31, 138, 76], textColor: 255 },
            alternateRowStyles: { fillColor: [245, 245, 245] }
        })

        autoTable(doc, {
            startY: roleStartY + 5,
            head: [roleData[0]],
            body: roleData.slice(1),
            theme: 'grid',
            headStyles: { fillColor: [31, 138, 76], textColor: 255 },
            alternateRowStyles: { fillColor: [245, 245, 245] }
        })
    }

    const generateActivityReport = async (doc, startY) => {
        try {
            const auditSnap = await getDocs(collection(db, 'auditLogs'))
            const auditData = auditSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            
            doc.setFontSize(14)
            doc.text(`Total Audit Events: ${auditData.length}`, 20, startY)
            
            const tableData = auditData.slice(0, 100).map(audit => [
                audit.action || 'N/A',
                audit.performedBy || 'N/A',
                audit.targetRole || 'N/A',
                audit.createdAt ? new Date(audit.createdAt).toLocaleString() : 'N/A',
                audit.details || 'N/A'
            ])
            
            autoTable(doc, {
                startY: startY + 10,
                head: [['Action', 'Performed By', 'Target Role', 'Time', 'Details']],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [31, 138, 76], textColor: 255 },
                alternateRowStyles: { fillColor: [245, 245, 245] }
            })
        } catch (error) {
            console.error('Error generating activity report:', error)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center">
                <div className="text-slate-600">Loading reports...</div>
            </div>
        )
    }

    return (
        <div className="text-slate-900 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                    <div
                        className="relative h-36 md:h-28 lg:h-24"
                        style={{ backgroundImage: "url('/images/unzaclinicposter.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
                    >
                        <div className="absolute inset-0 bg-black/45" />
                        <div className="relative z-10 p-6 flex items-center gap-3 h-full">
                            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                                <FaFilePdf className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">System Reports</h1>
                                <p className="text-slate-200">Generate and download comprehensive PDF reports</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <FaUsers className="w-5 h-5 text-teal-600" />
                            <span className="text-2xl font-bold text-slate-900">{reportData.totalStaff}</span>
                        </div>
                        <div className="text-sm text-slate-600">Total Staff</div>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <FaUsers className="w-5 h-5 text-emerald-600" />
                            <span className="text-2xl font-bold text-slate-900">{reportData.totalStudents}</span>
                        </div>
                        <div className="text-sm text-slate-600">Total Students</div>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <FaClipboardList className="w-5 h-5 text-violet-600" />
                            <span className="text-2xl font-bold text-slate-900">{reportData.totalConsultations}</span>
                        </div>
                        <div className="text-sm text-slate-600">Total Consultations</div>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <FaPhone className="w-5 h-5 text-teal-600" />
                            <span className="text-2xl font-bold text-slate-900">{reportData.totalEmergencyCalls}</span>
                        </div>
                        <div className="text-sm text-slate-600">Emergency Calls</div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold mb-4 text-slate-900 flex items-center gap-2">
                        <FaChartLine className="w-5 h-5 text-teal-600" />
                        Analytics & Trends
                    </h2>
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Consultation Trends Line Chart */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                            <h3 className="text-lg font-semibold mb-4 text-slate-900">Consultation Trends (Last 7 Days)</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={chartData.consultationTrends}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="consultations" stroke="#1f8a4c" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Staff Distribution Pie Chart */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                            <h3 className="text-lg font-semibold mb-4 text-slate-900">Staff Distribution by Role</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={chartData.staffDistribution}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {chartData.staffDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Consultation Types Bar Chart */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                            <h3 className="text-lg font-semibold mb-4 text-slate-900">Consultations by Type</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartData.consultationTypes}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="value" fill="#2d9f5e" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Activity Status Bar Chart */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                            <h3 className="text-lg font-semibold mb-4 text-slate-900">Consultation Status Distribution</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartData.dailyActivity}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="value" fill="#3cb472" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Report Types */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold mb-4 text-slate-900">Available Reports</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {reportTypes.map(report => {
                            const Icon = report.icon
                            return (
                                <button
                                    key={report.id}
                                    onClick={() => generatePDF(report.id)}
                                    className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-teal-300 hover:shadow-md transition-all text-left"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
                                            <Icon className="w-6 h-6 text-teal-600" />
                                        </div>
                                        <FaDownload className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{report.label}</h3>
                                    <p className="text-sm text-slate-600">{report.description}</p>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Staff by Role Breakdown */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h2 className="text-xl font-bold mb-4 text-slate-900">Staff by Role</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {Object.entries(reportData.staffByRole).map(([role, count]) => (
                            <div key={role} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <span className="text-sm font-medium text-slate-700 capitalize">{role}</span>
                                <span className="text-lg font-bold text-slate-900">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Back Button */}
                <div className="mt-8">
                    <Link
                        to="/admin"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-slate-200 hover:bg-slate-300 rounded-xl font-medium text-slate-900 transition"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    )
}
