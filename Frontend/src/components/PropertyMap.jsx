/** OpenStreetMap embed: free, no API key or extra dependency needed. */
export default function PropertyMap({ coordinates, title }) {
  const [lng, lat] = coordinates;
  const d = 0.01; // roughly 1km around the pin
  const bbox = [lng - d, lat - d, lng + d, lat + d].join(",");
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;

  return (
    <div>
      <div className="rounded-2xl overflow-hidden border border-gray-200 aspect-[16/9] bg-gray-100">
        <iframe title={`Map showing location of ${title}`} src={src} className="w-full h-full" loading="lazy" referrerPolicy="no-referrer" />
      </div>
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-2 text-sm text-blue-600 hover:underline"
      >
        Open in Google Maps
      </a>
    </div>
  );
}
