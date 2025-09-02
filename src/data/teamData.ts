import { TeamMember, CoreTeamMember } from '../types/team';

export const coreTeam: CoreTeamMember[] = [
  {
    name: 'Aditya',
    role: 'Founder & CEO',
    education: 'Diploma in Computer Science Engineering, JUT',
    specialization: 'Full-Stack Development & Community Building',
    bio: 'Visionary diploma student who founded JEHUB to create a space where fellow learners feel heard, guided, and connected. Experience: JEHUB - Founder & CEO',
    image: '/team/Aditya Hansda.jpg',
    social: {
      github: '#',
      linkedin: '#',
      twitter: '#'
    }
  },
  {
    name: 'Gourav',
    role: 'Executive Director',
    education: 'Government Polytechnic Khutri, Bokaro - Automobile Engineering',
    specialization: 'Community Engagement & Student Relations',
    bio: 'Passionate about exploring new opportunities and building strong student communities. Experienced in technical student organizations. Experience: JEHUB - Executive Director',
    image: '/team/Gaurav Kumar.jpg',
    social: {
      github: '#',
      linkedin: '#',
      instagram: '#'
    }
  },
  {
    name: 'Baby',
    role: 'Developer Team Head',
    education: 'Guru Gobind Singh Educational Society\'s Technical Campus - CSE',
    specialization: 'Website Development & Technical Management',
    bio: 'Dedicated to exploring new ways of learning and contributing to technical development of the platform. Experience: JEHUB - Developer Team Head',
    image: '/team/baby Kumari.jpg',
    social: {
      github: '#',
      linkedin: '#',
      twitter: '#'
    }
  },
  {
    name: 'Harsh',
    role: 'Community Manager',
    education: 'Computer Science Engineering',
    specialization: 'Community Management & Student Engagement',
    bio: 'Passionate community manager focused on building strong relationships and fostering collaboration among students. Experience: JEHUB - Community Manager',
    image: '/team/Harsh.jpg',
    social: {
      github: '#',
      linkedin: '#',
      twitter: '#'
    }
  }
];

export const allJehubTeam: TeamMember[] = [
  {
    name: 'Rajshekhar',
    role: 'Updates & Announcement Manager',
    education: 'Government Polytechnic Ranchi - Electrical Engineering',
    specialization: 'Information Dissemination & Group Administration',
    bio: 'Top performer managing official communications and maintaining group regulations. Experience: JEHUB - Updates & Announcement Manager',
    image: 'https://media.licdn.com/dms/image/v2/D4D35AQF-cJ0r6ghoxw/profile-framedphoto-shrink_400_400/B4DZjGMJ7sGQAc-/0/1755671732352?e=1757408400&v=beta&t=hzqB-cxMNipstQR3iN_LpPVeibsQ8pSGYYCcI5JD2pU',
    department: 'Communication Team',
    working: 1,
    xp: 409
  },
  {
    name: 'Shruti',
    role: 'Website Developer',
    education: 'Computer Science Engineering',
    specialization: 'Web Development & UI/UX Design',
    bio: 'Talented website developer creating exceptional user experiences and innovative solutions. Experience: JEHUB - Website Developer',
    image: 'https://media.licdn.com/dms/image/v2/D4E35AQERZAZgiKVbgA/profile-framedphoto-shrink_400_400/B4EZfA0iR6HIAk-/0/1751286687155?e=1757408400&v=beta&t=4T578z6GiCklWrpJJTVLXfF1BUOQCihj7iRmaMPHSNs',
    department: 'Development Team',
    working: 1,
    xp: 362
  },
  {
    name: 'Laxman',
    role: 'Website Developer',
    education: 'Government Polytechnic Bhaga - Final Year',
    specialization: 'Web Development & Technical Support',
    bio: 'Dedicated website developer enhancing technical skills while helping fellow students through web development. Experience: JEHUB - Website Developer',
    image: 'https://media.licdn.com/dms/image/v2/D5603AQGTK0DnO-agqw/profile-displayphoto-scale_400_400/B56ZengQ69G0Ag-/0/1750861944727?e=1759968000&v=beta&t=M1PvXDmCooeq5pv3VeOJmqBIsyuOnuEhaWZypqRudUc',
    department: 'Development Team',
    working: 1,
    xp: 330
  },
  {
    name: 'Rupanjay',
    role: 'Website Developer',
    education: 'Jharkhand Rai University - Computer Science',
    specialization: 'Web Development & Project Management',
    bio: 'Passionate website developer working on real-world projects and contributing to community development. Experience: JEHUB - Website Developer',
    image: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541',
    department: 'Development Team',
    working: 1,
    xp: 321
  },
  {
    name: 'Manish',
    role: 'Social Media Coordinator',
    education: 'Government Polytechnic Dumka - Mechanical Engineering',
    specialization: 'Social Media Management & Digital Marketing',
    bio: 'Expert social media coordinator managing JEHUB\'s online presence and creating engaging content for the community. Experience: JEHUB - Social Media Coordinator',
    image: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541',
    department: 'Marketing Team',
    working: 1,
    xp: 213
  },
  {
    name: 'Ujjwal',
    role: 'Website Developer',
    education: 'Government Polytechnic Dhanbad - CSE',
    specialization: 'Web Development & Software Engineering',
    bio: 'Focused website developer gaining real-world project experience and contributing to platform development. Experience: JEHUB - Website Developer',
    image: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541',
    department: 'Development Team',
    working: 1,
    xp: 179
  },
  {
    name: 'Suryansh',
    role: 'Developer',
    education: 'Government Polytechnic Dhanbad - CSE',
    specialization: 'Software Development & Innovation',
    bio: 'Passionate developer creating innovative solutions for the JEHUB platform and contributing to community growth. Experience: JEHUB - Developer',
    image: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541',
    department: 'Development Team',
    working: 1,
    xp: 134
  }
];

// Filter active team members (working: 1)
export const activeJehubTeam = allJehubTeam.filter(member => member.working === 1);

// Filter old team members (working: 0)
export const oldTeamMembers = allJehubTeam.filter(member => member.working === 0);

// Get active team members sorted by XP (highest first)
export const getActiveTeamSortedByXP = () => {
  return activeJehubTeam.sort((a, b) => b.xp - a.xp);
};

// Get old team members sorted by XP (highest first)
export const getOldTeamSortedByXP = () => {
  return oldTeamMembers.sort((a, b) => b.xp - a.xp);
};
