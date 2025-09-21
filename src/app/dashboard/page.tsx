'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { userPreferencesService, savedRecipesService, cookingHistoryService } from '../../lib/supabaseService'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BackButton from '@/components/BackButton'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function DashboardPage() {
  const { user } = useAuth() as any
  const [userProfile, setUserProfile] = useState<any>(null)
  const [stats, setStats] = useState({
    savedRecipes: 0,
    dietPlans: 0,
    recipesCreated: 0
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (user) {
        try {
          // Fetch user profile
          const { data: profileData } = await userPreferencesService.getUserPreferences(user.id)
          console.log('Profile data from database:', profileData)
          setUserProfile(profileData)

          // Fetch saved recipes count
          const { data: savedRecipes } = await savedRecipesService.getSavedRecipes(user.id)
          const savedCount = savedRecipes?.length || 0

          // Fetch cooking history for recent activity and recipes created
          const { data: cookingHistory } = await cookingHistoryService.getCookingHistory(user.id)
          const recipesCreated = cookingHistory?.filter(item => item.action === 'generated').length || 0
          const recentActivityData = cookingHistory?.slice(0, 5) || []

          setStats({
            savedRecipes: savedCount,
            dietPlans: 0, // TODO: Add diet plans count when implemented
            recipesCreated: recipesCreated
          })
          setRecentActivity(recentActivityData)
        } catch (error) {
          console.error('Error fetching dashboard data:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchDashboardData()
  }, [user])

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-base-100 flex items-center justify-center">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-base-100 relative">
        <BackButton fallbackUrl="/" />
        
        <Navbar />
        
        <div className="page-content md:mt-16 mt-28">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-4">
              Welcome to your Dashboard
            </h1>
            <p className="text-lg text-base-content/70">
              Hello, {userProfile?.username || user?.email}! Here's your personalized cooking journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Quick Stats */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-primary">📊 Your Stats</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Recipes Saved:</span>
                    <span className="font-semibold">{stats.savedRecipes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Diet Plans:</span>
                    <span className="font-semibold">{stats.dietPlans}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Recipes Created:</span>
                    <span className="font-semibold">{stats.recipesCreated}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-primary">🕒 Recent Activity</h2>
                <div className="space-y-2">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="truncate">{activity.recipe_title}</span>
                        <span className="text-xs text-base-content/60 capitalize">
                          {activity.action}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-base-content/70">
                      No recent activity yet. Start exploring recipes!
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-primary">⚡ Quick Actions</h2>
                <div className="space-y-2">
                  <a href="/ai" className="btn btn-primary btn-sm w-full">
                    Generate Recipe
                  </a>
                  <a href="/diet-planner" className="btn btn-outline btn-sm w-full">
                    Plan Diet
                  </a>
                  <a href="/ingredient-explorer" className="btn btn-outline btn-sm w-full">
                    Explore Ingredients
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="mt-8 card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-primary">👤 Account Information</h2>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Username:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{userProfile?.username || 'Not set'}</span>
                    {!userProfile?.username && (
                      <button 
                        className="btn btn-xs btn-primary"
                        onClick={async () => {
                          const username = prompt('Enter your username (you can use any characters including spaces, numbers, and symbols):')
                          if (username && username.trim()) {
                            const { data, error } = await userPreferencesService.updateUserPreferences(user.id, { username: username.trim() })
                            if (error) {
                              alert('Error updating username: ' + error.message)
                            } else {
                              alert('Username updated successfully!')
                              window.location.reload()
                            }
                          }
                        }}
                      >
                        Set Username
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span>Email:</span>
                  <span className="font-semibold">{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span>Member Since:</span>
                  <span className="font-semibold">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    </ProtectedRoute>
  )
}
