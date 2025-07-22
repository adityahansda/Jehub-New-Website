import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Users, ArrowRight, Star, Trophy, BookOpen } from 'lucide-react';
import PageHeader from '../../src/components/PageHeader';
import UniversalSidebar from '../../src/components/UniversalSidebar';

const Events = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const upcomingEvents = [
    {
      id: 1,
      title: 'Engineering Career Fair 2024',
      date: '2024-08-15',
      time: '10:00 AM - 4:00 PM',
      location: 'JUT Main Campus',
      description: 'Connect with top companies and explore career opportunities in engineering.',
      type: 'Career',
      attendees: 150,
      image: '/api/placeholder/300/200'
    },
    {
      id: 2,
      title: 'Web Development Workshop',
      date: '2024-08-20',
      time: '2:00 PM - 5:00 PM',
      location: 'Online',
      description: 'Learn modern web development techniques and build your first responsive website.',
      type: 'Workshop',
      attendees: 85,
      image: '/api/placeholder/300/200'
    },
    {
      id: 3,
      title: 'Study Group Session - CSE Sem 3',
      date: '2024-08-18',
      time: '6:00 PM - 8:00 PM',
      location: 'Library Hall',
      description: 'Collaborative study session for Computer Science Engineering third semester students.',
      type: 'Study Group',
      attendees: 45,
      image: '/api/placeholder/300/200'
    }
  ];

  const pastEvents = [
    {
      id: 4,
      title: 'JEHUB Hackathon 2024',
      date: '2024-07-10',
      time: '9:00 AM - 9:00 PM',
      location: 'Tech Hub',
      description: 'A 12-hour coding competition with amazing prizes and networking opportunities.',
      type: 'Competition',
      attendees: 200,
      image: '/api/placeholder/300/200'
    },
    {
      id: 5,
      title: 'AI & Machine Learning Seminar',
      date: '2024-07-05',
      time: '3:00 PM - 6:00 PM',
      location: 'Auditorium',
      description: 'Expert speakers discussed the future of AI and its applications in engineering.',
      type: 'Seminar',
      attendees: 120,
      image: '/api/placeholder/300/200'
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Career':
        return 'bg-blue-100 text-blue-800';
      case 'Workshop':
        return 'bg-green-100 text-green-800';
      case 'Study Group':
        return 'bg-purple-100 text-purple-800';
      case 'Competition':
        return 'bg-red-100 text-red-800';
      case 'Seminar':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <PageHeader 
        title="Events"
        icon={Calendar}
        onMenuClick={() => setSidebarOpen(true)}
      />
      
      {/* Universal Sidebar */}
      <UniversalSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="max-w-6xl mx-auto py-8 px-4 pt-20">
        {/* Description */}
        <div className="text-center mb-8">
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join our community events, workshops, and study sessions to enhance your learning experience.
          </p>
        </div>

        {/* Upcoming Events */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Calendar className="h-6 w-6 mr-2 text-blue-600" />
            Upcoming Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(event.type)}`}>
                    {event.type}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{event.title}</h3>
                <p className="text-gray-600 mb-4 text-sm">{event.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-500 text-sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Clock className="h-4 w-4 mr-2" />
                    {event.time}
                  </div>
                  <div className="flex items-center text-gray-500 text-sm">
                    <MapPin className="h-4 w-4 mr-2" />
                    {event.location}
                  </div>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Users className="h-4 w-4 mr-2" />
                    {event.attendees} attendees
                  </div>
                </div>
                
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Register Now
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Past Events */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Trophy className="h-6 w-6 mr-2 text-gray-600" />
            Past Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pastEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(event.type)}`}>
                    {event.type}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{event.title}</h3>
                <p className="text-gray-600 mb-4 text-sm">{event.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    {event.attendees} attended
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Want to organize an event?</h3>
          <p className="text-blue-100 mb-6">
            Have an idea for a workshop, study group, or competition? We&apos;d love to help you organize it!
          </p>
          <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            Propose an Event
          </button>
        </div>
      </div>
    </div>
  );
};

export default Events;
