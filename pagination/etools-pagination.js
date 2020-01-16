import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-item/paper-item.js';

import {customElement, LitElement, html, property} from 'lit-element/lit-element.js';
import {etoolsPaginationStyles} from './etools-pagination-style.js';
import {fireEvent} from '../utils/fire-custom-event.js';

// #region Paginator methods
export const defaultPaginator = {
  page: 1,
  page_size: 20,
  total_pages: 0,
  count: 0,
  visible_range: []
}

const updatePaginatorTotalResults = (data) => {
  if (data && data.count) {
    const count = parseInt(data.count, 10);
    if (!isNaN(count)) {
      return count;
    }
  }
  return 0;
}

const computeTotalPages = (pageSize, totalResults) => {
  return (pageSize < totalResults) ? Math.ceil(totalResults / pageSize) : 1;
}

const computeVisibleRange = (paginator) => {
  let start = 1;
  let end = paginator.count;
  if (!paginator.count) {
    start = 0;
  } else {
    if (paginator.page !== 1) {
      start = (paginator.page - 1) * paginator.page_size + 1;
    }
    if (paginator.page !== paginator.total_pages) {
      end = start + (paginator.count < paginator.page_size ? paginator.count : paginator.page_size) - 1;
    }
  }

  return [start, end];
}

export const setPaginator = (paginator, data) => {
  paginator.count = updatePaginatorTotalResults(data);
  paginator.total_pages = computeTotalPages(paginator.page_size, paginator.count);
  paginator.visible_range = computeVisibleRange(paginator);
};

export const getPagedData = (currentPaginator, data) => {
  try {
    return data.slice(currentPaginator.visible_range[0] - 1, currentPaginator.visible_range[1]);
  } catch (err) {
    console.log(err);
  }
  return [];
};

// #endregion

/**
 * TODO: add some page btns between page navigation controls
 * @customElement
 * @LitElement
 */

export class EtoolsPagination extends LitElement {

  static get styles() {
    return [etoolsPaginationStyles];
  }

  static get properties() {
    return {
      paginator: {type: Object},
      pageSizeOptions: {type: Array},
    };
  }

  constructor() {
    super();
    this.initializeProperties();
  }

  initializeProperties() {
    this.pageSizeOptions = [5, 10, 20, 50];
  }

  render() {
    return html`
      <span class="pagination-item">
        <span id="rows">Rows per page:</span>
        <paper-dropdown-menu vertical-align="bottom" horizontal-align="left" noink no-label-float
          @value-changed="${this.onPageSizeChanged}">
          <paper-listbox slot="dropdown-content" attr-for-selected="name" .selected="${this.paginator.page_size}">
            ${this.pageSizeOptions.map((sizeOption) => html`<paper-item name="${sizeOption}">
              ${sizeOption}</paper-item>`)}
          </paper-listbox>
        </paper-dropdown-menu>
        <span id="range">
          ${this.paginator.visible_range[0]}-${this.paginator.visible_range[1]} of ${this.paginator.count}
        </span>
      </span>

      <span class="pagination-item pagination-btns">
        <paper-icon-button icon="first-page" @tap="${this.goToFirstPage}"
                           ?disabled="${this.paginator.page === 1}"></paper-icon-button>

        <paper-icon-button icon="chevron-left" @tap="${this.pageLeft}"
                           ?disabled="${this.paginator.page === 1}"></paper-icon-button>

        <paper-icon-button icon="chevron-right" @tap="${this.pageRight}"
                           ?disabled="${this.paginator.page === this.paginator.total_pages}"></paper-icon-button>

        <paper-icon-button icon="last-page" @tap="${this.goToLastPage}"
                           ?disabled="${this.paginator.page === this.paginator.total_pages}"></paper-icon-button>
      </span>

    `;
  }

  goToFirstPage() {
    if (this.paginator.page > 1) {
      this.firePaginatorChangeEvent({page: 1});
    }
  }

  goToLastPage() {
    if (this.paginator.page < this.paginator.total_pages) {
      this.firePaginatorChangeEvent({page: this.paginator.total_pages});
    }
  }

  pageLeft() {
    if (this.paginator.page > 1) {
      this.firePaginatorChangeEvent({page: this.paginator.page - 1});
    }
  }

  pageRight() {
    if (this.paginator.page < this.paginator.total_pages) {
      this.firePaginatorChangeEvent({page: this.paginator.page + 1});
    }
  }

  onPageSizeChanged(e) {
    if (!e.detail.value) {
      return;
    }
    const newPageSize = Number(e.detail.value);
    if (newPageSize !== this.paginator.page_size) {
      this.firePaginatorChangeEvent({page: 1, page_size: newPageSize});
    }
  }

  firePaginatorChangeEvent(paginatorData) {
    fireEvent(this, 'paginator-change', Object.assign({}, this.paginator, paginatorData));
  }

}
window.customElements.define('etools-pagination', EtoolsPagination);
