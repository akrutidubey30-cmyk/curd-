import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';
import { User, Mail, Calendar, ShieldCheck, LogOut, Package, KeyRound } from 'lucide-react';

const Profile = () => {
  const { user: contextUser, logout, accessToken } = useAuth();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(contextUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const data = await authService.getMe();
        if (data.success && data.user) {
          setProfileData(data.user);
        }
      } catch (err) {
        console.error('Failed to load user profile via /me', err);
        setError('Failed to fetch profile details from /api/auth/me');
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return <LoadingSpinner text="Fetching your profile securely..." />;
  }

  const userInitial = profileData?.name ? profileData.name.charAt(0).toUpperCase() : 'U';

  return (
    <div style={{ maxWidth: '640px', margin: '2rem auto' }}>
      <div className="card" style={{ padding: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="profile-avatar" style={{ margin: 0 }}>
            {userInitial}
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {profileData?.name || 'User Profile'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Student Account &bull; Authenticated User
            </p>
          </div>
        </div>

        {error && <AlertMessage type="danger" message={error} />}

        <div className="profile-details-list">
          <div className="profile-field">
            <span className="profile-field-label">User ID:</span>
            <span className="profile-field-val" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
              {profileData?.id || 'N/A'}
            </span>
          </div>

          <div className="profile-field">
            <span className="profile-field-label">Email Address:</span>
            <span className="profile-field-val">{profileData?.email || 'N/A'}</span>
          </div>

          <div className="profile-field">
            <span className="profile-field-label">Account Created:</span>
            <span className="profile-field-val">
              {profileData?.createdAt
                ? new Date(profileData.createdAt).toLocaleString()
                : 'N/A'}
            </span>
          </div>

          <div className="profile-field">
            <span className="profile-field-label">Authentication Status:</span>
            <span className="badge badge-in-stock">
              <ShieldCheck size={14} /> Active JWT Session
            </span>
          </div>

          <div className="profile-field">
            <span className="profile-field-label">Access Token:</span>
            <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.75rem' }}>
              <KeyRound size={13} /> In Memory (15m expiry)
            </span>
          </div>

          <div className="profile-field">
            <span className="profile-field-label">Refresh Token:</span>
            <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.75rem' }}>
              <ShieldCheck size={13} /> HttpOnly Cookie (7d expiry)
            </span>
          </div>
        </div>

        <div
          style={{
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            gap: '1rem',
            justifyContent: 'space-between'
          }}
        >
          <Link to="/products" className="btn btn-outline">
            <Package size={16} />
            <span>Manage Products</span>
          </Link>

          <button onClick={handleLogout} className="btn btn-danger-outline">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
