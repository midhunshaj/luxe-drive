import { useEffect } from 'react';

const GoogleAd = ({ slot, style, format = 'auto', responsive = 'true' }) => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense Error:", e.message);
    }
  }, []);

  return (
    <div className="flex justify-center my-8 overflow-hidden rounded-lg">
      <ins
        className="adsbygoogle"
        style={style || { display: 'block', minWidth: '300px', maxWidth: '100%' }}
        data-ad-client="ca-pub-5655930972859112"
        data-ad-slot={slot || "REPLACE_WITH_YOUR_SLOT_ID"}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      ></ins>
    </div>
  );
};

export default GoogleAd;
