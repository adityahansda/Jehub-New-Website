import { databases, DATABASE_ID, USERS_COLLECTION_ID, NOTES_COLLECTION_ID, ACTIVITIES_COLLECTION_ID } from '../appwrite/config';
import { Query } from 'appwrite';

export interface DashboardStats {
    // User Stats
    notesUploaded: number;
    notesDownloaded: number;
    currentRank: number;
    level: number;
    pointsToNextLevel: number;

    // Activity Stats
    weeklyDownloads: number;
    monthlyDownloads: number;
    weeklyPoints: number;
    monthlyPoints: number;
    weeklyGrowth: number;

    // Community Stats
    totalViews: number;
    likesReceived: number;
    helpedStudents: number;
    notesRequested: number;
    requestsFulfilled: number;

    // Achievements
    completedAchievements: number;
    totalAchievements: number;

    // Recent Activity
    recentNotes: Array<{
        id: string;
        title: string;
        subject: string;
        semester: string;
        downloads: number;
        likes: number;
        uploadDate: string;
        thumbnail?: string;
    }>;

    // Notifications
    notifications: Array<{
        id: string;
        message: string;
        time: string;
        type: 'success' | 'info' | 'achievement' | 'warning';
        read: boolean;
    }>;
}

export interface UserActivity {
    $id: string;
    userId: string;
    activityType: 'upload' | 'download' | 'like' | 'share' | 'comment';
    targetId?: string;
    points: number;
    timestamp: string;
    metadata?: any;
}

export class DashboardService {
    // Get comprehensive dashboard stats for a user
    async getDashboardStats(userEmail: string): Promise<DashboardStats> {
        try {
            console.log('Fetching dashboard stats for:', userEmail);
            
            // Get user profile
            const userProfile = await this.getUserProfile(userEmail);
            if (!userProfile) {
                console.warn('User profile not found, returning mock data');
                return this.getMockDashboardStats();
            }

            // Get user's notes
            const userNotes = await this.getUserNotes(userProfile.$id || userProfile.userId);

            // Get user's activities
            const userActivities = await this.getUserActivities(userProfile.$id || userProfile.userId);

            // Calculate stats
            const stats = await this.calculateStats(userProfile, userNotes, userActivities);

            // Get recent notes
            const recentNotes = await this.getRecentNotes(userProfile.$id || userProfile.userId);

            // Get notifications
            const notifications = await this.getNotifications(userProfile.$id || userProfile.userId);

            console.log('Dashboard stats calculated:', stats);

            return {
                ...stats,
                recentNotes,
                notifications
            };
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            // Return mock data instead of throwing error
            return this.getMockDashboardStats();
        }
    }

    // Return mock dashboard data for development/fallback
    private getMockDashboardStats(): DashboardStats {
        return {
            notesUploaded: 24,
            notesDownloaded: 156,
            requestsFulfilled: 12,
            currentRank: 15,
            level: 5,
            pointsToNextLevel: 250,
            weeklyDownloads: 23,
            monthlyDownloads: 89,
            weeklyPoints: 150,
            monthlyPoints: 450,
            weeklyGrowth: 12,
            totalViews: 1847,
            likesReceived: 89,
            helpedStudents: 156,
            notesRequested: 5,
            completedAchievements: 8,
            totalAchievements: 12,
            recentNotes: [
                {
                    id: '1',
                    title: 'Data Structures and Algorithms',
                    subject: 'Computer Science',
                    semester: '4th',
                    downloads: 45,
                    likes: 12,
                    uploadDate: new Date().toISOString()
                },
                {
                    id: '2',
                    title: 'Database Management Systems',
                    subject: 'Computer Science',
                    semester: '5th',
                    downloads: 38,
                    likes: 9,
                    uploadDate: new Date(Date.now() - 86400000).toISOString()
                },
                {
                    id: '3',
                    title: 'Operating Systems Concepts',
                    subject: 'Computer Science',
                    semester: '6th',
                    downloads: 52,
                    likes: 15,
                    uploadDate: new Date(Date.now() - 172800000).toISOString()
                }
            ],
            notifications: [
                {
                    id: '1',
                    message: 'Your note \"Data Structures\" received 5 new downloads',
                    time: '2 hours ago',
                    type: 'success',
                    read: false
                },
                {
                    id: '2',
                    message: 'New semester counselling update available',
                    time: '4 hours ago',
                    type: 'info',
                    read: false
                },
                {
                    id: '3',
                    message: 'Achievement unlocked: Rising Star!',
                    time: '1 day ago',
                    type: 'achievement',
                    read: true
                }
            ]
        };
    }

    // Get user profile
    private async getUserProfile(email: string) {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                USERS_COLLECTION_ID,
                [Query.equal('email', email)]
            );
            return response.documents[0] || null;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }
    }

    // Get user's uploaded notes
    private async getUserNotes(userId: string) {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                NOTES_COLLECTION_ID,
                [Query.equal('userId', userId)]
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching user notes:', error);
            return [];
        }
    }

    // Get user's activities
    private async getUserActivities(userId: string) {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                ACTIVITIES_COLLECTION_ID,
                [Query.equal('userId', userId)]
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching user activities:', error);
            return [];
        }
    }

    // Calculate comprehensive stats
    private async calculateStats(userProfile: any, userNotes: any[], userActivities: any[]) {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Filter activities by time period
        const weeklyActivities = userActivities.filter(activity =>
            new Date(activity.timestamp) >= weekAgo
        );
        const monthlyActivities = userActivities.filter(activity =>
            new Date(activity.timestamp) >= monthAgo
        );

        // Calculate points
        const weeklyPoints = weeklyActivities.reduce((sum, activity) => sum + (activity.points || 0), 0);
        const monthlyPoints = monthlyActivities.reduce((sum, activity) => sum + (activity.points || 0), 0);

        // Calculate level based on points field
        const userPoints = userProfile.points || 0;
        const level = Math.floor(userPoints / 250) + 1;
        const pointsToNextLevel = 250 - (userPoints % 250);

        // Calculate downloads
        const weeklyDownloads = weeklyActivities.filter(activity => activity.activityType === 'download').length;
        const monthlyDownloads = monthlyActivities.filter(activity => activity.activityType === 'download').length;

        // Calculate growth rate
        const previousWeekPoints = monthlyPoints - weeklyPoints;
        const weeklyGrowth = previousWeekPoints > 0 ? Math.round(((weeklyPoints - previousWeekPoints) / previousWeekPoints) * 100) : 0;

        // Calculate community stats
        const totalViews = userNotes.reduce((sum, note) => sum + (note.views || 0), 0);
        const likesReceived = userNotes.reduce((sum, note) => sum + (note.likes || 0), 0);
        const helpedStudents = userNotes.reduce((sum, note) => sum + (note.downloads || 0), 0);

        // Calculate achievements (simplified for now)
        const completedAchievements = Math.floor(userPoints / 100);
        const totalAchievements = 12; // Fixed total for now

        return {
            notesUploaded: userProfile.notesUploaded || 0,
            notesDownloaded: userProfile.notesDownloaded || 0,
            currentRank: userProfile.rank || 0,
            level,
            pointsToNextLevel,
            weeklyDownloads,
            monthlyDownloads,
            weeklyPoints,
            monthlyPoints,
            weeklyGrowth,
            totalViews,
            likesReceived,
            helpedStudents,
            notesRequested: userProfile.notesRequested || 0,
            requestsFulfilled: userProfile.requestsFulfilled || 0,
            completedAchievements,
            totalAchievements
        };
    }

    // Get recent notes
    private async getRecentNotes(userId: string) {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                NOTES_COLLECTION_ID,
                [
                    Query.equal('userId', userId),
                    Query.orderDesc('$createdAt'),
                    Query.limit(5)
                ]
            );

            return response.documents.map(note => ({
                id: note.$id,
                title: note.title || 'Untitled Note',
                subject: note.subject || 'General',
                semester: note.semester || 'N/A',
                downloads: note.downloads || 0,
                likes: note.likes || 0,
                uploadDate: note.$createdAt,
                thumbnail: note.thumbnail || undefined
            }));
        } catch (error) {
            console.error('Error fetching recent notes:', error);
            return [];
        }
    }

    // Get notifications
    private async getNotifications(userId: string) {
        try {
            // For now, return mock notifications. You can implement real notifications later
            return [
                {
                    id: '1',
                    message: 'Your note received 5 new downloads',
                    time: '2 hours ago',
                    type: 'success' as const,
                    read: false
                },
                {
                    id: '2',
                    message: 'New counselling update for engineering admissions',
                    time: '4 hours ago',
                    type: 'info' as const,
                    read: false
                },
                {
                    id: '3',
                    message: 'You\'ve earned 50 points for active participation',
                    time: '1 day ago',
                    type: 'achievement' as const,
                    read: true
                }
            ];
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    }

    // Get user rank
    async getUserRank(userEmail: string): Promise<number> {
        try {
            const userProfile = await this.getUserProfile(userEmail);
            if (!userProfile) return 0;

            // Get all users sorted by points
            const response = await databases.listDocuments(
                DATABASE_ID,
                USERS_COLLECTION_ID,
                [Query.orderDesc('points')]
            );

            const userIndex = response.documents.findIndex(user => user.email === userEmail);
            return userIndex >= 0 ? userIndex + 1 : 0;
        } catch (error) {
            console.error('Error calculating user rank:', error);
            return 0;
        }
    }

    // Update user stats
    async updateUserStats(userEmail: string, stats: Partial<DashboardStats>) {
        try {
            const userProfile = await this.getUserProfile(userEmail);
            if (!userProfile) throw new Error('User profile not found');

            const updateData = {
                notesUploaded: stats.notesUploaded,
                notesDownloaded: stats.notesDownloaded,
                requestsFulfilled: stats.requestsFulfilled,
                rank: stats.currentRank
            };

            await databases.updateDocument(
                DATABASE_ID,
                USERS_COLLECTION_ID,
                userProfile.$id,
                updateData
            );
        } catch (error) {
            console.error('Error updating user stats:', error);
            throw error;
        }
    }
}

export const dashboardService = new DashboardService(); 