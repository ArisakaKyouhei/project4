@@ .. @@
 import React, { useState } from 'react';
 import { X } from 'lucide-react';
+import { useAuth } from '../contexts/AuthContext';

 interface LoginModalProps {
   isOpen: boolean;
   onClose: () => void;
   onSwitchToSignup: () => void;
+  onLoginSuccess: () => void;
 }

-const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSwitchToSignup }) => {
+const LoginModal: React.FC<LoginModalProps> = ({ 
+  isOpen, 
+  onClose, 
+  onSwitchToSignup, 
+  onLoginSuccess 
+}) => {
+  const { login } = useAuth();
   const [formData, setFormData] = useState({
     username: '',
     password: ''
@@ .. @@
     try {
       // TODO: 로그인 API 호출
       console.log('로그인 시도:', formData);
-      // 임시로 성공 처리
-      alert('로그인 성공!');
-      onClose();
+      
+      // 임시로 성공 처리 - 실제로는 서버에서 받은 사용자 정보를 사용
+      const userData = {
+        id: '1',
+        email: `${formData.username}@example.com`,
+        nickname: formData.username
+      };
+      
+      login(userData);
+      onLoginSuccess();
     } catch (error) {
       console.error('로그인 실패:', error);
       alert('로그인에 실패했습니다.');