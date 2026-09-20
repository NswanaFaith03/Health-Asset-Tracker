import { useListAuditLogs, getListAuditLogsQueryKey } from '@/lib/api-client';
import { List, Search, Calendar, User as UserIcon } from 'lucide-react';

const ACTION_COLORS: Record<string, string> = {
  CREATE: '#10b981',
  UPDATE: '#3b82f6',
  DELETE: '#ef4444',
  DISPENSE: '#f59e0b',
  LOGIN: '#8b5cf6',
  LOGOUT: '#6b7280',
};

export default function AdminAudit() {
  const { data: auditLogs = [], isLoading, refetch } = useListAuditLogs(undefined, {
    query: { queryKey: getListAuditLogsQueryKey() }
  });

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ color: '#64748b' }}>Loading audit logs...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#1e293b', fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          Audit Logs
        </h1>
        <p style={{ color: '#64748b', marginBottom: 0 }}>
          Track system activity and changes
        </p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '2rem', position: 'relative' }}>
        <Search size={20} style={{
          position: 'absolute',
          left: '1rem',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#64748b'
        }} />
        <input
          type="text"
          placeholder="Search audit logs..."
          style={{
            width: '100%',
            padding: '0.75rem 1rem 0.75rem 3rem',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            color: '#1e293b',
            fontSize: '0.875rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        />
      </div>

      {/* Audit Logs List */}
      {auditLogs.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <List size={48} style={{ color: '#64748b' }} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
            No audit logs
          </h2>
          <p style={{ color: '#64748b', margin: 0 }}>
            System activity will appear here
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {auditLogs.map((log) => {
            const actionColor = ACTION_COLORS[log.action] || ACTION_COLORS.LOGIN;
            return (
              <div
                key={log.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '1.5rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    background: actionColor,
                    color: 'white'
                  }}>
                    {log.action}
                  </span>
                  <span style={{ color: '#1e293b', fontSize: '0.875rem', fontWeight: '600' }}>
                    {log.resource}
                  </span>
                  {log.resourceId && (
                    <span style={{ color: '#64748b', fontSize: '0.875rem' }}>
                      ({log.resourceId})
                    </span>
                  )}
                </div>

                {log.userName && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <UserIcon size={14} style={{ color: '#64748b' }} />
                    <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
                      {log.userName}
                    </p>
                  </div>
                )}

                {log.details && (
                  <p style={{ color: '#1e293b', fontSize: '0.875rem', margin: '0.25rem 0' }}>
                    {log.details}
                  </p>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                  {log.ipAddress && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: '#64748b', fontSize: '0.75rem' }}>IP:</span>
                      <span style={{ color: '#64748b', fontSize: '0.875rem' }}>{log.ipAddress}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={14} style={{ color: '#64748b' }} />
                    <span style={{ color: '#64748b', fontSize: '0.875rem' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
