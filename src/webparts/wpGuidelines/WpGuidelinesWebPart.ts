import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { SPHttpClient } from '@microsoft/sp-http';
import { SPComponentLoader } from '@microsoft/sp-loader';
import Guidelines from './GuidelinesUi';
import SharedSidebar from '../../SharedSidebar';
import * as strings from 'WpGuidelinesWebPartStrings';

export interface IWpGuidelinesWebPartProps {
  description: string;
}

export interface ISPGuideline {
  Id: number;
  Title: string;
  Description: string;
}

export default class WpGuidelinesWebPart extends BaseClientSideWebPart<IWpGuidelinesWebPartProps> {

  private siteUrl: string = '';

 protected onInit(): Promise<void> {
  this.siteUrl = this.context.pageContext.web.absoluteUrl;

  window.onpopstate = () => {
    void this.render();
  };

  return super.onInit();
}

  public async render(): Promise<void> {
  const resourceUrl = `${this.siteUrl}/SiteAssets`;

  this.domElement.innerHTML =
    SharedSidebar.getHtml({
      resourceUrl,
      siteUrl: this.siteUrl,
      activeNavItem: 'guidelines',
    }) +
    Guidelines.allElementsHtml.replace(/__KEY_URL_RESOURCE__/g, resourceUrl);

  this.loadCSS();
  await this.fetchAndRenderGuidelines();
  SharedSidebar.initBehavior(this.domElement, this.siteUrl);
  this.loadScripts();
}

  private async fetchAndRenderGuidelines(): Promise<void> {
    const apiUrl =
      `${this.siteUrl}/_api/web/lists/getbytitle('Guidelines')/items` +
      `?$select=Id,Title,Description&$orderby=ID asc&$top=500`;

    try {
      const response = await this.context.spHttpClient.get(apiUrl, SPHttpClient.configurations.v1);
      const data = await response.json();
      const items: ISPGuideline[] = data.value || [];

      const accordion = this.domElement.querySelector('#guidelines-accordion');
      if (!accordion) return;

      accordion.innerHTML = '';
      items.forEach((item, index) => {
        const num = index + 1;
        const collapseId = `guidelineCollapse${item.Id}`;
        const isFirst = index === 0;

        accordion.innerHTML += Guidelines.guidelinesContent
          .replace(/__KEY_OPEN_CLASS__/g, isFirst ? 'is-open' : '')
          .replace(/__KEY_COLLAPSE_ID__/g, collapseId)
          .replace(/__KEY_ARIA_EXPANDED__/g, isFirst ? 'true' : 'false')
          .replace(/__KEY_NUMBER__/g, String(num))
          .replace(/__KEY_TITLE__/g, item.Title || '')
          .replace(/__KEY_SHOW_CLASS__/g, isFirst ? 'show' : '')
          .replace(/__KEY_DESCRIPTION__/g, item.Description || '');
      });
    } catch (e) {
      console.error('Guidelines fetch error:', e);
    }
  }

  private loadCSS(): void {
    const base = `${this.siteUrl}/SiteAssets/resources/css`;
    
    SPComponentLoader.loadCss(`${base}/guidelines.css`);
    
  }

  private loadScripts(): void {
    const accordion = this.domElement.querySelector('#guidelines-accordion');
    if (!accordion) return;

    accordion.addEventListener('show.bs.collapse', (e: Event) => {
      (e.target as HTMLElement).closest('.accordion-item')?.classList.add('is-open');
    });
    accordion.addEventListener('hide.bs.collapse', (e: Event) => {
      (e.target as HTMLElement).closest('.accordion-item')?.classList.remove('is-open');
    });
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
