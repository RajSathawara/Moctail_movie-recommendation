import './Footer.css';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-inner">
                <div className="footer-logo">
                    <span className="footer-logo-icon">🎬</span>
                    <span>Moctail</span>
                </div>
                <p className="footer-desc">The ultimate destination for movie enthusiasts. Discover, track, and watch your favorite films with our advanced AI recommendation system.</p>
                <div className="footer-links">
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Use</a>
                    <a href="#">Help Center</a>
                </div>
                <p className="footer-copy">© 2024 Moctail Recommendation Engine. All rights reserved.</p>
            </div>
        </footer>
    );
}
