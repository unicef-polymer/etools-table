import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-checkbox/paper-checkbox.js';
import {LitElement, html, css} from 'lit-element/lit-element.js';

import {etoolsTableStyles} from './styles/etools-table-styles.js';
import {etoolsTableResponsiveStyles} from './styles/etools-table-responsive-styles.js';
import {gridLayoutStylesLit} from './styles/grid-layout-styles.js';
import {fireEvent, toggleAttributeValue} from './utils/utils.js';
import {prettyDate} from './utils/date-utility.js';
import './pagination/etools-pagination.js';
import get from 'lodash-es/get';

export const EtoolsTableColumn = {
  label: 'label', // column header label
  name: 'name', // property name from item object
  type: 'type',
  sort: 'sort',
  /**
   * used only for EtoolsTableColumnType.Link to specify url template (route with a single param)
   * ex: `${ROOT_PATH}assessments/:id/details`
   *    - id will be replaced with item object id property
   */
  link_tmpl: 'link_tmpl',
  isExternalLink: 'isExternalLink',
  capitalize: 'capitalize',
  placeholder: 'placeholder',
  customMethod: 'customMethod',
  sortMethod: 'sortMethod',
  cssClass: ''
};

export const EtoolsTableChildRow = {
  rowHTML: '',
  showExpanded: false
};

export const EtoolsTableColumnType = {
  Text: 'Text',
  Date: 'Date',
  Link: 'Link',
  Number: 'Number',
  Checkbox: 'Checkbox',
  Custom: 'Custom'
};

export const EtoolsTableColumnSort = {
  Asc: 'asc',
  Desc: 'desc'
};

export const EtoolsTableActionType = {
  Edit: 'Edit',
  Delete: 'Delete',
  Copy: 'Copy',
  View: 'View'
};

class EtoolsTable extends LitElement {
  static get styles() {
    return [etoolsTableResponsiveStyles, etoolsTableStyles, gridLayoutStylesLit];
  }

  static get properties() {
    return {
      dateFormat: {type: String, value: 'D MMM YYYY'},
      showEdit: {type: Boolean, reflect: true},
      showDelete: {type: Boolean, reflect: true},
      showCopy: {type: Boolean, reflect: true},
      showView: {type: Boolean, reflect: true},
      caption: {type: String},
      actionsLabel: {type: String},
      columns: {type: Array},
      items: {type: Array},
      paginator: {type: Object},
      defaultPlaceholder: {type: String},
      getChildRowTemplateMethod: {type: Function},
      setRowActionsVisibility: {type: Function},
      customData: {type: Object},
      showChildRows: {type: Boolean},
      extraCSS: {type: Object},
      singleSort: {type: Boolean, value: false},
      language: {type: String}
    };
  }

  constructor() {
    super();
    this.initializeProperties();
  }

  initializeProperties() {
    this.columns = [];
    this.items = [];
    this.actionsLabel = 'Actions';
    this.caption = '';
    this.defaultPlaceholder = '—';
    this.extraCSS = css``;
    this.singleSort = false;
    if (!this.language) {
      this.language = window.localStorage.defaultLanguage || 'en';
    }
    this.handleLanguageChange = this.handleLanguageChange.bind(this);
  }

  handleLanguageChange(e) {
    this.language = e.detail.language;
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('language-changed', this.handleLanguageChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('language-changed', this.handleLanguageChange);
  }

  render() {
    this.showChildRows = !!this.getChildRowTemplateMethod;
    return html`
      <style>
        ${this
          .extraCSS}
        /*
         * Do not use transparent colors here, it will make the chk border darker.
         * rgba(117, 117, 117) is the equivalent of --secondary-text-color
         */
        paper-checkbox[readonly] {
          --paper-checkbox-checked-color: rgba(117, 117, 117);
        }
        table td {
          line-height: 24px;
        }
      </style>
      <table>
        <caption ?hidden="${this.showCaption(this.caption)}">
          ${this.caption}
        </caption>
        <thead>
          <tr>
            ${this.showChildRows ? html`<th class="expand-cell"></th>` : ''}
            ${this.columns.map((column) => this.getColumnHtml(column))} ${this.showRowActions() ? html`<th></th>` : ''}
          </tr>
        </thead>
        <tbody>
          ${this.items.map((item) => this.getRowDataHtml(item, this.showEdit, this.customData))}
          ${this.paginator ? this.paginationHtml : ''}
        </tbody>
      </table>
    `;
  }

  getColumnHtml(column) {
    if (!Object.prototype.hasOwnProperty.call(column, 'sort')) {
      return html` <th class="${this.getColumnClassList(column)}">${column.label}</th> `;
    } else {
      return this.getColumnHtmlWithSort(column);
    }
  }

  getColumnHtmlWithSort(column) {
    return html`
      <th class="${this.getColumnClassList(column)}" @tap="${() => this.toggleAndSortBy(column)}">
        ${column.label}
        ${this.columnHasSort(column.sort)
          ? html`<iron-icon .icon="${this.getSortIcon(column.sort)}"> </iron-icon>`
          : ''}
      </th>
    `;
  }

  getLinkTmpl(pathTmpl, item, key, isExternalLink) {
    if (!pathTmpl) {
      throw new Error(`[EtoolsTable.getLinkTmpl]: column "${item[key]}" has no link tmpl defined`);
    }
    const path = pathTmpl.split('/');
    path.forEach((p, index) => {
      if (p.slice(0, 1) === ':') {
        const param = p.slice(1);
        path[index] = item[param];
      }
    });
    const aHref = path.join('/');
    return isExternalLink
      ? html`<a class="" @click="${() => (window.location.href = aHref)}" href="#">${item[key]}</a>`
      : html`<a class="" href="${aHref}">${item[key]}</a>`;
  }

  getRowDataHtml(item, showEdit, customData) {
    let childRow;
    if (this.showChildRows) {
      childRow = this.getChildRowTemplate(item);
    }
    const rowClass = this.showRowActions() ? 'row-editable' : 'row-non-editable';
    return html`
      <tr class="${rowClass}">
        ${this.showChildRows
          ? html`<td class="expand-cell">
              <iron-icon
                @keydown="${this.callClickOnSpace}"
                expanded="${childRow.showExpanded}"
                @tap="${this.toggleChildRow}"
                icon="${this.getExpandIcon(childRow.showExpanded)}"
                tabindex="0"
              ></iron-icon>
            </td>`
          : ''}
        ${this.columns.map(
          (col) => html`<td data-label="${col.label}" class="${this.getRowDataColumnClassList(col)}">
            ${this.getItemValue(item, col, showEdit, customData)}
          </td>`
        )}
        ${this.showRowActions()
          ? html`<td data-label="${this.actionsLabel}" class="row-actions">&nbsp;${this.getRowActionsTmpl(item)}</td>`
          : ''}
      </tr>
      ${childRow !== undefined ? childRow.rowHTML : ''}
    `;
  }

  getChildRowTemplate(item) {
    let childRow;
    try {
      childRow = this.getChildRowTemplateMethod(item) || {};
    } catch (err) {
      console.log(err);
      childRow = {};
    }
    childRow.rowHTML = html`
      <tr class="child-row${childRow.showExpanded ? '' : ' display-none'}">
        ${childRow.rowHTML}
      </tr>
    `;
    return childRow;
  }

  getRowActionsTmpl(item) {
    const rowActionsVisibility = this.setRowActionsVisibility ? this.setRowActionsVisibility(item) : {};
    const {
      showEdit = this.showEdit,
      showDelete = this.showDelete,
      showCopy = this.showCopy,
      showView = this.showView
    } = rowActionsVisibility;
    return html`
      <div class="actions">
        <paper-icon-button
          ?hidden="${!showEdit}"
          icon="create"
          @tap="${() => this.triggerAction(EtoolsTableActionType.Edit, item)}"
          tabindex="0"
        ></paper-icon-button>
        <paper-icon-button
          ?hidden="${!showDelete}"
          icon="delete"
          @tap="${() => this.triggerAction(EtoolsTableActionType.Delete, item)}"
          tabindex="0"
        ></paper-icon-button>
        <paper-icon-button
          ?hidden="${!showCopy}"
          icon="content-copy"
          @tap="${() => this.triggerAction(EtoolsTableActionType.Copy, item)}"
          tabindex="0"
        ></paper-icon-button>
        <paper-icon-button
          ?hidden="${!showView}"
          icon="icons:visibility"
          @tap="${() => this.triggerAction(EtoolsTableActionType.View, item)}"
          tabindex="0"
        ></paper-icon-button>
      </div>
    `;
  }

  get paginationHtml() {
    const extraColsNo = this.showChildRows ? (this.showRowActions ? 2 : 1) : this.showRowActions ? 1 : 0;
    return html` <tr>
      <td class="pagination" colspan="${this.columns.length + extraColsNo}">
        <etools-pagination .paginator="${this.paginator}" .language="${this.language}"></etools-pagination>
      </td>
    </tr>`;
  }

  showCaption(caption) {
    return !caption;
  }

  // Columns
  getColumnClassList(column) {
    const classList = [];

    if (column.type === EtoolsTableColumnType.Number) {
      classList.push('align-right');
    }

    if (Object.prototype.hasOwnProperty.call(column, 'sort')) {
      classList.push('sort');
    }

    if (column.cssClass) {
      classList.push(column.cssClass);
    }

    return classList.join(' ');
  }

  columnHasSort(sort) {
    return sort === EtoolsTableColumnSort.Asc || sort === EtoolsTableColumnSort.Desc;
  }

  getSortIcon(sort) {
    return sort === EtoolsTableColumnSort.Asc ? 'arrow-upward' : 'arrow-downward';
  }

  getExpandIcon(expanded) {
    return expanded === true ? 'expand-more' : 'chevron-right';
  }

  toggleChildRow(ev) {
    const nextRow = ev.target.closest('tr').nextElementSibling;
    if (nextRow) {
      nextRow.classList.toggle('display-none');
    }
    toggleAttributeValue(ev.target, 'icon', 'expand-more', 'chevron-right');
  }

  callClickOnSpace(event) {
    if (event.key === ' ' && !event.ctrlKey) {
      // Cancel the default action, if needed
      event.preventDefault();
      // Trigger the button element with a click
      event.target.click();
      return false;
    }
  }

  getColumnDetails(name) {
    const column = this.columns.find((c) => c.name === name);
    if (!column) {
      throw new Error(`[EtoolsTable.getColumnDetails]: column "${name}" not found`);
    }
    return column;
  }

  // Rows
  getRowDataColumnClassList(column) {
    let cssClass = column.cssClass ? column.cssClass : '';
    if (column.capitalize) {
      cssClass = `${cssClass} capitalize`;
    }

    switch (column.type) {
      case EtoolsTableColumnType.Number:
        return `${cssClass} align-right`;
      default:
        return cssClass;
    }
  }

  getColumnsKeys() {
    return this.columns.map((c) => c.name);
  }

  getItemValue(item, column, showEdit, customData) {
    // get column object to determine how data should be displayed (date, string, link, number...)
    const key = column.name;
    switch (column.type) {
      case EtoolsTableColumnType.Date:
        return item[key]
          ? prettyDate(item[key], this.dateFormat)
          : column.placeholder
          ? column.placeholder
          : this.defaultPlaceholder;
      case EtoolsTableColumnType.Link:
        return this.getLinkTmpl(column.link_tmpl, item, key, column.isExternalLink);
      case EtoolsTableColumnType.Checkbox:
        return this._getCheckbox(item, key, showEdit);
      case EtoolsTableColumnType.Custom:
        return column.customMethod
          ? column.customMethod(item, key, customData)
          : this._getValueByKey(item, key, column.placeholder);
      default:
        return this._getValueByKey(item, key, column.placeholder);
    }
  }

  _getCheckbox(item, key, showEdit) {
    return html` <paper-checkbox
      ?checked="${this._getValueByKey(item, key, '', true)}"
      ?readonly="${!showEdit}"
      @change="${(e) => this.triggerItemChanged(item, key, e.currentTarget.checked)}"
    >
    </paper-checkbox>`;
  }

  _getValueByKey(item, key, placeholder, ignorePlaceholder = false) {
    const value = get(item, key, '');

    if (!ignorePlaceholder && (!value || value === '')) {
      return placeholder ? placeholder : this.defaultPlaceholder;
    }
    return value;
  }

  // row actions
  showRowActions() {
    return this.setRowActionsVisibility || this.showDelete || this.showEdit || this.showView;
  }

  triggerAction(type, item) {
    if (!this.showRowActions()) {
      return;
    }
    switch (type) {
      case EtoolsTableActionType.Edit:
        fireEvent(this, 'edit-item', item);
        break;
      case EtoolsTableActionType.Delete:
        fireEvent(this, 'delete-item', item);
        break;
      case EtoolsTableActionType.Copy:
        fireEvent(this, 'copy-item', item);
        break;
      case EtoolsTableActionType.View:
        fireEvent(this, 'view-item', item);
        break;
    }
  }

  toggleAndSortBy(column) {
    if (column.sort === undefined) {
      return;
    }
    column.sort = this.toggleColumnSort(column.sort);
    if (this.singleSort) {
      this.columns.forEach((columnData) => {
        if (Object.prototype.hasOwnProperty.call(columnData, 'sort') && columnData.name !== column.name) {
          columnData.sort = null;
        }
      });
    }
    fireEvent(this, 'sort-change', [...this.columns]);
  }

  toggleColumnSort(sort) {
    return sort === EtoolsTableColumnSort.Asc ? EtoolsTableColumnSort.Desc : EtoolsTableColumnSort.Asc;
  }

  triggerItemChanged(item, field, filedValue) {
    const changedItem = Object.assign({}, item);
    changedItem[field] = filedValue;
    fireEvent(this, 'item-changed', changedItem);
  }
}
window.customElements.define('etools-table', EtoolsTable);
