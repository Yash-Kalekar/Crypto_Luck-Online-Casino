
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dice1, Dice2, Dice3, LogIn, LogOut, Settings } from 'lucide-react';
import SlotMachine from '@/components/games/SlotMachine';
import Roulette from '@/components/games/Roulette';
import Blackjack from '@/components/games/Blackjack';
import UserStats from '@/components/UserStats';
import { useToast } from '@/hooks/use-toast';

interface UserData {
  username: string;
  balance: number;
  totalWins: number;
  totalLosses: number;
  gamesPlayed: number;
  lastLogin: number;
  gameHistory: GameResult[];
}

interface GameResult {
  game: string;
  bet: number;
  result: number;
  timestamp: number;
}

const Index = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [showStats, setShowStats] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedUser = localStorage.getItem('casinoUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = () => {
    if (!username.trim()) {
      toast({
        title: "Error",
        description: "Please enter a username",
        variant: "destructive"
      });
      return;
    }

    const existingUser = localStorage.getItem(`casinoUser_${username}`);
    let userData: UserData;

    if (existingUser) {
      userData = JSON.parse(existingUser);
      userData.lastLogin = Date.now();
    } else {
      userData = {
        username,
        balance: 1000,
        totalWins: 0,
        totalLosses: 0,
        gamesPlayed: 0,
        lastLogin: Date.now(),
        gameHistory: []
      };
    }

    localStorage.setItem(`casinoUser_${username}`, JSON.stringify(userData));
    localStorage.setItem('casinoUser', JSON.stringify(userData));
    setUser(userData);
    setUsername('');
    
    toast({
      title: "Welcome!",
      description: `Welcome ${userData.username}! You have ${userData.balance} coins.`,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('casinoUser');
    setUser(null);
    setCurrentGame(null);
    setShowStats(false);
  };

  const updateUserBalance = (amount: number, gameType: string) => {
    if (!user) return;

    const newBalance = user.balance + amount;
    const gameResult: GameResult = {
      game: gameType,
      bet: Math.abs(amount),
      result: amount,
      timestamp: Date.now()
    };

    const updatedUser: UserData = {
      ...user,
      balance: newBalance,
      totalWins: amount > 0 ? user.totalWins + amount : user.totalWins,
      totalLosses: amount < 0 ? user.totalLosses + Math.abs(amount) : user.totalLosses,
      gamesPlayed: user.gamesPlayed + 1,
      gameHistory: [...user.gameHistory, gameResult]
    };

    localStorage.setItem(`casinoUser_${user.username}`, JSON.stringify(updatedUser));
    localStorage.setItem('casinoUser', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gradient-to-br from-purple-800/20 to-blue-800/20 backdrop-blur-lg border-purple-500/30">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold flex justify-center items-center gap-2 text-center">
              <span>🎰</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                Crypto Luck
              </span>
              <span>🎰</span>
            </CardTitle>
        
            <p className="text-green-700 mt-2">You Feeling Lucky Tonight!!</p>
            <p className="text-red-700 mt-2">Enter your username to start playing</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-purple-900/50 border-purple-500/50 text-white placeholder-purple-300"
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
            <Button 
              onClick={handleLogin} 
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Enter Casino
            </Button>
            <p className="mt-12 text-center">
               © {new Date().getFullYear()} Made with <span className="text-red-500">❤️</span> by <span className="font-semibold text-yellow-400">Yash Kalekar</span>
            </p>
          </CardContent>

        </Card>

      </div>
    );
  }

  if (currentGame) {
    const GameComponent = {
      slots: SlotMachine,
      roulette: Roulette,
      blackjack: Blackjack
    }[currentGame];

    return GameComponent ? (
      <GameComponent 
        user={user} 
        onBalanceChange={updateUserBalance}
        onBackToLobby={() => setCurrentGame(null)}
      />
    ) : null;
  }

  if (showStats) {
    return (
      <UserStats 
        user={user} 
        onBack={() => setShowStats(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold flex items-center gap-2">
            <span>🎰</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              Crypto Luck
            </span>
            <span>🎰</span>
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-white text-lg">
              <span className="text-purple-300">Welcome, </span>
              <span className="font-bold text-yellow-400">{user.username}</span>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 rounded-lg">
              <span className="text-white font-bold">{user.balance} 🪙</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowStats(true)}
              className="border-purple-500/50 text-purple-200 hover:bg-purple-800/30"
            >
              <Settings className="h-4 w-4 mr-2" />
              Stats
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-red-500/50 text-red-400 hover:bg-red-800/30"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Game Selection */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card 
            className="bg-gradient-to-br from-purple-800/30 to-blue-800/30 backdrop-blur-lg border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 cursor-pointer"
            onClick={() => setCurrentGame('slots')}
          >
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-yellow-400 flex items-center justify-center gap-2">
                <Dice1 className="h-8 w-8" />
                Slot Machine
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-6xl mb-4">🎰</div>
              <p className="text-purple-200 mb-4">
                Spin the reels and hit the jackpot! Match symbols to win big.
              </p>
              <div className="text-sm text-purple-300">
                Min bet: 10 coins | Max bet: 100 coins
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-red-800/30 to-pink-800/30 backdrop-blur-lg border-red-500/30 hover:border-red-400/50 transition-all duration-300 hover:scale-105 cursor-pointer"
            onClick={() => setCurrentGame('roulette')}
          >
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-yellow-400 flex items-center justify-center gap-2">
                <Dice2 className="h-8 w-8" />
                Roulette
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-6xl mb-4">🎡</div>
              <p className="text-purple-200 mb-4">
                Place your bets and watch the wheel spin! Red or black, odd or even?
              </p>
              <div className="text-sm text-purple-300">
                Min bet: 5 coins | Max payout: 35x
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-green-800/30 to-emerald-800/30 backdrop-blur-lg border-green-500/30 hover:border-green-400/50 transition-all duration-300 hover:scale-105 cursor-pointer"
            onClick={() => setCurrentGame('blackjack')}
          >
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-yellow-400 flex items-center justify-center gap-2">
                <Dice3 className="h-8 w-8" />
                Blackjack
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-6xl mb-4">🂡</div>
              <p className="text-purple-200 mb-4">
                Beat the dealer! Get as close to 21 as possible without going over.
              </p>
              <div className="text-sm text-purple-300">
                Min bet: 20 coins | Blackjack pays 3:2
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-800/20 to-indigo-800/20 backdrop-blur-lg border-blue-500/30">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{user.gamesPlayed}</div>
              <div className="text-sm text-blue-300">Games Played</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-800/20 to-emerald-800/20 backdrop-blur-lg border-green-500/30">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{user.totalWins}</div>
              <div className="text-sm text-green-300">Total Winnings</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-800/20 to-pink-800/20 backdrop-blur-lg border-red-500/30">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-400">{user.totalLosses}</div>
              <div className="text-sm text-red-300">Total Losses</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-800/20 to-orange-800/20 backdrop-blur-lg border-yellow-500/30">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {user.totalWins > 0 ? ((user.totalWins / (user.totalWins + user.totalLosses)) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-sm text-yellow-300">Win Rate</div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Footer */}
      <footer className="mt-12 text-center text-sm text-purple-300">
        © {new Date().getFullYear()} Made with <span className="text-red-500">❤️</span> by <span className="font-semibold text-yellow-400">Yash Kalekar</span>
      </footer>
    </div>
  );
  
};

export default Index;
