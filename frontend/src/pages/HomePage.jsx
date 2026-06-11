import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, Shield, Wrench, Truck, CreditCard } from 'lucide-react';
import ProductCard from '../components/ProductCard';

import sportImg from '../data/main/kawasaki_ninja-zx-10r.webp';
import nakedImg from '../data/main/Honda_CB650R.png';
import cruiserImg from '../data/main/Indian_Scout_Bobber.avif';
import adventureImg from '../data/main/Moto_Guzzi_V85_TT.avif';
import enduroImg from '../data/main/KTM_500_EXC-F.png';
import scooterImg from '../data/main/Vespa_GTS_300.avif';

import '../styles/HomePage.css';

const TYPES = [
  { type: 'Sport', color: '#ef4444', desc: 'Максимальна швидкість та адреналін', img: sportImg },
  { type: 'Naked', color: '#4ade80', desc: 'Стиль та потужність без компромісів', img: nakedImg },
  { type: 'Cruiser', color: '#f59e0b', desc: 'Свобода дороги у кожному кілометрі', img: cruiserImg },
  { type: 'Adventure', color: '#60a5fa', desc: 'Будь-яке бездоріжжя — твоя стихія', img: adventureImg },
  { type: 'Enduro', color: '#a78bfa', desc: 'Підкори будь-який рельєф', img: enduroImg },
  { type: 'Scooter', color: '#f472b6', desc: 'Міська мобільність без зусиль', img: scooterImg },
];


const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

// Рамка тепер не потрібна, бо ми обводимо сам силует мотоцикла
const NeonDecor = () => null;

// Компонент для літаючих неонових точок
const NeonParticles = ({ currentType }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      tx: `${(Math.random() - 0.5) * 400}px`,
      ty: `${(Math.random() - 0.5) * 400}px`,
      duration: `${3 + Math.random() * 4}s`,
      delay: `${Math.random() * 5}s`
    }));
    setParticles(newParticles);
  }, [currentType]);

  return (
    <div className="neon-particles">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            '--left': p.left,
            '--top': p.top,
            '--tx': p.tx,
            '--ty': p.ty,
            '--duration': p.duration,
            animationDelay: p.delay
          }}
        />
      ))}
    </div>
  );
};

const HomePage = () => {
  const navigate = useNavigate();
  const [activeIdx, setActiveIdx] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const intervalRef = useRef(null);

  const { type, color, desc, img } = TYPES[activeIdx];

  const goTo = useCallback((idx) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => setAnimating(false), 450);
    setActiveIdx(idx);
  }, [animating]);

  const next = useCallback(() => goTo((activeIdx + 1) % TYPES.length), [activeIdx, goTo]);
  const prev = () => goTo((activeIdx - 1 + TYPES.length) % TYPES.length);

  useEffect(() => {
    intervalRef.current = setInterval(next, 4000);
    return () => clearInterval(intervalRef.current);
  }, [next]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [moto, equip, comp] = await Promise.all([
          fetch('/api/motorcycles').then(r => r.json()),
          fetch('/api/equipment').then(r => r.json()),
          fetch('/api/components').then(r => r.json()),
        ]);
        const all = [
          ...(Array.isArray(moto) ? moto.map(i => ({ ...i, category: 'motorcycle' })) : []),
          ...(Array.isArray(equip) ? equip.map(i => ({ ...i, category: 'equipment' })) : []),
          ...(Array.isArray(comp) ? comp.map(i => ({ ...i, category: 'component' })) : []),
        ].filter(i => i.image);
        setProducts(shuffle(all).slice(0, 12));
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="home-container">

      {/* ── HERO ── */}
      <section className="hero" style={{ '--accent': color }}>
        <div className="hero-bg">
          <div className="hero-glow" style={{ background: color }} />
          <div className="hero-grid" />
          <NeonParticles currentType={type} />
        </div>

        <div className="type-tabs">
          {TYPES.map((t, i) => (
            <button
              key={t.type}
              className={`type-tab ${i === activeIdx ? 'active' : ''}`}
              style={i === activeIdx ? { '--tab-color': t.color } : {}}
              onClick={() => goTo(i)}
            >
              {t.type}
            </button>
          ))}
        </div>

        <div className="hero-stage">
          <div className="hero-info">
            <p className="hero-type-label" style={{ color }}>{type}</p>
            <p className="hero-type-desc">{desc}</p>
            <div className="hero-actions">
              <button
                className="btn-primary"
                style={{ background: color, color: '#000' }}
                onClick={() => navigate(`/moto?type=${type}`)}
              >
                Переглянути <ArrowRight size={16} />
              </button>
              <button className="btn-ghost" onClick={() => navigate('/moto')}>
                Весь каталог
              </button>
            </div>
          </div>

          {/* Photo + neon decor */}
          <div className={`hero-photo-wrap ${animating ? 'fade' : ''}`}>
            <NeonDecor color={color} />

            {/* Підсвітка під мотоциклом */}
            <div className="moto-glow-ring" style={{ '--glow-color': color }} />
            <div className="moto-glow-floor" style={{ background: `radial-gradient(ellipse at center, ${color}55 0%, ${color}00 70%)` }} />

            <div className="hero-photo-img-wrap">
              {/* Розмиті шари підсвітки (копії зображення) */}
              <img src={img} className="hero-photo-img-glow-layer" alt="" aria-hidden="true"
                style={{ filter: `blur(18px) brightness(1.4) saturate(1.5) drop-shadow(0 0 30px ${color})` }} />
              <img src={img} className="hero-photo-img-glow-layer sharp" alt="" aria-hidden="true"
                style={{ filter: `blur(5px) brightness(1.2) drop-shadow(0 0 15px ${color}aa)` }} />

              {/* Основне зображення */}
              <img
                key={type}
                src={img}
                alt={type}
                className="hero-photo-img"
                style={{ filter: `drop-shadow(0 0 20px ${color}88) drop-shadow(0 25px 40px rgba(0,0,0,0.6))` }}
              />
            </div>

            <div className="hero-photo-glow" style={{ background: color }} />
          </div>

          <div className="hero-nav">
            <button className="nav-btn" onClick={prev}><ChevronLeft size={20} /></button>
            <button className="nav-btn" onClick={next}><ChevronRight size={20} /></button>
          </div>
        </div>

        <div className="hero-dots">
          {TYPES.map((t, i) => (
            <button
              key={t.type}
              className={`hero-dot ${i === activeIdx ? 'active' : ''}`}
              style={i === activeIdx ? { background: t.color } : {}}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <section className="home-products-section">
        <div className="home-products-header">
          <h2 className="section-title">Популярні товари</h2>
          <button className="btn-ghost-sm" onClick={() => navigate('/moto')}>Дивитись всі →</button>
        </div>
        {loadingProducts ? (
          <div className="home-products-skeleton">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="product-skeleton-card" />
            ))}
          </div>
        ) : (
          <div className="home-products-grid">
            {products.map(item => (
              <ProductCard
                key={`${item.category}-${item.id}`}
                id={item.id}
                category={item.category}
                image={item.image}
                type={item.type}
                model={item.name}
                price={item.price}
                average_rating={item.average_rating}
                availability={item.availability}
                details={[{ label: 'Бренд', value: item.brand }]}
              />
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

export default HomePage;
