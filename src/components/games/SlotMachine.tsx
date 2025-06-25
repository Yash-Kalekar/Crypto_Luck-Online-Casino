
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SlotMachineProps {
  user: any;
  onBalanceChange: (amount: number, gameType: string) => void;
  onBackToLobby: () => void;
}

const SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '⭐', '💎', '🔔', '💰'];
const PAYOUTS = {
  '💰💰💰': 100,
  '💎💎💎': 75,
  '⭐⭐⭐': 50,
  '🔔🔔🔔': 30,
  '🍇🍇🍇': 20,
  '🍊🍊🍊': 15,
  '🍋🍋🍋': 10,
  '🍒🍒🍒': 5
};

const SlotMachine: React.FC<SlotMachineProps> = ({ user, onBalanceChange, onBackToLobby }) => {
  const [reels, setReels] = useState<string[]>(['🍒', '🍒', '🍒']);
  const [spinning, setSpinning] = useState(false);
  const [bet, setBet] = useState(10);
  const [lastWin, setLastWin] = useState(0);
  const { toast } = useToast();

  const adjustBet = (direction: 'up' | 'down') => {
    setBet(prev => {
      if (direction === 'up' && prev < 100) return prev + 10;
      if (direction === 'down' && prev > 10) return prev - 10;
      return prev;
    });
  };

  const spin = async () => {
    if (bet > user.balance) {
      toast({
        title: "Insufficient Funds",
        description: "You don't have enough coins for this bet!",
        variant: "destructive"
      });
      return;
    }

    setSpinning(true);
    setLastWin(0);

    // Deduct bet
    onBalanceChange(-bet, 'slots');

    // Spinning animation
    const spinDuration = 2000;
    const spinInterval = setInterval(() => {
      setReels([
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
      ]);
    }, 100);

    setTimeout(() => {
      clearInterval(spinInterval);
      
      // Final result
      const finalReels = [
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
      ];
      
      setReels(finalReels);
      setSpinning(false);

      // Check for wins
      const combination = finalReels.join('');
      const payout = PAYOUTS[combination as keyof typeof PAYOUTS];
      
      if (payout) {
        const winAmount = payout * (bet / 10);
        setLastWin(winAmount);
        onBalanceChange(winAmount, 'slots');
        toast({
          title: "Winner!",
          description: `You won ${winAmount} coins!`,
        });
      } else {
        // Check for two matching symbols
        if (finalReels[0] === finalReels[1] || finalReels[1] === finalReels[2] || finalReels[0] === finalReels[2]) {
          const smallWin = bet * 0.5;
          setLastWin(smallWin);
          onBalanceChange(smallWin, 'slots');
          toast({
            title: "Small Win!",
            description: `You won ${smallWin} coins!`,
          });
        }
      }
    }, spinDuration);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            🎰 Slot Machine
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

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card className="bg-gradient-to-br from-purple-800/30 to-blue-800/30 backdrop-blur-lg border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-center text-yellow-400">Slot Machine</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="bg-black/50 p-8 rounded-lg mb-6">
                  <div className="flex justify-center items-center gap-4 mb-4">
                    {reels.map((symbol, index) => (
                      <div
                        key={index}
                        className={`w-24 h-24 bg-white rounded-lg flex items-center justify-center text-4xl ${
                          spinning ? 'animate-pulse' : ''
                        }`}
                      >
                        {symbol}
                      </div>
                    ))}
                  </div>
                  
                  {lastWin > 0 && (
                    <div className="text-yellow-400 text-2xl font-bold animate-pulse">
                      🎉 Winner! +{lastWin} coins 🎉
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center gap-4 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustBet('down')}
                    disabled={spinning || bet <= 10}
                    className="border-yellow-500/50 text-yellow-400"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <div className="text-white text-lg font-bold">
                    Bet: {bet} coins
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustBet('up')}
                    disabled={spinning || bet >= 100}
                    className="border-yellow-500/50 text-yellow-400"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  onClick={spin}
                  disabled={spinning || bet > user.balance}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold text-xl px-8 py-4"
                >
                  {spinning ? 'Spinning...' : 'SPIN!'}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="bg-gradient-to-br from-green-800/30 to-emerald-800/30 backdrop-blur-lg border-green-500/30">
              <CardHeader>
                <CardTitle className="text-yellow-400">Paytable</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {Object.entries(PAYOUTS).map(([combo, payout]) => (
                    <div key={combo} className="flex justify-between text-white">
                      <span>{combo}</span>
                      <span className="text-yellow-400">{payout}x</span>
                    </div>
                  ))}
                  <div className="border-t border-green-500/30 pt-2 mt-2">
                    <div className="flex justify-between text-green-300">
                      <span>2 matching</span>
                      <span className="text-yellow-400">0.5x</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlotMachine;
