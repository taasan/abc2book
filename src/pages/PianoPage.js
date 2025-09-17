import ResponsivePiano from '../components/ResponsivePiano'

export default function PianoPage(props) {
  // In development the soundfonts are served by a local static server on port 4000.
  // In production use an absolute path so the browser requests are not relative to
  // the current route (e.g. /piano/...). A relative path caused network errors.
  const soundFontUrl = process.env.NODE_ENV === 'development'
    ? 'http://localhost:4000/midi-js-soundfonts/selection/'
    : '/midi-js-soundfonts/selection/';

  return (
    <ResponsivePiano soundFontUrl={soundFontUrl} />
  );
}
