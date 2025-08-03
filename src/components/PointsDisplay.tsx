import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Coins, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { pointsService, UserPoints } from '../services/pointsService';

interface PointsDisplayProps {
  className?: string;
  showLabel?: boolean;
}

const PointsDisplay: React.FC<PointsDisplayProps> = ({ 
  className = '', 
  showLabel = true 
}) => {
  const { user, userProfile } = useAuth();
  const [points, setPoints] = useState<UserPoints>({
    totalPoints: 0,
    availablePoints: 0,
    pointsSpent: 0,
    totalReferrals: 0
  });
  const [loading, setLoading] = useState(false);

  const loadUserPoints = async () => {
    if (user && user.email) {
      try {
        setLoading(true);
        console.log('PointsDisplay: Loading points for user:', user.$id, user.email);
        
        // Use the new email-based method
        const userPoints = await pointsService.getUserPointsByEmail(user.email);
        
        console.log('PointsDisplay: Points from getUserPointsByEmail:', userPoints);
        
        setPoints(userPoints);
      } catch (error) {
        console.error('Error loading user points:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setPoints({
        totalPoints: 0,
        availablePoints: 0,
        pointsSpent: 0,
        totalReferrals: 0
      });
    }
  };

  useEffect(() => {
    loadUserPoints();
  }, [user, userProfile]); // Also refresh when userProfile changes

  // Refresh points periodically
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      loadUserPoints();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  if (!user) {
    return (
      <Link 
        href="/login"
        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors ${className}`}
      >
        <Coins className="w-4 h-4" />
        {showLabel && <span>Sign in to earn points</span>}
      </Link>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Link 
        href="/referral"
        className="flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
        title={`Available: ${points.availablePoints} | Total: ${points.totalPoints} | Spent: ${points.pointsSpent}`}
      >
        <div className="flex items-center gap-1">
          <Coins className="w-4 h-4 text-blue-600" />
          {loading ? (
            <div className="w-6 h-4 bg-blue-200 animate-pulse rounded"></div>
          ) : (
            <span className="font-semibold text-blue-700">
              {points.availablePoints}
            </span>
          )}
        </div>
        {showLabel && (
          <span className="text-sm text-blue-600 group-hover:text-blue-700">
            Points
          </span>
        )}
      </Link>
      
      <Link 
        href="/referral"
        className="flex items-center justify-center w-8 h-8 bg-green-100 hover:bg-green-200 rounded-full transition-colors"
        title="Earn more points"
      >
        <Plus className="w-4 h-4 text-green-600" />
      </Link>
    </div>
  );
};

export default PointsDisplay;
