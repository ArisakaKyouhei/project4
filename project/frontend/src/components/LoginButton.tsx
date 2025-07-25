import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';

const LoginButton: React.FC = () => {
  const { user, isLoggedIn, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  const handleLogoutClick = () => {
    logout();
  };

  const handleCloseModals = () => {
    setShowLoginModal(false);
    setShowSignupModal(false);
  };

  const handleSwitchToSignup = () => {
    setShowLoginModal(false);
    setShowSignupModal(true);
  };

  const handleSwitchToLogin = () => {
    setShowSignupModal(false);
    setShowLoginModal(true);
  };

  const handleLoginSuccess = () => {
    handleCloseModals();
  };

  const handleSignupSuccess = () => {
    setShowSignupModal(false);
    setShowLoginModal(true);
  };

  if (isLoggedIn && user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-gray-700">안녕하세요, {user.nickname}님</span>
        <button
          onClick={handleLogoutClick}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200 font-medium"
        >
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleLoginClick}
        className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors duration-200 font-medium"
      >
        로그인
      </button>

      <LoginModal
        isOpen={showLoginModal}
        onClose={handleCloseModals}
        onSwitchToSignup={handleSwitchToSignup}
        onLoginSuccess={handleLoginSuccess}
      />

      <SignupModal
        isOpen={showSignupModal}
        onClose={handleCloseModals}
        onSwitchToLogin={handleSwitchToLogin}
        onSignupSuccess={handleSignupSuccess}
      />
    </>
  );
};

export default LoginButton;