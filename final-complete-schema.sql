-- =====================================================
-- CHEFBOT PRO - FINAL COMPLETE DATABASE SCHEMA
-- =====================================================
-- Run this ONCE in your Supabase SQL Editor
-- This includes EVERYTHING - tables, columns, policies, indexes, triggers

-- =====================================================
-- 1. USER PREFERENCES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  username TEXT, -- No UNIQUE constraint - allow duplicates
  dietary_restrictions TEXT[] DEFAULT '{}',
  favorite_cuisines TEXT[] DEFAULT '{}',
  skill_level TEXT DEFAULT 'beginner',
  cooking_goals TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add username column if it doesn't exist (for existing tables)
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS username TEXT;

-- =====================================================
-- 2. SAVED RECIPES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS saved_recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  recipe_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  image TEXT DEFAULT '',
  ingredients JSONB DEFAULT '[]',
  instructions JSONB DEFAULT '[]',
  prep_time TEXT DEFAULT '',
  servings TEXT DEFAULT '',
  difficulty TEXT DEFAULT '',
  cuisine TEXT DEFAULT '',
  calories INTEGER,
  recipe_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. COOKING HISTORY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS cooking_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  recipe_id TEXT NOT NULL,
  recipe_title TEXT NOT NULL,
  recipe_image TEXT DEFAULT '',
  recipe_data JSONB DEFAULT '{}',
  action TEXT NOT NULL, -- 'viewed', 'generated', 'cooked', 'saved'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. COMMUNITY RECIPES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS community_recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL,
  author_username TEXT, -- Username from user_preferences
  title TEXT NOT NULL,
  description TEXT,
  image TEXT,
  ingredients JSONB DEFAULT '[]',
  instructions JSONB DEFAULT '[]',
  prep_time TEXT,
  servings TEXT,
  difficulty TEXT,
  cuisine TEXT,
  calories INTEGER,
  tags JSONB DEFAULT '[]',
  recipe_data JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT true,
  likes_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add author_username column if it doesn't exist (for existing tables)
ALTER TABLE community_recipes ADD COLUMN IF NOT EXISTS author_username TEXT;

-- =====================================================
-- 5. COMMUNITY RECIPE LIKES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS community_recipe_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  recipe_id UUID NOT NULL REFERENCES community_recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, recipe_id) -- Prevent duplicate likes
);

-- =====================================================
-- 6. USER COLLECTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. COLLECTION RECIPES TABLE (Many-to-Many)
-- =====================================================
CREATE TABLE IF NOT EXISTS collection_recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID NOT NULL REFERENCES user_collections(id) ON DELETE CASCADE,
  recipe_id TEXT NOT NULL, -- Can reference community_recipes or external recipes
  recipe_type TEXT NOT NULL, -- 'community', 'saved', 'external'
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. MY DIET PLAN TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS my_diet_plan (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  diet_plan_data JSONB NOT NULL, -- Complete diet plan data from API
  plan_date DATE NOT NULL, -- Date for which the diet plan is created
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooking_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_recipe_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE my_diet_plan ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- User Preferences Policies
DROP POLICY IF EXISTS "Users can view their own preferences" ON user_preferences;
CREATE POLICY "Users can view their own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own preferences" ON user_preferences;
CREATE POLICY "Users can insert their own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own preferences" ON user_preferences;
CREATE POLICY "Users can update their own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own preferences" ON user_preferences;
CREATE POLICY "Users can delete their own preferences" ON user_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- Saved Recipes Policies
DROP POLICY IF EXISTS "Users can view their own saved recipes" ON saved_recipes;
CREATE POLICY "Users can view their own saved recipes" ON saved_recipes
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own saved recipes" ON saved_recipes;
CREATE POLICY "Users can insert their own saved recipes" ON saved_recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own saved recipes" ON saved_recipes;
CREATE POLICY "Users can update their own saved recipes" ON saved_recipes
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own saved recipes" ON saved_recipes;
CREATE POLICY "Users can delete their own saved recipes" ON saved_recipes
  FOR DELETE USING (auth.uid() = user_id);

-- Cooking History Policies
DROP POLICY IF EXISTS "Users can view their own cooking history" ON cooking_history;
CREATE POLICY "Users can view their own cooking history" ON cooking_history
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own cooking history" ON cooking_history;
CREATE POLICY "Users can insert their own cooking history" ON cooking_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own cooking history" ON cooking_history;
CREATE POLICY "Users can update their own cooking history" ON cooking_history
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own cooking history" ON cooking_history;
CREATE POLICY "Users can delete their own cooking history" ON cooking_history
  FOR DELETE USING (auth.uid() = user_id);

-- Community Recipes Policies
DROP POLICY IF EXISTS "Anyone can view public community recipes" ON community_recipes;
CREATE POLICY "Anyone can view public community recipes" ON community_recipes
  FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Users can view their own community recipes" ON community_recipes;
CREATE POLICY "Users can view their own community recipes" ON community_recipes
  FOR SELECT USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can insert their own community recipes" ON community_recipes;
CREATE POLICY "Users can insert their own community recipes" ON community_recipes
  FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can update their own community recipes" ON community_recipes;
CREATE POLICY "Users can update their own community recipes" ON community_recipes
  FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can delete their own community recipes" ON community_recipes;
CREATE POLICY "Users can delete their own community recipes" ON community_recipes
  FOR DELETE USING (auth.uid() = author_id);

-- Community Recipe Likes Policies
DROP POLICY IF EXISTS "Users can view all recipe likes" ON community_recipe_likes;
CREATE POLICY "Users can view all recipe likes" ON community_recipe_likes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own likes" ON community_recipe_likes;
CREATE POLICY "Users can insert their own likes" ON community_recipe_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own likes" ON community_recipe_likes;
CREATE POLICY "Users can delete their own likes" ON community_recipe_likes
  FOR DELETE USING (auth.uid() = user_id);

-- User Collections Policies
DROP POLICY IF EXISTS "Users can view their own collections" ON user_collections;
CREATE POLICY "Users can view their own collections" ON user_collections
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view public collections" ON user_collections;
CREATE POLICY "Users can view public collections" ON user_collections
  FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Users can insert their own collections" ON user_collections;
CREATE POLICY "Users can insert their own collections" ON user_collections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own collections" ON user_collections;
CREATE POLICY "Users can update their own collections" ON user_collections
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own collections" ON user_collections;
CREATE POLICY "Users can delete their own collections" ON user_collections
  FOR DELETE USING (auth.uid() = user_id);

-- Collection Recipes Policies
DROP POLICY IF EXISTS "Users can view collection recipes" ON collection_recipes;
CREATE POLICY "Users can view collection recipes" ON collection_recipes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_collections 
      WHERE id = collection_id 
      AND (user_id = auth.uid() OR is_public = true)
    )
  );

DROP POLICY IF EXISTS "Users can insert to their own collections" ON collection_recipes;
CREATE POLICY "Users can insert to their own collections" ON collection_recipes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_collections 
      WHERE id = collection_id 
      AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete from their own collections" ON collection_recipes;
CREATE POLICY "Users can delete from their own collections" ON collection_recipes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_collections 
      WHERE id = collection_id 
      AND user_id = auth.uid()
    )
  );

-- My Diet Plan Policies
DROP POLICY IF EXISTS "Users can view their own diet plans" ON my_diet_plan;
CREATE POLICY "Users can view their own diet plans" ON my_diet_plan
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own diet plans" ON my_diet_plan;
CREATE POLICY "Users can insert their own diet plans" ON my_diet_plan
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own diet plans" ON my_diet_plan;
CREATE POLICY "Users can update their own diet plans" ON my_diet_plan
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own diet plans" ON my_diet_plan;
CREATE POLICY "Users can delete their own diet plans" ON my_diet_plan
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- User Preferences Indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_username ON user_preferences(username);

-- Saved Recipes Indexes
CREATE INDEX IF NOT EXISTS idx_saved_recipes_user_id ON saved_recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_recipes_recipe_id ON saved_recipes(recipe_id);
CREATE INDEX IF NOT EXISTS idx_saved_recipes_created_at ON saved_recipes(created_at);

-- Cooking History Indexes
CREATE INDEX IF NOT EXISTS idx_cooking_history_user_id ON cooking_history(user_id);
CREATE INDEX IF NOT EXISTS idx_cooking_history_recipe_id ON cooking_history(recipe_id);
CREATE INDEX IF NOT EXISTS idx_cooking_history_created_at ON cooking_history(created_at);
CREATE INDEX IF NOT EXISTS idx_cooking_history_action ON cooking_history(action);

-- Community Recipes Indexes
CREATE INDEX IF NOT EXISTS idx_community_recipes_author_id ON community_recipes(author_id);
CREATE INDEX IF NOT EXISTS idx_community_recipes_created_at ON community_recipes(created_at);
CREATE INDEX IF NOT EXISTS idx_community_recipes_is_public ON community_recipes(is_public);
CREATE INDEX IF NOT EXISTS idx_community_recipes_likes_count ON community_recipes(likes_count);
CREATE INDEX IF NOT EXISTS idx_community_recipes_cuisine ON community_recipes(cuisine);

-- Community Recipe Likes Indexes
CREATE INDEX IF NOT EXISTS idx_community_recipe_likes_user_id ON community_recipe_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_community_recipe_likes_recipe_id ON community_recipe_likes(recipe_id);

-- User Collections Indexes
CREATE INDEX IF NOT EXISTS idx_user_collections_user_id ON user_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_collections_is_public ON user_collections(is_public);

-- Collection Recipes Indexes
CREATE INDEX IF NOT EXISTS idx_collection_recipes_collection_id ON collection_recipes(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_recipes_recipe_type ON collection_recipes(recipe_type);

-- My Diet Plan Indexes
CREATE INDEX IF NOT EXISTS idx_my_diet_plan_user_id ON my_diet_plan(user_id);
CREATE INDEX IF NOT EXISTS idx_my_diet_plan_plan_date ON my_diet_plan(plan_date);
CREATE INDEX IF NOT EXISTS idx_my_diet_plan_created_at ON my_diet_plan(created_at);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Triggers for updated_at (drop existing triggers first)
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
DROP TRIGGER IF EXISTS update_saved_recipes_updated_at ON saved_recipes;
DROP TRIGGER IF EXISTS update_community_recipes_updated_at ON community_recipes;
DROP TRIGGER IF EXISTS update_user_collections_updated_at ON user_collections;

-- Function to update updated_at column
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_preferences_updated_at 
  BEFORE UPDATE ON user_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_recipes_updated_at 
  BEFORE UPDATE ON saved_recipes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_recipes_updated_at 
  BEFORE UPDATE ON community_recipes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_collections_updated_at 
  BEFORE UPDATE ON user_collections 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_my_diet_plan_updated_at ON my_diet_plan;
CREATE TRIGGER update_my_diet_plan_updated_at 
  BEFORE UPDATE ON my_diet_plan 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMPLETE! 
-- =====================================================
