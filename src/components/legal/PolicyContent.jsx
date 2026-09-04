import { useBusiness } from '../../context/BusinessContext.jsx';

/** Renders a rich-text policy field from business info (e.g. `privacy_policy`). */
export default function PolicyContent({ field }) {
  const { info, loading } = useBusiness();

  if (loading) return <p>Loading…</p>;

  const html = info?.[field];
  if (!html) return <p className="legal-intro">This policy has not been published yet.</p>;

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
