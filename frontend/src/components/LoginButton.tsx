@@ .. @@
 import React, { useState } from 'react';
+import { useAuth } from '../contexts/AuthContext';
 import LoginModal from './LoginModal';
 import SignupModal from './SignupModal';

 const LoginButton: React.FC = () => {
+  const { user, isLoggedIn, logout } = useAuth();
   const [showLoginModal, setShowLoginModal] = useState(false);
   const [showSignupModal, setShowSignupModal] = useState(false);

   const handleLoginClick = () => {
-    setShowLoginModal(true);
+    if (isLoggedIn) {
+      logout();
+    } else {
+      setShowLoginModal(true);
+    }
   };

   const handleCloseModals = () => {
@@ .. @@
     setShowLoginModal(true);
   };

+  if (isLoggedIn) {
+    return (
+      <div className="flex items-center gap-3">
+        <span className="text-gray-700 text-sm">
+          안녕하세요, {user?.nickname}님
+        </span>
+        <button
+          onClick={handleLoginClick}
+          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors duration-200 font-medium"
+        >
+          로그아웃
+        </button>
+      </div>
+    );
+  }

   return (
     <>
       <button
@@ .. @@
         onClose={handleCloseModals}
         onSwitchToSignup={handleSwitchToSignup}
+        onLoginSuccess={handleCloseModals}
       />

       <SignupModal
@@ .. @@
         onClose={handleCloseModals}
         onSwitchToLogin={handleSwitchToLogin}
+        onSignupSuccess={handleSwitchToLogin}
       />
     </>
   );