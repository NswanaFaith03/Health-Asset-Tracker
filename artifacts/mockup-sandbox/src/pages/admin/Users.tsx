import { useState } from 'react';
import { useListUsers, useUpdateUserStatus, getListUsersQueryKey } from '@/lib/api-client';
import { useQueryClient } from '@tanstack/react-query';
import { Users, Search, Edit, Ban, Check } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  active: '#10b981',
  inactive: '#6b7280',
  suspended: '#ef4444',
};

const ROLE_COLORS: Record<string, string> = {
  doctor: '#3b82f6',
  pharmacist: '#f97316',
  lab_technician: '#06b6d4',
  mental_health_counselor: '#8b5cf6',
  hiv_professional: '#f59e0b',
  admin: '#ef4444',
  nurse: '#10b981',
  student: '#6b7280',
};

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const { data: users = [], isLoading, refetch } = useListUsers(undefined, {
    query: { queryKey: getListUsersQueryKey() }
  });
  const updateStatus = useUpdateUserStatus();

  const roles = ['All', 'student', 'doctor', 'pharmacist', 'lab_technician', 'mental_health_counselor', 'hiv_professional', 'admin', 'nurse'];
  const statuses = ['All', 'active', 'inactive', 'suspended'];

  const filteredUsers = users.filter(user => {
    const roleMatch = selectedRole === 'All' || user.role === selectedRole;
    const statusMatch = selectedStatus === 'All' || user.status === selectedStatus;
    return roleMatch && statusMatch;
  });

  const handleStatusChange = (id: number, newStatus: string) => {
    updateStatus.mutate(
      { id, data: { status: newStatus as any } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() }) }
    );
  };

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ color: '#64748b' }}>Loading users...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#1e293b', fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          User Management
        </h1>
        <p style={{ color: '#64748b', marginBottom: 0 }}>
          Manage system users and permissions
        </p>
      </div>

      {/* Search and Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <Search size={20} style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#64748b'
          }} />
          <input
            type="text"
            placeholder="Search users..."
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
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          style={{
            padding: '0.75rem 1rem',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            color: '#1e293b',
            fontSize: '0.875rem',
            cursor: 'pointer'
          }}
        >
          {roles.map(role => (
            <option key={role} value={role}>{role.replace('_', ' ').toUpperCase()}</option>
          ))}
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          style={{
            padding: '0.75rem 1rem',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            color: '#1e293b',
            fontSize: '0.875rem',
            cursor: 'pointer'
          }}
        >
          {statuses.map(status => (
            <option key={status} value={status}>{status.toUpperCase()}</option>
          ))}
        </select>
      </div>

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <Users size={48} style={{ color: '#64748b' }} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
            No users found
          </h2>
          <p style={{ color: '#64748b', margin: 0 }}>
            Try adjusting your filters
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {filteredUsers.map((user) => {
            const statusColor = STATUS_COLORS[user.status] || STATUS_COLORS.inactive;
            const roleColor = ROLE_COLORS[user.role] || ROLE_COLORS.student;
            return (
              <div
                key={user.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '1.5rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <h3 style={{ color: '#1e293b', fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                        {user.name}
                      </h3>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        background: roleColor,
                        color: 'white'
                      }}>
                        {user.role.replace('_', ' ').toUpperCase()}
                      </span>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        background: statusColor,
                        color: 'white'
                      }}>
                        {user.status.toUpperCase()}
                      </span>
                    </div>
                    <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.25rem 0' }}>
                      {user.email}
                    </p>
                    {user.studentNumber && (
                      <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
                        {user.studentNumber}
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                    Joined: {new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      color: '#64748b',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}>
                      <Edit size={16} />
                      Edit
                    </button>
                    {user.status === 'active' ? (
                      <button
                        onClick={() => handleStatusChange(user.id, 'suspended')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 1rem',
                          background: '#ef4444',
                          border: 'none',
                          borderRadius: '8px',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                        }}
                      >
                        <Ban size={16} />
                        Suspend
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusChange(user.id, 'active')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 1rem',
                          background: '#10b981',
                          border: 'none',
                          borderRadius: '8px',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                        }}
                      >
                        <Check size={16} />
                        Activate
                      </button>
                    )}
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
