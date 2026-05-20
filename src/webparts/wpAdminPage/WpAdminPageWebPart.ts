import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import AdminPage from './AdminPageUi';
import { SPComponentLoader } from '@microsoft/sp-loader';
import * as strings from 'WpAdminPageWebPartStrings';
import SharedSidebar from '../../SharedSidebar';

export interface IWpAdminPageWebPartProps {
  description: string;
}

export default class WpAdminPageWebPart extends BaseClientSideWebPart<IWpAdminPageWebPartProps> {

private siteUrl: string = '';

  public render(): void {
      const resourceUrl = `${this.siteUrl}/SiteAssets`;
      const metadataUrl = `${this.siteUrl}/SitePages/AdvancedSearch.aspx`;
      const employeeUrl = `${this.siteUrl}/SitePages/Employees.aspx`;

      this.domElement.innerHTML =
        SharedSidebar.getHtml({
          resourceUrl,
          siteUrl: this.siteUrl,
          activeNavItem: '',
          activeTabId: '',
        }) +
        AdminPage.allElementsHtml
        .replace(/__KEY_URL_RESOURCE__/g, resourceUrl)
        .replace("__KEY_MASTERDATA_URL__", metadataUrl)
        .replace("__KEY_EMPLOYEES_URL__", employeeUrl)
      // ── Sidebar init — no timeout needed ─────────────────────────────────
      SharedSidebar.initBehavior(this.domElement, this.siteUrl);
      this.initWhenReady();
  
     
    }
  

private initWhenReady(): void {
  if ((window as any).bootstrap) {
    SharedSidebar.initBehavior(this.domElement, this.siteUrl);
    return;
  }
  // Bootstrap not ready yet — poll until it is
  let attempts = 0;
  const interval = setInterval(() => {
    attempts++;
    if ((window as any).bootstrap) {
      clearInterval(interval);
      SharedSidebar.initBehavior(this.domElement, this.siteUrl);
    } else if (attempts > 20) {
      clearInterval(interval);
      // Bootstrap never loaded — init anyway so rest of sidebar works
      SharedSidebar.initBehavior(this.domElement, this.siteUrl);
      console.warn('[NEMKO] Bootstrap not found after waiting');
    }
  }, 100);
}

protected onInit(): Promise<void> {
    this.siteUrl = this.context.pageContext.web.absoluteUrl;
    this.loadCSS();

    window.onpopstate = () => {
      this.render();
    };

    return Promise.resolve();
  }

   private loadCSS(): void {
      SPComponentLoader.loadCss(`${this.siteUrl}/SiteAssets/resources/css/jquery-ui.css`);
      SPComponentLoader.loadCss(`${this.siteUrl}/SiteAssets/resources/css/qualification-db.css`);
      SPComponentLoader.loadCss(`${this.siteUrl}/SiteAssets/resources/css/admin.css`);
      // ← removed setTimeout loadHomeScripts — render() calls it directly
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
