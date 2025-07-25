import Link from 'next/link';

export default function CategoriesPage() {
  const branches = [
    { name: 'CSE', fullName: 'Computer Science Engineering', link: '/category/branch/cse' },
    { name: 'ECE', fullName: 'Electronics & Communication Engineering', link: '/category/branch/ece' },
    { name: 'ME', fullName: 'Mechanical Engineering', link: '/category/branch/me' },
    { name: 'CE', fullName: 'Civil Engineering', link: '/category/branch/ce' },
    { name: 'EE', fullName: 'Electrical Engineering', link: '/category/branch/ee' },
    { name: 'IT', fullName: 'Information Technology', link: '/category/branch/it' },
  ];

  const semesters = [
    { number: '1st', link: '/category/semester/1' },
    { number: '2nd', link: '/category/semester/2' },
    { number: '3rd', link: '/category/semester/3' },
    { number: '4th', link: '/category/semester/4' },
    { number: '5th', link: '/category/semester/5' },
    { number: '6th', link: '/category/semester/6' },
    { number: '7th', link: '/category/semester/7' },
    { number: '8th', link: '/category/semester/8' },
  ];

  const subjectTags = [
    { name: 'Maths', link: '/category/tag/maths' },
    { name: 'DSA', link: '/category/tag/dsa' },
    { name: 'DBMS', link: '/category/tag/dbms' },
    { name: 'CN', link: '/category/tag/cn' },
    { name: 'OS', link: '/category/tag/os' },
    { name: 'Physics', link: '/category/tag/physics' },
    { name: 'AI', link: '/category/tag/ai' },
    { name: 'Data Science', link: '/category/tag/data-science' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">
            📂 Browse Notes by Category
          </h1>
          <p className="text-gray-300 text-center max-w-4xl mx-auto text-lg leading-relaxed">
            Explore and download student-uploaded notes organized by Branch, Semester, and Subject. 
            Whether you're preparing for exams or catching up on lectures, find exactly what you need here.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Branches Section */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
            🧑‍💻 Select Your Branch
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {branches.map((branch) => (
              <Link
                key={branch.name}
                href={branch.link}
                className="group bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-blue-500 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 hover:scale-105"
              >
                <div className="text-center">
                  <h3 className="text-xl font-bold text-blue-400 group-hover:text-blue-300 mb-2">
                    {branch.name}
                  </h3>
                  <p className="text-gray-400 text-sm group-hover:text-gray-300">
                    {branch.fullName}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Semesters Section */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
            📆 Browse by Semester
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {semesters.map((semester) => (
              <Link
                key={semester.number}
                href={semester.link}
                className="group bg-gray-800 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 border border-gray-600 hover:border-transparent rounded-lg p-4 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 hover:scale-105"
              >
                <div className="text-center">
                  <h3 className="text-lg font-bold text-purple-400 group-hover:text-white">
                    {semester.number}
                  </h3>
                  <p className="text-gray-400 text-xs group-hover:text-gray-200 mt-1">
                    Semester
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Subject Tags Section */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
            🏷 Find by Subject or Tag
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {subjectTags.map((tag) => (
              <Link
                key={tag.name}
                href={tag.link}
                className="group bg-gray-800 hover:bg-gradient-to-r hover:from-green-600 hover:to-teal-600 border border-gray-600 hover:border-transparent rounded-full px-6 py-3 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20 hover:scale-105"
              >
                <span className="text-green-400 group-hover:text-white font-semibold">
                  {tag.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl p-8 md:p-12 text-center border border-gray-600">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-yellow-400">
            🙌 Can't find your subject?
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-3xl mx-auto leading-relaxed">
            Encourage your friends to upload notes or contribute yours to help the JEHUB community grow!
          </p>
          <Link
            href="/upload"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/30 hover:scale-105"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload Notes
          </Link>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2024 JEHUB - Empowering students through shared knowledge
          </p>
        </div>
      </footer>
    </div>
  );
}
