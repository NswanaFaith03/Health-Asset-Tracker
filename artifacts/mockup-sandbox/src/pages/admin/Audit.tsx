import { useState } from 'react';
import { List, Search, Filter, Calendar, User as UserIcon } from 'lucide-react';

interface AuditLog {
  id: number;
  userId?: number;
  userName?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

export default function AdminAudit() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: 1,
      userId: 1,
      userName: 'John Banda',
      action: 'CREATE',
      resource: 'Consultation',
      resourceId: 'CONS-001',
      details: 'Created new consultation',
      ipAddress: '192.168.1.100',
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      userId: 2,
      userName: 'Dr. Mary Phiri',
      action: 'UPDATE',
      resource: 'Prescription',
      resourceId: 'RX-002',
      details: 'Updated prescription dosage',
      ipAddress: '192.168.1.101',
      createdAt: '2024-01-15T09:15:00Z'
    },
    {
      id: 3,
      action: 'DELETE',
      resource: 'User',
      resourceId: 'USER-003',
      details: 'Deleted user account',
      ipAddress: '192.168.1.102',
      createdAt: '2024-01-14T16:00:00Z'
    },
    {
      id: 4,
      userId: 4,
      userName: 'Pharm. Grace Nkoma',
      action: 'DISPENSE',
      resource: 'Prescription',
      resourceId: 'RX-004',
      details: 'Dispensed medication',
      ipAddress: '192.168.1.103',
      createdAt: '2024-01-14T14:30:00Z'
    }
  ]);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'hsl(142, 76%, 36%)';
      case 'UPDATE': return 'hsl(217, 91%, 60%)';
      case 'DELETE': return 'hsl(0, 72%, 51%)';
      case 'DISPENSE': return 'hsl(45, 93%, 47%)';
      default: return 'hsl(217, 33%, 17%)';
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'white', fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          Audit Logs
        </h1>
        <p style={{ color: 'hsl(215, 20%, 65%)', marginBottom: 0 }}>
          Track system activity and changes
        </p>
      </div>

      {/* Search and Filter */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={20} style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'hsl(215, 20%, 65%)'
          }} />
          <input
            type="text"
            placeholder="Search audit logs..."
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 3rem',
              background: 'hsl(217, 33%, 17%)',
              border: '1px solid hsl(217, 33%, 25%)',
              borderRadius: '8px',
              color: 'white',
              fontSize: '0.875rem'
            }}
          />
        </div>
        <button style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.5rem',
          background: 'hsl(217, 33%, 17%)',
          border: '1px solid hsl(217, 33%, 25%)',
          borderRadius: '8px',
          color: 'white',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: '600'
        }}>
          <Filter size={16} />
          Filter
        </button>
      </div>

      {/* Audit Logs List */}
      <div style={{
        background: 'hsl(217, 33%, 17%)',
        borderRadius: '12px',
        border: '1px solid hsl(217, 33%, 25%)',
        overflow: 'hidden'
      }}>
        {auditLogs.map((log) => (
          <div
            key={log.id}
            style={{
              padding: '1.5rem',
              borderBottom: '1px solid hsl(217, 33%, 25%)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1.5rem'
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <span style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  background: getActionColor(log.action),
                  color: 'white'
                }}>
                  {log.action}
                </span>
                <span style={{ color: 'white', fontSize: '0.875rem', fontWeight: '600' }}>
                  {log.resource}
                </span>
                {log.resourceId && (
                  <span style={{ color: 'hsl(215, 20%, 65%)', fontSize: '0.875rem' }}>
                    ({log.resourceId})
                  </span>
                )}
              </div>
              
              {log.userName && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <UserIcon size={14} style={{ color: 'hsl(215, 20%, 65%)' }} />
                  <p style={{ color: 'hsl(215, 20%, 65%)', fontSize: '0.875rem', margin: 0 }}>
                    {log.userName}
                  </p>
                </div>
              )}
              
              {log.details && (
                <p style={{ color: 'white', fontSize: '0.875rem', margin: '0.25rem 0' }}>
                  {log.details}
                </p>
              )}
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                {log.ipAddress && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: 'hsl(215, 20%, 65%)', fontSize: '0.75rem' }}>IP:</span>
                    <span style={{ color: 'hsl(215, 20%, 65%)', fontSize: '0.875rem' }}>{log.ipAddress}</span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={14} style={{ color: 'hsl(215, 20%, 65%)' }} />
                  <span style={{ color: 'hsl(215, 20%, 65%)', fontSize: '0.875rem' }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
