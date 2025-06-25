
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface RouletteProps {
  user: any;
  onBalanceChange: (amount: number, gameType: string) => void;
  onBackToLobby: () => void;
}

interface Bet {
  type: string;
  value: number | string;
  amount: number;
  payout: number;
}

const NUMBERS = Array.from({ length: 37 }, (_, i) => i); // 0-36
const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

const Roulette: React.FC<RouletteProps> = ({ user, onBalanceChange, onBackToLobby }) => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [selectedBetAmount, setSelectedBetAmount] = useState(5);
  const { toast } = useToast();

  const addBet = (type: string, value: number | string, payout: number) => {
    if (selectedBetAmount > user.balance) {
      toast({
        title: "Insufficient Funds",
        description: "You don't have enough coins for this bet!",
        variant: "destructive"
      });
      return;
    }

    setBets(prev => [...prev, {
      type,
      value,
      amount: selectedBetAmount,
      payout
    }]);
  };

  const clearBets = () => {
    setBets([]);
  };

  const spin = async () => {
    if (bets.length === 0) {
      toast({
        title: "No Bets Placed",
        description: "Please place at least one bet before spinning!",
        variant: "destructive"
      });
      return;
    }

    const totalBet = bets.reduce((sum, bet) => sum + bet.amount, 0);
    if (totalBet > user.balance) {
      toast({
        title: "Insufficient Funds",
        description: "You don't have enough coins for these bets!",
        variant: "destructive"
      });
      return;
    }

    setSpinning(true);
    
    // Deduct total bet amount
    onBalanceChange(-totalBet, 'roulette');

    // Simulate spinning
    setTimeout(() => {
      const result = Math.floor(Math.random() * 37);
      setWinningNumber(result);
      setSpinning(false);

      // Calculate winnings
      let totalWin = 0;
      bets.forEach(bet => {
        let wins = false;
        
        switch (bet.type) {
          case 'number':
            wins = bet.value === result;
            break;
          case 'red':
            wins = RED_NUMBERS.includes(result);
            break;
          case 'black':
            wins = result !== 0 && !RED_NUMBERS.includes(result);
            break;
          case 'odd':
            wins = result !== 0 && result % 2 === 1;
            break;
          case 'even':
            wins = result !== 0 && result % 2 === 0;
            break;
          case 'low':
            wins = result >= 1 && result <= 18;
            break;
          case 'high':
            wins = result >= 19 && result <= 36;
            break;
        }

        if (wins) {
          totalWin += bet.amount * bet.payout;
        }
      });

      if (totalWin > 0) {
        onBalanceChange(totalWin, 'roulette');
        toast({
          title: "Winner!",
          description: `Number ${result}! You won ${totalWin} coins!`,
        });
      } else {
        toast({
          title: "Better luck next time!",
          description: `Number ${result}. Try again!`,
          variant: "destructive"
        });
      }

      setBets([]);
    }, 3000);
  };

  const getNumberColor = (num: number) => {
    if (num === 0) return 'bg-green-600';
    return RED_NUMBERS.includes(num) ? 'bg-red-600' : 'bg-black';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            🎡 Roulette
          </h1>
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 rounded-lg">
              <span className="text-white font-bold">{user.balance} 🪙</span>
            </div>
            <Button onClick={onBackToLobby} variant="outline" className="border-purple-500/50 text-purple-200">
              Back to Lobby
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-br from-red-800/30 to-pink-800/30 backdrop-blur-lg border-red-500/30 mb-6">
              <CardHeader>
                <CardTitle className="text-center text-yellow-400">
                  {spinning ? "🎡 Spinning..." : winningNumber !== null ? `Winning Number: ${winningNumber}` : "Place Your Bets"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  {winningNumber !== null && (
                    <div className={`inline-block w-16 h-16 rounded-full ${getNumberColor(winningNumber)} text-white text-2xl font-bold flex items-center justify-center animate-pulse`}>
                      {winningNumber}
                    </div>
                  )}
                </div>

                {/* Number Grid */}
                <div className="grid grid-cols-12 gap-1 mb-6">
                  <div className={`col-span-12 h-12 ${getNumberColor(0)} text-white flex items-center justify-center font-bold cursor-pointer hover:opacity-80`}
                       onClick={() => addBet('number', 0, 35)}>
                    0
                  </div>
                  {NUMBERS.slice(1).map(num => (
                    <div
                      key={num}
                      className={`h-12 ${getNumberColor(num)} text-white flex items-center justify-center font-bold cursor-pointer hover:opacity-80`}
                      onClick={() => addBet('number', num, 35)}
                    >
                      {num}
                    </div>
                  ))}
                </div>

                {/* Outside Bets */}
                <div className="grid grid-cols-6 gap-2">
                  <Button onClick={() => addBet('red', 'red', 2)} className="bg-red-600 hover:bg-red-700">Red</Button>
                  <Button onClick={() => addBet('black', 'black', 2)} className="bg-black hover:bg-gray-800">Black</Button>
                  <Button onClick={() => addBet('odd', 'odd', 2)} className="bg-blue-600 hover:bg-blue-700">Odd</Button>
                  <Button onClick={() => addBet('even', 'even', 2)} className="bg-blue-600 hover:bg-blue-700">Even</Button>
                  <Button onClick={() => addBet('low', '1-18', 2)} className="bg-green-600 hover:bg-green-700">1-18</Button>
                  <Button onClick={() => addBet('high', '19-36', 2)} className="bg-green-600 hover:bg-green-700">19-36</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="bg-gradient-to-br from-green-800/30 to-emerald-800/30 backdrop-blur-lg border-green-500/30 mb-4">
              <CardHeader>
                <CardTitle className="text-yellow-400">Bet Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {[5, 10, 25, 50, 100].map(amount => (
                    <Button
                      key={amount}
                      onClick={() => setSelectedBetAmount(amount)}
                      variant={selectedBetAmount === amount ? "default" : "outline"}
                      className={selectedBetAmount === amount ? "bg-yellow-500 text-black" : "border-yellow-500/50 text-yellow-400"}
                    >
                      {amount}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-800/30 to-indigo-800/30 backdrop-blur-lg border-blue-500/30 mb-4">
              <CardHeader>
                <CardTitle className="text-yellow-400">Your Bets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {bets.map((bet, index) => (
                    <div key={index} className="flex justify-between text-sm text-white">
                      <span>{bet.type}: {bet.value}</span>
                      <span className="text-yellow-400">{bet.amount} coins</span>
                    </div>
                  ))}
                  {bets.length === 0 && (
                    <div className="text-gray-400 text-sm">No bets placed</div>
                  )}
                </div>
                <div className="border-t border-blue-500/30 pt-2 mt-2">
                  <div className="flex justify-between text-white font-bold">
                    <span>Total:</span>
                    <span className="text-yellow-400">{bets.reduce((sum, bet) => sum + bet.amount, 0)} coins</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Button
                onClick={spin}
                disabled={spinning || bets.length === 0}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold"
              >
                {spinning ? 'Spinning...' : 'Spin Wheel!'}
              </Button>
              <Button
                onClick={clearBets}
                disabled={spinning}
                variant="outline"
                className="w-full border-red-500/50 text-red-400 hover:bg-red-800/30"
              >
                Clear Bets
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Roulette;
