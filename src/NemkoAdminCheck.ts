// Shared admin-group check

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

 
  public static reset(): void {
    delete window.__nemkoIsAdminPromise;
  }
}
