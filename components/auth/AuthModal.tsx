'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { auth } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

const firestore = getFirestore();

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);

  // ✅ SAVE USER
  const storeUser = async (uid: string) => {
    const userRef = doc(firestore, 'users', uid);

    await setDoc(
      userRef,
      {
        id: uid,
        name,
        email,
        phoneNumber: '',
        addresses: [],
        orderCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { merge: true }
    );
  };

  // ✅ HANDLE LOGIN / REGISTER
  const handleSubmit = async () => {
    if (!email || !password) {
      toast.error('Please fill all fields');
      return;
    }

    if (!isLogin && !name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // 🔐 LOGIN
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Login successful 🚀');
      } else {
        // 🆕 REGISTER
        const res = await createUserWithEmailAndPassword(auth, email, password);

        await storeUser(res.user.uid);

        toast.success('Account created 🚀');
      }

      onClose();
      resetForm();
    } catch (error: any) {
      console.error(error);

      // 🔥 PROPER ERROR HANDLING
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Email already exists. Please login 🔐');
        setIsLogin(true);
      } else if (error.code === 'auth/wrong-password') {
        toast.error('Wrong password ❌');
      } else if (error.code === 'auth/user-not-found') {
        toast.error('User not found ❌');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Invalid email format ❌');
      } else if (error.code === 'auth/weak-password') {
        toast.error('Password should be at least 6 characters ❌');
      } else {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setIsLogin(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-orange-500" />
            <span>{isLogin ? 'Login' : 'Register'}</span>
          </DialogTitle>

          {/* ✅ FIXED WARNING */}
          <DialogDescription>
            Enter your details to continue
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {!isLogin && (
                <div>
                  <Label>Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>
              )}

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                {loading
                  ? 'Please wait...'
                  : isLogin
                  ? 'Login'
                  : 'Register'}
              </Button>

              <p
                className="text-center text-sm cursor-pointer text-orange-500"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin
                  ? "Don't have an account? Register"
                  : 'Already have an account? Login'}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;