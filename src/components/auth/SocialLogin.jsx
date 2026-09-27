import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useBusiness } from '../../context/BusinessContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { parseApiError } from '../../api/errors.js';
import { loadScript } from '../../utils/loadScript.js';

/**
 * "Continue with Google / Facebook". The provider's own browser SDK signs the shopper in and
 * hands us a token; the backend checks that token was issued to this shop's app, then answers
 * like a normal login. business/info.social_login carries the public ids (null = switched off).
 */
export default function SocialLogin({ onDone, label = 'or continue with' }) {
  const { info } = useBusiness();
  const { socialLogin } = useAuth();
  const toast = useToast();
  const googleBox = useRef(null);
  const [busy, setBusy] = useState(false);
  const googleId = info?.social_login?.google_client_id;
  const facebookId = info?.social_login?.facebook_app_id;

  // the SDK callbacks outlive renders - always call the latest version
  const finish = useRef();
  finish.current = async (provider, token) => {
    if (!token) return;
    setBusy(true);
    try {
      await socialLogin(provider, token);
      onDone?.();
    } catch (e) {
      toast.error(parseApiError(e).message);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!googleId) return undefined;
    let alive = true;
    loadScript('https://accounts.google.com/gsi/client')
      .then(() => {
        const gsi = window.google?.accounts?.id;
        if (!alive || !gsi || !googleBox.current) return;
        gsi.initialize({ client_id: googleId, callback: (res) => finish.current('google', res.credential) });
        gsi.renderButton(googleBox.current, {
          theme: 'outline', size: 'large', text: 'continue_with', width: Math.min(googleBox.current.offsetWidth || 320, 400),
        });
      })
      .catch(() => { if (alive) toast.error('Google sign-in could not load. Please use your email instead.'); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleId]);

  useEffect(() => {
    if (!facebookId) return;
    loadScript('https://connect.facebook.net/en_US/sdk.js')
      .then(() => window.FB?.init({ appId: facebookId, cookie: false, xfbml: false, version: 'v19.0' }))
      .catch(() => {});
  }, [facebookId]);

  const facebook = () => {
    if (!window.FB) {
      toast.error('Facebook sign-in could not load. Please use your email instead.');
      return;
    }
    window.FB.login((res) => finish.current('facebook', res?.authResponse?.accessToken), { scope: 'email,public_profile' });
  };

  if (!googleId && !facebookId) return null;

  return (
    <div aria-busy={busy}>
      <div className="auth-divider">
        <span>{label}</span>
      </div>
      <div className="social-auth">
        {googleId && <div ref={googleBox} className="d-flex justify-content-center w-100" style={{ minHeight: 44 }} />}
        {facebookId && (
          <button type="button" className="btn btn-social" onClick={facebook} disabled={busy}>
            <i className="bi bi-facebook"></i> Continue with Facebook
          </button>
        )}
      </div>
    </div>
  );
}
