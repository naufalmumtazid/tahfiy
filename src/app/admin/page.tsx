"use client";

import { FiUsers, FiBookOpen, FiUserPlus, FiBarChart2, FiChevronRight, FiStar } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import Header from "@/components/Header";

export default function AdminDashboard() {
  // Data untuk stats card
  const statsData = [
    { title: "Total Students", value: "48", change: "+4 this month", icon: <FiUsers className="w-6 h-6" />, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
    { title: "Juz Memorized", value: "156", change: "+12 this week", icon: <FiBookOpen className="w-6 h-6" />, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
    { title: "Active Today", value: "32", change: "67% attendance", icon: <FiUserPlus className="w-6 h-6" />, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
    { title: "Completion Rate", value: "78%", change: "+5% vs last month", icon: <FiBarChart2 className="w-6 h-6" />, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
  ];

  // Data untuk recent activity
  const activities = [
    { name: "Fatimah Azzahra", surah: "Al-Baqarah", verses: "1-5", juz: 1, time: "2 hours ago", type: "new" },
    { name: "Muhammad Rizki", surah: "Yasin", verses: "1-12", juz: 22, time: "4 hours ago", type: "review" },
    { name: "Aisyah Putri", surah: "Ar-Rahman", verses: "1-20", juz: 27, time: "Yesterday", type: "new" },
    { name: "Abdullah Hasan", surah: "Al-Mulk", verses: "1-15", juz: 29, time: "Yesterday", type: "review" },
    { name: "Hafizhuddin", surah: "An-Naba", verses: "1-20", juz: 30, time: "Yesterday", type: "test" },
  ];

  // Data untuk top students
  const topStudents = [
    { name: "Aisyah Putri", juz: 8, score: 98, rank: 1 },
    { name: "Abdullah Hasan", juz: 6, score: 95, rank: 2 },
    { name: "Fatimah Azzahra", juz: 5, score: 94, rank: 3 },
    { name: "Muhammad Rizki", juz: 4, score: 92, rank: 4 },
    { name: "Hafizhuddin", juz: 4, score: 90, rank: 5 },
  ];

  // Data untuk students table
  const studentsTable = [
    { name: "Aisyah Putri", juz: 8, lastSession: "Today, 09:00", status: "Active" },
    { name: "Abdullah Hasan", juz: 6, lastSession: "Today, 08:30", status: "Active" },
    { name: "Fatimah Azzahra", juz: 5, lastSession: "Yesterday", status: "Active" },
    { name: "Muhammad Rizki", juz: 4, lastSession: "Yesterday", status: "Review" },
    { name: "Hafizhuddin", juz: 4, lastSession: "2 days ago", status: "Pending" },
  ];

  const typeStyles = {
    new: { bg: "bg-blue-100", text: "text-blue-700", badge: "bg-blue-50 text-blue-600", label: "New Memorization" },
    review: { bg: "bg-sky-100", text: "text-sky-700", badge: "bg-sky-50 text-sky-600", label: "Review" },
    test: { bg: "bg-indigo-100", text: "text-indigo-700", badge: "bg-indigo-50 text-indigo-600", label: "Test" },
  };

  const statusStyles = {
    Active: "bg-blue-50 text-blue-600",
    Review: "bg-sky-50 text-sky-600",
    Pending: "bg-gray-100 text-gray-500",
  };

  return (
    <>
      {/* Header Component */}
      <Header />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statsData.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
                <p className="text-blue-600 text-xs mt-2 flex items-center gap-1">
                  <FiBarChart2 className="w-3 h-3" />
                  {stat.change}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                <div className={stat.iconColor}>{stat.icon}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-blue-100 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-semibold text-gray-800 text-lg">Recent Memorization Activity</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View All <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {activities.map((item, idx) => {
              const styles = typeStyles[item.type as keyof typeof typeStyles];
              return (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-blue-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium ${styles.bg} ${styles.text}`}>
                      {item.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.surah} • Ayat {item.verses} • Juz {item.juz}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${styles.badge}`}>
                      {styles.label}
                    </span>
                    <p className="text-[10px] text-gray-400 mt-1">{item.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Students Leaderboard */}
        <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 text-lg mb-4 flex items-center gap-2">
            <FaStar className="w-5 h-5 text-yellow-500" />
            Top Students This Month
          </h3>
          <div className="space-y-3">
            {topStudents.map((student) => (
              <div key={student.rank} className="flex items-center justify-between py-2.5 border-b border-blue-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-7 text-center font-bold text-sm ${student.rank === 1 ? "text-yellow-500" :
                      student.rank === 2 ? "text-gray-500" :
                        student.rank === 3 ? "text-amber-700" : "text-gray-400"
                    }`}>
                    {student.rank === 1 && <FaStar className="w-4 h-4 inline" />}
                    {student.rank === 2 && <FiStar className="w-4 h-4 inline" />}
                    {student.rank === 3 && <FiStar className="w-4 h-4 inline" />}
                    {student.rank > 3 && `#${student.rank}`}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{student.name}</p>
                    <p className="text-xs text-gray-500">{student.juz} Juz memorized</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-blue-600">{student.score}%</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-5 text-center text-sm bg-blue-50 rounded-xl py-2.5 hover:bg-blue-100 transition text-blue-700 font-medium">
            View Full Leaderboard →
          </button>
        </div>
      </div>

      {/* Students Progress Table */}
      <div className="bg-white rounded-2xl border border-blue-100 mt-6 p-6 shadow-sm overflow-x-auto">
        <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
          <h3 className="font-semibold text-gray-800 text-lg">Student Progress Overview</h3>
          <select className="text-sm border border-gray-200 rounded-xl px-4 py-2 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
            <option>All Classes</option>
            <option>Class A (Tahfidz)</option>
            <option>Class B (Tahfidz)</option>
            <option>Class C (Review)</option>
          </select>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-blue-100">
              <th className="text-left py-3 text-gray-500 font-medium text-xs">Student</th>
              <th className="text-left py-3 text-gray-500 font-medium text-xs">Juz Memorized</th>
              <th className="text-left py-3 text-gray-500 font-medium text-xs">Last Session</th>
              <th className="text-left py-3 text-gray-500 font-medium text-xs">Progress</th>
              <th className="text-left py-3 text-gray-500 font-medium text-xs hidden sm:table-cell">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-50">
            {studentsTable.map((student, idx) => {
              const progressPercent = Math.round(student.juz / 30 * 100);
              return (
                <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-700">
                        {student.name.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-800">{student.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-gray-700">Juz {student.juz}</td>
                  <td className="py-3 text-gray-500 text-xs">{student.lastSession}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full" style={{ width: `${progressPercent}%` }}></div>
                      </div>
                      <span className="text-xs text-gray-600">{progressPercent}%</span>
                    </div>
                  </td>
                  <td className="py-3 hidden sm:table-cell">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusStyles[student.status as keyof typeof statusStyles]}`}>
                      {student.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}