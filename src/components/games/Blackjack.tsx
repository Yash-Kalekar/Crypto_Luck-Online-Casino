
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface BlackjackProps {
  user: any;
  onBalanceChange: (amount: number, gameType: string) => void;
  onBackToLobby: () => void;
}

interface PlayingCard {
  suit: string;
  value: string;
  numValue: number;
}

const SUITS = ['♠', '♥', '♦', '♣'];
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const Blackjack: React.FC<BlackjackProps> = ({ user, onBalanceChange, onBackToLobby }) => {
  const [deck, setDeck] = useState<PlayingCard[]>([]);
  const [playerHand, setPlayerHand] = useState<PlayingCard[]>([]);
  const [dealerHand, setDealerHand] = useState<PlayingCard[]>([]);
  const [gamePhase, setGamePhase] = useState<'betting' | 'playing' | 'finished'>('betting');
  const [bet, setBet] = useState(20);
  const [gameResult, setGameResult] = useState<string>('');
  const [showDealerCard, setShowDealerCard] = useState(false);
  const { toast } = useToast();

  const createDeck = (): PlayingCard[] => {
    const newDeck: PlayingCard[] = [];
    SUITS.forEach(suit => {
      VALUES.forEach(value => {
        let numValue = parseInt(value);
        if (value === 'A') numValue = 11;
        else if (['J', 'Q', 'K'].includes(value)) numValue = 10;
        
        newDeck.push({ suit, value, numValue });
      });
    });
    return shuffleDeck(newDeck);
  };

  const shuffleDeck = (deck: PlayingCard[]): PlayingCard[] => {
    const newDeck = [...deck];
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    return newDeck;
  };

  const calculateHandValue = (hand: PlayingCard[]): number => {
    let value = 0;
    let aces = 0;

    hand.forEach(card => {
      if (card.value === 'A') {
        aces++;
        value += 11;
      } else {
        value += card.numValue;
      }
    });

    while (value > 21 && aces > 0) {
      value -= 10;
      aces--;
    }

    return value;
  };

  const dealCard = (currentDeck: PlayingCard[]): [PlayingCard, PlayingCard[]] => {
    const newDeck = [...currentDeck];
    const card = newDeck.pop()!;
    return [card, newDeck];
  };

  const startGame = () => {
    if (bet > user.balance) {
      toast({
        title: "Insufficient Funds",
        description: "You don't have enough coins for this bet!",
        variant: "destructive"
      });
      return;
    }

    onBalanceChange(-bet, 'blackjack');

    const newDeck = createDeck();
    let currentDeck = newDeck;
    
    // Deal initial cards
    const [playerCard1, deck1] = dealCard(currentDeck);
    const [dealerCard1, deck2] = dealCard(deck1);
    const [playerCard2, deck3] = dealCard(deck2);
    const [dealerCard2, finalDeck] = dealCard(deck3);

    setDeck(finalDeck);
    setPlayerHand([playerCard1, playerCard2]);
    setDealerHand([dealerCard1, dealerCard2]);
    setGamePhase('playing');
    setShowDealerCard(false);
    setGameResult('');

    // Check for immediate blackjack
    const playerValue = calculateHandValue([playerCard1, playerCard2]);
    const dealerValue = calculateHandValue([dealerCard1, dealerCard2]);
    
    if (playerValue === 21) {
      if (dealerValue === 21) {
        endGame('push', finalDeck, [playerCard1, playerCard2], [dealerCard1, dealerCard2]);
      } else {
        endGame('blackjack', finalDeck, [playerCard1, playerCard2], [dealerCard1, dealerCard2]);
      }
    }
  };

  const hit = () => {
    const [newCard, newDeck] = dealCard(deck);
    const newPlayerHand = [...playerHand, newCard];
    setPlayerHand(newPlayerHand);
    setDeck(newDeck);

    const playerValue = calculateHandValue(newPlayerHand);
    if (playerValue > 21) {
      endGame('bust', newDeck, newPlayerHand, dealerHand);
    }
  };

  const stand = () => {
    setShowDealerCard(true);
    let currentDealerHand = [...dealerHand];
    let currentDeck = [...deck];

    // Dealer must hit on 16 and below, stand on 17 and above
    while (calculateHandValue(currentDealerHand) < 17) {
      const [newCard, newDeck] = dealCard(currentDeck);
      currentDealerHand.push(newCard);
      currentDeck = newDeck;
    }

    setDealerHand(currentDealerHand);
    setDeck(currentDeck);
    
    const playerValue = calculateHandValue(playerHand);
    const dealerValue = calculateHandValue(currentDealerHand);

    if (dealerValue > 21) {
      endGame('win', currentDeck, playerHand, currentDealerHand);
    } else if (playerValue > dealerValue) {
      endGame('win', currentDeck, playerHand, currentDealerHand);
    } else if (playerValue < dealerValue) {
      endGame('lose', currentDeck, playerHand, currentDealerHand);
    } else {
      endGame('push', currentDeck, playerHand, currentDealerHand);
    }
  };

  const endGame = (result: string, finalDeck: PlayingCard[], finalPlayerHand: PlayingCard[], finalDealerHand: PlayingCard[]) => {
    setGamePhase('finished');
    setShowDealerCard(true);
    setGameResult(result);

    let winAmount = 0;
    switch (result) {
      case 'blackjack':
        winAmount = Math.floor(bet * 2.5); // 3:2 payout
        onBalanceChange(winAmount, 'blackjack');
        toast({
          title: "Blackjack!",
          description: `You won ${winAmount} coins!`,
        });
        break;
      case 'win':
        winAmount = bet * 2;
        onBalanceChange(winAmount, 'blackjack');
        toast({
          title: "You Win!",
          description: `You won ${winAmount} coins!`,
        });
        break;
      case 'push':
        winAmount = bet;
        onBalanceChange(winAmount, 'blackjack');
        toast({
          title: "Push!",
          description: "It's a tie! Your bet is returned.",
        });
        break;
      case 'lose':
      case 'bust':
        toast({
          title: result === 'bust' ? "Bust!" : "Dealer Wins!",
          description: "Better luck next time!",
          variant: "destructive"
        });
        break;
    }
  };

  const newGame = () => {
    setPlayerHand([]);
    setDealerHand([]);
    setGamePhase('betting');
    setGameResult('');
    setShowDealerCard(false);
  };

  const renderCard = (card: PlayingCard, hidden = false) => {
    if (hidden) {
      return (
        <div className="w-16 h-24 bg-blue-800 border-2 border-white rounded-lg flex items-center justify-center">
          <div className="text-white text-xs">🂠</div>
        </div>
      );
    }

    const isRed = card.suit === '♥' || card.suit === '♦';
    return (
      <div className={`w-16 h-24 bg-white border-2 border-gray-300 rounded-lg flex flex-col items-center justify-center ${isRed ? 'text-red-600' : 'text-black'}`}>
        <div className="text-sm font-bold">{card.value}</div>
        <div className="text-lg">{card.suit}</div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            🂡 Blackjack
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
            <Card className="bg-gradient-to-br from-green-800/30 to-emerald-800/30 backdrop-blur-lg border-green-500/30">
              <CardHeader>
                <CardTitle className="text-center text-yellow-400">
                  {gamePhase === 'betting' ? 'Place Your Bet' : 
                   gamePhase === 'playing' ? 'Make Your Move' : 
                   `Game Over - ${gameResult.charAt(0).toUpperCase() + gameResult.slice(1)}`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Dealer's Hand */}
                <div className="mb-8">
                  <h3 className="text-white text-lg mb-2">
                    Dealer's Hand {showDealerCard && `(${calculateHandValue(dealerHand)})`}
                  </h3>
                  <div className="flex gap-2">
                    {dealerHand.map((card, index) => (
                      <div key={index}>
                        {renderCard(card, !showDealerCard && index === 1)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Player's Hand */}
                <div className="mb-8">
                  <h3 className="text-white text-lg mb-2">
                    Your Hand {playerHand.length > 0 && `(${calculateHandValue(playerHand)})`}
                  </h3>
                  <div className="flex gap-2">
                    {playerHand.map((card, index) => (
                      <div key={index}>
                        {renderCard(card)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Game Controls */}
                <div className="text-center">
                  {gamePhase === 'betting' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-4">
                        <Button
                          onClick={() => setBet(Math.max(20, bet - 10))}
                          variant="outline"
                          className="border-yellow-500/50 text-yellow-400"
                        >
                          -10
                        </Button>
                        <div className="text-white text-xl font-bold">
                          Bet: {bet} coins
                        </div>
                        <Button
                          onClick={() => setBet(Math.min(user.balance, bet + 10))}
                          variant="outline"
                          className="border-yellow-500/50 text-yellow-400"
                        >
                          +10
                        </Button>
                      </div>
                      <Button
                        onClick={startGame}
                        disabled={bet > user.balance}
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold px-8 py-4"
                      >
                        Deal Cards
                      </Button>
                    </div>
                  )}

                  {gamePhase === 'playing' && (
                    <div className="flex gap-4 justify-center">
                      <Button
                        onClick={hit}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3"
                      >
                        Hit
                      </Button>
                      <Button
                        onClick={stand}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3"
                      >
                        Stand
                      </Button>
                    </div>
                  )}

                  {gamePhase === 'finished' && (
                    <Button
                      onClick={newGame}
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold px-8 py-4"
                    >
                      New Game
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="bg-gradient-to-br from-blue-800/30 to-indigo-800/30 backdrop-blur-lg border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-yellow-400">Game Rules</CardTitle>
              </CardHeader>
              <CardContent className="text-white text-sm space-y-2">
                <p>• Get as close to 21 as possible without going over</p>
                <p>• Face cards are worth 10</p>
                <p>• Aces are worth 11 or 1</p>
                <p>• Blackjack (21 with 2 cards) pays 3:2</p>
                <p>• Dealer must hit on 16, stand on 17</p>
                <p>• Minimum bet: 20 coins</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blackjack;
