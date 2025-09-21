"use client";

import BackButton from "@/components/BackButton";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useAuth } from "../../contexts/AuthContext";
import { cookingHistoryService } from "@/lib/supabaseService";
import ProtectedRoute from "@/components/ProtectedRoute";

interface CookingHistoryItem {
  id: string;
  action: string;
  recipe_id: string;
  recipe_title: string;
  recipe_image: string;
  created_at: string;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<CookingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const { user } = useAuth() as any;

  const handleSearchFocus = () => setShowResults(true);
  const handleBlur = () => setTimeout(() => setShowResults(false), 200);

  useEffect(() => {
    if (user) {
      loadCookingHistory();
    }
  }, [user]);

  const loadCookingHistory = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await cookingHistoryService.getCookingHistory(user.id);
      
      if (error) {
        throw error;
      }
      
      setHistory(data || []);
    } catch (err) {
      console.error('Error loading cooking history:', err);
      setError('Failed to load cooking history');
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    if (!user) return;
    
    if (!confirm('Are you sure you want to clear your cooking history?')) {
      return;
    }
    
    try {
      const { error } = await cookingHistoryService.clearCookingHistory(user.id);
      
      if (error) {
        throw error;
      }
      
      setHistory([]);
    } catch (err) {
      console.error('Error clearing cooking history:', err);
      setError('Failed to clear cooking history');
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'viewed': return '👀';
      case 'generated': return '🤖';
      case 'cooked': return '👨‍🍳';
      case 'saved': return '💾';
      default: return '📝';
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'viewed': return 'Viewed';
      case 'generated': return 'Generated';
      case 'cooked': return 'Cooked';
      case 'saved': return 'Saved';
      default: return 'Action';
    }
  };

  const filteredHistory = filter === "all" 
    ? history 
    : history.filter(item => item.action === filter);

  const groupedHistory = filteredHistory.reduce((groups, item) => {
    const date = new Date(item.created_at).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
    return groups;
  }, {} as Record<string, CookingHistoryItem[]>);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-base-100 relative">
          <BackButton fallbackUrl="/" />
          <Navbar 
            showResults={showResults}
            setShowResults={setShowResults}
            handleSearchFocus={handleSearchFocus}
            handleBlur={handleBlur}
          />
          <div className="container mx-auto md:mt-16 mt-28 px-4 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="loading loading-spinner loading-lg text-primary"></div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-base-100 relative">
        <BackButton fallbackUrl="/" />
        
        <Navbar 
          showResults={showResults}
          setShowResults={setShowResults}
          handleSearchFocus={handleSearchFocus}
          handleBlur={handleBlur}
        />

        <div className={`container mx-auto md:mt-16 mt-28 px-4 py-8 transition-all duration-300 ${
          showResults ? "opacity-80 blur-sm" : "opacity-100"
        }`}>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-4">
              Your Cooking History
            </h1>
            <p className="text-lg text-base-content/70">
              Track your culinary journey and discoveries
            </p>
          </div>

          {error && (
            <div className="alert alert-error mb-6">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="btn btn-sm btn-ghost">
                Dismiss
              </button>
            </div>
          )}

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            <button
              onClick={() => setFilter("all")}
              className={`btn btn-sm ${filter === "all" ? "btn-primary" : "btn-outline"}`}
            >
              All ({history.length})
            </button>
            <button
              onClick={() => setFilter("viewed")}
              className={`btn btn-sm ${filter === "viewed" ? "btn-primary" : "btn-outline"}`}
            >
              👀 Viewed ({history.filter(h => h.action === "viewed").length})
            </button>
            <button
              onClick={() => setFilter("generated")}
              className={`btn btn-sm ${filter === "generated" ? "btn-primary" : "btn-outline"}`}
            >
              🤖 Generated ({history.filter(h => h.action === "generated").length})
            </button>
            <button
              onClick={() => setFilter("cooked")}
              className={`btn btn-sm ${filter === "cooked" ? "btn-primary" : "btn-outline"}`}
            >
              👨‍🍳 Cooked ({history.filter(h => h.action === "cooked").length})
            </button>
            <button
              onClick={() => setFilter("saved")}
              className={`btn btn-sm ${filter === "saved" ? "btn-primary" : "btn-outline"}`}
            >
              💾 Saved ({history.filter(h => h.action === "saved").length})
            </button>
          </div>

          {/* Clear History Button */}
          {history.length > 0 && (
            <div className="text-center mb-6">
              <button
                onClick={clearHistory}
                className="btn btn-error btn-sm"
              >
                Clear All History
              </button>
            </div>
          )}

          {filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📜</div>
              <h3 className="text-xl font-semibold text-base-content mb-2">
                {filter === "all" ? "No cooking history yet" : `No ${filter} history`}
              </h3>
              <p className="text-base-content/70 mb-6">
                Start exploring recipes to build your cooking history!
              </p>
              <Link href="/ai" className="btn btn-primary">
                Generate Recipe
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedHistory).map(([date, items]) => (
                <div key={date} className="card bg-base-200 shadow-lg">
                  <div className="card-body">
                    <h2 className="card-title text-lg mb-4">
                      {date}
                    </h2>
                    
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-3 bg-base-100 rounded-lg">
                          <div className="text-2xl">
                            {getActionIcon(item.action)}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-base-content">
                                {getActionText(item.action)}
                              </span>
                              <span className="text-sm text-base-content/70">
                                {new Date(item.created_at).toLocaleTimeString()}
                              </span>
                            </div>
                            <h3 className="font-medium text-base-content">
                              {item.recipe_title}
                            </h3>
                          </div>
                          
                          <div className="w-16 h-16 relative rounded-lg overflow-hidden">
                            <Image
                              src={item.recipe_image || "/placeholder.svg"}
                              alt={item.recipe_title}
                              fill
                              className="object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/placeholder.svg";
                              }}
                            />
                          </div>
                          
                          <Link 
                            href={`/recipe?id=${item.recipe_id}`}
                            className="btn btn-primary btn-sm"
                          >
                            View
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
