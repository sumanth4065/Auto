export function mobileOrDesktop() {
  const userAgent =
    typeof window.navigator === 'undefined' ? '' : navigator.userAgent;
  const isMobile = Boolean(
    userAgent.match(
      /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
    )
  );
  return isMobile ? 'mobile' : 'desktop';
}
