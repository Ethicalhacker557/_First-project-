import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, CalendarDays, Settings, ChevronLeft, ChevronRight, Activity } from "lucide-react";

export default function BeingGracefulApp() {
  /* ---------------- Multi User System ---------------- */
  const [users, setUsers] = useState<any>({});
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [authInput, setAuthInput] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("bg_users_v1");
    if (saved) setUsers(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("bg_users_v1", JSON.stringify(users));
  }, [users]);

  const createOrLoginUser = () => {
    if (!authInput.trim()) return;

    if (!users[authInput]) {
      if (Object.keys(users).length >= 50) {
        alert("User limit reached (50 users max in demo mode)");
        return;
      }

      const newUserData = {
        events: {},
        yearlyPersonal: {},
        recurringProfessional: {},
        moodHistory: [],
        communityPosts: [],
        personalColor: "#f472b6",
        professionalColor: "#6366f1",
        themeColor: "#ec4899",
      };

      setUsers((prev: any) => ({ ...prev, [authInput]: newUserData }));
    }

    setCurrentUser(authInput);
    setAuthInput("");
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-white">
        <Card className="rounded-2xl shadow-xl w-full max-w-md">
          <CardContent className="p-8 space-y-4">
            <h2 className="text-2xl font-semibold text-center">Welcome to Being Graceful</h2>
            <input
              value={authInput}
              onChange={(e) => setAuthInput(e.target.value)}
              placeholder="Enter your username"
              className="w-full border rounded-xl px-3 py-2"
            />
            <Button onClick={createOrLoginUser} className="w-full">
              Continue
            </Button>
            <p className="text-xs text-gray-500 text-center">
              Demo supports up to 50 users locally in this browser.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userData = users[currentUser];

  const updateUser = (newData: any) => {
    setUsers((prev: any) => ({
      ...prev,
      [currentUser]: { ...prev[currentUser], ...newData },
    }));
  };

  /* ---------------- States ---------------- */
  const [activeTab, setActiveTab] = useState("dashboard");
  const today = new Date();
  const [displayDate, setDisplayDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [eventInput, setEventInput] = useState("");
  const [taskType, setTaskType] = useState<"personal" | "professional" | null>(null);

  const currentYear = displayDate.getFullYear();
  const currentMonth = displayDate.getMonth();
  const monthName = displayDate.toLocaleString("default", { month: "long" });
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const formatKey = (y: number, m: number, d: number) => `${y}-${m}-${d}`;

  /* ---------------- Add Task ---------------- */
  const handleAddEvent = () => {
    if (!selectedDate || !eventInput || !taskType) return;

    const fullKey = formatKey(currentYear, currentMonth, selectedDate);
    const newEvent = { text: eventInput, type: taskType };

    const updated = {
      ...userData.events,
      [fullKey]: [...(userData.events[fullKey] || []), newEvent],
    };

    updateUser({ events: updated });
    setEventInput("");
  };

  /* ---------------- Community ---------------- */
  const addPost = (text: string) => {
    if (!text.trim()) return;

    const newPost = {
      id: Date.now(),
      text,
      likes: 0,
      likedBy: {},
      author: currentUser,
      date: new Date().toLocaleDateString(),
    };

    updateUser({ communityPosts: [newPost, ...userData.communityPosts] });
  };

  const toggleLike = (postId: number) => {
    const updated = userData.communityPosts.map((post: any) => {
      if (post.id !== postId) return post;

      const alreadyLiked = post.likedBy[currentUser];
      const newLikedBy = { ...post.likedBy };

      if (alreadyLiked) {
        delete newLikedBy[currentUser];
        return { ...post, likes: post.likes - 1, likedBy: newLikedBy };
      } else {
        newLikedBy[currentUser] = true;
        return { ...post, likes: post.likes + 1, likedBy: newLikedBy };
      }
    });

    updateUser({ communityPosts: updated });
  };

  /* ---------------- UI ---------------- */
  return (
    <div
      className="min-h-screen p-4"
      style={{
        background: `linear-gradient(to bottom right, ${userData.themeColor}22, white)`,
      }}
    >
      <h1 className="text-2xl font-bold text-center mb-4">Being Graceful</h1>
      <p className="text-center text-sm mb-6">Logged in as {currentUser}</p>

      {activeTab === "dashboard" && (
        <Card className="rounded-2xl shadow-lg max-w-xl mx-auto">
          <CardContent className="p-6 text-center space-y-4">
            <h2 className="text-xl font-semibold">Welcome back 🌸</h2>
            <p>Take care of your tasks and your mind today.</p>
          </CardContent>
        </Card>
      )}

      {activeTab === "calendar" && (
        <Card className="rounded-2xl shadow-lg">
          <CardContent className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <button onClick={() => setDisplayDate(new Date(currentYear, currentMonth - 1, 1))}>
                <ChevronLeft />
              </button>
              <h2 className="font-semibold">{monthName} {currentYear}</h2>
              <button onClick={() => setDisplayDate(new Date(currentYear, currentMonth + 1, 1))}>
                <ChevronRight />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1;
                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDate(day)}
                    className="border rounded-xl p-2 text-center cursor-pointer"
                  >
                    {day}
                  </div>
                );
              })}
            </div>

            {selectedDate && (
              <div className="space-y-3">
                <div className="flex gap-3">
                  <Button onClick={() => setTaskType("personal")}>Personal</Button>
                  <Button onClick={() => setTaskType("professional")}>Professional</Button>
                </div>

                {taskType && (
                  <>
                    <input
                      value={eventInput}
                      onChange={(e) => setEventInput(e.target.value)}
                      placeholder="Enter task..."
                      className="border rounded-xl px-3 py-2 w-full"
                    />
                    <Button onClick={handleAddEvent}>Save</Button>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "community" && (
        <Card className="rounded-2xl shadow-lg max-w-3xl mx-auto">
          <CardContent className="p-6 space-y-6">
            <h2 className="text-xl font-semibold text-center">Community</h2>
            <textarea
              placeholder="Share something inspiring..."
              className="w-full border rounded-xl p-3"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) {
                  addPost((e.target as HTMLTextAreaElement).value);
                  (e.target as HTMLTextAreaElement).value = "";
                }
              }}
            />

            {userData.communityPosts.map((post: any) => (
              <div key={post.id} className="bg-white p-4 rounded-xl shadow space-y-2">
                <p className="text-xs text-gray-500">{post.date} • @{post.author}</p>
                <p>{post.text}</p>
                <button onClick={() => toggleLike(post.id)}>
                  ❤️ {post.likes}
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg rounded-t-2xl p-3 flex justify-around">
        <button onClick={() => setActiveTab("dashboard")}><Home /></button>
        <button onClick={() => setActiveTab("calendar")}><CalendarDays /></button>
        <button onClick={() => setActiveTab("community")}><Activity /></button>
        <button onClick={() => setActiveTab("settings")}><Settings /></button>
      </nav>
    </div>
  );
}
