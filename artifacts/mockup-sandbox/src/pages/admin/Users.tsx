import { useState } from 'react';
import { Users, Search, Filter, Edit, Ban, Check } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  studentNumber?: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: 'John Banda',
      email: 'john.banda@unza.zm',
      studentNumber: 'STU001',
      role: 'student',
      status: 'active',
      createdAt: '2024-01-10T10:00:00Z'
    },
    {
      id: 2,
      name: 'Dr. Mary Phiri',
      email: 'mary.phiri@unza.zm',
      role: 'doctor',
      status: 'active',
      createdAt: '2024-01-08T14:00:00Z'
    },
    {
      id: 3,
      name: 'Joseph Mwamba',
      email: 'joseph.mwamba@unza.zm',
      studentNumber: 'STU003',
      role: 'student',
      status: 'suspended',
      createdAt: '2024-01-05T09:00:00Z'
    },
    {
      id: 4,
      name: 'Pharm. Grace Nkoma',
      email: 'grace.nkoma@unza.zm',
      role: 'pharmacist',
      status: 'active',
      createdAt: '2024-01-03T11:00:00Z'
    }
  ]);

  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const roles = ['All', 'student', 'doctor', 'pharmacist', 'lab_technician', 'mental_health_counselor', 'hiv_professional', 'admin', 'nurse'];
  const statuses = ['All', 'active', 'inactive', 'suspended'];

  const filteredUsers = users.filter(user => {
    const roleMatch = selectedRole === 'All' || user.role === selectedRole;
    const statusMatch = selectedStatus === 'All' || user.status === selectedStatus;
    return roleMatch && statusMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'hsl(142, 76%, 36%)';
      case 'inactive': return 'hsl(215, 20%, 65%)';
      case 'suspended': return 'hsl(0, 72%, 51%)';
      default: return 'hsl(217, 33%, 17%)';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'doctor': return 'hsl(217, 91%, 60%)';
      case 'pharmacist': return 'hsl(28, 100%, 50%)';
      case 'lab_technician': return 'hsl(199, 89%, 48%)';
      case 'mental_health_counselor': return 'hsl(280, 67%, 55%)';
      case 'hiv_professional': return 'hsl(45, 93%, 47%)';
      case 'admin': return 'hsl(0, 72%, 51%)';
      case 'nurse': return 'hsl(142, 76%, 36%)';
      default: return 'hsl(217, 33%, 17%)';
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'white', fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          User Management
        </h1>
        <p style={{ color: 'hsl(215, 20%, 65%)', marginBottom: 0 }}>
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
            color: 'hsl(215, 20%, 65%)'
          }} />
          <input
            type="text"
            placeholder="Search users..."
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
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          style={{
            padding: '0.75rem 1rem',
            background: 'hsl(217, 33%, 17%)',
            border: '1px solid hsl(217, 33%, 25%)',
            borderRadius: '8px',
            color: 'white',
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
            background: 'hsl(217, 33%, 17%)',
            border: '1px solid hsl(217, 33%, 25%)',
            borderRadius: '8px',
            color: 'white',
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
      <div style={{
        background: 'hsl(217, 33%, 17%)',
        borderRadius: '12px',
        border: '1px solid hsl(217, 33%, 25%)',
        overflow: 'hidden'
      }}>
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            style={{
              padding: '1.5rem',
              borderBottom: '1px solid hsl(217, 33%, 25%)',
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem'
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                <h3 style={{ color: 'white', fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                  {user.name}
                </h3>
                <span style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  background: getRoleColor(user.role),
                  color: 'white'
                }}>
                  {user.role.replace('_', ' ').toUpperCase()}
                </span>
                <span style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  background: getStatusColor(user.status),
                  color: 'white'
                }}>
                  {user.status.toUpperCase()}
                </span>
              </div>
              <p style={{ color: 'hsl(215, 20%, 65%)', fontSize: '0.875rem', margin: '0.25rem 0' }}>
                {user.email}
              </p>
              {user.studentNumber && (
                <p style={{ color: 'hsl(215, 20%, 65%)', fontSize: '0.875rem', margin: 0 }}>
                  {user.studentNumber}
                </p>
              )}
              <p style={{ color: 'hsl(215, 20%, 65%)', fontSize: '0.875rem', margin: '0.25rem 0' }}>
                Joined: {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: 'hsl(217, 33%, 25%)',
                border: '1px solid hsl(217, 33%, 25%)',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}>
                <Edit size={16} />
                Edit
              </button>
              {user.status === 'active' ? (
                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: 'hsl(0, 72%, 51%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}>
                  <Ban size={16} />
                  Suspend
                </button>
              ) : (
                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: 'hsl(142, 76%, 36%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}>
                  <Check size={16} />
                  Activate
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
