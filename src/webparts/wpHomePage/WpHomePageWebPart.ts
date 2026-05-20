import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { SPComponentLoader } from '@microsoft/sp-loader'
import HomePage from './HomePageUi';
import { SPHttpClient, SPHttpClientResponse}  from '@microsoft/sp-http'
import * as strings from 'WpHomePageWebPartStrings';

export interface IWpHomePageWebPartProps {
  description: string;
}

export interface ISPHomeContent {
  Title?: string,
  Description?: string 
}

export default class WpHomePageWebPart extends BaseClientSideWebPart<IWpHomePageWebPartProps> {

  private siteUrl: string = ""


  public async render(): Promise<void>{
    
    const resourceUrl = `${this.siteUrl}/SiteAssets`
    this.domElement.innerHTML = HomePage.allElementsHtml
    .replace(/__KEY_URL_RESOURCE__/g,resourceUrl)
    .replace('__KEY_ADD_QUALIFICATION_URL__', `${this.siteUrl}/SitePages/MyQualifications.aspx?modal=addQualification`)
    .replace('__KEY_MY_QUALIFICATION_URL__',`${this.siteUrl}/SitePages/MyQualifications.aspx?`)
    .replace('__KEY_MY_VERIFICATION_URL__',`${this.siteUrl}/SitePages/VerificationAuthorization.aspx?tab=verification`)
    .replace('__KEY_MY_AUTHORIZATION_URL__',`${this.siteUrl}/SitePages/VerificationAuthorization.aspx?tab=authorization`)
    .replace('__KEY_ADVANCED_SEARCH_URL__',`${this.siteUrl}/SitePages/AdvancedSearch.aspx`)
    .replace('__KEY_GUIDELINES_URL__',`${this.siteUrl}/SitePages/Guidelines.aspx`)
    ;
    await this.renderHomeContents();
    this.loadHomeScripts();
    
  }

  private async renderHomeContents():Promise<void>{
    const query =
      `${this.siteUrl}/_api/web/lists/getbytitle('HomePageContent')/items` +
      `?$select=*,Id,Title,Description,Created,File/ServerRelativeUrl` +
      `&$orderby=SortOrder asc&$top=2`; 
    const items = await this.fetchItems(query);
    if(!items.length) return;
    
    const wrapper = this.domElement.querySelector("#homePageContent")
    if(!wrapper) return;
    wrapper.innerHTML = "";
    for(const item of items){
      const contentTitle = item.Title || "";
      const contentDescription = item.Description || ""
      wrapper.innerHTML+= HomePage.homePageContent
      .replace("__KEY_CONTENT_TITLE__",contentTitle)
      .replace("__KEY_CONTENT_DESCRIPTION__",contentDescription)
    }
  }

  protected onInit(): Promise<void> {
    this.siteUrl = this.context.pageContext.web.absoluteUrl
    this.loadCSS();
   

    // Listen for browser Back/Forward navigation
    window.onpopstate = () => {
      this.render();
    };

    return Promise.resolve();

  }

   private loadCSS(): void {
    SPComponentLoader.loadCss(`${this.siteUrl}/SiteAssets/resources/css/jquery-ui.css`);
    

  }

    private loadHomeScripts(): void {
    const siteAssetsUrl = `${this.siteUrl}/SiteAssets`;
    

      
     SPComponentLoader.loadScript(`${siteAssetsUrl}/resources/js/jquery-ui.js`)
      
      .catch(err => console.error('JS Load Error:', err));
  }
 


  //  private formatHtmlContent(content: string): string {
  //   if (!content) return '';
   
  //   let formatted = content;
  //   formatted = formatted.replace(/\r?\n/g, '<br>');
  //   formatted = formatted.replace(/  /g, ' &nbsp;');
  //   formatted = `<div class="announcement-content">${formatted}</div>`;
   
  //   return formatted;
  // }

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
