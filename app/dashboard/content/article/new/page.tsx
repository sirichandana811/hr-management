"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { useState, useEffect } from "react";

export default function ArticlesPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [search, setSearch] = useState(""); // 🔍 search state

  useEffect(() => {
    fetch("/api/article")
      .then((res) => res.json())
      .then((data) => setArticles(data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/article", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
    if (res.ok) {
      const newArticle = await res.json();
      setArticles([newArticle, ...articles]);
      setTitle("");
      setContent("");
    }
  };

  // Filter articles by search term (check both title & content)
  const filteredArticles = articles.filter(
    (article) =>
      article.title.toLowerCase().includes(search.toLowerCase()) ||
      article.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout title="Add Article">
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">Add Article</h1>

        {/* ✅ Add New Article Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full border p-2 rounded"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Content"
            className="w-full border p-2 rounded"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Submit
          </button>
        </form>

        {/* 🔍 Search Input */}
        <div className="mt-6">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles..."
            className="w-full border p-2 rounded"
          />
        </div>

        {/* 📰 Article List */}
        <h2 className="text-lg font-semibold mt-6">All Articles</h2>
        <ul className="space-y-2 mt-2">
          {filteredArticles.length === 0 ? (
            <p className="text-gray-500">No articles found.</p>
          ) : (
            filteredArticles.map((article) => (
              <li key={article.id} className="border p-3 rounded">
                <h3 className="font-bold">{article.title}</h3>
                <p className="text-gray-700">{article.content}</p>
              </li>
            ))
          )}
        </ul>
      </div>
    </DashboardLayout>
  );
}
