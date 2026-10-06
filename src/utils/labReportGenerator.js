import { jsPDF } from 'jspdf'
import autoTablePlugin from 'jspdf-autotable'

function ensureAutoTable(doc) {
    if (typeof doc.autoTable === 'function') return doc

    const plugin = autoTablePlugin?.autoTable || autoTablePlugin?.default || autoTablePlugin

    if (typeof plugin !== 'function') {
        throw new Error('jsPDF autoTable plugin is not available')
    }

    doc.autoTable = (options) => plugin(doc, options)
    return doc
}

async function loadImageDataUrl(imagePath) {
    try {
        // Try fetching from public folder first
        let response = await fetch(imagePath)
        if (!response.ok) {
            // Fallback to adding /DigiHealth path prefix
            response = await fetch(`/DigiHealth${imagePath}`)
        }
        if (!response.ok) {
            throw new Error(`Failed to load image: ${imagePath}`)
        }

        const blob = await response.blob()
        return await new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result)
            reader.onerror = reject
            reader.readAsDataURL(blob)
        })
    } catch (error) {
        console.error('Error loading image:', imagePath, error)
        throw error
    }
}

async function addBrandLogos(doc) {
    try {
        const unzaLogo = await loadImageDataUrl('/images/unzamainlogo.png')
        doc.addImage(unzaLogo, 'PNG', 10, 2, 35, 35)
    } catch (error) {
        console.warn('UNZA logo could not be added to PDF:', error)
    }

    try {
        const flagLogo = await loadImageDataUrl('/images/zamflag.png')
        doc.addImage(flagLogo, 'PNG', 165, 2, 35, 35)
    } catch (error) {
        console.warn('DigiHealth flag logo could not be added to PDF:', error)
    }
}

function safeText(value, fallback = 'Not provided') {
    if (value === undefined || value === null || value === '') return fallback
    return String(value)
}

export async function generateLabMedicalReportPDF(report = {}) {
    const doc = ensureAutoTable(new jsPDF())
    const request = report.request || {}
    const profile = report.profile || {}
    const results = Array.isArray(report.results) ? report.results : []
    const summary = report.summary || 'Lab report generated from submitted specimen analysis.'
    const recommendations = report.recommendations || 'Continue routine monitoring and review with the attending clinician.'
    const generatedAt = report.generatedAt || new Date().toISOString()

    doc.setProperties({
        title: `Medical Lab Report - ${safeText(request.studentName || request.studentId || 'Student')}`,
        subject: 'Student Medical Laboratory Report',
        author: 'DigiHealth Clinic',
        creator: 'DigiHealth Management System'
    })

    doc.setFillColor(15, 118, 110)
    doc.rect(0, 0, 210, 45, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.setFont(undefined, 'bold')
    doc.text('UNZA MEDICAL LABORATORY REPORT', 105, 28, { align: 'center' })
    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')
    doc.text('DigiHealth Clinic Management System', 105, 36, { align: 'center' })


    doc.setTextColor(15, 23, 42)
    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.text('Patient Information', 14, 58)
    doc.setFont(undefined, 'normal')
    doc.setFontSize(10)

    const patientInfo = [
        ['Student Name', safeText(request.studentName || profile.fullName || 'Student')],
        ['Student ID', safeText(request.studentId || profile.studentId || profile.studentNumber || 'Not provided')],
        ['Email', safeText(request.patientEmail || profile.email || 'Not provided')],
        ['Phone', safeText(request.patientPhone || profile.phone || 'Not provided')],
        ['Age', safeText(profile.age || 'Not provided')],
        ['Blood Type', safeText(profile.bloodType || 'Not provided')],
        ['Date', new Date(generatedAt).toLocaleDateString()]
    ]

    doc.autoTable({
        startY: 64,
        head: [],
        body: patientInfo,
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 3, textColor: [15, 23, 42] },
        columnStyles: {
            0: { cellWidth: 50, fontStyle: 'bold' },
            1: { cellWidth: 120 }
        },
        margin: { left: 14, right: 14 },
        tableWidth: 180
    })

    const vitalData = [
        ['Height', safeText(profile.height || 'Not provided')],
        ['Weight', safeText(profile.weight || 'Not provided')],
        ['BMI', safeText(profile.bmi || 'Not provided')],
        ['Temperature', safeText(profile.temperature || 'Not provided')],
        ['Blood Pressure', safeText(profile.bloodPressure || 'Not provided')],
        ['Pulse', safeText(profile.pulse || 'Not provided')],
        ['Allergies', safeText(profile.allergies || 'None reported')],
        ['Medications', safeText(profile.medications || 'None reported')]
    ]

    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.text('Vital Signs / Medical Intake', 14, doc.lastAutoTable.finalY + 12)
    doc.setFont(undefined, 'normal')
    doc.setFontSize(10)

    doc.autoTable({
        startY: doc.lastAutoTable.finalY + 18,
        head: [],
        body: vitalData,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
            0: { cellWidth: 60, fontStyle: 'bold' },
            1: { cellWidth: 110 }
        },
        margin: { left: 14, right: 14 },
        tableWidth: 180
    })

    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.text('Requested Examination', 14, doc.lastAutoTable.finalY + 12)
    doc.setFont(undefined, 'normal')
    doc.setFontSize(10)
    doc.text(`Test: ${safeText(request.testName || 'Lab test')}`, 18, doc.lastAutoTable.finalY + 20)
    doc.text(`Doctor: ${safeText(request.doctorName || 'Not provided')}`, 18, doc.lastAutoTable.finalY + 28)
    doc.text(`Priority: ${safeText(request.priority || 'Normal')}`, 18, doc.lastAutoTable.finalY + 36)
    doc.text(`Clinical Notes: ${safeText(request.notes || 'No additional notes provided')}`, 18, doc.lastAutoTable.finalY + 44, { maxWidth: 170 })

    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.text('Lab Findings', 14, doc.lastAutoTable.finalY + 16)
    doc.setFont(undefined, 'normal')
    doc.setFontSize(10)

    if (results.length > 0) {
        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 22,
            head: [['Parameter', 'Result', 'Unit', 'Reference Range', 'Status']],
            body: results.map((item) => [
                safeText(item.parameter || 'N/A'),
                safeText(item.result || 'N/A'),
                safeText(item.unit || '—'),
                safeText(item.referenceRange || '—'),
                safeText(item.status || 'Normal')
            ]),
            theme: 'grid',
            headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontStyle: 'bold' },
            styles: { fontSize: 8, cellPadding: 2.5 },
            margin: { left: 14, right: 14 },
            tableWidth: 180
        })
    } else {
        doc.text('No result rows were entered for this report.', 18, doc.lastAutoTable.finalY + 22)
    }

    const summaryY = doc.lastAutoTable.finalY + 14
    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.text('Clinical Summary', 14, summaryY)
    doc.setFont(undefined, 'normal')
    doc.setFontSize(10)
    doc.text(doc.splitTextToSize(summary, 170), 18, summaryY + 8)

    const recY = summaryY + 30
    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.text('Recommendations', 14, recY)
    doc.setFont(undefined, 'normal')
    doc.setFontSize(10)
    doc.text(doc.splitTextToSize(recommendations, 170), 18, recY + 8)

    doc.setDrawColor(15, 118, 110)
    doc.setLineWidth(0.5)
    doc.line(14, 270, 196, 270)
    doc.setFontSize(8)
    doc.setTextColor(100, 116, 139)
    doc.text('Verified and issued by DigiHealth clinic', 105, 276, { align: 'center' })

    return doc
}
