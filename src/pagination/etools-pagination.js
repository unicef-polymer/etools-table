var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, property } from 'lit-element';
import { etoolsPaginationStyles } from '../styles/pagination-style';
import { fireEvent } from '../utils/utils';
import { getTranslation } from '../utils/translate';
import '@shoelace-style/shoelace/dist/components/select/select.js';
import '@shoelace-style/shoelace/dist/components/option/option.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
// #region Paginator methods
export const defaultPaginator = {
    page: 1,
    page_size: 20,
    total_pages: 0,
    count: 0,
    visible_range: []
};
const computeTotalPages = (pageSize, totalResults) => {
    return pageSize < totalResults ? Math.ceil(totalResults / pageSize) : 1;
};
const computeVisibleRange = (paginator) => {
    let start = 1;
    let end = paginator.count;
    if (!paginator.count) {
        start = 0;
    }
    else {
        if (paginator.page !== 1) {
            start = (paginator.page - 1) * paginator.page_size + 1;
        }
        if (paginator.page !== paginator.total_pages) {
            end = start + (paginator.count < paginator.page_size ? paginator.count : paginator.page_size) - 1;
        }
    }
    return [start, end];
};
export const setPaginator = (paginator, data) => {
    paginator.count = Array.isArray(data) ? data.length : 0;
    paginator.total_pages = computeTotalPages(paginator.page_size, paginator.count);
    paginator.visible_range = computeVisibleRange(paginator);
};
export const getPaginatorWithBackend = (currentPaginator, count) => {
    count = parseInt(count, 10);
    if (isNaN(count)) {
        count = 0;
    }
    const paginator = Object.assign({}, currentPaginator);
    paginator.count = count;
    paginator.total_pages = computeTotalPages(paginator.page_size, paginator.count);
    paginator.visible_range = computeVisibleRange(paginator);
    return paginator;
};
export const getPagedData = (currentPaginator, data) => {
    try {
        return data.slice(currentPaginator.visible_range[0] - 1, currentPaginator.visible_range[1]);
    }
    catch (err) {
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
    constructor() {
        super();
        this.paginator = defaultPaginator;
        this.pageSizeOptions = [5, 10, 20, 50];
        this.language = 'en';
        this.direction = 'ltr';
        this.initializeProperties();
    }
    static get styles() {
        return [etoolsPaginationStyles];
    }
    initializeProperties() {
        this.pageSizeOptions = [5, 10, 20, 50];
        this.direction = 'ltr';
        if (!this.language) {
            this.language = window.localStorage.defaultLanguage || 'en';
            this.direction = this.language === 'ar' ? 'rtl' : 'ltr';
        }
    }
    render() {
        return html `
      <span class="pagination-item">
        <span id="rows">${getTranslation(this.language, 'ROWS_PER_PAGE')}</span>
        <sl-select size="small" hoist @sl-change="${this.onPageSizeChanged}" value="${this.paginator.page_size}">
          ${this.pageSizeOptions.map((sizeOption) => html `<sl-option value="${sizeOption}">${sizeOption}</sl-option>`)}
        </sl-select>
        <span id="range">
          ${this.paginator.visible_range[0]}-${this.paginator.visible_range[1]} ${getTranslation(this.language, 'OF')}
          ${this.paginator.count}
        </span>
      </span>

      <span class="pagination-item pagination-btns">
        <sl-icon-button
          name="${this.direction === 'ltr' ? 'chevron-bar-left' : 'chevron-bar-right'}"
          @click="${this.goToFirstPage}"
          ?disabled="${this.paginator.page === 1}"
        ></sl-icon-button>

        <sl-icon-button
          name="${this.direction === 'ltr' ? 'chevron-left' : 'chevron-right'}"
          @click="${this.pageLeft}"
          ?disabled="${this.paginator.page === 1}"
        ></sl-icon-button>

        <sl-icon-button
          name="${this.direction === 'ltr' ? 'chevron-right' : 'chevron-left'}"
          @click="${this.pageRight}"
          ?disabled="${this.paginator.page === this.paginator.total_pages}"
        ></sl-icon-button>

        <sl-icon-button
          name="${this.direction === 'ltr' ? 'chevron-bar-right' : 'chevron-bar-left'}"
          @click="${this.goToLastPage}"
          ?disabled="${this.paginator.page === this.paginator.total_pages}"
        ></sl-icon-button>
      </span>
    `;
    }
    connectedCallback() {
        super.connectedCallback();
        document.addEventListener('language-changed', this.handleLanguageChange.bind(this));
        console.log(this.paginator);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        document.removeEventListener('language-changed', this.handleLanguageChange.bind(this));
    }
    handleLanguageChange(e) {
        this.language = e.detail.language;
        this.direction = this.language === 'ar' ? 'rtl' : 'ltr';
    }
    goToFirstPage() {
        if (this.paginator.page > 1) {
            this.firePaginatorChangeEvent({ page: 1 });
        }
    }
    goToLastPage() {
        if (this.paginator.page < this.paginator.total_pages) {
            this.firePaginatorChangeEvent({ page: this.paginator.total_pages });
        }
    }
    pageLeft() {
        if (this.paginator.page > 1) {
            this.firePaginatorChangeEvent({ page: this.paginator.page - 1 });
        }
    }
    pageRight() {
        if (this.paginator.page < this.paginator.total_pages) {
            this.firePaginatorChangeEvent({ page: this.paginator.page + 1 });
        }
    }
    onPageSizeChanged(e) {
        if (!e.target.value) {
            return;
        }
        const newPageSize = Number(e.target.value);
        if (newPageSize !== this.paginator.page_size) {
            this.firePaginatorChangeEvent({ page: 1, page_size: newPageSize });
        }
    }
    firePaginatorChangeEvent(paginatorData) {
        fireEvent(this, 'paginator-change', Object.assign({}, this.paginator, paginatorData));
    }
}
__decorate([
    property({ type: Object })
], EtoolsPagination.prototype, "paginator", void 0);
__decorate([
    property({ type: Array })
], EtoolsPagination.prototype, "pageSizeOptions", void 0);
__decorate([
    property({ type: String })
], EtoolsPagination.prototype, "language", void 0);
__decorate([
    property({ type: String })
], EtoolsPagination.prototype, "direction", void 0);
window.customElements.define('etools-pagination', EtoolsPagination);
