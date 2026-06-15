import RouteTicker from './RouteTicker.jsx';

export default function AuthSplitLayout({
  imageSrc,
  imageAlt,
  imageFallback,
  overlayStyle,
  logoAccent,
  topSticker,
  quoteSticker,
  quoteTitle,
  quoteSub,
  children,
}) {
  return (
    <>
      <RouteTicker />
      <div className="auth-split">
        <div className="auth-left-panel">
          <img
            src={imageSrc}
            alt={imageAlt}
            className="auth-panel-image"
            onError={(event) => {
              event.currentTarget.style.background = imageFallback;
              event.currentTarget.style.objectFit = 'cover';
              event.currentTarget.removeAttribute('src');
            }}
          />
          <div className="auth-left-overlay" style={overlayStyle} />
          <div className="auth-watermark">
            <span className="auth-logo">
              <span style={{ color: logoAccent }}>NAI</span>
              <span style={{ color: '#FF2D78' }}>PULSE</span> OS
            </span>
          </div>
          {topSticker && (
            <div className="auth-top-sticker">{topSticker}</div>
          )}
          <div className="auth-quote-card">
            {quoteSticker}
            <div className="auth-quote-text">{quoteTitle}</div>
            <div className="auth-quote-sub">{quoteSub}</div>
          </div>
        </div>
        <div className="auth-right-panel">{children}</div>
      </div>
    </>
  );
}
