import React, { useState } from 'react';
import { Search, User, Plus, Minus, Star, Trophy, Activity, Save, RefreshCw } from 'lucide-react';
import { databases } from '../../lib/appwrite';
import { appwriteConfig } from '../../lib/appwriteConfig';
import { Query } from 'appwrite';
import { formatUserForDisplay, getSearchStrategy } from '../../utils/idUtils';

type UserProfile = {
    userId: string;
    shortId: string;
    name: string;
    email: string;
    branch: string;
    year: string;
    currentPoints: number;
    rank: number;
    totalEarned: number;
    avatar: string | null;
    phone: string;
    college: string;
    semester: string;
    availablePoints: number;
    pointsSpent: number;
    level: number;
    joinDate: string;
    lastActive: string;
};

function PointsManagement() {
    const [userSearch, setUserSearch] = useState('');
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [points, setPoints] = useState(0);
    const [customValue, setCustomValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');


    const fetchUserProfile = async () => {
        if (!userSearch.trim()) {
            setMessage('Please enter a valid User Identifier');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            console.log('Searching for user:', userSearch);
            console.log('Using databaseId:', appwriteConfig.databaseId);
            console.log('Using collections.users:', appwriteConfig.collections.users);
            
            let response;
            
            // Use utility function to determine search strategy
            const searchStrategy = getSearchStrategy(userSearch);
            console.log('Search strategy:', searchStrategy);
            
            switch (searchStrategy) {
                case 'fullId':
                    console.log('Attempting to fetch by full User ID...');
                    try {
                        const user = await databases.getDocument(
                            appwriteConfig.databaseId,
                            appwriteConfig.collections.users,
                            userSearch
                        );
                        console.log('Found user by User ID:', user.$id);
                        response = { documents: [user] };
                    } catch (idError) {
                        console.log('Full User ID lookup failed, trying email lookup:', idError instanceof Error ? idError.message : String(idError));
                        response = await databases.listDocuments(
                            appwriteConfig.databaseId,
                            appwriteConfig.collections.users,
                            [Query.equal('email', userSearch)]
                        );
                    }
                    break;
                    
                case 'shortId':
                    console.log('Searching by short User ID...');
                    // For short ID, we need to search through all users and match the last 6 characters
                    const allUsers = await databases.listDocuments(
                        appwriteConfig.databaseId,
                        appwriteConfig.collections.users
                    );
                    const matchedUser = allUsers.documents.find(user => 
                        user.$id.slice(-6).toUpperCase() === userSearch.toUpperCase()
                    );
                    response = { documents: matchedUser ? [matchedUser] : [] };
                    break;
                    
                case 'email':
                default:
                    console.log('Attempting to fetch by email...');
                    response = await databases.listDocuments(
                        appwriteConfig.databaseId,
                        appwriteConfig.collections.users,
                        [Query.equal('email', userSearch)]
                    );
                    break;
            }
            
            console.log('Search response:', response);

            if (response.documents.length > 0) {
                const user = response.documents[0];
                console.log('User data loaded:', {
                    userId: user.$id,
                    shortId: user.$id.slice(-6),
                    name: user.name,
                    points: user.points,
                    availablePoints: user.availablePoints
                });
                
                setUserProfile(formatUserForDisplay(user));
                setPoints(user.points || 0);
                setMessage('User profile loaded successfully!');
            } else {
                setMessage('User not found. Please check the User ID or email.');
            }

        } catch (error) {
            console.error('Error fetching user profile:', error);
            setMessage('Failed to load user profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Function to log points transaction
    const logPointsTransaction = async (userId: string, action: string, amount: number, previousPoints: number, newPoints: number, reason: string = 'Admin adjustment') => {
        try {
            // This would typically go to a points transactions collection
            // For now, we'll just log it to console and could be extended later
            console.log('Points Transaction:', {
                userId,
                action,
                amount,
                previousPoints,
                newPoints,
                reason,
                timestamp: new Date().toISOString(),
                adminAction: true
            });
        } catch (error) {
            console.error('Failed to log points transaction:', error);
        }
    };

    const addPoints = (value: number) => {
        const previousPoints = points;
        const newPoints = points + value;
        setPoints(newPoints);
        setMessage(`Added ${value} points successfully!`);
        
        // Log the transaction
        if (userProfile) {
            logPointsTransaction(userProfile.userId, 'ADD', value, previousPoints, newPoints);
        }
    };

    const removePoints = (value: number) => {
        const previousPoints = points;
        const newPoints = Math.max(0, points - value);
        setPoints(newPoints);
        setMessage(`Removed ${value} points successfully!`);
        
        // Log the transaction
        if (userProfile) {
            logPointsTransaction(userProfile.userId, 'REMOVE', value, previousPoints, newPoints);
        }
    };

    const addCustomPoints = () => {
        const value = parseInt(customValue);
        if (isNaN(value) || value <= 0) {
            setMessage('Please enter a valid positive number');
            return;
        }
        addPoints(value);
        setCustomValue('');
    };

    const removeCustomPoints = () => {
        const value = parseInt(customValue);
        if (isNaN(value) || value <= 0) {
            setMessage('Please enter a valid positive number');
            return;
        }
        removePoints(value);
        setCustomValue('');
    };

    const saveChanges = async () => {
        if (!userProfile) {
            setMessage('No user selected to save changes.');
            return;
        }

        // Show confirmation dialog
        const originalPoints = userProfile.currentPoints;
        const pointsDifference = points - originalPoints;
        const confirmMessage = pointsDifference >= 0 
            ? `Are you sure you want to add ${pointsDifference} points to ${userProfile.name}? (${originalPoints} → ${points})`
            : `Are you sure you want to remove ${Math.abs(pointsDifference)} points from ${userProfile.name}? (${originalPoints} → ${points})`;
        
        if (!confirm(confirmMessage)) {
            setMessage('Changes cancelled by user.');
            return;
        }

        setSaving(true);
        setMessage('');

        try {
            console.log('Attempting to update user points:', {
                userId: userProfile.userId,
                shortId: userProfile.shortId,
                newPoints: points,
                originalPoints: userProfile.currentPoints
            });
            
            // Update the user's points in the database
            // Based on the console logs, your schema has: points, availablePoints, pointsSpent
            const updateResult = await databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.users,
                userProfile.userId, // This is the user ID
                {
                    points: points,
                    availablePoints: points,
                    updatedAt: new Date().toISOString()
                }
            );
            
            console.log('Update successful:', updateResult);

            // Update the local userProfile state to reflect the changes
            setUserProfile({
                ...userProfile,
                currentPoints: points,
                availablePoints: points,
                totalEarned: Math.max(userProfile.totalEarned, points) // Don't decrease total earned
            });

            setMessage(`Points updated successfully! User now has ${points} points.`);
            console.log(`Updated points for user ${userProfile.name} (${userProfile.email}) to ${points}`);

        } catch (error) {
            console.error('Error updating user points:', error);
            setMessage('Failed to save points to database. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const resetUser = () => {
        setUserProfile(null);
        setUserSearch('');
        setPoints(0);
        setCustomValue('');
        setMessage('');
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Points Management</h2>
                    <p className="text-gray-600 dark:text-gray-400">Add or remove points for users across the platform</p>
                </div>
                <button
                    onClick={resetUser}
                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                    <RefreshCw className="h-4 w-4" />
                    <span>Reset</span>
                </button>
            </div>

            {/* User Search Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                    <Search className="h-5 w-5" />
                    <span>Find User</span>
                </h3>
                
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        placeholder="Enter User ID (6-digit), Email, or Full User ID"
                        className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        disabled={loading}
                    />
                    <button
                        onClick={fetchUserProfile}
        disabled={loading || !userSearch.trim()}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center space-x-2 min-w-[140px] justify-center"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Loading...</span>
                            </>
                        ) : (
                            <>
                                <Search className="h-4 w-4" />
                                <span>Search User</span>
                            </>
                        )}
                    </button>
                </div>

                {message && (
                    <div className={`mt-4 p-3 rounded-lg text-sm ${
                        message.includes('successfully') || message.includes('loaded')
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                        {message}
                    </div>
                )}
            </div>

            {/* User Profile Section */}
            {userProfile && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                    {/* Profile Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                                {userProfile.avatar ? (
                                    <img src={userProfile.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <User className="h-8 w-8" />
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold">{userProfile.name}</h3>
                                <p className="text-blue-100">{userProfile.email}</p>
                                <p className="text-blue-100 text-sm">{userProfile.branch} • {userProfile.year}</p>
                                <div className="flex items-center space-x-4 mt-2 text-sm text-blue-200">
                                    <span>📞 {userProfile.phone}</span>
                                    <span>🏫 {userProfile.college}</span>
                                    <span>📅 Joined: {userProfile.joinDate}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-blue-200">User ID</p>
                                <p className="text-lg font-bold bg-white/20 px-3 py-2 rounded">
                                    {userProfile.shortId}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                        <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{points}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Current Points</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <Trophy className="h-8 w-8 text-green-600 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">#{userProfile.rank}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Current Rank</p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{userProfile.totalEarned}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Earned</p>
                        </div>
                    </div>

                    {/* Points Management Controls */}
                    <div className="p-6 border-t border-gray-100 dark:border-gray-700">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Manage Points</h4>
                        
                        {/* Quick Actions */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                            <button
                                onClick={() => addPoints(5)}
                                className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
                            >
                                <Plus className="h-4 w-4" />
                                <span>+5</span>
                            </button>
                            <button
                                onClick={() => addPoints(10)}
                                className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
                            >
                                <Plus className="h-4 w-4" />
                                <span>+10</span>
                            </button>
                            <button
                                onClick={() => removePoints(5)}
                                className="flex items-center justify-center space-x-2 px-4 py-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                            >
                                <Minus className="h-4 w-4" />
                                <span>-5</span>
                            </button>
                            <button
                                onClick={() => removePoints(10)}
                                className="flex items-center justify-center space-x-2 px-4 py-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                            >
                                <Minus className="h-4 w-4" />
                                <span>-10</span>
                            </button>
                        </div>

                        {/* Custom Value Input */}
                        <div className="flex flex-col sm:flex-row gap-3 mb-6">
                            <input
                                type="number"
                                value={customValue}
                                onChange={(e) => setCustomValue(e.target.value)}
                                placeholder="Enter custom value"
                                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                min="1"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={addCustomPoints}
                                    disabled={!customValue || parseInt(customValue) <= 0}
                                    className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center space-x-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>Add</span>
                                </button>
                                <button
                                    onClick={removeCustomPoints}
                                    disabled={!customValue || parseInt(customValue) <= 0}
                                    className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center space-x-2"
                                >
                                    <Minus className="h-4 w-4" />
                                    <span>Remove</span>
                                </button>
                            </div>
                        </div>

                        {/* Save Changes Button */}
                        <div className="flex justify-end">
                            <button
                                onClick={saveChanges}
                                disabled={saving}
                                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center space-x-2 min-w-[150px] justify-center"
                            >
                                {saving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        <span>Save Changes</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PointsManagement;

