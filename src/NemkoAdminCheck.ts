// Shared admin-group check, safe to call from independently-bundled
// SPFx components (webparts, extensions, shared static classes).
//
// Each SPFx component is built as its own bundle, so a plain static
// field on this class would NOT be shared between them — every bundle
// gets its own module scope. `window` is the one thing all bundles run
// against at runtime, so the cache lives there instead (same pattern
// already used for the `sidebarMounted` event).
//
// Net effect: whichever caller runs first fires the one REST call;
// everyone else (same page load) awaits that same promise.

declare global {
  interface Window {
    __nemkoIsAdminPromise?: Promise<boolean>;
  }
}

const ADMIN_GROUP_ID = 19;

export default class NemkoAdminCheck {
  public static isAdmin(siteUrl: string): Promise<boolean> {
    if (!window.__nemkoIsAdminPromise) {
      const apiUrl = `${siteUrl}/_api/web/currentuser/groups?$select=Id`;

      window.__nemkoIsAdminPromise = fetch(apiUrl, { headers: { Accept: 'application/json;odata=nometadata' } })
        .then(res => res.json())
        .then(data => (data.value as Array<{ Id: number }>)?.some(g => g.Id === ADMIN_GROUP_ID) ?? false)
        .catch(() => false);
    }

    return window.__nemkoIsAdminPromise;
  }

  // Call this if you ever need to force a re-check (e.g. after a group
  // membership change in the same session). Not needed in normal flow.
  public static reset(): void {
    delete window.__nemkoIsAdminPromise;
  }
}
