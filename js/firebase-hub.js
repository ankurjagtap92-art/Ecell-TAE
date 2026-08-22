/**
 * E-CELL TAE — FIREBASE & FIRESTORE REAL-TIME CLOUD DATABASE HUB
 * Project Name: Ecell-TAE
 * Project ID: ecell-tae
 * Project Number: 453928288620
 */

const ECELL_FIREBASE_CONFIG = {
  apiKey: "AIzaSyC81RGKGu1oQDlHyVLYpO3DzNxzqCGXhio",
  authDomain: "ecell-tae.firebaseapp.com",
  projectId: "ecell-tae",
  storageBucket: "ecell-tae.firebasestorage.app",
  messagingSenderId: "453928288620",
  appId: "1:453928288620:web:18839d649ed186bbb4f349",
  measurementId: "G-D3N5JZNSTK"
};

// Storage Keys for fast local cache fallback
const ECELL_STORAGE = {
  TEAMS: 'ecell_tae_teams_v1',
  COHORT: 'ecell_tae_cohort_members_v1',
  INQUIRIES: 'ecell_tae_inquiries_v1',
  MOCK_CLEARED: 'ecell_tae_mock_purged_v1'
};

// Firebase Instance State
let ecellFirebaseApp = null;
let ecellFirestore = null;
let ecellAnalytics = null;
let isEcellFirebaseLive = false;

// 1. Initialize Firebase & Firestore
try {
  if (typeof firebase !== 'undefined') {
    // Set Firestore log level to silent to suppress harmless offline/backend reachability notifications in sandboxes
    if (firebase.firestore && typeof firebase.firestore.setLogLevel === 'function') {
      try {
        firebase.firestore.setLogLevel('silent');
      } catch (logErr) {
        // Silently ignore
      }
    }

    if (!firebase.apps || !firebase.apps.length) {
      ecellFirebaseApp = firebase.initializeApp(ECELL_FIREBASE_CONFIG);
    } else {
      ecellFirebaseApp = firebase.app();
    }

    ecellFirestore = firebase.firestore();

    // Use HTTP long polling to prevent WebSocket handshake stalls in iframe sandbox environments
    try {
      ecellFirestore.settings({
        experimentalForceLongPolling: true,
        ignoreUndefinedProperties: true
      });
    } catch (settingErr) {
      // Settings must be applied before any Firestore operation
    }

    // Enable multi-tab offline persistence for seamless local read/write
    try {
      if (typeof ecellFirestore.enablePersistence === 'function') {
        ecellFirestore.enablePersistence({ synchronizeTabs: true }).catch((pErr) => {
          // Persistence may already be active or multi-tab restricted; silently fallback
        });
      }
    } catch (persistErr) {
      // Offline fallback
    }

    isEcellFirebaseLive = true;

    if (typeof firebase.analytics === 'function') {
      try {
        ecellAnalytics = firebase.analytics();
      } catch (aErr) {
        console.info('Firebase Analytics notice:', aErr.message);
      }
    }

    console.log('⚡ Firebase Firestore Connected: ecell-tae (Project #453928288620)');
  }
} catch (initErr) {
  console.warn('Firebase initialization notice (Offline cache active):', initErr);
  isEcellFirebaseLive = false;
}

// 2. Real-Time Firestore Cloud Listeners
if (ecellFirestore) {
  try {
    // A. Listen to 'teams' collection in real-time
    ecellFirestore.collection('teams').onSnapshot((snapshot) => {
      const realTeams = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data && (data.code || doc.id)) {
          realTeams.push({
            code: data.code || doc.id,
            teamName: data.teamName || 'Untitled Startup',
            necId: data.necId || 'NEC2685500',
            track: data.track || 'Eureka! 2026 Track',
            startupDesc: data.startupDesc || '',
            leader: data.leader || { name: 'Leader', email: '', phone: '', dept: '', year: '' },
            members: Array.isArray(data.members) ? data.members : [],
            deckUrl: data.deckUrl || '',
            stage: data.stage || 'Round 1 Submission',
            status: data.status || 'active',
            source: data.source || 'web_portal',
            registeredAt: data.registeredAt || new Date().toISOString(),
            lastUpdated: data.lastUpdated || new Date().toISOString()
          });
        }
      });

      // Update local storage with genuine cloud documents
      if (realTeams.length > 0 || localStorage.getItem(ECELL_STORAGE.MOCK_CLEARED) === 'true') {
        localStorage.setItem(ECELL_STORAGE.TEAMS, JSON.stringify(realTeams));
      }

      // Live refresh UI components
      if (typeof window.refreshAdminHub === 'function') {
        window.refreshAdminHub();
      }
      if (typeof window.syncActivePortalDashboard === 'function') {
        window.syncActivePortalDashboard();
      }
    }, (err) => {
      console.warn('Firestore teams real-time listener notice:', err.message);
    });

    // B. Listen to 'cohort_applications' collection in real-time
    ecellFirestore.collection('cohort_applications').onSnapshot((snapshot) => {
      const realCohort = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        realCohort.push({
          id: doc.id,
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          dept: data.dept || '',
          domain: data.domain || '',
          whyJoin: data.whyJoin || '',
          status: data.status || 'pending_review',
          submittedAt: data.submittedAt || new Date().toISOString()
        });
      });

      localStorage.setItem(ECELL_STORAGE.COHORT, JSON.stringify(realCohort));

      if (typeof window.refreshAdminHub === 'function') {
        window.refreshAdminHub();
      }
    }, (err) => {
      console.warn('Firestore cohort listener notice:', err.message);
    });

    // C. Listen to 'inquiries' collection in real-time
    ecellFirestore.collection('inquiries').onSnapshot((snapshot) => {
      const realInquiries = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        realInquiries.push({
          id: doc.id,
          name: data.name || '',
          email: data.email || '',
          subject: data.subject || 'General Inquiry',
          message: data.message || '',
          status: data.status || 'new',
          submittedAt: data.submittedAt || new Date().toISOString()
        });
      });

      localStorage.setItem(ECELL_STORAGE.INQUIRIES, JSON.stringify(realInquiries));

      if (typeof window.refreshAdminHub === 'function') {
        window.refreshAdminHub();
      }
    }, (err) => {
      console.warn('Firestore inquiries listener notice:', err.message);
    });

  } catch (listenerErr) {
    console.warn('Firestore snapshot setup error:', listenerErr);
  }
}

// 3. Global Data Accessor and Mutator API
const ECellDatabase = {
  // Get all registered genuine teams (no mock data)
  getTeams: () => {
    try {
      const raw = localStorage.getItem(ECELL_STORAGE.TEAMS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.filter(t => t && t.code && t.teamName && !['AeroKite Robotics', 'NeuroHealth AI', 'EcoAgro CleanTech', 'AeroKite', 'NeuroVision'].includes(t.teamName));
        }
      }
      return [];
    } catch {
      return [];
    }
  },

  // Save new team with all mandatory Firestore fields
  saveTeam: async (teamData) => {
    const formattedTeam = {
      code: teamData.code,
      teamName: teamData.teamName,
      necId: 'NEC2685500',
      track: teamData.track,
      startupDesc: teamData.startupDesc || '',
      leader: {
        name: teamData.leader ? teamData.leader.name : (teamData.leaderName || ''),
        email: teamData.leader ? teamData.leader.email : (teamData.leaderEmail || ''),
        phone: teamData.leader ? teamData.leader.phone : (teamData.leaderPhone || ''),
        dept: teamData.leader ? teamData.leader.dept : (teamData.leaderDept || ''),
        year: teamData.leader ? teamData.leader.year : (teamData.leaderYear || '')
      },
      members: Array.isArray(teamData.members) && teamData.members.length ? teamData.members : [
        {
          name: teamData.leader ? teamData.leader.name : (teamData.leaderName || ''),
          email: teamData.leader ? teamData.leader.email : (teamData.leaderEmail || ''),
          phone: teamData.leader ? teamData.leader.phone : (teamData.leaderPhone || ''),
          dept: teamData.leader ? teamData.leader.dept : (teamData.leaderDept || ''),
          year: teamData.leader ? teamData.leader.year : (teamData.leaderYear || ''),
          role: 'Team Leader & Founder',
          joinedAt: new Date().toISOString()
        }
      ],
      deckUrl: teamData.deckUrl || '',
      deckFile: teamData.deckFile || null,
      deckSubmittedAt: teamData.deckSubmittedAt || (teamData.deckUrl || teamData.deckFile ? new Date().toISOString() : null),
      stage: teamData.stage || 'Round 1 Submission',
      status: 'active',
      source: 'web_portal',
      registeredAt: teamData.registeredAt || new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    // Update local cache
    const teams = ECellDatabase.getTeams();
    const idx = teams.findIndex(t => t.code && t.code.toUpperCase() === formattedTeam.code.toUpperCase());
    if (idx !== -1) {
      teams[idx] = formattedTeam;
    } else {
      teams.push(formattedTeam);
    }
    localStorage.setItem(ECELL_STORAGE.TEAMS, JSON.stringify(teams));

    // Save directly to Firestore Collection 'teams' (Doc ID = formattedTeam.code)
    if (ecellFirestore) {
      try {
        await ecellFirestore.collection('teams').doc(formattedTeam.code).set(formattedTeam, { merge: true });
        console.log(`✓ Firestore: Team ${formattedTeam.teamName} [${formattedTeam.code}] stored successfully.`);
      } catch (err) {
        console.warn('Firestore write notice (stored locally):', err.message);
      }
    }

    if (typeof window.refreshAdminHub === 'function') {
      window.refreshAdminHub();
    }

    return formattedTeam;
  },

  // Update existing team
  updateTeam: async (updatedTeam) => {
    updatedTeam.lastUpdated = new Date().toISOString();
    
    const teams = ECellDatabase.getTeams();
    const idx = teams.findIndex(t => t.code && t.code.toUpperCase() === updatedTeam.code.toUpperCase());
    if (idx !== -1) {
      teams[idx] = updatedTeam;
      localStorage.setItem(ECELL_STORAGE.TEAMS, JSON.stringify(teams));
    }

    if (ecellFirestore && updatedTeam.code) {
      try {
        await ecellFirestore.collection('teams').doc(updatedTeam.code).set(updatedTeam, { merge: true });
        console.log(`✓ Firestore: Team ${updatedTeam.code} updated.`);
      } catch (err) {
        console.warn('Firestore update notice:', err.message);
      }
    }

    if (typeof window.refreshAdminHub === 'function') {
      window.refreshAdminHub();
    }

    return updatedTeam;
  },

  // Find team by code (checks local cache and Firestore)
  findTeamByCode: async (code) => {
    if (!code) return null;
    const cleanCode = code.trim().toUpperCase();
    
    // 1. Check local cache first
    const teams = ECellDatabase.getTeams();
    let team = teams.find(t => t.code && t.code.toUpperCase() === cleanCode);
    if (team) return team;

    // 2. Query Firestore if online
    if (ecellFirestore) {
      try {
        const docRef = await ecellFirestore.collection('teams').doc(cleanCode).get();
        if (docRef.exists) {
          team = docRef.data();
          // Update local cache
          teams.push(team);
          localStorage.setItem(ECELL_STORAGE.TEAMS, JSON.stringify(teams));
          return team;
        }
      } catch (err) {
        console.warn('Firestore findTeamByCode notice:', err.message);
      }
    }
    return null;
  },

  // Add a team member with complete student credentials to an existing team
  addMemberToTeam: async (teamCode, memberData) => {
    if (!teamCode) {
      return { success: false, error: 'Team access code is required.' };
    }

    const cleanCode = teamCode.trim().toUpperCase();
    let team = await ECellDatabase.findTeamByCode(cleanCode);

    if (!team) {
      return { success: false, error: `No registered team found with code "${cleanCode}". Please verify with your team leader.` };
    }

    if (!team.members) {
      team.members = [];
    }

    // Maximum team limit check (e.g. 4 members)
    if (team.members.length >= 4) {
      return { success: false, error: `Team "${team.teamName}" has already reached the maximum roster limit (4 members).` };
    }

    // Check if email already registered
    const cleanEmail = (memberData.email || '').trim().toLowerCase();
    if (cleanEmail && team.members.some(m => m.email && m.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: `A member with email "${cleanEmail}" is already registered in team "${team.teamName}".` };
    }

    const newMember = {
      name: memberData.name || 'Team Member',
      email: memberData.email || '',
      phone: memberData.phone || '',
      prn: memberData.prn || '',
      college: memberData.college || 'Trinity Academy of Engineering, Pune',
      dept: memberData.dept || 'Engineering',
      year: memberData.year || 'TE (Third Year)',
      role: memberData.role || 'Co-Developer & Innovator',
      skills: memberData.skills || '',
      joinedAt: new Date().toISOString()
    };

    team.members.push(newMember);
    team.lastUpdated = new Date().toISOString();

    // Update in local cache
    const teams = ECellDatabase.getTeams();
    const idx = teams.findIndex(t => t.code && t.code.toUpperCase() === cleanCode);
    if (idx !== -1) {
      teams[idx] = team;
    } else {
      teams.push(team);
    }
    localStorage.setItem(ECELL_STORAGE.TEAMS, JSON.stringify(teams));

    // Save directly to Firestore Collection 'teams'
    if (ecellFirestore) {
      try {
        await ecellFirestore.collection('teams').doc(cleanCode).set(team, { merge: true });
        console.log(`✓ Firestore: Member ${newMember.name} joined team ${team.teamName} [${cleanCode}].`);
      } catch (err) {
        console.warn('Firestore addMemberToTeam notice:', err.message);
      }
    }

    // Trigger UI updates
    if (typeof window.refreshAdminHub === 'function') {
      window.refreshAdminHub();
    }
    if (typeof window.syncActivePortalDashboard === 'function') {
      window.syncActivePortalDashboard();
    }

    return { success: true, team, member: newMember };
  },

  // Save Inquiry
  saveInquiry: async (inquiryData) => {
    const docData = {
      name: inquiryData.name || 'Founder',
      email: inquiryData.email || '',
      subject: inquiryData.subject || 'General Inquiry',
      message: inquiryData.message || '',
      status: 'new',
      submittedAt: new Date().toISOString()
    };

    try {
      const inquiries = JSON.parse(localStorage.getItem(ECELL_STORAGE.INQUIRIES) || '[]');
      inquiries.push(docData);
      localStorage.setItem(ECELL_STORAGE.INQUIRIES, JSON.stringify(inquiries));
    } catch (e) {
      // Ignored
    }

    if (ecellFirestore) {
      try {
        const ref = await ecellFirestore.collection('inquiries').add(docData);
        docData.id = ref.id;
      } catch (err) {
        console.warn('Firestore inquiry sync notice:', err.message);
      }
    }

    if (typeof window.refreshAdminHub === 'function') {
      window.refreshAdminHub();
    }

    return docData;
  },

  // Clear mock cache to display 100% genuine cloud database records
  clearMockCache: async () => {
    localStorage.setItem(ECELL_STORAGE.MOCK_CLEARED, 'true');
    localStorage.removeItem(ECELL_STORAGE.TEAMS);
    localStorage.removeItem(ECELL_STORAGE.INQUIRIES);

    if (ecellFirestore) {
      await ECellDatabase.syncFromCloud();
    }

    if (typeof window.refreshAdminHub === 'function') {
      window.refreshAdminHub();
    }
  },

  // Force sync from Firestore
  syncFromCloud: async () => {
    if (!ecellFirestore) return ECellDatabase.getTeams();

    try {
      const snap = await ecellFirestore.collection('teams').get();
      const cloudTeams = [];
      snap.forEach(doc => {
        cloudTeams.push(doc.data());
      });

      localStorage.setItem(ECELL_STORAGE.TEAMS, JSON.stringify(cloudTeams));

      const inqSnap = await ecellFirestore.collection('inquiries').get();
      const cloudInq = [];
      inqSnap.forEach(doc => {
        cloudInq.push({ id: doc.id, ...doc.data() });
      });
      localStorage.setItem(ECELL_STORAGE.INQUIRIES, JSON.stringify(cloudInq));

      return cloudTeams;
    } catch (err) {
      console.warn('Manual Firestore fetch error:', err.message);
      return ECellDatabase.getTeams();
    }
  }
};

// Bind to window for global access
window.ECellDatabase = ECellDatabase;
window.getTeams = ECellDatabase.getTeams;
window.saveTeam = ECellDatabase.saveTeam;
window.updateTeam = ECellDatabase.updateTeam;
window.findTeamByCode = ECellDatabase.findTeamByCode;
window.addMemberToTeam = ECellDatabase.addMemberToTeam;
window.syncTeamsFromCloud = ECellDatabase.syncFromCloud;
window.getFirebaseDb = () => ecellFirestore;
window.getIsFirebaseReady = () => isEcellFirebaseLive;
window.MEMBERS_STORAGE_KEY = ECELL_STORAGE.COHORT;
window.TEAMS_STORAGE_KEY = ECELL_STORAGE.TEAMS;
window.INQUIRIES_STORAGE_KEY = ECELL_STORAGE.INQUIRIES;
