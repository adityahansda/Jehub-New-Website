// pages/categories.tsx
import NewPageLayout from "../src/components/NewPageLayout";

export default function CategoriesPage() {
  const branches = ["CSE", "ECE", "ME", "CE", "EE", "IT"];
  const semesters = Array.from({ length: 8 }, (_, i) => `${i + 1} Semester`);
  const tags = [
    "Maths",
    "DSA",
    "DBMS",
    "CN",
    "OS",
    "Physics",
    "AI",
    "Data Science",
  ];

  return (
    <NewPageLayout>
      <div className="mt-10 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-400 via-pink-500 to-yellow-400 bg-clip-text text-transparent">
            📂 Browse Notes by Category
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Explore and download student-uploaded notes organized by Branch,
            Semester, and Subject. Whether you're preparing for exams or
            catching up on lectures, find exactly what you need here.
          </p>
        </div>

        {/* Why Use JEHUB */}
        <section className="mb-20 space-y-10">
          <h2 className="text-2xl font-semibold mb-8 text-center">
            ✨ Why Use JEHUB?
          </h2>
          <div className="flex flex-wrap justify-center gap-6">
            {[
              {
                title: "Community Notes",
                desc: "Access notes uploaded by students across branches. Each note is contributed by peers like you, ensuring variety and real student perspectives.",
              },
              {
                title: "Exam Ready",
                desc: "Find curated materials designed for last-minute preparation and effective revision. Perfect when exams are near and time is short.",
              },
              {
                title: "Always Free",
                desc: "Download and share notes without any hidden cost. Knowledge is meant to be shared openly for everyone to benefit.",
              },
            ].map((item, index) => (
              <div
                key={item.title}
                className={`w-[30%] min-w-[250px] rounded-2xl shadow-lg p-8 text-center bg-gradient-to-r ${
                  index % 2 === 0
                    ? "from-indigo-700 to-purple-600"
                    : "from-pink-600 to-red-500"
                }`}
              >
                <h3 className="text-xl font-bold mb-2 text-white">
                  {item.title}
                </h3>
                <p className="text-gray-100">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Branch Section */}
        <section className="mb-20">
          <h2 className="text-2xl font-semibold mb-6">🧑‍💻 Select Your Branch</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {branches.map((branch, i) => (
              <a
                key={branch}
                href={`/category/branch/${branch.toLowerCase()}`}
                className={`rounded-2xl shadow-lg p-6 text-center font-semibold transition transform hover:scale-105 bg-gradient-to-br ${
                  i % 2 === 0
                    ? "from-indigo-500 to-blue-600"
                    : "from-green-500 to-emerald-600"
                }`}
              >
                {branch}
              </a>
            ))}
          </div>
        </section>

        {/* Continue with semesters, tags, call-to-action ... */}

        {/* Semester Section with Unique Layout */}
        <section className="mb-20">
          <h2 className="text-2xl font-semibold mb-6">📆 Browse by Semester</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {semesters.map((sem, i) => (
              <a
                key={sem}
                href={`/category/semester/${i + 1}`}
                className={`rounded-xl shadow-lg p-6 text-center font-semibold transition transform hover:rotate-2 hover:scale-105 bg-gradient-to-tr ${
                  i % 2 === 0
                    ? "from-yellow-500 to-orange-600"
                    : "from-purple-500 to-pink-600"
                }`}
              >
                {sem}
              </a>
            ))}
          </div>
        </section>

        {/* Subject Tags Section with Pills */}
        <section className="mb-20">
          <h2 className="text-2xl font-semibold mb-6">
            🏷 Find by Subject or Tag
          </h2>
          <div className="flex flex-wrap gap-4">
            {tags.map((tag, i) => (
              <a
                key={tag}
                href={`/category/tag/${tag.toLowerCase().replace(/\s+/g, "-")}`}
                className={`px-6 py-3 rounded-lg font-medium shadow-md transition transform hover:scale-105 bg-gradient-to-r ${
                  i % 2 === 0
                    ? "from-teal-500 to-cyan-600"
                    : "from-pink-500 to-rose-600"
                }`}
              >
                {tag}
              </a>
            ))}
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="text-center mt-20 bg-gradient-to-r from-indigo-600 to-purple-600 py-12 px-6 rounded-3xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4">
            🚀 Contribute & Grow Together
          </h2>
          <p className="text-gray-100 max-w-xl mx-auto mb-6">
            Have useful notes to share? Upload and help your peers while
            building a strong learning community.
          </p>
          <a
            href="/upload"
            className="inline-block bg-white text-indigo-700 hover:bg-gray-200 transition-colors px-6 py-3 rounded-xl font-semibold shadow-md"
          >
            Upload Your Notes
          </a>
        </section>
      </div>
    </NewPageLayout>
  );
}
