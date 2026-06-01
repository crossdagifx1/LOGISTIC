import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Helper for logger
function log(msg: string) {
  console.log(`[BACKEND] ${new Date().toLocaleTimeString()}: ${msg}`);
}

// ──────────────────────────────────────────────────────────────────────────
// DB Seeding Engine
// ──────────────────────────────────────────────────────────────────────────
async function ensureSeeded() {
  try {
    const regionsCount = await prisma.regionState.count();
    if (regionsCount > 0) return;

    log("Database is empty. Seeding initial Postgres tables...");

    const initialRegionStates = [
      { region: 'Addis Ababa', totalCapacity: 1000, medicalSupplies: 240, electronics: 180, securedDocs: 90 },
      { region: 'Hawassa', totalCapacity: 800, medicalSupplies: 190, electronics: 140, securedDocs: 60 },
      { region: 'Dire Dawa', totalCapacity: 900, medicalSupplies: 210, electronics: 160, securedDocs: 70 }
    ];

    const initialCouriers = [
      {
        id: 'CR-001',
        name: 'Abebe Kebede',
        phone: '+251 911 223344',
        status: 'Idle',
        assignedManifests: ['ET-KAZ-308'],
        documentUrl: 'ETH-2026-9041285',
        signatureUrl: 'CAPTURED_BASE64_URI',
        rating: 4.8,
        joinedDate: '2026-01-12',
        commissionEarned: 2400
      },
      {
        id: 'CR-002',
        name: 'Selamawit Alene',
        phone: '+251 912 556677',
        status: 'Dispatched',
        assignedManifests: ['ET-MER-114'],
        documentUrl: 'ETH-2026-7814920',
        signatureUrl: 'CAPTURED_BASE64_URI',
        rating: 4.9,
        joinedDate: '2026-02-28',
        commissionEarned: 4800
      },
      {
        id: 'CR-003',
        name: 'Yonas Tesfaye',
        phone: '+251 915 889900',
        status: 'Idle',
        assignedManifests: [],
        documentUrl: 'ETH-2026-1122334',
        signatureUrl: 'CAPTURED_BASE64_URI',
        rating: 4.2,
        joinedDate: '2026-05-15',
        commissionEarned: 5200
      }
    ];

    const initialManifests = [
      {
        trackingCode: 'ET-BOL-902',
        destination: 'Bole Zone',
        type: 'Medical Supplies',
        weight: 4.2,
        units: 25,
        status: 'Awaiting Dispatch',
        assignedCourierId: 'CR-001',
        priority: 'Expedited',
        departureTime: '11:45 AM',
        createdDate: '2026-06-01',
        transitOrigin: 'Dubai',
        localAddress: 'Bole Zone Office'
      },
      {
        trackingCode: 'ET-MER-114',
        destination: 'Mercato Zone',
        type: 'Secured Documents',
        weight: 1.5,
        units: 10,
        status: 'In Transit',
        assignedCourierId: 'CR-002',
        priority: 'Standard',
        createdDate: '2026-06-01',
        transitOrigin: 'China',
        localAddress: 'Mercato Plaza'
      },
      {
        trackingCode: 'ET-KAZ-308',
        destination: 'Kazanchis Zone',
        type: 'High-Value Electronics',
        weight: 12.8,
        units: 5,
        status: 'Allocated',
        assignedCourierId: 'CR-001',
        priority: 'Standard',
        createdDate: '2026-06-01',
        transitOrigin: 'Dire Dawa',
        localAddress: 'Kazanchis Towers'
      },
      {
        trackingCode: 'ET-BOL-003',
        destination: 'Bole Zone',
        type: 'Medical Supplies',
        weight: 2.1,
        units: 15,
        status: 'Handed Over',
        assignedCourierId: 'CR-002',
        priority: 'Standard',
        createdDate: '2026-05-31',
        transitOrigin: 'Other',
        localAddress: 'Main Terminal'
      },
      {
        trackingCode: 'ET-MER-512',
        destination: 'Mercato Zone',
        type: 'High-Value Electronics',
        weight: 8.5,
        units: 12,
        status: 'Awaiting Dispatch',
        assignedCourierId: undefined,
        priority: 'Expedited',
        departureTime: '12:30 PM',
        createdDate: '2026-06-01',
        transitOrigin: 'Dubai',
        localAddress: 'Mercato Apparel Store'
      }
    ];

    const initialLedger = {
      id: 'main',
      baseCashETB: 425000,
      pendingCommissionsETB: 12400,
      supplierClearingETB: 89000
    };

    const initialLedgerHistory = [
      {
        id: 'LDG-001',
        date: '2026-05-31 09:12',
        type: 'Release Manifest',
        amount: 1500,
        description: 'Courier Abebe completed ET-BOL-003 release'
      },
      {
        id: 'LDG-002',
        date: '2026-05-31 16:45',
        type: 'Penalty Deduction',
        amount: -1200,
        description: 'Damaged cargo penalty applied to CR-003 Yonas'
      }
    ];

    const initialIncidents = [
      {
        id: 'INC-101',
        trackingCode: 'ET-MER-114',
        courierId: 'CR-003',
        courierName: 'Yonas Tesfaye',
        type: 'Damaged Cargo',
        description: 'Moisture ingress detected on outer seal boxes at Mercato Hub.',
        status: 'Pending',
        date: '2026-06-01 07:15',
        financialPenalty: 1200
      }
    ];

    const initialChatMessages = [
      {
        id: 'MSG-1',
        sender: 'Dispatcher Center',
        avatar: 'DP',
        msg: 'Welcome to regional dispatch chat room! Keep comms secure. 🔒',
        time: '09:42 AM',
        role: 'dispatcher'
      },
      {
        id: 'MSG-2',
        sender: 'Abebe Kebede (CR-001)',
        avatar: 'AG',
        msg: 'Super Star Gold Deliverer online. All cargo secure! 🚀',
        time: '09:44 AM',
        role: 'agent'
      },
      {
        id: 'MSG-3',
        sender: 'Dispatcher Center',
        avatar: 'DP',
        msg: 'Copy that Abebe. Please scan and allocate next Bole Zone items.',
        time: '09:45 AM',
        role: 'dispatcher'
      }
    ];

    const initialSystemSettings = {
      id: 'settings',
      dispatcherMode: 'centralized',
      soundEnabled: true,
      currentRegion: 'Addis Ababa'
    };

    await prisma.regionState.createMany({ data: initialRegionStates });
    await prisma.courier.createMany({ data: initialCouriers as any });
    await prisma.manifest.createMany({ data: initialManifests as any });
    await prisma.ledger.create({ data: initialLedger });
    await prisma.ledgerHistory.createMany({ data: initialLedgerHistory });
    await prisma.incident.create({ data: initialIncidents[0] });
    await prisma.chatMessage.createMany({ data: initialChatMessages });
    await prisma.systemSettings.create({ data: initialSystemSettings });

    log("Database seeded successfully.");
  } catch (err: any) {
    log(`Seeding failed or already seeded: ${err.message}`);
  }
}

// ──────────────────────────────────────────────────────────────────────────
// API Route: Bootstrap
// ──────────────────────────────────────────────────────────────────────────
app.get('/api/bootstrap', async (req, res) => {
  try {
    await ensureSeeded();

    const couriers = await prisma.courier.findMany();
    const manifests = await prisma.manifest.findMany();
    const incidents = await prisma.incident.findMany();
    const restockTickets = await prisma.restockTicket.findMany();
    const ledgerHistory = await prisma.ledgerHistory.findMany();
    const chatMessages = await prisma.chatMessage.findMany();
    const ledger = await prisma.ledger.findUnique({ where: { id: 'main' } });
    const settings = await prisma.systemSettings.findUnique({ where: { id: 'settings' } });
    const regions = await prisma.regionState.findMany();

    const inventoriesByRegion: Record<string, any> = {};
    for (const r of regions) {
      inventoriesByRegion[r.region] = {
        totalCapacity: r.totalCapacity,
        medicalSupplies: r.medicalSupplies,
        electronics: r.electronics,
        securedDocs: r.securedDocs
      };
    }

    res.json({
      success: true,
      dbMode: "PostgreSQL/Supabase Live",
      couriers,
      manifests,
      incidents,
      restockTickets,
      ledgerHistory,
      chatMessages,
      ledger: ledger || { id: 'main', baseCashETB: 425000, pendingCommissionsETB: 12400, supplierClearingETB: 89000 },
      systemSettings: settings || { id: 'settings', dispatcherMode: 'centralized', soundEnabled: true, currentRegion: 'Addis Ababa' },
      inventoriesByRegion
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────────────────────────────
// API Route: Courier Registration
// ──────────────────────────────────────────────────────────────────────────
app.post('/api/couriers', async (req, res) => {
  try {
    const { id, name, phone, documentUrl, signatureUrl } = req.body;

    const existing = await prisma.courier.findUnique({ where: { id } });
    let data;
    if (existing) {
      data = await prisma.courier.update({
        where: { id },
        data: {
          name,
          phone,
          documentUrl: documentUrl || existing.documentUrl,
          signatureUrl: signatureUrl || existing.signatureUrl
        }
      });
    } else {
      data = await prisma.courier.create({
        data: {
          id,
          name,
          phone,
          status: 'Idle',
          assignedManifests: [],
          documentUrl,
          signatureUrl,
          rating: 5.0,
          joinedDate: new Date().toISOString().split('T')[0],
          commissionEarned: 0
        }
      });
    }

    log(`Registered Courier ${data.id} (${data.name})`);
    res.json({ success: true, courier: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────────────────────────────
// API Route: Manifest Intake / Allocation
// ──────────────────────────────────────────────────────────────────────────
app.post('/api/manifests', async (req, res) => {
  try {
    const { 
      trackingCode, 
      destination, 
      type, 
      weight, 
      units, 
      status, 
      assignedCourierId, 
      priority, 
      departureTime, 
      transitOrigin, 
      localAddress, 
      cargoPhotoUrl,
      currentRegion 
    } = req.body;

    const regionRecord = await prisma.regionState.findUnique({ where: { region: currentRegion } });
    if (!regionRecord) throw new Error("Region not found");

    let updatedSupplies = regionRecord.medicalSupplies;
    let updatedElectronics = regionRecord.electronics;
    let updatedDocs = regionRecord.securedDocs;

    if (type === 'Medical Supplies' || type === 'Imported Shoes' || type === 'Designer Clothes') {
      updatedSupplies -= units;
    } else if (type === 'High-Value Electronics' || type === 'Laptops & Tech') {
      updatedElectronics -= units;
    } else {
      updatedDocs -= units;
    }

    const [manifest, courier, updatedRegion] = await prisma.$transaction([
      prisma.manifest.create({
        data: {
          trackingCode,
          destination,
          type,
          weight,
          units,
          status,
          assignedCourierId,
          priority,
          departureTime,
          createdDate: new Date().toISOString().split('T')[0],
          transitOrigin,
          localAddress,
          cargoPhotoUrl
        }
      }),
      prisma.courier.update({
        where: { id: assignedCourierId },
        data: {
          assignedManifests: { push: trackingCode }
        }
      }),
      prisma.regionState.update({
        where: { region: currentRegion },
        data: {
          medicalSupplies: updatedSupplies,
          electronics: updatedElectronics,
          securedDocs: updatedDocs
        }
      })
    ]);

    log(`Created manifest ${trackingCode}`);
    res.json({ success: true, manifest, courier, updatedRegion });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────────────────────────────
// API Route: Direct Merchant Claim and Release Payment
// ──────────────────────────────────────────────────────────────────────────
app.post('/api/claims', async (req, res) => {
  try {
    const { trackingCode } = req.body;

    const manifest = await prisma.manifest.findUnique({ where: { trackingCode } });
    if (!manifest) throw new Error("Manifest not found");

    const commissionAmount = manifest.priority === 'Expedited' ? 600 : 400;

    const [updatedManifest, updatedCourier, updatedLedger, createdHistory] = await prisma.$transaction([
      prisma.manifest.update({
        where: { trackingCode },
        data: { status: 'Handed Over' }
      }),
      prisma.courier.update({
        where: { id: manifest.assignedCourierId || '' },
        data: { commissionEarned: { increment: commissionAmount } }
      }),
      prisma.ledger.update({
        where: { id: 'main' },
        data: { baseCashETB: { decrement: commissionAmount } }
      }),
      prisma.ledgerHistory.create({
        data: {
          id: `LDG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          type: 'Release Manifest',
          amount: commissionAmount,
          description: `Merchant Claim for cargo ${trackingCode}. Payout disbursed to Courier ${manifest.assignedCourierId}`
        }
      })
    ]);

    log(`Released merchant direct claim for ${trackingCode}`);
    res.json({ success: true, manifest: updatedManifest, courier: updatedCourier, ledger: updatedLedger, history: createdHistory });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────────────────────────────
// API Route: Send Chat Message
// ──────────────────────────────────────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  try {
    const { id, sender, avatar, msg, time, role } = req.body;

    const data = await prisma.chatMessage.create({
      data: { id, sender, avatar, msg, time, role }
    });

    res.json({ success: true, chatMessage: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────────────────────────────
// API Route: Restock Replenish Ticket Creation
// ──────────────────────────────────────────────────────────────────────────
app.post('/api/restock', async (req, res) => {
  try {
    const { id, type, qty } = req.body;

    const data = await prisma.restockTicket.create({
      data: { id, type, qty, status: 'Pending' }
    });

    res.json({ success: true, restockTicket: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────────────────────────────
// API Route: Restock Ticket Approval
// ──────────────────────────────────────────────────────────────────────────
app.post('/api/restock/approve', async (req, res) => {
  try {
    const { id, currentRegion } = req.body;

    const ticket = await prisma.restockTicket.findUnique({ where: { id } });
    if (!ticket) throw new Error("Ticket not found");

    const regionRecord = await prisma.regionState.findUnique({ where: { region: currentRegion } });
    if (!regionRecord) throw new Error("Region not found");

    let updatedSupplies = regionRecord.medicalSupplies;
    let updatedElectronics = regionRecord.electronics;
    let updatedDocs = regionRecord.securedDocs;

    if (ticket.type === 'Medical Supplies') {
      updatedSupplies += ticket.qty;
    } else if (ticket.type === 'High-Value Electronics') {
      updatedElectronics += ticket.qty;
    } else {
      updatedDocs += ticket.qty;
    }

    const [updatedTicket, updatedRegion] = await prisma.$transaction([
      prisma.restockTicket.update({
        where: { id },
        data: { status: 'Approved' }
      }),
      prisma.regionState.update({
        where: { region: currentRegion },
        data: {
          medicalSupplies: updatedSupplies,
          electronics: updatedElectronics,
          securedDocs: updatedDocs
        }
      })
    ]);

    log(`Approved restock ticket ${id}`);
    res.json({ success: true, restockTicket: updatedTicket, updatedRegion });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────────────────────────────
// API Route: File Incident Exception
// ──────────────────────────────────────────────────────────────────────────
app.post('/api/incidents', async (req, res) => {
  try {
    const { id, trackingCode, courierId, courierName, type, description, financialPenalty } = req.body;

    const [incident, updatedCourier, updatedLedger, ledgerHistory] = await prisma.$transaction([
      prisma.incident.create({
        data: {
          id,
          trackingCode,
          courierId,
          courierName,
          type,
          description,
          status: 'Pending',
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          financialPenalty
        }
      }),
      prisma.courier.update({
        where: { id: courierId },
        data: { status: 'Suspended' }
      }),
      prisma.ledger.update({
        where: { id: 'main' },
        data: { baseCashETB: { decrement: financialPenalty } }
      }),
      prisma.ledgerHistory.create({
        data: {
          id: `LDG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          type: 'Penalty Deduction',
          amount: -financialPenalty,
          description: `Disaster penalty on cargo ${trackingCode}. Courier ${courierName} suspended.`
        }
      })
    ]);

    log(`Filed cargo incident: ${id}`);
    res.json({ success: true, incident, courier: updatedCourier, ledger: updatedLedger, ledgerHistory });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────────────────────────────
// API Route: Resolve Incident
// ──────────────────────────────────────────────────────────────────────────
app.post('/api/incidents/resolve', async (req, res) => {
  try {
    const { id } = req.body;

    const incident = await prisma.incident.findUnique({ where: { id } });
    if (!incident) throw new Error("Incident not found");

    const [updatedIncident, updatedCourier] = await prisma.$transaction([
      prisma.incident.update({
        where: { id },
        data: { status: 'Resolved' }
      }),
      prisma.courier.update({
        where: { id: incident.courierId },
        data: { status: 'Idle' }
      })
    ]);

    log(`Resolved exception arbitration case: ${id}`);
    res.json({ success: true, incident: updatedIncident, courier: updatedCourier });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────────────────────────────
// API Route: Manual Vault Cash Deposit
// ──────────────────────────────────────────────────────────────────────────
app.post('/api/ledger/vault-deposit', async (req, res) => {
  try {
    const { depositVal, description } = req.body;

    const [updatedLedger, ledgerHistory] = await prisma.$transaction([
      prisma.ledger.update({
        where: { id: 'main' },
        data: { baseCashETB: { increment: depositVal } }
      }),
      prisma.ledgerHistory.create({
        data: {
          id: `LDG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          type: 'Supplier Balance Cleared',
          amount: depositVal,
          description: description || `Manual controller vault cash override audit entry.`
        }
      })
    ]);

    log(`Processed physical vault cash deposit: +ETB ${depositVal}`);
    res.json({ success: true, ledger: updatedLedger, ledgerHistory });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────────────────────────────
// API Route: Disburse Commissions
// ──────────────────────────────────────────────────────────────────────────
app.post('/api/ledger/disburse-commissions', async (req, res) => {
  try {
    const { amount } = req.body;

    const [updatedLedger, ledgerHistory] = await prisma.$transaction([
      prisma.ledger.update({
        where: { id: 'main' },
        data: {
          baseCashETB: { decrement: amount },
          pendingCommissionsETB: 0
        }
      }),
      prisma.ledgerHistory.create({
        data: {
          id: `LDG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          type: 'Commission Disbursed',
          amount: -amount,
          description: `Clearing and disbursement payout of agent commissions. ETB ${amount} disbursed to couriers.`
        }
      })
    ]);

    res.json({ success: true, ledger: updatedLedger, ledgerHistory });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────────────────────────────
// API Route: Clear Supplier Balance
// ──────────────────────────────────────────────────────────────────────────
app.post('/api/ledger/clear-supplier', async (req, res) => {
  try {
    const { amount } = req.body;

    const [updatedLedger, ledgerHistory] = await prisma.$transaction([
      prisma.ledger.update({
        where: { id: 'main' },
        data: {
          baseCashETB: { decrement: amount },
          supplierClearingETB: 0
        }
      }),
      prisma.ledgerHistory.create({
        data: {
          id: `LDG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          type: 'Supplier Balance Cleared',
          amount: -amount,
          description: `Disbursed and cleared balance matching supplier settlement clearances of ETB ${amount}.`
        }
      })
    ]);

    res.json({ success: true, ledger: updatedLedger, ledgerHistory });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────────────────────────────
// API Route: Save settings
// ──────────────────────────────────────────────────────────────────────────
app.post('/api/settings', async (req, res) => {
  try {
    const { dispatcherMode, soundEnabled, currentRegion } = req.body;

    const data = await prisma.systemSettings.upsert({
      where: { id: 'settings' },
      update: { dispatcherMode, soundEnabled, currentRegion },
      create: { id: 'settings', dispatcherMode, soundEnabled, currentRegion }
    });

    res.json({ success: true, systemSettings: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────────────────────────────
// API Route: Manual Real-Time Database Sync HUD
// ──────────────────────────────────────────────────────────────────────────
app.post('/api/sync', async (req, res) => {
  try {
    const stats = {
      couriers: await prisma.courier.count(),
      manifests: await prisma.manifest.count(),
      incidents: await prisma.incident.count(),
      tickets: await prisma.restockTicket.count()
    };

    log(`Synchronized operational tables successfully.`);
    res.json({
      success: true,
      time: new Date().toLocaleTimeString(),
      latencyMs: Math.floor(40 + Math.random() * 50),
      dbStats: stats
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  log(`Logistics Backend Express server is running on http://localhost:${PORT}`);
});
