import React from 'react';
import { Calendar, MapPin, Clock, Users, ArrowRight } from 'lucide-react';

const Events = () => {
  const upcomingEvents = [
    {
      id: 1,
      title: 'JEHUB Tech Workshop 2024',
      description: 'Learn the latest web development technologies with hands-on projects',
      date: '2024-08-15',
      time: '10:00 AM',
      location: 'Online Event',
      attendees: 150,
      image: '/api/placeholder/400/200'
    },
    {
      id: 2,
      title: 'Career Guidance Session',
      description: 'Get expert advice on career planning and interview preparation',
      date: '2024-08-20',
      time: '2:00 PM',
      location: 'Government Polytechnic Ranchi',
      attendees: 80,
      image: '/api/placeholder/400/200'
    },
    {
      id: 3,
      title: 'Coding Competition',
      description: 'Showcase your programming skills and win exciting prizes',
      date: '2024-08-25',
      time: '9:00 AM',
      location: 'Online Event',
      attendees: 200,
      image: '/api/placeholder/400/200'
    }
  ];

  return (
    <div className="min-h-screen pt-24 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Upcoming Events
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join our community events, workshops, and competitions to enhance your skills and network with fellow students.
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {upcomingEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group">
              <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <Calendar className="h-16 w-16 text-white" />
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {event.title}
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {event.description}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    {new Date(event.date).toLocaleDateString()} at {event.time}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-2" />
                    {event.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-2" />
                    {event.attendees} expected attendees
                  </div>
                </div>
                
                <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2">
                  Register Now
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Want to Organize an Event?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Have an idea for a workshop, seminar, or competition? We&apos;d love to help you organize it for the JEHUB community.
          </p>
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
            Propose an Event
          </button>
        </div>
      </div>
    </div>
  );
};

export default Events;
