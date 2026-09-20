import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react';

export default function StudentProfile() {
  const { user } = useAuth();
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  useEffect(() => {
    // Load saved profile photo from localStorage
    const savedPhoto = localStorage.getItem('profilePhoto');
    if (savedPhoto) {
      setProfilePhoto(savedPhoto);
    }
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setProfilePhoto(result);
        localStorage.setItem('profilePhoto', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setProfilePhoto(null);
    localStorage.removeItem('profilePhoto');
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ 
        backgroundImage: "url('/images/nursing_students.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        borderRadius: '12px',
        padding: '2rem',
        marginBottom: '2rem',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(147, 197, 253, 0.8) 100%)",
          borderRadius: "12px"
        }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, marginBottom: '0.5rem' }}>
            My Profile
          </h1>
          <p style={{ margin: 0, opacity: 0.9 }}>Manage your personal information</p>
        </div>
      </div>

      {/* Profile Photo Section */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1.5rem' }}>
          Profile Photo
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: profilePhoto ? 'transparent' : 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#ffffff',
            overflow: 'hidden',
            border: '4px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            position: 'relative'
          }}>
            {profilePhoto ? (
              <img 
                src={profilePhoto} 
                alt="Profile" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '2px' }}>UNZA</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{user?.name?.charAt(0).toUpperCase() || 'S'}</div>
              </div>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <label style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                background: '#10b981',
                color: 'white',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
              }}
              >
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  style={{ display: 'none' }}
                />
              </label>
              
              {profilePhoto && (
                <button
                  onClick={handleRemovePhoto}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                  }}
                >
                  Remove Photo
                </button>
              )}
            </div>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              Recommended: Square image, at least 200x200px
            </p>
            <p style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
              JPG, PNG or GIF (max 5MB)
            </p>
          </div>
        </div>
      </div>

      {/* Personal Information Section */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ color: '#64748b', display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
            Full Name
          </label>
          <div style={{ color: '#1e293b', fontSize: '1.1rem' }}>{user?.name || 'N/A'}</div>
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ color: '#64748b', display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
            Student Number
          </label>
          <div style={{ color: '#1e293b', fontSize: '1.1rem' }}>{user?.studentNumber || 'N/A'}</div>
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ color: '#64748b', display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
            Email
          </label>
          <div style={{ color: '#1e293b', fontSize: '1.1rem' }}>{user?.email || 'N/A'}</div>
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ color: '#64748b', display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
            Role
          </label>
          <div style={{ color: '#1e293b', fontSize: '1.1rem' }}>{user?.role || 'N/A'}</div>
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ color: '#64748b', display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
            Status
          </label>
          <div style={{ 
            color: '#16a34a', 
            fontSize: '1.1rem',
            fontWeight: '600'
          }}>
            {user?.status === 'active' ? 'Active' : user?.status || 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
}
