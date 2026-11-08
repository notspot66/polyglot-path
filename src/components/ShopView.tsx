import React, { useState } from 'react';
import { UserStats } from '../types';
import { sound } from '../utils/audio';
import {
  Shield,
  Heart,
  Zap,
  Sparkles,
  Gem,
  Shirt,
  Check,
  Coins,
  Package,
  ShoppingBag,
  ExternalLink,
  CreditCard,
  X,
  Truck,
} from 'lucide-react';

interface ShopViewProps {
  userStats: UserStats;
  onBuyItem: (itemKey: 'freeze' | 'refill' | 'doubleXp' | 'streakShield' | 'coins500' | 'coins2000' | string, cost: number) => boolean;
}

interface MerchItem {
  id: string;
  name: string;
  tagline: string;
  priceUsd: number;
  imageIcon: string;
  badge: string;
  desc: string;
}

const MERCHANDISE_ITEMS: MerchItem[] = [
  {
    id: 'merch-hoodie',
    name: 'Lingoverse Cyber Hoodie',
    tagline: 'Neon Teal & Jet Black Luxury Fleece',
    priceUsd: 68.0,
    imageIcon: '🧥',
    badge: 'BESTSELLER',
    desc: 'Heavyweight 450 GSM organic French terry cotton with embroidered glowing cyber fox crest, thumbhole cuffs, and water-resistant stash pocket for flashcards.',
  },
  {
    id: 'merch-figurine',
    name: 'Golden Cyber Fox Figurine',
    tagline: 'Limited Edition 24K Electroplated Desk Mascot',
    priceUsd: 45.0,
    imageIcon: '🦊',
    badge: 'LIMITED 500 UNITS',
    desc: 'Precision solid cast polyresin mascot with metallic electroplating. Includes serialized NFC authenticity chip verifying your billionaire polyglot status.',
  },
  {
    id: 'merch-journal',
    name: 'Polyglot Executive Leather Journal',
    tagline: 'Cognac Vegan Leather & Matte Black Pen',
    priceUsd: 32.0,
    imageIcon: '📓',
    badge: 'HANDCRAFTED',
    desc: 'Dotted 120 GSM bleedproof paper tailored for foreign script practice, grammatical tables, and vocabulary memory indexing.',
  },
];

export const ShopView: React.FC<ShopViewProps> = ({ userStats, onBuyItem }) => {
  const [selectedMerch, setSelectedMerch] = useState<MerchItem | null>(null);
  const [merchOrderedNotice, setMerchOrderedNotice] = useState<string | null>(null);

  const powerUps = [
    {
      key: 'streakShield',
      title: 'Streak Shield (Auto-Consuming)',
      desc: 'Automatically consumes itself if you miss a day to safeguard your streak from resetting to 0.',
      cost: 250,
      icon: <Shield className="w-8 h-8 text-teal-400" />,
      bg: 'border-teal-500/40 bg-teal-950/20',
      inventoryCount: userStats.streakShields || 0,
      disabled: false,
      disabledLabel: '',
    },
    {
      key: 'refill',
      title: 'Full Heart Refill',
      desc: 'Instantly restore all 5 hearts to continue practicing uninterrupted.',
      cost: 300,
      icon: <Heart className="w-8 h-8 fill-rose-500 text-rose-500" />,
      bg: 'border-rose-500/40 bg-rose-950/20',
      inventoryCount: null,
      disabled: userStats.hearts >= userStats.maxHearts,
      disabledLabel: 'Hearts Full',
    },
    {
      key: 'coins500',
      title: 'Arena Coin Pouch (500 Coins)',
      desc: 'Add 500 wager coins to duel rival learners in the 1v1 Trivia Arena.',
      cost: 100,
      icon: <Coins className="w-8 h-8 text-amber-400" />,
      bg: 'border-amber-500/40 bg-amber-950/20',
      inventoryCount: null,
      disabled: false,
      disabledLabel: '',
    },
    {
      key: 'coins2000',
      title: 'Arena Coin Vault (2,000 Coins)',
      desc: 'High-roller coin cache for billionaire-tier bets in Trivia Arena (+20% bonus coins).',
      cost: 300,
      icon: <Coins className="w-8 h-8 text-amber-300" />,
      bg: 'border-amber-400/50 bg-amber-950/30',
      inventoryCount: null,
      disabled: false,
      disabledLabel: '',
    },
    {
      key: 'doubleXp',
      title: 'Double XP Supercharge',
      desc: 'Earn 2x Experience Points on every completed lesson and duel for 1 hour.',
      cost: 150,
      icon: <Zap className="w-8 h-8 fill-amber-500 text-amber-500" />,
      bg: 'border-amber-500/40 bg-amber-950/20',
      inventoryCount: null,
      disabled: false,
      disabledLabel: '',
    },
  ];

  const outfits = [
    {
      key: 'fox',
      title: 'Neon Cyber Fox Avatar',
      desc: 'Futuristic geometric mascot with glowing cybernetic circuits.',
      cost: 600,
      icon: '🦊',
      equipped: userStats.costume === 'fox' || userStats.costume === 'default',
    },
    {
      key: 'astronaut',
      title: 'Cosmic Astronaut Mascot',
      desc: 'Space helmet equipped for intergalactic language adventures.',
      cost: 500,
      icon: '🚀',
      equipped: userStats.costume === 'astronaut',
    },
    {
      key: 'detective',
      title: 'Polyglot Detective Outfit',
      desc: 'Trenchcoat and magnifying glass for deducing linguistic roots.',
      cost: 400,
      icon: '🕵️',
      equipped: userStats.costume === 'detective',
    },
  ];

  const handlePurchase = (key: string, cost: number) => {
    if (userStats.gems < cost) {
      sound.playWrong();
      alert(`Insufficient gems! You need ${cost} gems for this item.`);
      return;
    }
    const success = onBuyItem(key, cost);
    if (success) {
      sound.playGems();
    }
  };

  const handlePreorderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playFanfare();
    setMerchOrderedNotice(
      `Pre-order confirmed for "${selectedMerch?.name}"! A tracking reservation has been logged.`
    );
    setSelectedMerch(null);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto py-6 px-4 pb-28">
      {/* Gems & Coins Balance Banner */}
      <div className="w-full rounded-3xl bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 p-6 sm:p-7 text-white shadow-xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 border border-teal-400/30">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-teal-200">
            LINGOVERSE MARKETPLACE
          </span>
          <h2 className="text-3xl font-black mt-0.5">PANDA SHOP</h2>
          <p className="text-xs sm:text-sm text-teal-100 font-medium mt-1">
            Exchange your earned gems for shields, wager coins, avatar outfits, and official merchandise!
          </p>
        </div>

        {/* Dual Wallet Display */}
        <div className="flex items-center gap-3 bg-black/30 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 shrink-0">
          <div className="flex items-center gap-2 border-r border-white/20 pr-3">
            <Gem className="w-5 h-5 fill-sky-400 text-sky-400" />
            <div className="text-left">
              <span className="text-[10px] text-sky-200 font-bold block">Gems</span>
              <span className="text-lg font-black text-white tabular-nums">{userStats.gems}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pl-1">
            <Coins className="w-5 h-5 text-amber-400" />
            <div className="text-left">
              <span className="text-[10px] text-amber-200 font-bold block">Coins</span>
              <span className="text-lg font-black text-white tabular-nums">{userStats.coins || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {merchOrderedNotice && (
        <div className="w-full p-4 mb-6 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <span>{merchOrderedNotice}</span>
          <button
            onClick={() => setMerchOrderedNotice(null)}
            className="text-white hover:text-emerald-300 font-black ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* SECTION 1: POWER-UPS & STREAK SHIELDS */}
      <section className="w-full mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-black text-white">Power-Ups & Streak Shields</h3>
          </div>
          <span className="text-xs font-bold text-teal-400">
            Active Shields: {userStats.streakShields || 0}
          </span>
        </div>

        <div className="flex flex-col gap-3.5">
          {powerUps.map((item) => (
            <div
              key={item.key}
              className={`p-5 rounded-2xl bg-[#161b22] border shadow-sm flex items-center justify-between gap-4 transition-all ${item.bg}`}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-14 h-14 rounded-2xl bg-[#0d1117] flex items-center justify-center shrink-0 border border-slate-800">
                  {item.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-white">{item.title}</h4>
                    {item.inventoryCount !== null && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                        x{item.inventoryCount} in Bag
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 max-w-md">{item.desc}</p>
                </div>
              </div>

              {/* Purchase button */}
              <div className="shrink-0">
                {item.disabled ? (
                  <span className="px-4 py-2 rounded-xl bg-[#21262d] text-slate-400 font-extrabold text-xs border border-slate-700">
                    {item.disabledLabel}
                  </span>
                ) : (
                  <button
                    disabled={userStats.gems < item.cost}
                    onClick={() => handlePurchase(item.key, item.cost)}
                    className={`btn-3d px-4 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer ${
                      userStats.gems >= item.cost
                        ? 'bg-sky-500 hover:bg-sky-600 text-white shadow-md border-b-2 border-sky-700'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border-none'
                    }`}
                  >
                    <Gem className="w-4 h-4 fill-white" />
                    <span>{item.cost}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: AVATAR CUSTOMIZATION */}
      <section className="w-full mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Shirt className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-black text-white">Avatar Customization</h3>
        </div>

        <div className="flex flex-col gap-3.5">
          {outfits.map((outfit) => (
            <div
              key={outfit.key}
              className="p-5 rounded-2xl bg-[#161b22] border border-slate-800 shadow-sm flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-14 h-14 rounded-2xl bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-center text-3xl shrink-0">
                  {outfit.icon}
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">{outfit.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5 max-w-md">{outfit.desc}</p>
                </div>
              </div>

              <div className="shrink-0">
                {outfit.equipped ? (
                  <span className="px-4 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-extrabold text-xs flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Equipped
                  </span>
                ) : (
                  <button
                    disabled={userStats.gems < outfit.cost}
                    onClick={() => handlePurchase(outfit.key, outfit.cost)}
                    className={`btn-3d px-4 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer ${
                      userStats.gems >= outfit.cost
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md border-b-2 border-emerald-700'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border-none'
                    }`}
                  >
                    <Gem className="w-4 h-4 fill-white" />
                    <span>{outfit.cost}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: PHYSICAL MERCHANDISE PRE-ORDERS */}
      <section className="w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-black text-white">Physical Merchandise Pre-Orders</h3>
          </div>
          <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
            Official Hardware Store
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MERCHANDISE_ITEMS.map((merch) => (
            <div
              key={merch.id}
              className="bg-[#161b22] border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between hover:border-teal-500/40 transition-all"
            >
              <div>
                <div className="w-full h-36 rounded-2xl bg-[#0d1117] border border-slate-800 flex items-center justify-center text-6xl shadow-inner mb-4 relative">
                  <span>{merch.imageIcon}</span>
                  <span className="absolute top-2.5 right-2.5 text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {merch.badge}
                  </span>
                </div>

                <h4 className="text-base font-black text-white">{merch.name}</h4>
                <span className="text-xs text-teal-400 font-bold block mt-0.5">{merch.tagline}</span>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{merch.desc}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-lg font-black text-white">${merch.priceUsd}</span>
                <button
                  onClick={() => {
                    sound.playClick();
                    setSelectedMerch(merch);
                  }}
                  className="btn-3d px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer border-b-2 border-teal-800 shadow-sm"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Pre-Order</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MERCHANDISE PRE-ORDER MODAL */}
      {selectedMerch && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="relative w-full max-w-md bg-[#161b22] border border-teal-500/40 rounded-3xl p-6 sm:p-7 text-slate-100 shadow-2xl flex flex-col">
            <button
              onClick={() => setSelectedMerch(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-[#0d1117] border border-slate-800 flex items-center justify-center text-3xl">
                {selectedMerch.imageIcon}
              </div>
              <div>
                <h3 className="text-lg font-black text-white">{selectedMerch.name}</h3>
                <span className="text-sm font-black text-teal-400">${selectedMerch.priceUsd} USD</span>
              </div>
            </div>

            <form onSubmit={handlePreorderSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">
                  Select Size / Variant
                </label>
                <select className="w-full px-3 py-2 bg-[#0d1117] border border-slate-800 rounded-xl text-white outline-none focus:border-teal-400">
                  <option>Medium (Unisex)</option>
                  <option>Large (Unisex)</option>
                  <option>Extra Large (Unisex)</option>
                  <option>Collector Box Edition</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">
                  Shipping Destination
                </label>
                <input
                  type="text"
                  placeholder="Full shipping address..."
                  required
                  defaultValue="100 Silicon Way, Tech District, CA"
                  className="w-full px-3 py-2 bg-[#0d1117] border border-slate-800 rounded-xl text-white outline-none focus:border-teal-400"
                />
              </div>

              <div className="p-3 bg-teal-950/30 border border-teal-500/30 rounded-xl flex items-center gap-2 text-teal-200">
                <Truck className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Free global express shipping included on all pre-orders.</span>
              </div>

              <button
                type="submit"
                className="btn-3d w-full mt-2 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-black text-sm uppercase tracking-wider border-b-2 border-teal-800 cursor-pointer shadow-lg"
              >
                Confirm Pre-Order Reservation (${selectedMerch.priceUsd})
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
