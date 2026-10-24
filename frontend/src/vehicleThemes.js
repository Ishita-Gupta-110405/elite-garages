export const getVehicleTheme = (make = '', model = '', category = '') => {
  const key = `${make} ${model}`.toLowerCase();

  // 1. Porsche — Guards Red / GT Silver metallic aesthetic
  if (key.includes('porsche')) {
    return {
      signatureName: 'Guards Red • Weissach Edition',
      swatchColor: '#dc2626',
      cardBorder: 'border-red-900/50 hover:border-red-500/80',
      cardGlow: 'from-red-950/40 via-zinc-950 to-zinc-950',
      accentText: 'text-red-400',
      badgeBg: 'bg-red-500/10 text-red-300 border-red-500/30',
      image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=900&q=80',
    };
  }

  // 2. Rivian — Launch Edition Forest Green & Compass Amber
  if (key.includes('rivian')) {
    return {
      signatureName: 'Launch Green • Adventure Spec',
      swatchColor: '#10b981',
      cardBorder: 'border-emerald-900/50 hover:border-amber-500/70',
      cardGlow: 'from-emerald-950/40 via-zinc-950 to-zinc-950',
      accentText: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      image: 'https://images.unsplash.com/photo-1669215420018-098507d14861?auto=format&fit=crop&w=900&q=80',
    };
  }

  // 3. BMW — M-Performance Isle of Man Green / Marina Bay Blue
  if (key.includes('bmw')) {
    return {
      signatureName: 'M-Performance • Frozen Bay Blue',
      swatchColor: '#3b82f6',
      cardBorder: 'border-blue-900/50 hover:border-blue-400/80',
      cardGlow: 'from-blue-950/40 via-zinc-950 to-zinc-950',
      accentText: 'text-blue-400',
      badgeBg: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=900&q=80',
    };
  }

  // 4. Ford — Antimatter Blue / Shelby Performance
  if (key.includes('ford')) {
    return {
      signatureName: 'Antimatter Blue • Performance Pack',
      swatchColor: '#0ea5e9',
      cardBorder: 'border-sky-900/50 hover:border-sky-400/80',
      cardGlow: 'from-sky-950/40 via-zinc-950 to-zinc-950',
      accentText: 'text-sky-400',
      badgeBg: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
      image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=900&q=80',
    };
  }

  // 5. Toyota — Gazoo Racing Track bRed
  if (key.includes('toyota')) {
    return {
      signatureName: 'GR Track bRed • Circuit Tuned',
      swatchColor: '#e11d48',
      cardBorder: 'border-rose-900/50 hover:border-rose-500/80',
      cardGlow: 'from-rose-950/40 via-zinc-950 to-zinc-950',
      accentText: 'text-rose-400',
      badgeBg: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
      image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=900&q=80',
    };
  }

  // 6. Lucid / Luxury EV — Eureka Gold & Platinum
  if (key.includes('lucid') || key.includes('mercedes') || key.includes('audi')) {
    return {
      signatureName: 'Eureka Gold • Grand Touring',
      swatchColor: '#f59e0b',
      cardBorder: 'border-amber-800/50 hover:border-amber-400/90',
      cardGlow: 'from-amber-950/40 via-zinc-950 to-zinc-950',
      accentText: 'text-amber-400',
      badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=900&q=80',
    };
  }

  // 7. Ferrari / Lamborghini / Exotic — Rosso Corsa / Giallo
  if (key.includes('ferrari') || key.includes('lamborghini') || key.includes('mclaren')) {
    return {
      signatureName: 'Rosso Corsa • Scuderia Spec',
      swatchColor: '#ef4444',
      cardBorder: 'border-red-700/60 hover:border-amber-400',
      cardGlow: 'from-red-950/50 via-zinc-950 to-zinc-950',
      accentText: 'text-amber-400',
      badgeBg: 'bg-red-500/15 text-amber-300 border-red-500/40',
      image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=900&q=80',
    };
  }

  // Fallback by Category (Obsidian & Brushed Gold)
  const categoryImages = {
    Coupe: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=900&q=80',
    SUV: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=900&q=80',
    Truck: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=900&q=80',
    Convertible: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80',
    Sedan: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80',
  };

  return {
    signatureName: 'Obsidian Black • Bespoke Spec',
    swatchColor: '#eab308',
    cardBorder: 'border-zinc-800 hover:border-amber-500/60',
    cardGlow: 'from-amber-950/20 via-zinc-950 to-zinc-950',
    accentText: 'text-amber-400',
    badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    image: categoryImages[category] || categoryImages.Coupe,
  };
};