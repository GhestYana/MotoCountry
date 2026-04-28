import React, { useState, useEffect } from 'react';
import '../styles/HomePage.css';
import sportVideo from "../data/sport.mp4";
import nakedVideo from "../data/Naked.mp4";
import cruiserVideo from "../data/cruiser.mp4";
import { Link } from 'react-router-dom';


const HomePage = () => {
  const slides = [
    { id: 0, title: 'Sport', video: sportVideo },
    { id: 1, title: 'Naked', video: nakedVideo },
    { id: 2, title: 'Cruiser', video: cruiserVideo },
    { id: 3, title: 'Classic', video: "/Honda CB500F_Classic.mp4" },
    { id: 4, title: 'Touring', video: nakedVideo } // Using naked as placeholder for touring
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const prevIndex = (currentSlide === 0) ? slides.length - 1 : currentSlide - 1;
  const nextIndex = (currentSlide === slides.length - 1) ? 0 : currentSlide + 1;

  return (
    <div className="home-container">


      {/* HERO SECTION / SLIDER */}
      <main className="hero-slider">
        <div className="slider-main">
          <button className="nav-arrow" onClick={prevSlide}>&lt;</button>

          <div className="side-video left-preview">
            <video key={slides[prevIndex].id} muted>
              <source src={slides[prevIndex].video} type="video/mp4" />
            </video>
          </div>

          <div className="central-stage">
            <video key={slides[currentSlide].id} className="video" autoPlay loop muted>
              <source src={slides[currentSlide].video} type="video/mp4" />
            </video>
            <div className="moto-placeholder">
            </div>
          </div>

          <div className="side-video right-preview">
            <video key={slides[nextIndex].id} muted>
              <source src={slides[nextIndex].video} type="video/mp4" />
            </video>
          </div>

          <button className="nav-arrow" onClick={nextSlide}>&gt;</button>
        </div>

        <div className="slider-dots">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`dot ${currentSlide === index ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            ></div>
          ))}
        </div>

        <h2 className="category-title">{slides[currentSlide].title}</h2>
      </main>
    </div>
  );
};

export default HomePage;
