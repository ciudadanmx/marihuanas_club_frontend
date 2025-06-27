import React, { useEffect } from 'react';
import './css/style.css';

const WeedClicker = () => {
  useEffect(() => {
    // Cargar scripts del juego
    const scripts = [
      '/js/buildings.js',
      '/js/upgrades.js',
      '/js/playlist.js',
      '/js/music.js',
      '/js/script.js',
      '/js/achievements.js',
      '/js/cosmetics.js',
    ];
    const elems = scripts.map(src => {
      const s = document.createElement('script');
      s.src = src;
      s.async = false;
      document.body.appendChild(s);
      return s;
    });
    return () => elems.forEach(s => document.body.removeChild(s));
  }, []);

  return (
    <>
      <audio id="background-music">
        <source src="/assets/audio/track_1.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      <header>
        <nav className="navbar">
          <a href="#" className="btn desktop resetGame">Reset Game</a>
          <a href="#" className="musicButton music-control-button" id="music-toggle">
            <i className="fas fa-music"></i>
          </a>
          <div className="music-control">
            <button id="muteButton" className="mute-button">
              <i className="fas fa-volume-up"></i>
            </button>
            <input
              type="range"
              className="desktop volumeSlider"
              id="volumeSlider"
              min="0"
              max="100"
              defaultValue="50"
            />
            <button id="prevTrackButton" className="music-control-button">
              <i className="fas fa-step-backward"></i>
            </button>
            <button id="nextTrackButton" className="music-control-button">
              <i className="fas fa-step-forward"></i>
            </button>
          </div>

          <div className="nav-logo">
            <img src="/assets/img/logo.svg" alt="Weed Clicker Logo" />
          </div>

          <div className="hamburger">
            <i className="fas fa-bars"></i>
          </div>

          <ul className="nav-links-mobile">
            <li><a href="#" id="achievementTriggerMob"><i className="fas fa-award"></i></a></li>
            <li><a href="/">Home</a></li>
            <li><a target="_blank" rel="noreferrer" href="https://www.github.com/yousifpa98/clicker"><i className="fab fa-github"></i> Repository</a></li>
            <li><a href="#" className="btn resetGame">Reset Game</a></li>
            <li className="ver">ver. <span id="version">0.0.1</span></li>
          </ul>
          <ul className="nav-links-desktop">
            <li></li>
            <li><a href="#" id="achievementTrigger"><i className="fas fa-award"></i></a></li>
            <li><a href="/">Home</a></li>
            <li><a target="_blank" rel="noreferrer" href="https://www.github.com/yousifpa98/clicker"><i className="fab fa-github"></i>Repository</a></li>
            <li className="ver">ver. <span id="version">0.0.1</span></li>
          </ul>
        </nav>
      </header>

      <main>
        <section id="game">
          <div className="click-container">
            <div className="currentBuds">
              <p id="buds">0</p>
              <h2>buds of Weed</h2>
              <h4><span id="bps">0</span> buds per second</h4>
            </div>
            <div id="clicker" className="disable-dbl-tap-zoom">
              <img src="/assets/img/click_img.png" alt="bud" className="disable-dbl-tap-zoom" />
            </div>
          </div>
          <div className="shop disable-dbl-tap-zoom">
            <h2>Shop</h2>
            <div className="upgrade-row" id="upgrade-row"></div>
            <div className="buildings">
              <div className="building-controls">
                <div className="setting">
                  <label htmlFor="buy">buy</label>
                  <input type="radio" name="setting" id="buy" />
                  <label htmlFor="sell">sell</label>
                  <input type="radio" name="setting" id="sell" />
                </div>
                <div className="amount">
                  <label htmlFor="onePer">1</label>
                  <input type="radio" name="amount" id="onePer" defaultChecked />
                  <label htmlFor="tenPer">10</label>
                  <input type="radio" name="amount" id="tenPer" />
                  <label htmlFor="hundredPer">100</label>
                  <input type="radio" name="amount" id="hundredPer" />
                </div>
              </div>
              <div className="building-shop" id="building-shop"></div>
            </div>
          </div>

          <div className="stats-container">
            <h2>Stats</h2>
            {/* Agrega aquí las tablas de stats completas */}
          </div>
        </section>
        <div id="leaf-container"></div>
      </main>

      <footer>
        <p>&copy; 2024 <a target="_blank" rel="noreferrer" href="https://www.yousifpaulus.dev">Yousif Paulus</a></p>
        <ul className="footer-socials">
          <li><a target="_blank" rel="noreferrer" href="https://www.github.com/yousifpa98"><i className="fab fa-github"></i></a></li>
        </ul>
      </footer>

      <div id="resetModal" className="modal">
        <div className="modal-content">
          <h2>Are you sure?</h2>
          <p>This action will reset all your progress.</p>
          <button id="confirmReset" className="btn btn-danger">Yes, Reset</button>
          <button id="cancelReset" className="btn btn-cancel">Cancel</button>
        </div>
      </div>

      <div id="achivModal" className="achiv-modal">
        <div className="achiv-modal-content">
          <span id="achivModalClose" className="achiv-modal-close">&times;</span>
          <h2>Unlocked Achievements</h2>
          <div id="achivDetails" className="achiv-details">
            <h3 id="achivName">Hover over an achievement</h3>
            <p id="achivDesc">Achievement details will be displayed here.</p>
          </div>
          <div id="achivModalList" className="achiv-list"></div>
        </div>
      </div>
    </>
  );
};

export default WeedClicker;
