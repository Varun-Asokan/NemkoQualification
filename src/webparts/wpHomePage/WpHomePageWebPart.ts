import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { SPComponentLoader } from '@microsoft/sp-loader'
import HomePage from './HomePageUi';
import NemkoAdminCheck from '../../NemkoAdminCheck';
import { SPHttpClient, SPHttpClientResponse, AadHttpClient } from '@microsoft/sp-http'
import * as strings from 'WpHomePageWebPartStrings';

export interface IWpHomePageWebPartProps {
  description: string;
}

export interface ISPHomeContent {
  Title?: string,
  Description?: string
}

export interface IDashboardData {
  myVerificationPending: number;
  myAuthorizationsPending: number;
}



export default class WpHomePageWebPart extends BaseClientSideWebPart<IWpHomePageWebPartProps> {

  private siteUrl: string = ""
  private apiClient!: AadHttpClient;

  public async render(): Promise<void> {

    const resourceUrl = `${this.siteUrl}/SiteAssets`;

    // Fetch dashboard data; fall back to zero counts on failure
    const dashboard = await this.fetchDashboard();
    const verificationPending = dashboard?.myVerificationPending ?? 0;
    const authorizationPending = dashboard?.myAuthorizationsPending ?? 0;

    // Build conditional badge + pending-count HTML for Verification
    const verificationBadge = verificationPending > 0 ? HomePage.pendingBadgeHtml : '';
    const verificationPendingHtml = verificationPending > 0
      ? HomePage.pendingCountHtml.replace('__KEY_PENDING_COUNT__', String(verificationPending))
      : '';

    // Build conditional badge + pending-count HTML for Authorization
    const authorizationBadge = authorizationPending > 0 ? HomePage.pendingBadgeHtml : '';
    const authorizationPendingHtml = authorizationPending > 0
      ? HomePage.pendingCountHtml.replace('__KEY_PENDING_COUNT__', String(authorizationPending))
      : '';

    this.domElement.innerHTML = HomePage.allElementsHtml
      .replace(/__KEY_URL_RESOURCE__/g, resourceUrl)
      .replace('__KEY_ADD_QUALIFICATION_URL__', `${this.siteUrl}/SitePages/MyQualifications.aspx?modal=addQualification&env=WebViewList`)
      .replace('__KEY_MY_QUALIFICATION_URL__', `${this.siteUrl}/SitePages/MyQualifications.aspx?env=WebViewList`)
      .replace('__KEY_MY_VERIFICATION_URL__', `${this.siteUrl}/SitePages/VerificationAuthorization.aspx?tab=verification&env=WebViewList`)
      .replace('__KEY_MY_AUTHORIZATION_URL__', `${this.siteUrl}/SitePages/VerificationAuthorization.aspx?tab=authorization&env=WebViewList`)
      .replace('__KEY_ADVANCED_SEARCH_URL__', `${this.siteUrl}/SitePages/AdvancedSearch.aspx?env=WebViewList`)
      .replace('__KEY_GUIDELINES_URL__', `${this.siteUrl}/SitePages/Guidelines.aspx?env=WebViewList`)
      .replace('__KEY_ADD_NEW_STANDARD_URL__', `${this.siteUrl}/SitePages/AdvancedSearch.aspx?open=create-standard&env=WebViewList`)
      // Verification card
      .replace('__KEY_VERIFICATION_BADGE__', verificationBadge)
      .replace('__KEY_VERIFICATION_PENDING__', verificationPendingHtml)
      // Authorization card
      .replace('__KEY_AUTHORIZATION_BADGE__', authorizationBadge)
      .replace('__KEY_AUTHORIZATION_PENDING__', authorizationPendingHtml);

    await this.renderHomeContents();
    this.loadHomeScripts();
    this.applyAdminVisibility().catch(() => { /* keep tile hidden */ });
  }

  private async applyAdminVisibility(): Promise<void> {
    const isAdmin = await NemkoAdminCheck.isAdmin(this.siteUrl);
    const tile = this.domElement.querySelector<HTMLElement>('#add-new-standard-tile');
    if (tile) tile.style.display = isAdmin ? '' : 'none';
  }

  private async renderHomeContents(): Promise<void> {
    const query =
      `${this.siteUrl}/_api/web/lists/getbytitle('HomePageContent')/items` +
      `?$select=*,Id,Title,Description,Created,File/ServerRelativeUrl` +
      `&$orderby=SortOrder asc&$top=2`;
    const items = await this.fetchItems(query);
    if (!items.length) return;

    const wrapper = this.domElement.querySelector("#homePageContent");
    if (!wrapper) return;
    wrapper.innerHTML = "";
    for (const item of items) {
      const contentTitle = item.Title || "";
      const contentDescription = item.Description || "";
      wrapper.innerHTML += HomePage.homePageContent
        .replace("__KEY_CONTENT_TITLE__", contentTitle)
        .replace("__KEY_CONTENT_DESCRIPTION__", contentDescription);
    }
  }

  protected onInit(): Promise<void> {
    this.siteUrl = this.context.pageContext.web.absoluteUrl;
    this.loadCSS();

    // Listen for browser Back/Forward navigation
    window.onpopstate = () => {
      this.render();
    };

    return this.context.aadHttpClientFactory
      .getClient('api://66eda48a-d5f9-4db0-a911-0d936f8ce92b')
      .then(client => {
        this.apiClient = client;
        
      })
      .catch(err => {
        console.error('[NEMKO] AAD client init failed:', err);
      })
  }

  private loadCSS(): void {
    SPComponentLoader.loadCss(`${this.siteUrl}/SiteAssets/resources/css/jquery-ui.css`);
  }

  private loadHomeScripts(): void {
    const siteAssetsUrl = `${this.siteUrl}/SiteAssets`;
    SPComponentLoader.loadScript(`${siteAssetsUrl}/resources/js/jquery-ui.js`)
      .catch(err => console.error('JS Load Error:', err));
  }

  /**
   * Fetches the dashboard summary from the external API.
   * Returns null if the request fails so callers can apply safe defaults.
   */
  private async fetchDashboard(): Promise<IDashboardData | null> {
    const apiUrl =
      'https://nemko-mendix-api-dev-ne-h2byesf0a8d5b4by.norwayeast-01.azurewebsites.net/api/dashboard';

    if (!this.apiClient) {

      return null;
    }
    try {
      const response = await this.apiClient.get(apiUrl, AadHttpClient.configurations.v1);
      if (!response.ok) {
        console.error('Dashboard API error:', response.status, response.statusText);
        return null;
      }
      const json = await response.json();
      return json.data as IDashboardData;
    } catch (e) {
      console.error('Dashboard fetch error:', e);
      return null;
    }
  }

  private async fetchItems(query: string): Promise<ISPHomeContent[]> {
    try {
      const res: SPHttpClientResponse =
        await this.context.spHttpClient.get(
          query,
          SPHttpClient.configurations.v1
        );
      const json = await res.json();
      return json.value || [];
    } catch (e) {
      console.error('Announcement fetch error', e);
      return [];
    }
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}