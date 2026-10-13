import { Link } from 'react-router-dom';
import Countdown from './Countdown.jsx';
import { imageUrl, plain } from '../../utils/product.js';

/**
 * A running campaign's banner: its image (or a plain colour block), title, countdown to the end
 * and - on the home page - a link to the campaign page. `onEnd` runs when the countdown hits zero.
 */
export default function CampaignHero({ campaign, onEnd, linked = true, as: Title = 'h2' }) {
  const banner = imageUrl(campaign.banner);
  const about = plain(campaign.description);

  return (
    <div className={`campaign-hero${banner ? ' has-banner' : ''}`}>
      {banner && <img className="campaign-hero-img" src={banner} alt="" loading="lazy" />}
      <div className="campaign-hero-body">
        <p className="campaign-hero-eyebrow"><i className="bi bi-lightning-charge-fill"></i> Campaign</p>
        <Title className="campaign-hero-title">{campaign.title}</Title>
        {about && <p className="campaign-hero-about">{linked && about.length > 140 ? `${about.slice(0, 139)}…` : about}</p>}
        {linked && (
          <Link to={`/campaign/${campaign.slug}`} className="btn campaign-hero-cta">
            Shop the campaign{campaign.products_count > 0 && ` (${campaign.products_count})`} <i className="bi bi-arrow-right"></i>
          </Link>
        )}
      </div>
      {/* the countdown sits on the right (below the text on a phone) */}
      <div className="campaign-hero-ends">
        <span className="campaign-hero-ends-label">Ends in</span>
        <Countdown endsAt={campaign.ends_at} onEnd={onEnd} className="countdown-light" />
      </div>
    </div>
  );
}
