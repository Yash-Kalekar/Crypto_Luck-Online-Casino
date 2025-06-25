
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface UserStatsProps {
  user: any;
  onBack: () => void;
}

interface LeaderboardEntry {
  username: string;
  balance: number;
  totalWins: number;
  gamesPlayed: number;
  winRate: number;
}

const UserStats: React.FC<UserStatsProps> = ({ user, onBack }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [sortBy, setSortBy] = useState<'balance' | 'winRate' | 'totalWins'>('balance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    // Get all users from localStorage
    const allUsers: LeaderboardEntry[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('casinoUser_')) {
        try {
          const userData = JSON.parse(localStorage.getItem(key) || '');
          const winRate = userData.totalWins > 0 ? 
            ((userData.totalWins / (userData.totalWins + userData.totalLosses)) * 100) : 0;
          
          allUsers.push({
            username: userData.username,
            balance: userData.balance,
            totalWins: userData.totalWins,
            gamesPlayed: userData.gamesPlayed,
            winRate: parseFloat(winRate.toFixed(1))
          });
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    }

    // Sort users
    allUsers.sort((a, b) => {
      const order = sortOrder === 'desc' ? -1 : 1;
      return (a[sortBy] - b[sortBy]) * order;
    });

    setLeaderboard(allUsers);
  }, [sortBy, sortOrder]);

  const handleSort = (field: 'balance' | 'winRate' | 'totalWins') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const recentGames = user.gameHistory.slice(-10).reverse();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            📊 Statistics & Leaderboard
          </h1>
          <Button onClick={onBack} variant="outline" className="border-purple-500/50 text-purple-200">
            Back to Casino
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Personal Stats */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-blue-800/30 to-indigo-800/30 backdrop-blur-lg border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-yellow-400">Your Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{user.balance}</div>
                    <div className="text-sm text-green-300">Current Balance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{user.gamesPlayed}</div>
                    <div className="text-sm text-blue-300">Games Played</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{user.totalWins}</div>
                    <div className="text-sm text-purple-300">Total Winnings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">
                      {user.totalWins > 0 ? ((user.totalWins / (user.totalWins + user.totalLosses)) * 100).toFixed(1) : 0}%
                    </div>
                    <div className="text-sm text-yellow-300">Win Rate</div>
                  </div>
                </div>
                <div className="border-t border-blue-500/30 pt-4">
                  <div className="text-sm text-gray-300">
                    Member since: {formatDate(user.lastLogin)}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-800/30 to-pink-800/30 backdrop-blur-lg border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-yellow-400">Recent Games</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {recentGames.length > 0 ? recentGames.map((game, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-white capitalize">{game.game}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-400">{formatDate(game.timestamp)}</span>
                      </div>
                      <div className={`font-bold ${game.result > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {game.result > 0 ? '+' : ''}{game.result}
                      </div>
                    </div>
                  )) : (
                    <div className="text-gray-400 text-sm text-center">No games played yet</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Leaderboard */}
          <div>
            <Card className="bg-gradient-to-br from-yellow-800/30 to-orange-800/30 backdrop-blur-lg border-yellow-500/30">
              <CardHeader>
                <CardTitle className="text-yellow-400">Leaderboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Button
                    onClick={() => handleSort('balance')}
                    variant={sortBy === 'balance' ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs"
                  >
                    Balance
                    {sortBy === 'balance' && (
                      sortOrder === 'desc' ? <ArrowDown className="h-3 w-3 ml-1" /> : <ArrowUp className="h-3 w-3 ml-1" />
                    )}
                  </Button>
                  <Button
                    onClick={() => handleSort('totalWins')}
                    variant={sortBy === 'totalWins' ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs"
                  >
                    Winnings
                    {sortBy === 'totalWins' && (
                      sortOrder === 'desc' ? <ArrowDown className="h-3 w-3 ml-1" /> : <ArrowUp className="h-3 w-3 ml-1" />
                    )}
                  </Button>
                  <Button
                    onClick={() => handleSort('winRate')}
                    variant={sortBy === 'winRate' ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs"
                  >
                    Win Rate
                    {sortBy === 'winRate' && (
                      sortOrder === 'desc' ? <ArrowDown className="h-3 w-3 ml-1" /> : <ArrowUp className="h-3 w-3 ml-1" />
                    )}
                  </Button>
                </div>
                
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {leaderboard.map((entry, index) => (
                    <div
                      key={entry.username}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        entry.username === user.username 
                          ? 'bg-yellow-500/20 border border-yellow-500/50' 
                          : 'bg-black/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-yellow-500 text-black' :
                          index === 1 ? 'bg-gray-400 text-black' :
                          index === 2 ? 'bg-orange-600 text-white' :
                          'bg-gray-600 text-white'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-white font-medium">{entry.username}</div>
                          <div className="text-xs text-gray-400">{entry.gamesPlayed} games</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-yellow-400 font-bold">{entry.balance} 🪙</div>
                        <div className="text-xs text-gray-400">{entry.winRate}% win rate</div>
                      </div>
                    </div>
                  ))}
                  {leaderboard.length === 0 && (
                    <div className="text-gray-400 text-sm text-center">No players yet</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStats;
