import {customElement, LitElement, html, property, TemplateResult} from 'lit-element/lit-element.js';

/**
 * `etools-pagination`
 */
declare class EtoolsPagination extends LitElement {
  paginator: object | null | undefined;
  pageSizeOptions: any[] | null | undefined;

  goToFirstPage(): void;
  goToLastPage(): void;
  pageLeft(): void;
  pageRight(): void;
  onPageSizeChanged(e: any): void;
  firePaginatorChangeEvent(paginatorData: any): void;
}

export interface EtoolsPaginator {
  page: number;
  page_size: number;
  total_pages: number;
  count: number;
  visible_range: string[] | number[];
}

export const defaultPaginator: {
  page: 1,
  page_size: 20,
  total_pages: 0,
  count: 0,
  visible_range: []
};

declare function getPaginator(currentPaginator: EtoolsPaginator, data: any): EtoolsPaginator;

declare global {

  interface HTMLElementTagNameMap {
    "etools-pagination": EtoolsPagination;
  }
}
