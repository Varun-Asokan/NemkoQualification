export function currentSite(): string {
  const pathParts = window.location.pathname.split('/');
  const sitesIndex = pathParts.indexOf('sites');
  if (sitesIndex !== -1 && pathParts.length > sitesIndex + 1) {
    return pathParts[sitesIndex + 1];
  }
  return ''; // fallback if not in a site
}