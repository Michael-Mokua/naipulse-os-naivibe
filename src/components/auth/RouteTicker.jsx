import { AUTH_ROUTE_TICKER } from '../../auth/authConstants.js';

export default function RouteTicker() {
  const items = [...AUTH_ROUTE_TICKER, ...AUTH_ROUTE_TICKER];

  return (
    <div className="auth-ticker-wrap">
      <div className="auth-ticker">
        {items.map((route, index) => (
          <span key={`${route}-${index}`}>{route}</span>
        ))}
      </div>
    </div>
  );
}
