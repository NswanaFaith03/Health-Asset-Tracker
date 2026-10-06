#!/usr/bin/env node

/**
 * Staff Account Audit & Recovery Script
 * 
 * This script scans for orphaned staff accounts:
 * - Users that exist in Firebase Auth but NOT in Firestore staffData collection
 * 
 * Usage:
 *   node auditAndRecoverStaffAccounts.js              # Audit only, show orphaned accounts
 *   node auditAndRecoverStaffAccounts.js --recover    # Audit AND recover all orphaned accounts
 *   node auditAndRecoverStaffAccounts.js --recover <uid>  # Recover specific UID
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
    console.error('❌ serviceAccountKey.json not found in project root');
    process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
});

const auth = admin.auth();
const db = admin.firestore();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise((resolve) => rl.question(query, resolve));
}

const staffRoles = {
    doctor: { displayName: 'Doctor' },
    pharmacist: { displayName: 'Pharmacist' },
    labTechnician: { displayName: 'Lab Technician' },
    nurse: { displayName: 'Nurse' },
    mentalHealthCounselor: { displayName: 'Mental Health Counselor' },
    hivProfessional: { displayName: 'HIV Professional' },
    receptionist: { displayName: 'Receptionist' },
    admin: { displayName: 'Administrator' }
};

function getPermissionsForRole(role) {
    const permissions = {
        doctor: ['view_appointments', 'create_prescription', 'view_patient_records', 'update_consultation_status'],
        pharmacist: ['view_prescriptions', 'dispense_medication', 'track_fulfillment'],
        labTechnician: ['process_lab_requests', 'publish_results', 'view_samples'],
        nurse: ['patient_intake', 'triage_support', 'queue_coordination', 'create_consultation'],
        mentalHealthCounselor: ['manage_sessions', 'patient_communication', 'schedule_counseling'],
        hivProfessional: ['coordinate_support', 'manage_resources', 'session_tracking'],
        receptionist: ['manage_intake', 'schedule_appointments', 'manage_billing', 'queue_support'],
        admin: ['all_access', 'system_management', 'user_administration', 'analytics']
    };
    return permissions[role] || [];
}

async function auditStaffAccounts() {
    console.log('\n🔍 Auditing staff accounts...\n');

    const orphanedAccounts = [];
    const validAccounts = [];
    const staffDataUids = new Set();

    try {
        // Get all UIDs from Firestore staffData collection
        console.log('📋 Scanning Firestore staffData collection...');
        const staffSnapshot = await db.collection('staffData').get();
        staffSnapshot.forEach(doc => {
            staffDataUids.add(doc.id);
        });
        console.log(`   Found ${staffDataUids.size} valid staff records in Firestore\n`);

        // Get all users from Firebase Auth
        console.log('👥 Scanning Firebase Auth users...');
        let pageToken = undefined;
        let totalAuthUsers = 0;
        let processedBatch = 0;

        do {
            const listUsersResult = await auth.listUsers(1000, pageToken);
            processedBatch++;
            console.log(`   Processing batch ${processedBatch}...`);

            for (const user of listUsersResult.users) {
                totalAuthUsers++;

                // Skip test/special users
                if (user.email && (user.email.includes('test') || user.email.includes('demo'))) {
                    continue;
                }

                // Check if this Auth user has a Firestore record
                if (!staffDataUids.has(user.uid)) {
                    // This is an orphaned account
                    orphanedAccounts.push({
                        uid: user.uid,
                        email: user.email || 'NO_EMAIL',
                        displayName: user.displayName || 'NO_NAME',
                        emailVerified: user.emailVerified || false,
                        createdAt: new Date(user.metadata.creationTime).toISOString()
                    });
                } else {
                    validAccounts.push({
                        uid: user.uid,
                        email: user.email
                    });
                }
            }

            pageToken = listUsersResult.pageToken;
        } while (pageToken);

        console.log(`   Total Auth users scanned: ${totalAuthUsers}\n`);

        // Report findings
        console.log('╔════════════════════════════════════════════╗');
        console.log('║           AUDIT REPORT                      ║');
        console.log('╠════════════════════════════════════════════╣');
        console.log(`║ Total Auth Users:           ${String(totalAuthUsers).padEnd(19)}║`);
        console.log(`║ Valid Staff Records:        ${String(validAccounts.length).padEnd(19)}║`);
        console.log(`║ ORPHANED (missing docs):    ${String(orphanedAccounts.length).padEnd(19)}║`);
        console.log('╚════════════════════════════════════════════╝\n');

        if (orphanedAccounts.length > 0) {
            console.log('⚠️  ORPHANED ACCOUNTS (exist in Auth but not in Firestore):\n');
            orphanedAccounts.forEach((acc, idx) => {
                console.log(`  ${idx + 1}. ${acc.email} (verified: ${acc.emailVerified ? '✅' : '❌'})`);
                console.log(`     UID: ${acc.uid}`);
                console.log(`     Created: ${acc.createdAt}`);
                console.log('');
            });
        } else {
            console.log('✅ No orphaned accounts found! All staff have valid Firestore records.\n');
        }

        return { orphanedAccounts, validAccounts };

    } catch (error) {
        console.error('❌ Error during audit:', error.message);
        throw error;
    }
}

async function recoverAccount(uid, email, displayName, emailVerified) {
    try {
        console.log(`\n🔧 Recovering account for ${email}...`);

        // Guess role based on email or ask user
        let role = 'doctor'; // default
        if (email.includes('pharmacist')) role = 'pharmacist';
        if (email.includes('lab')) role = 'labTechnician';
        if (email.includes('nurse')) role = 'nurse';
        if (email.includes('counsel')) role = 'mentalHealthCounselor';
        if (email.includes('receptionist')) role = 'receptionist';

        const userRole = await question(`   What role? (${Object.keys(staffRoles).join('/')} | default=${role}): `);
        if (userRole && Object.keys(staffRoles).includes(userRole)) {
            role = userRole;
        }

        // Create staff profile
        const staffProfile = {
            uid: uid,
            email: email.toLowerCase(),
            fullName: displayName || 'Unknown User',
            role: role,
            emailVerified: emailVerified,
            createdAt: new Date().toISOString(),
            recoveredAt: new Date().toISOString(),
            recoveredByAdmin: 'CLI_AUDIT_RECOVERY',
            lastLogin: null,
            isActive: true,
            permissions: getPermissionsForRole(role),
            verificationEmailSent: null
        };

        await db.collection('staffData').doc(uid).set(staffProfile);

        // Verify recovery
        const verifyDoc = await db.collection('staffData').doc(uid).get();
        if (verifyDoc.exists) {
            console.log(`   ✅ Successfully recovered ${email} as ${role}`);
            return true;
        } else {
            console.log(`   ❌ Recovery failed - document not created`);
            return false;
        }

    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        return false;
    }
}

async function main() {
    console.log('╔═════════════════════════════════════════════════════╗');
    console.log('║   Staff Account Audit & Recovery Tool               ║');
    console.log('║   Finds and fixes orphaned staff accounts           ║');
    console.log('╚═════════════════════════════════════════════════════╝');

    try {
        const { orphanedAccounts } = await auditStaffAccounts();

        const args = process.argv.slice(2);
        const shouldRecover = args.includes('--recover');
        const specificUid = args[args.indexOf('--recover') + 1];

        if (shouldRecover) {
            if (specificUid && orphanedAccounts.length === 0) {
                console.log(`No orphaned accounts to recover`);
                process.exit(0);
            }

            if (specificUid) {
                // Recover specific UID
                const account = orphanedAccounts.find(acc => acc.uid === specificUid);
                if (!account) {
                    console.log(`Account ${specificUid} not found in orphaned list`);
                    process.exit(1);
                }
                await recoverAccount(account.uid, account.email, account.displayName, account.emailVerified);
            } else if (orphanedAccounts.length > 0) {
                // Recover all
                const proceed = await question(`Recover all ${orphanedAccounts.length} orphaned accounts? (yes/no): `);
                if (proceed.toLowerCase() === 'yes') {
                    let recovered = 0;
                    for (const account of orphanedAccounts) {
                        if (await recoverAccount(account.uid, account.email, account.displayName, account.emailVerified)) {
                            recovered++;
                        }
                    }
                    console.log(`\n✅ Recovery complete: ${recovered}/${orphanedAccounts.length} accounts recovered\n`);
                } else {
                    console.log('Recovery cancelled');
                }
            }
        } else if (orphanedAccounts.length > 0) {
            console.log('💡 TIP: Run with --recover to fix these accounts');
            console.log('    Example: node auditAndRecoverStaffAccounts.js --recover\n');
        }

    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    } finally {
        rl.close();
        process.exit(0);
    }
}

main().catch(console.error);
