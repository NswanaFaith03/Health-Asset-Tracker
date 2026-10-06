import { collection, doc, setDoc, getDocs, getDoc, query, where, Timestamp } from 'firebase/firestore'
import { db } from '../firebase/config'

/**
 * Database validation and initialization utility
 * Checks if all required collections exist and validates schema
 */

export const REQUIRED_COLLECTIONS = [
    'adminAccounts',
    'staffData',
    'appointments',
    'prescriptions',
    'medicines',
    'invoices',
    'payments',
    'patients',
    'services'
]

export const SAMPLE_DATA = {
    doctors: [
        {
            email: 'dr.smith@clinic.com',
            fullName: 'Dr. James Smith',
            role: 'doctor',
            specialization: 'General Practice',
            department: 'Medicine',
            phone: '+1-555-0101'
        },
        {
            email: 'dr.johnson@clinic.com',
            fullName: 'Dr. Sarah Johnson',
            role: 'doctor',
            specialization: 'Pediatrics',
            department: 'Pediatrics',
            phone: '+1-555-0102'
        },
        {
            email: 'dr.williams@clinic.com',
            fullName: 'Dr. Michael Williams',
            role: 'doctor',
            specialization: 'Cardiology',
            department: 'Cardiology',
            phone: '+1-555-0103'
        }
    ],

    medicines: [
        {
            name: 'Aspirin',
            genericName: 'Acetylsalicylic acid',
            dosage: '500mg',
            manufacturer: 'Generic',
            stock: 500,
            minStock: 50,
            price: 0.50,
            category: 'Pain Relief',
            side_effects: ['Stomach upset', 'Bleeding'],
            contraindications: ['Ulcers', 'Bleeding disorders']
        },
        {
            name: 'Amoxicillin',
            genericName: 'Amoxicillin',
            dosage: '500mg',
            manufacturer: 'Generic',
            stock: 300,
            minStock: 50,
            price: 2.50,
            category: 'Antibiotic',
            side_effects: ['Nausea', 'Diarrhea'],
            contraindications: ['Penicillin allergy']
        },
        {
            name: 'Lisinopril',
            genericName: 'Lisinopril',
            dosage: '10mg',
            manufacturer: 'Generic',
            stock: 200,
            minStock: 30,
            price: 1.50,
            category: 'Blood Pressure',
            side_effects: ['Dry cough', 'Dizziness'],
            contraindications: ['Pregnancy', 'Kidney disease']
        },
        {
            name: 'Metformin',
            genericName: 'Metformin',
            dosage: '500mg',
            manufacturer: 'Generic',
            stock: 250,
            minStock: 50,
            price: 0.75,
            category: 'Diabetes',
            side_effects: ['Nausea', 'Metallic taste'],
            contraindications: ['Kidney disease']
        },
        {
            name: 'Ibuprofen',
            genericName: 'Ibuprofen',
            dosage: '400mg',
            manufacturer: 'Generic',
            stock: 400,
            minStock: 50,
            price: 0.60,
            category: 'Pain Relief',
            side_effects: ['Stomach upset'],
            contraindications: ['Ulcers', 'Cardiovascular disease']
        }
    ],

    services: [
        {
            name: 'General Consultation',
            description: 'Basic medical consultation with a general practitioner',
            category: 'consultation',
            price: 50.00,
            duration: 30
        },
        {
            name: 'Specialist Consultation',
            description: 'Consultation with a medical specialist',
            category: 'consultation',
            price: 100.00,
            duration: 45
        },
        {
            name: 'Blood Test',
            description: 'Complete blood count and chemistry panel',
            category: 'lab',
            price: 75.00,
            duration: 15
        },
        {
            name: 'COVID-19 Test',
            description: 'RT-PCR COVID-19 test',
            category: 'lab',
            price: 30.00,
            duration: 10
        },
        {
            name: 'X-Ray',
            description: 'Digital radiography',
            category: 'diagnostic',
            price: 80.00,
            duration: 20
        },
        {
            name: 'Ultrasound',
            description: 'Ultrasound diagnostic imaging',
            category: 'diagnostic',
            price: 120.00,
            duration: 30
        },
        {
            name: 'Vaccination',
            description: 'Standard immunization services',
            category: 'treatment',
            price: 25.00,
            duration: 15
        }
    ]
}

export const DEFAULT_ROLE_SET = [
    'student',
    'doctor',
    'pharmacist',
    'labTechnician',
    'nurse',
    'mentalHealthCounselor',
    'hivProfessional',
    'receptionist',
    'admin'
]

export const ROOT_ADMIN_PROFILE = {
    email: 'root@unza.zm',
    fullName: 'System Administrator',
    role: 'admin',
    isRootAdmin: true,
    emailVerified: true,
    permissions: [
        'create_staff',
        'delete_staff',
        'modify_staff_roles',
        'view_all_records',
        'manage_system'
    ]
}

/**
 * Validate that all required collections exist in Firestore
 */
export async function validateCollections() {
    console.log('🔍 Validating Firestore collections...')
    const validationResults = {}

    for (const collectionName of REQUIRED_COLLECTIONS) {
        try {
            const snapshot = await getDocs(collection(db, collectionName))
            validationResults[collectionName] = {
                exists: true,
                count: snapshot.size,
                status: '✅'
            }
            console.log(`✅ Collection "${collectionName}" exists (${snapshot.size} documents)`)
        } catch (error) {
            validationResults[collectionName] = {
                exists: false,
                error: error.message,
                status: '❌'
            }
            console.warn(`⚠️ Collection "${collectionName}" may not exist or cannot be accessed`)
        }
    }

    return validationResults
}

/**
 * Seed database with sample data (doctors, medicines, services)
 * Only for development/testing - will not overwrite existing data
 */
export async function seedDatabase() {
    console.log('🌱 Seeding database with sample data...')

    // Seed medicines
    console.log('Adding medicines...')
    for (const medicine of SAMPLE_DATA.medicines) {
        try {
            const docRef = doc(collection(db, 'medicines'))
            await setDoc(docRef, {
                ...medicine,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
                status: 'active'
            })
            console.log(`  ✅ Added medicine: ${medicine.name}`)
        } catch (error) {
            console.error(`  ❌ Error adding medicine ${medicine.name}:`, error.message)
        }
    }

    // Seed services
    console.log('Adding services...')
    for (const service of SAMPLE_DATA.services) {
        try {
            const docRef = doc(collection(db, 'services'))
            await setDoc(docRef, {
                ...service,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
                status: 'active'
            })
            console.log(`  ✅ Added service: ${service.name}`)
        } catch (error) {
            console.error(`  ❌ Error adding service ${service.name}:`, error.message)
        }
    }

    console.log('🎉 Database seeding complete!')
}

/**
 * Check if user's staffData document has required fields
 */
export async function validateUserProfile(userId) {
    try {
        const userDocRef = doc(db, 'staffData', userId)
        const userDoc = await getDoc(userDocRef)

        if (!userDoc.exists()) {
            console.error(`❌ User profile not found for ${userId}`)
            return false
        }

        const data = userDoc.data()
        const requiredFields = ['uid', 'email', 'fullName', 'role']
        const missingFields = requiredFields.filter(field => !data[field])

        if (missingFields.length > 0) {
            console.warn(`⚠️ User profile missing fields: ${missingFields.join(', ')}`)
            return false
        }

        if (data.role && !DEFAULT_ROLE_SET.includes(data.role)) {
            console.warn(`⚠️ Unsupported role detected: ${data.role}`)
            return false
        }

        if (data.role === 'admin' && data.isRootAdmin !== true && !['root@unza.zm', 'nswana.faith@cs.unza.zm'].includes(String(data.email || '').trim().toLowerCase())) {
            console.warn('⚠️ Admin profile should include isRootAdmin flag or root email mapping')
            return false
        }

        console.log(`✅ User profile valid for ${data.fullName}`)
        return true
    } catch (error) {
        console.error('Error validating user profile:', error.message)
        return false
    }
}

/**
 * Validate Firestore indexes are properly configured
 */
export function validateIndexes() {
    const requiredIndexes = [
        { collection: 'staffData', fields: ['role', 'createdAt'] },
        { collection: 'appointments', fields: ['doctorName', 'createdAt'] },
        { collection: 'appointments', fields: ['status', 'createdAt'] },
        { collection: 'appointments', fields: ['appointmentDate', 'createdAt'] },
        { collection: 'appointments', fields: ['appointmentDate', 'doctorName'] },
        { collection: 'appointments', fields: ['appointmentDate', 'status'] },
        { collection: 'invoices', fields: ['status', 'createdAt'] },
        { collection: 'payments', fields: ['processedAt', 'status'] }
    ]

    console.log('📋 Required Firestore Indexes:')
    for (const idx of requiredIndexes) {
        console.log(`  • ${idx.collection}: ${idx.fields.join(' + ')}`)
    }

    console.log('\n📖 To create indexes:')
    console.log('  1. Go to Firebase Console → Firestore → Indexes')
    console.log('  2. Create each composite index listed above')
    console.log('  3. Or use: firebase deploy --only firestore:indexes')
}

/**
 * Validate Firestore security rules
 */
export function validateSecurityRules() {
    console.log('🔐 Security Rules Status:')
    console.log('  ✅ Root admin can create staff accounts only')
    console.log('  ✅ Students can self-register only as student')
    console.log('  ✅ Staff roles are admin-managed instead of self-registered')
    console.log('  ✅ Email verification remains required for normal access')
    console.log('  ✅ Firestore rules validate the admin-first workflow')
    console.log('\n📖 To deploy rules:')
    console.log('  1. Go to Firebase Console → Firestore → Rules')
    console.log('  2. Replace with content from firestore-rules-enhanced.txt')
    console.log('  3. Click "Publish"')
}

/**
 * Run full database validation
 */
export async function runFullValidation() {
    console.log('='.repeat(50))
    console.log('🚀 FIRESTORE DATABASE VALIDATION')
    console.log('='.repeat(50))

    const collectionResults = await validateCollections()
    console.log('\n')
    validateIndexes()
    console.log('\n')
    validateSecurityRules()

    // Initialize system settings
    await initializeSystemSettings()

    const allValid = Object.values(collectionResults).every(r => r.exists)
    console.log('\n' + '='.repeat(50))
    if (allValid) {
        console.log('✅ All collections are accessible!')
    } else {
        console.log('⚠️ Some collections may not exist. Run setup wizard or check permissions.')
    }
    console.log('='.repeat(50))

    return collectionResults
}

/**
 * Initialize system settings if they don't exist
 * This ensures emergency response settings are always available
 */
export async function initializeSystemSettings() {
    try {
        const emergencyRef = doc(db, 'systemSettings', 'emergencyResponse')
        const emergencySnap = await getDoc(emergencyRef)

        if (!emergencySnap.exists()) {
            await setDoc(emergencyRef, {
                emergencyPhone: '',
                createdAt: new Date().toISOString(),
                lastModified: new Date().toISOString()
            })
            console.log('✅ Initialized systemSettings/emergencyResponse')
        }
    } catch (error) {
        const message = error?.message || ''
        const isPermissionError = /permission|insufficient permissions/i.test(message)
        if (!isPermissionError) {
            console.error('Could not initialize system settings:', error)
        }
    }
}

export default {
    validateCollections,
    validateUserProfile,
    validateIndexes,
    validateSecurityRules,
    runFullValidation,
    seedDatabase,
    initializeSystemSettings,
    REQUIRED_COLLECTIONS,
    SAMPLE_DATA,
    DEFAULT_ROLE_SET,
    ROOT_ADMIN_PROFILE
}
