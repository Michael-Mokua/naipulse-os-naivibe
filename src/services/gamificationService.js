// Gamification Service for Naipulse OS
// Handles points, badges, levels, and Sheng elements

class GamificationService {
  constructor() {
    this.userStats = {
      totalPoints: 0,
      safetyStreakDays: 0,
      communityReports: 0,
      helpfulActions: 0,
      level: 1,
      badges: [],
      lastActivityDate: null
    };
    this.badges = [
      { id: 'first_report', name: 'First Report', description: 'Reported your first incident', icon: '🚨', points: 50 },
      { id: 'safety_hero', name: 'Safety Hero', description: '10 safety reports verified', icon: '🦸', points: 200 },
      { id: 'community_guardian', name: 'Community Guardian', description: 'Joined 5 watch groups', icon: '🛡️', points: 150 },
      { id: 'route_master', name: 'Route Master', description: 'Used safe routes 50 times', icon: '🗺️', points: 100 },
      { id: 'event_enthusiast', name: 'Event Enthusiast', description: 'Attended 10 events', icon: '🎉', points: 120 },
      { id: 'carpool_champion', name: 'Carpool Champion', description: 'Completed 20 carpool rides', icon: '🚗', points: 180 },
      { id: 'marketplace_pro', name: 'Marketplace Pro', description: 'Sold 10 items', icon: '🛍️', points: 160 },
      { id: 'chat_master', name: 'Chat Master', description: 'Sent 100 messages', icon: '💬', points: 80 },
      { id: 'lost_found_hero', name: 'Lost & Found Hero', description: 'Helped return 5 lost items', icon: '🔍', points: 250 },
      { id: 'news_reader', name: 'News Reader', description: 'Read 50 news articles', icon: '📰', points: 60 },
      { id: 'streak_master', name: 'Streak Master', description: '30-day activity streak', icon: '🔥', points: 300 },
      { id: 'early_adopter', name: 'Early Adopter', description: 'Joined in first month', icon: '⭐', points: 100 },
      { id: 'verified_user', name: 'Verified User', description: 'Account verified', icon: '✓', points: 200 },
      { id: 'helper', name: 'Helper', description: 'Helped 10 community members', icon: '🤝', points: 150 },
      { id: 'influencer', name: 'Influencer', description: '100 profile views', icon: '📱', points: 120 }
    ];
    this.shengPhrases = [
      'Poa!', 'Sema!', 'Fiti!', 'Vibe!', 'Staki!', 'Hapo!', 'Poa kibao!', 'Maze!',
      'Weka!', 'Fanya!', 'Chapa!', 'Ruka!', 'Sema!', 'Poa!', 'Mambo!', 'Poa!'
    ];
    this.achievements = [];
    this.isInitialized = false;
  }

  // Initialize the gamification service
  async initialize() {
    if (this.isInitialized) return;

    // Load user stats from localStorage or Supabase
    this.loadUserStats();

    // Check and update daily streak
    this.updateDailyStreak();

    this.isInitialized = true;
  }

  // Load user stats from localStorage
  loadUserStats() {
    try {
      const saved = localStorage.getItem('naipulse_user_stats');
      if (saved) {
        this.userStats = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }
  }

  // Save user stats to localStorage
  saveUserStats() {
    try {
      localStorage.setItem('naipulse_user_stats', JSON.stringify(this.userStats));
    } catch (error) {
      console.error('Failed to save user stats:', error);
    }
  }

  // Add points to user's total
  addPoints(points, reason = '') {
    this.userStats.totalPoints += points;
    this.checkLevelUp();
    this.saveUserStats();
    
    // Trigger achievement check
    this.checkAchievements();

    // Show notification for points earned
    this.showPointsNotification(points, reason);

    return this.userStats.totalPoints;
  }

  // Check if user should level up
  checkLevelUp() {
    const pointsNeeded = this.getPointsForLevel(this.userStats.level + 1);
    if (this.userStats.totalPoints >= pointsNeeded) {
      this.userStats.level++;
      this.showLevelUpNotification();
    }
  }

  // Get points needed for a specific level
  getPointsForLevel(level) {
    return level * 100; // Simple formula: level * 100 points
  }

  // Award a badge to the user
  awardBadge(badgeId) {
    const badge = this.badges.find(b => b.id === badgeId);
    if (badge && !this.userStats.badges.includes(badgeId)) {
      this.userStats.badges.push(badgeId);
      this.addPoints(badge.points, `Earned badge: ${badge.name}`);
      this.showBadgeNotification(badge);
      this.saveUserStats();
      return true;
    }
    return false;
  }

  // Check if user qualifies for any achievements
  checkAchievements() {
    // Safety reports
    if (this.userStats.communityReports >= 1 && !this.userStats.badges.includes('first_report')) {
      this.awardBadge('first_report');
    }
    if (this.userStats.communityReports >= 10 && !this.userStats.badges.includes('safety_hero')) {
      this.awardBadge('safety_hero');
    }

    // Streak
    if (this.userStats.safetyStreakDays >= 30 && !this.userStats.badges.includes('streak_master')) {
      this.awardBadge('streak_master');
    }

    // Helpful actions
    if (this.userStats.helpfulActions >= 10 && !this.userStats.badges.includes('helper')) {
      this.awardBadge('helper');
    }
  }

  // Update daily streak
  updateDailyStreak() {
    const today = new Date().toDateString();
    const lastActivity = this.userStats.lastActivityDate;

    if (lastActivity) {
      const lastDate = new Date(lastActivity);
      const diffDays = Math.floor((new Date() - lastDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day
        this.userStats.safetyStreakDays++;
      } else if (diffDays > 1) {
        // Streak broken
        this.userStats.safetyStreakDays = 1;
      }
      // If diffDays === 0, same day, no change needed
    } else {
      // First activity
      this.userStats.safetyStreakDays = 1;
    }

    this.userStats.lastActivityDate = today;
    this.saveUserStats();
  }

  // Record a safety report
  recordSafetyReport() {
    this.userStats.communityReports++;
    this.addPoints(10, 'Safety report submitted');
    this.saveUserStats();
  }

  // Record a helpful action
  recordHelpfulAction() {
    this.userStats.helpfulActions++;
    this.addPoints(5, 'Helpful action performed');
    this.saveUserStats();
  }

  // Record a carpool ride
  recordCarpoolRide() {
    this.addPoints(15, 'Carpool ride completed');
    this.saveUserStats();
  }

  // Record an event attendance
  recordEventAttendance() {
    this.addPoints(10, 'Event attended');
    this.saveUserStats();
  }

  // Record a marketplace transaction
  recordMarketplaceTransaction() {
    this.addPoints(20, 'Marketplace transaction');
    this.saveUserStats();
  }

  // Record a lost & found help
  recordLostFoundHelp() {
    this.addPoints(25, 'Lost & found help provided');
    this.saveUserStats();
  }

  // Get a random Sheng phrase
  getRandomShengPhrase() {
    return this.shengPhrases[Math.floor(Math.random() * this.shengPhrases.length)];
  }

  // Get Sheng greeting based on time of day
  getShengGreeting() {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      return ['Morning poa!', 'Sema boss!', 'Poa asubuhi!'][Math.floor(Math.random() * 3)];
    } else if (hour >= 12 && hour < 17) {
      return ['Afternoon fiti!', 'Maze!', 'Poa mchana!'][Math.floor(Math.random() * 3)];
    } else if (hour >= 17 && hour < 21) {
      return ['Evening vibe!', 'Poa jioni!', 'Staki jioni!'][Math.floor(Math.random() * 3)];
    } else {
      return ['Night poa!', 'Usiku fiti!', 'Poa usiku!'][Math.floor(Math.random() * 3)];
    }
  }

  // Get Sheng response for different actions
  getShengResponse(action) {
    const responses = {
      success: ['Poa!', 'Fiti!', 'Inarudi!', 'Imekam!', 'Poa sana!'],
      error: ['Aii!', 'Hapana!', 'Siwezi!', 'Shida!', 'Maze!'],
      greeting: ['Sasa!', 'Poa!', 'Niaje!', 'Vipi!', 'Mambo!'],
      thanks: ['Asante!', 'Nashukuru!', 'Ahsante sana!', 'Thank you poa!'],
      goodbye: ['Bye!', 'Tutaonana!', 'Nikuone!', 'Salama!'],
      agreement: ['Ndio!', 'Sawa!', 'Poa!', 'Fiti!', 'Sawa poa!'],
      excitement: ['Woo!', 'Yess!', 'Poa!', 'Fiti!', 'Vibe!']
    };

    const actionResponses = responses[action] || responses.success;
    return actionResponses[Math.floor(Math.random() * actionResponses.length)];
  }

  // Get user's current level progress
  getLevelProgress() {
    const currentLevelPoints = this.getPointsForLevel(this.userStats.level);
    const nextLevelPoints = this.getPointsForLevel(this.userStats.level + 1);
    const progress = this.userStats.totalPoints - currentLevelPoints;
    const needed = nextLevelPoints - currentLevelPoints;
    
    return {
      level: this.userStats.level,
      currentPoints: this.userStats.totalPoints,
      progress,
      needed,
      percentage: Math.min(100, (progress / needed) * 100)
    };
  }

  // Get user's badges
  getUserBadges() {
    return this.badges.filter(badge => this.userStats.badges.includes(badge.id));
  }

  // Get user's leaderboard position (mock implementation)
  getLeaderboardPosition() {
    // In production, this would query Supabase for actual leaderboard
    return Math.floor(Math.random() * 100) + 1;
  }

  // Show points notification
  showPointsNotification(points, reason) {
    const sheng = this.getRandomShengPhrase();
    const notification = {
      type: 'gamification',
      title: `+${points} Points! ${sheng}`,
      message: reason || 'Keep up the great work!',
      data: { points, reason }
    };

    window.dispatchEvent(new CustomEvent('naipulse-notification', {
      detail: notification
    }));
  }

  // Show level up notification
  showLevelUpNotification() {
    const sheng = this.getShengResponse('excitement');
    const notification = {
      type: 'gamification',
      title: `Level Up! ${sheng}`,
      message: `You reached level ${this.userStats.level}!`,
      data: { level: this.userStats.level }
    };

    window.dispatchEvent(new CustomEvent('naipulse-notification', {
      detail: notification
    }));
  }

  // Show badge notification
  showBadgeNotification(badge) {
    const sheng = this.getRandomShengPhrase();
    const notification = {
      type: 'gamification',
      title: `Badge Earned! ${sheng}`,
      message: `You earned the ${badge.name} badge!`,
      data: { badge }
    };

    window.dispatchEvent(new CustomEvent('naipulse-notification', {
      detail: notification
    }));
  }

  // Get user statistics
  getUserStats() {
    return {
      ...this.userStats,
      levelProgress: this.getLevelProgress(),
      badges: this.getUserBadges(),
      leaderboardPosition: this.getLeaderboardPosition()
    };
  }

  // Reset user stats (for testing)
  resetStats() {
    this.userStats = {
      totalPoints: 0,
      safetyStreakDays: 0,
      communityReports: 0,
      helpfulActions: 0,
      level: 1,
      badges: [],
      lastActivityDate: null
    };
    this.saveUserStats();
  }

  // Export user stats (for backup/sync)
  exportStats() {
    return JSON.stringify(this.userStats);
  }

  // Import user stats (for backup/sync)
  importStats(statsJson) {
    try {
      const stats = JSON.parse(statsJson);
      this.userStats = { ...this.userStats, ...stats };
      this.saveUserStats();
      return true;
    } catch (error) {
      console.error('Failed to import stats:', error);
      return false;
    }
  }
}

export default new GamificationService();
