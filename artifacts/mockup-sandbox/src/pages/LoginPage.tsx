import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSlidingOut, setIsSlidingOut] = useState(false);
  const swiperRef = useRef<any>(null);

  const backgroundImages = [
    '/images/happystudents.jpg',
    '/images/school.jpg',
    '/images/doctor.jpg',
    '/images/nursing_students.jpg',
    '/images/zambia_graduate_nurses.jpg'
  ];

  // Initialize Swiper
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Swiper) {
      swiperRef.current = new (window as any).Swiper('.swiper', {
        direction: 'horizontal',
        loop: true,
        autoplay: {
          delay: 6000,
          disableOnInteraction: false,
        },
        speed: 1000,
        effect: 'fade',
        fadeEffect: {
          crossFade: true
        },
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
        allowTouchMove: true,
        passiveListeners: true,
      });
    }

    return () => {
      if (swiperRef.current) {
        swiperRef.current.destroy();
      }
    };
  }, []);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setIsSlidingOut(true);

    try {
      await login({ email, password });
      // Navigate after slide animation completes
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 500);
    } catch (err) {
      // Slide back in on error
      setTimeout(() => {
        setIsSlidingOut(false);
        (window as any).Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: 'Invalid email or password. Please try again.',
          confirmButtonColor: '#10b981'
        });
      }, 500);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Swiper Background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0
      }}>
        <div className="swiper" style={{ width: '100%', height: '100%' }}>
          <div className="swiper-wrapper">
            {backgroundImages.map((image, index) => (
              <div key={index} className="swiper-slide" style={{
                width: '100%',
                height: '100%',
                backgroundImage: `url('${image}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
              }} />
            ))}
          </div>
          <div className="swiper-pagination" style={{
            position: 'absolute',
            bottom: '30px',
            zIndex: 10
          }} />
        </div>
      </div>

      {/* Dark Overlay */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0, 0, 0, 0.5)",
        zIndex: 1
      }} />

      {/* Login Form Container */}
      <div style={{
        position: "relative",
        zIndex: 2,
        width: '100%',
        maxWidth: '400px',
        padding: '1rem'
      }}>
        <div style={{
          marginBottom: '2rem',
          textAlign: 'center',
          transform: isSlidingOut ? 'translateX(-100%)' : 'translateX(0)',
          transition: 'transform 0.5s ease-in-out 0.1s',
          opacity: isSlidingOut ? 0 : 1
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '900',
            marginBottom: '1rem',
            color: '#ffffff'
          }}>
            UNZA DigiHealth
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '0'
          }}>
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ 
          marginBottom: '2rem',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          transform: isSlidingOut ? 'translateX(-100%)' : 'translateX(0)',
          transition: 'transform 0.5s ease-in-out 0.1s',
          opacity: isSlidingOut ? 0 : 1
        }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#475569'
            }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                background: '#ffffff',
                color: '#1e293b',
                fontSize: '1rem'
              }}
              disabled={isSubmitting}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#475569'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                background: '#ffffff',
                color: '#1e293b',
                fontSize: '1rem'
              }}
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fee2e2',
              color: '#dc2626',
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              marginBottom: '1.5rem',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !(email && password)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              background: 'linear-gradient(135deg, #10b981, #34d399)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1,
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
