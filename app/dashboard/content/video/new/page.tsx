"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { useState, useEffect } from "react";

export default function VideosPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [search, setSearch] = useState(""); // 🔍 search state

  useEffect(() => {
    fetch("/api/video")
      .then((res) => res.json())
      .then((data) => setVideos(data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, url, createdBy: "content_creator_id" }),
    });
    if (res.ok) {
      const newVideo = await res.json();
      setVideos([newVideo, ...videos]);
      setTitle("");
      setUrl("");
    }
  };

  // Filter videos by search term
  const filteredVideos = videos.filter((video) =>
    video.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout title="Add Video">
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">Add Video</h1>

        {/* ✅ Add New Video Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full border p-2 rounded"
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Video URL"
            className="w-full border p-2 rounded"
          />
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Submit
          </button>
        </form>

        {/* 🔍 Search Input */}
        <div className="mt-6">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search videos..."
            className="w-full border p-2 rounded"
          />
        </div>

        {/* 📺 Video List */}
        <h2 className="text-lg font-semibold mt-6">All Videos</h2>
        <ul className="space-y-2 mt-2">
          {filteredVideos.length === 0 ? (
            <p className="text-gray-500">No videos found.</p>
          ) : (
            filteredVideos.map((video) => (
              <li key={video.id} className="border p-3 rounded">
                <h3 className="font-bold">{video.title}</h3>
                <a
                  href={video.url}
                  target="_blank"
                  className="text-blue-500 underline"
                >
                  Watch Video
                </a>
              </li>
            ))
          )}
        </ul>
      </div>
    </DashboardLayout>
  );
}
