import React from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import LoginButton from './LoginButton';

interface HeaderProps {
  showSearchBar?: boolean;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  showSearchBar = false, 
  onSearch,
  searchPlaceholder = "어떤 노래를 연주할까요?"
}) => {
  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    if (onSearch) {
      onSearch(query);
    } else {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="sticky top-0 bg-white z-50 border-b border-gray-200 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => navigate('/')}
              className="text-2xl font-bold text-black hover:text-gray-700 transition-colors duration-200 flex-shrink-0"
            >
              AutoChord
            </button>
            {showSearchBar && (
              <div className="flex-1 max-w-2xl">
                <SearchBar
                  onSearch={handleSearch}
                  placeholder={searchPlaceholder}
                />
              </div>
            )}
          </div>
          
          {/* 로그인 버튼 */}
          <div className="flex-shrink-0">
            <LoginButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;