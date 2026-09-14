import { useState } from 'react';
import { useListUsers, type ListUsersParams, type User } from "@/lib/api-client";
import { Header } from './Header';
import { Search, X, Loader2, XCircle, User } from 'lucide-react';

export function PatientsTable({ onNavigate }: { onNavigate?: (p: string) => void }) {
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<ListUsersParams['role']>(undefined);
  const [searchFocused, setSearchFocused] = useState(false);

  const { data: users, isLoading, error } = useListUsers({
    role: filterRole,
    search: search || undefined
  });

  const filteredUsers = users || [];

  return (
    <div style={{ minHeight: '100vh', background: 'hsl(222, 47%, 5%)' }}>
      <Header activePage="table" onNavigate={onNavigate} />

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '36px 28px' }}>

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(52,211,153,0.7)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 6 }}>
              Patient Management
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: '#e2faf2', margin: 0 }}>Patient Directory</h1>
          </div>
          <button className="btn-primary-dh" style={{ height: 44, padding: '0 20px', fontSize: 14, borderRadius: 12 }} onClick={() => onNavigate?.('form')}>
            + Register New Patient
          </button>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{
            flex: 1, minWidth: 260, display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(255,255,255,0.03)',
            border: `1.5px solid ${searchFocused ? 'rgba(16,185,129,0.65)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: 12, padding: '0 16px', height: 46,
            transition: 'all 0.3s ease',
            boxShadow: searchFocused ? '0 0 0 4px rgba(16,185,129,0.1)' : 'none',
          }}>
            <Search style={{ width: 16, height: 16, color: searchFocused ? '#34d399' : 'rgba(160,180,195,0.4)', transition: 'color 0.3s' }} />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSearchFocused(true);
              }}
              placeholder="Search patients, emails, phones…"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: 'rgba(220,235,230,0.95)', fontSize: 14, fontWeight: 500,
                caretColor: '#10b981', fontFamily: 'inherit',
              }}
              disabled={isLoading}
            />
            {search && (
              <button onClick={() => {
                setSearch('');
                setSearchFocused(false);
              }} style={{
                background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%',
                width: 20, height: 20, color: 'rgba(160,180,195,0.7)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <X style={{ width: 10, height: 10 }} />
              </button>
            )}
          </div>

          {/* Role filter pills */}
          {['student', 'doctor', 'pharmacist', 'lab_technician', 'nurse', 'mental_health_counselor', 'hiv_professional', 'admin'].map(role => (
            <button
              key={role}
              onClick={() => setFilterRole(filterRole === role ? undefined : role)}
              style={{
                height: 36, padding: '0 16px', borderRadius: 99, border: '1px solid',
                fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.25s ease',
                textTransform: 'capitalize', letterSpacing: '0.3px',
                background: filterRole === role
                  ? role === 'student' ? 'rgba(16,185,129,0.15)' :
                    role === 'doctor' ? 'rgba(16,185,129,0.15)' :
                    role === 'pharmacist' ? 'rgba(245,158,11,0.15)' :
                    role === 'lab_technician' ? 'rgba(245,158,11,0.15)' :
                    role === 'nurse' ? 'rgba(16,185,129,0.15)' :
                    role === 'mental_health_counselor' ? 'rgba(16,185,129,0.15)' :
                    role === 'hiv_professional' ? 'rgba(16,185,129,0.15)' :
                    'rgba(16,185,129,0.15)'
                  : 'rgba(255,255,255,0.03)',
                borderColor: filterRole === role
                  ? role === 'student' ? 'rgba(16,185,129,0.5)' :
                    role === 'doctor' ? 'rgba(16,185,129,0.5)' :
                    role === 'pharmacist' ? 'rgba(245,158,11,0.5)' :
                    role === 'lab_technician' ? 'rgba(245,158,11,0.5)' :
                    role === 'nurse' ? 'rgba(16,185,129,0.5)' :
                    role === 'mental_health_counselor' ? 'rgba(16,185,129,0.5)' :
                    role === 'hiv_professional' ? 'rgba(16,185,129,0.5)' :
                    'rgba(16,185,129,0.5)'
                  : 'rgba(255,255,255,0.07)',
                color: filterRole === role
                  ? role === 'student' ? '#34d399' :
                    role === 'doctor' ? '#34d399' :
                    role === 'pharmacist' ? '#fbbf24' :
                    role === 'lab_technician' ? '#fbbf24' :
                    role === 'nurse' ? '#34d399' :
                    role === 'mental_health_counselor' ? '#34d399' :
                    role === 'hiv_professional' ? '#34d399' :
                    '#34d399'
                  : 'rgba(160,180,195,0.6)',
              }}
            >
              {role === 'student' ? 'Students' :
                role === 'doctor' ? 'Doctors' :
                role === 'pharmacist' ? 'Pharmacists' :
                role === 'lab_technician' ? 'Lab Techs' :
                role === 'nurse' ? 'Nurses' :
                role === 'mental_health_counselor' ? 'Mental Health' :
                role === 'hiv_professional' ? 'HIV Support' :
                'Admins'}
            </button>
          ))}

          <div style={{ fontSize: 12, color: 'rgba(160,180,195,0.5)', fontWeight: 500, marginLeft: 'auto', whiteSpace: 'nowrap' }}>
            {filteredUsers.length} users
          </div>
        </div>

        {/* Table */}
        <div style={{
          borderRadius: 20, overflow: 'hidden',
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
        }}>
          <table className="dh-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '48px 24px', color: 'rgba(160,180,195,0.4)' }}>
                    <div style={{ marginBottom: 12 }}>
                      <Loader2 style={{ width: 32, height: 32, color: '#94a3b8', animation: 'spin 1s linear infinite' }} />
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Loading users...</div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '48px 24px', color: 'rgba(160,180,195,0.4)' }}>
                    <div style={{ marginBottom: 12 }}>
                      <XCircle style={{ width: 32, height: 32, color: '#ef4444' }} />
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Failed to load users</div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '48px 24px', color: 'rgba(160,180,195,0.4)' }}>
                    <div style={{ marginBottom: 12 }}>
                      <User style={{ width: 32, height: 32, color: '#94a3b8' }} />
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>No users found</div>
                    <div style={{ fontSize: 13 }}>Try adjusting your search or filters</div>
                  </td>
                </tr>
              ) : filteredUsers.map((user, index) => {
                const statusColors: Record<User['status'], { bg: string; color: string; label: string }> = {
                  active: { bg: 'rgba(16,185,129,0.1)', color: '#34d399', label: 'Active' },
                  inactive: { bg: 'rgba(245,158,11,0.1)', color: '#fbbf24', label: 'Inactive' },
                  suspended: { bg: 'rgba(239,68,68,0.1)', color: '#f87171', label: 'Suspended' },
                };
                const status = statusColors[user.status] || { bg: 'rgba(255,255,255,0.05)', color: '#9ca3af', label: user.status || 'Unknown' };

                return (
                  <tr key={user.id || index}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                          background: `hsl(${(user.name?.charCodeAt(0) || 65) * 13) % 360}, 50%, 20%)`,
                          border: `1px solid hsl(${(user.name?.charCodeAt(0) || 65) * 13) % 360}, 50%, 35%)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 13, fontWeight: 800,
                          color: `hsl(${(user.name?.charCodeAt(0) || 65) * 13) % 360}, 70%, 65%)`,
                        }}>
                          {user.name?.split(' ').map(n => n[0]).join('') || '??'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'rgba(220,235,230,0.95)', fontSize: 14 }}>{user.name || 'Unknown User'}</div>
                          <div style={{ fontSize: 11, color: 'rgba(160,180,195,0.5)' }}>Age: {user.studentNumber ? 'Student' : 'Professional'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'rgba(52,211,153,0.7)', background: 'rgba(16,185,129,0.08)', padding: '3px 8px', borderRadius: 6 }}>
                      {user.id ?? 'N/A'}
                    </td>
                    <td style={{ fontSize: 13 }}>{user.email ?? 'N/A'}</td>
                    <td style={{ fontSize: 13 }}>{user.phone ?? 'N/A'}</td>
                    <td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 700,
                        background: status.bg, color: status.color, border: `1px solid ${status.color}30`,
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: status.color, display: 'inline-block' }} />
                        {status.label}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        {['View', 'Edit'].map(action => (
                          <button key={action} style={{
                            padding: '5px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)',
                            background: 'rgba(255,255,255,0.03)', color: 'rgba(180,200,210,0.8)',
                            fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease',
                          }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(16,185,129,0.4)';
                              (e.currentTarget as HTMLElement).style.color = '#34d399';
                              (e.currentTarget as HTMLElement).style.background = 'rgba(16,185,129,0.08)';
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                              (e.currentTarget as HTMLElement).style.color = 'rgba(180,200,210,0.8)';
                              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                            }}
                          >{action}</button>
                        ))}
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        <style>{`
          input::placeholder { color: rgba(140,160,180,0.4); }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );
}