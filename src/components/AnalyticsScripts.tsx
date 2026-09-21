import Script from "next/script";

interface AnalyticsScriptsProps {
  ga4MeasurementId?: string | null;
  googleAdsConversionId?: string | null;
  googleAdsConversionLabel?: string | null;
  metaPixelId?: string | null;
}

export default function AnalyticsScripts({
  ga4MeasurementId,
  googleAdsConversionId,
  googleAdsConversionLabel,
  metaPixelId,
}: AnalyticsScriptsProps) {
  // gtag.js один раз обслуживает и GA4, и Google Ads — если задан хотя бы
  // один из двух ID, подключаем библиотеку.
  const gtagId = ga4MeasurementId || googleAdsConversionId;
  const conversionSendTo =
    googleAdsConversionId && googleAdsConversionLabel
      ? `${googleAdsConversionId}/${googleAdsConversionLabel}`
      : null;

  return (
    <>
      {gtagId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gtagId}`} strategy="afterInteractive" />
          <Script id="gtag-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              ${ga4MeasurementId ? `gtag('config', '${ga4MeasurementId}');` : ""}
              ${googleAdsConversionId ? `gtag('config', '${googleAdsConversionId}');` : ""}
              ${conversionSendTo ? `window.__googleAdsConversionSendTo = '${conversionSendTo}';` : ""}
            `}
          </Script>
        </>
      )}

      {metaPixelId && (
        <Script id="meta-pixel-init" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            window.fbq = window.fbq || function(){(window.fbq.q = window.fbq.q || []).push(arguments)};
            fbq('init', '${metaPixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}
    </>
  );
}
