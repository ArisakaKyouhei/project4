@@ .. @@
 import React, { useState } from 'react';
 import { X } from 'lucide-react';

 interface SignupModalProps {
   isOpen: boolean;
   onClose: () => void;
   onSwitchToLogin: () => void;
+  onSignupSuccess: () => void;
 }

-const SignupModal: React.FC<SignupModalProps> = ({ isOpen, onClose, onSwitchToLogin }) => {
+const SignupModal: React.FC<SignupModalProps> = ({ 
+  isOpen, 
+  onClose, 
+  onSwitchToLogin, 
+  onSignupSuccess 
+}) => {
   const [formData, setFormData] = useState({
     email: '',
     password: '',
@@ .. @@
     try {
       // TODO: 회원가입 API 호출
       console.log('회원가입 시도:', formData);
-      // 임시로 성공 처리
-      alert('회원가입 성공!');
-      onClose();
+      
+      // 회원가입 성공 시 로그인 모달로 전환
+      onSignupSuccess();
     } catch (error) {
       console.error('회원가입 실패:', error);
       alert('회원가입에 실패했습니다.');