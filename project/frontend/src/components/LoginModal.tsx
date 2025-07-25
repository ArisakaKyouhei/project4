import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
  onLoginSuccess: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ 
  isOpen, 
  onClose, 
  onSwitchToSignup, 
  onLoginSuccess 
}) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // TODO: 로그인 API 호출
      console.log('로그인 시도:', formData);
      
      // 임시로 성공 처리 - 실제로는 서버에서 받은 사용자 정보를 사용
      const userData = {
        id: '1',
        email: formData.email,
        nickname: formData.email.split('@')[0] // 이메일에서 닉네임 추출
      };
      
      login(userData);
      onLoginSuccess();
    } catch (error) {
      console.error('로그인 실패:', error);
      alert('로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-200 rounded-lg p-8 w-full max-w-md mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-black text-center mb-8">
          AutoChord에 로그인
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-600 text-sm">📧</span>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-white border-0 rounded-md text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-600 text-sm">🔒</span>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-white border-0 rounded-md text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-white text-black font-semibold rounded-md hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? '로그인 중...' : 'Login'}
            </button>
          </div>
        </form>

        <div className="text-center mt-6">
          <span className="text-gray-600">아직 계정이 없으세요? </span>
          <button
            onClick={onSwitchToSignup}
            className="text-black font-semibold hover:underline"
          >
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;