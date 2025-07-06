export interface Note {
  id: string;
  title: string;
  branch: string;
  semester: string;
  subject: string;
  description: string;
  uploader: string;
  uploadDate: string;
  downloads: number;
  points: number;
  tags: string[];
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
  image: string;
}

export interface Request {
  id: string;
  title: string;
  branch: string;
  semester: string;
  subject: string;
  description: string;
  user: string;
  upvotes: number;
  status: 'pending' | 'fulfilled' | 'in-progress';
  timestamp: string;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  college: string;
  points: number;
  rank: number;
  avatar: string;
  level: string;
}

export interface CommunityPost {
  id: string;
  user: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  type: 'text' | 'poll' | 'link' | 'file';
}

export const mockNotes: Note[] = [
  {
    id: '1',
    title: 'Data Structures and Algorithms Complete Notes',
    branch: 'Computer Science',
    semester: '3rd',
    subject: 'DSA',
    description: 'Comprehensive notes covering all major data structures and algorithms with examples',
    uploader: 'Alex Johnson',
    uploadDate: '2024-01-15',
    downloads: 245,
    points: 50,
    tags: ['algorithms', 'data-structures', 'programming']
  },
  {
    id: '2',
    title: 'Database Management System Notes',
    branch: 'Computer Science',
    semester: '4th',
    subject: 'DBMS',
    description: 'Complete DBMS notes with SQL queries and normalization examples',
    uploader: 'Sarah Chen',
    uploadDate: '2024-01-20',
    downloads: 189,
    points: 45,
    tags: ['database', 'sql', 'normalization']
  },
  {
    id: '3',
    title: 'Operating Systems Concepts',
    branch: 'Computer Science',
    semester: '5th',
    subject: 'OS',
    description: 'Process management, memory management, and file systems explained',
    uploader: 'Mike Davis',
    uploadDate: '2024-01-25',
    downloads: 156,
    points: 40,
    tags: ['operating-systems', 'processes', 'memory']
  }
];

export const mockBlogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'How to Master Data Structures in 30 Days',
    excerpt: 'A comprehensive guide to understanding and implementing data structures efficiently...',
    author: 'Emily Rodriguez',
    date: '2024-01-28',
    category: 'Study Tips',
    readTime: '8 min read',
    image: 'https://images.pexels.com/photos/574070/pexels-photo-574070.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  {
    id: '2',
    title: 'Top 10 Programming Languages for Students',
    excerpt: 'Discover which programming languages are most valuable for your academic and career growth...',
    author: 'David Kim',
    date: '2024-01-26',
    category: 'Programming',
    readTime: '6 min read',
    image: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  {
    id: '3',
    title: 'Effective Study Techniques for Engineering Students',
    excerpt: 'Learn proven study methods that will help you excel in your engineering courses...',
    author: 'Lisa Wang',
    date: '2024-01-24',
    category: 'Study Tips',
    readTime: '10 min read',
    image: 'https://images.pexels.com/photos/1181715/pexels-photo-1181715.jpeg?auto=compress&cs=tinysrgb&w=600'
  }
];

export const mockRequests: Request[] = [
  {
    id: '1',
    title: 'Need Machine Learning Notes for CSE 6th Sem',
    branch: 'Computer Science',
    semester: '6th',
    subject: 'Machine Learning',
    description: 'Looking for comprehensive ML notes covering supervised and unsupervised learning',
    user: 'Anonymous',
    upvotes: 23,
    status: 'pending',
    timestamp: '2024-01-29'
  },
  {
    id: '2',
    title: 'Calculus 2 Integration Problems and Solutions',
    branch: 'Mathematics',
    semester: '2nd',
    subject: 'Calculus',
    description: 'Need practice problems for integration by parts and substitution methods',
    user: 'John Smith',
    upvotes: 18,
    status: 'in-progress',
    timestamp: '2024-01-28'
  },
  {
    id: '3',
    title: 'Digital Electronics Lab Manual',
    branch: 'Electronics',
    semester: '3rd',
    subject: 'Digital Electronics',
    description: 'Looking for complete lab manual with circuit diagrams and explanations',
    user: 'Anonymous',
    upvotes: 15,
    status: 'fulfilled',
    timestamp: '2024-01-27'
  }
];

export const mockLeaderboard: LeaderboardUser[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    college: 'MIT',
    points: 2450,
    rank: 1,
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    level: 'Scholar'
  },
  {
    id: '2',
    name: 'Sarah Chen',
    college: 'Stanford University',
    points: 2180,
    rank: 2,
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    level: 'Expert'
  },
  {
    id: '3',
    name: 'Mike Davis',
    college: 'Harvard University',
    points: 1950,
    rank: 3,
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    level: 'Expert'
  },
  {
    id: '4',
    name: 'Emily Rodriguez',
    college: 'UC Berkeley',
    points: 1780,
    rank: 4,
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    level: 'Advanced'
  },
  {
    id: '5',
    name: 'David Kim',
    college: 'Carnegie Mellon',
    points: 1650,
    rank: 5,
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    level: 'Advanced'
  }
];

export const mockCommunityPosts: CommunityPost[] = [
  {
    id: '1',
    user: 'Alex Johnson',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    content: 'Just uploaded comprehensive DSA notes! Hope they help everyone prepare for their exams. Feel free to ask questions in the comments.',
    timestamp: '2 hours ago',
    likes: 24,
    comments: 8,
    type: 'text'
  },
  {
    id: '2',
    user: 'Sarah Chen',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    content: 'Poll: Which programming language should I learn next? A) Python B) JavaScript C) Java D) C++',
    timestamp: '4 hours ago',
    likes: 15,
    comments: 12,
    type: 'poll'
  },
  {
    id: '3',
    user: 'Mike Davis',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    content: 'Found this amazing free course on machine learning. Highly recommended for CS students!',
    timestamp: '6 hours ago',
    likes: 32,
    comments: 6,
    type: 'link'
  }
];

export const stats = {
  notesUploaded: 1247,
  activeMembers: 3456,
  requestsFulfilled: 892
};