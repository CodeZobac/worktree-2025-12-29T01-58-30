"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BlurText from '@/components/BlurText';
import { motion } from 'motion/react';
import { showSuccessToast, showErrorToast } from '@/components/toast';

interface FamilySetupPromptProps {
  userName?: string;
  onSuccess?: () => void;
}

type Mode = 'create' | 'join';

export default function FamilySetupPrompt({ userName, onSuccess }: FamilySetupPromptProps) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('create');
  const [familyName, setFamilyName] = useState(userName ? `${userName}'s Family` : 'My Family');
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!familyName.trim()) {
      setError('Please enter a family name');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/family', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: familyName.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to create family');
      }

      showSuccessToast('Family created successfully!');
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Refresh the page to reload with family data
      router.refresh();
    } catch (err) {
      console.error('Error creating family:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create family';
      setError(errorMessage);
      showErrorToast(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteCode.trim()) {
      setError('Please enter an invite code');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/family/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inviteCode: inviteCode.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to join family');
      }

      showSuccessToast('Joined family successfully!');
      
      if (onSuccess) {
        onSuccess();
      }

      router.refresh();
    } catch (err) {
      console.error('Error joining family:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to join family';
      setError(errorMessage);
      showErrorToast(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    router.push('/');
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <div className="text-center">
          <BlurText
            text="Welcome to Family Recipes!"
            delay={100}
            animateBy="words"
            className="text-2xl font-bold text-gray-900 mb-2"
          />
          <p className="text-gray-600">
            {mode === 'create' 
              ? "Let's create your family group to start sharing recipes"
              : "Enter the invite code to join your family"
            }
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center space-x-4 border-b border-gray-200 pb-4">
          <button
            onClick={() => setMode('create')}
            className={`pb-2 px-4 font-medium transition-colors relative ${
              mode === 'create' ? 'text-orange-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Create Family
            {mode === 'create' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-[-17px] left-0 right-0 h-0.5 bg-orange-600"
              />
            )}
          </button>
          <button
            onClick={() => setMode('join')}
            className={`pb-2 px-4 font-medium transition-colors relative ${
              mode === 'join' ? 'text-orange-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Join Family
            {mode === 'join' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-[-17px] left-0 right-0 h-0.5 bg-orange-600"
              />
            )}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={mode === 'create' ? handleCreateFamily : handleJoinFamily} className="space-y-4">
          {mode === 'create' ? (
            <div>
              <label htmlFor="familyName" className="block text-sm font-medium text-gray-700 mb-2">
                Family Name
              </label>
              <input
                type="text"
                id="familyName"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="Enter your family name"
                disabled={isLoading}
                required
              />
            </div>
          ) : (
            <div>
              <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 mb-2">
                Invite Code
              </label>
              <input
                type="text"
                id="inviteCode"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="Enter invite code"
                disabled={isLoading}
                required
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.95 }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {mode === 'create' ? 'Creating...' : 'Joining...'}
              </span>
            ) : (
              mode === 'create' ? 'Create Family' : 'Join Family'
            )}
          </motion.button>
        </form>

        {/* Skip Button */}
        <div className="text-center">
          <button
            onClick={handleSkip}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
