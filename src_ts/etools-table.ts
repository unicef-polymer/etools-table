import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import '@shoelace-style/shoelace/dist/components/checkbox/checkbox.js';
import {LitElement, html, css, property} from 'lit-element';
import {ifDefined} from 'lit-html/directives/if-defined';

import {etoolsTableStyles} from './styles/table-styles';
import {etoolsTableResponsiveStyles} from './styles/table-responsive-styles';
import {gridLayoutStylesLit} from './styles/grid-layout-styles';
import {fireEvent, toggleAttributeValue} from './utils/utils';
import {prettyDate} from './utils/date-utility';
import './pagination/etools-pagination';
import get from 'lodash-es/get';
import {EtoolsPaginator} from './pagination/etools-pagination';

export type EtoolsTableColumn = {
  label?: string;
  name?: string;
  type?: string;
  sort?: string;
  link_tmpl?: string;
  isExternalLink?: string;
  capitalize?: boolean;
  placeholder?: string;
  customMethod?: any;
  sortMethod?: string;
  cssClass?: string;
};

export type EtoolsTableChildRow = {
  rowHTML?: any;
  showExpanded?: boolean;
};

export enum EtoolsTableColumnType {
  Text = 'Text',
  Date = 'Date',
  Link = 'Link',
  Number = 'Number',
  Checkbox = 'Checkbox',
  Custom = 'Custom'
}

export enum EtoolsTableColumnSort {
  Asc = 'asc',
  Desc = 'desc'
}

export enum EtoolsTableActionType {
  Edit = 'Edit',
  Delete = 'Delete',
  Copy = 'Copy',
  View = 'View'
}

export class EtoolsTable extends LitElement {
  static get styles() {
    return [etoolsTableResponsiveStyles, etoolsTableStyles, gridLayoutStylesLit];
  }

  @property({type: String})
  dateFormat = 'D MMM YYYY';

  @property({type: Boolean, reflect: true, attribute: 'show-edit'})
  showEdit = false;

  @property({type: Boolean, reflect: true, attribute: 'show-delete'})
  showDelete = false;

  @property({type: Boolean, reflect: true, attribute: 'show-copy'})
  showCopy = false;

  @property({type: Boolean, reflect: true, attribute: 'show-view'})
  showView = false;

  @property({type: String})
  caption = '';

  @property({type: String})
  actionsLabel = 'Actions';

  @property({type: Array})
  columns: any[] = [];

  @property({type: Array})
  items: any[] = [];

  @property({type: Object})
  paginator: EtoolsPaginator | undefined;

  @property({type: String})
  defaultPlaceholder = '—';

  @property({type: Function})
  getChildRowTemplateMethod: ((item: any) => void) | undefined = undefined;

  @property({type: Function})
  setRowActionsVisibility: ((item: any) => void) | undefined = undefined;

  @property({type: Object})
  customData: any = {};

  @property({type: Boolean})
  showChildRows = false;

  @property({type: Object})
  extraCSS: any = css``;

  @property({type: Boolean})
  singleSort = false;

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

  getColumnHtml(column: any) {
    if (!Object.prototype.hasOwnProperty.call(column, 'sort')) {
      return html` <th class="${this.getColumnClassList(column)}">${column.label}</th> `;
    } else {
      return this.getColumnHtmlWithSort(column);
    }
  }

  getColumnHtmlWithSort(column: any) {
    return html`
      <th class="${this.getColumnClassList(column)}" @tap="${() => this.toggleAndSortBy(column)}">
        ${column.label}
        ${this.columnHasSort(column.sort) ? html`<sl-icon name="${this.getSortIcon(column.sort)}"> </sl-icon>` : ''}
      </th>
    `;
  }

  getLinkTmpl(pathTmpl: string, item: any, key: string, isExternalLink: boolean) {
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

  getRowDataHtml(item: any, showEdit: boolean, customData: any) {
    let childRow;
    if (this.showChildRows) {
      childRow = this.getChildRowTemplate(item);
    }
    const rowClass = this.showRowActions() ? 'row-editable' : 'row-non-editable';
    return html`
      <tr class="${rowClass}" comment-element=${ifDefined(item.commentElement ? item.commentElement : undefined)}>
        ${this.showChildRows
          ? html`<td class="expand-cell">
              <sl-icon
                @keydown="${this.callClickOnSpace}"
                expanded="${childRow.showExpanded}"
                @click="${this.toggleChildRow}"
                name="${this.getExpandIcon(childRow.showExpanded)}"
                tabindex="0"
              ></sl-icon>
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

  getChildRowTemplate(item: any) {
    let childRow;
    try {
      childRow = (this.getChildRowTemplateMethod && this.getChildRowTemplateMethod(item)) || {};
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

  getRowActionsTmpl(item: any) {
    const rowActionsVisibility = this.setRowActionsVisibility ? this.setRowActionsVisibility(item) : {};
    const {
      showEdit = this.showEdit,
      showDelete = this.showDelete,
      showCopy = this.showCopy,
      showView = this.showView
    } = rowActionsVisibility;
    return html`
      <div class="actions">
        <sl-icon-button
          ?hidden="${!showEdit}"
          name="plus-square-fill"
          @click="${() => this.triggerAction(EtoolsTableActionType.Edit, item)}"
          tabindex="0"
        ></sl-icon-button>
        <sl-icon-button
          ?hidden="${!showDelete}"
          name="trash3-fill"
          @click="${() => this.triggerAction(EtoolsTableActionType.Delete, item)}"
          tabindex="0"
        ></sl-icon-button>
        <sl-icon-button
          ?hidden="${!showCopy}"
          name="files"
          @click="${() => this.triggerAction(EtoolsTableActionType.Copy, item)}"
          tabindex="0"
        ></sl-icon-button>
        <sl-icon-button
          ?hidden="${!showView}"
          name="eye-fill"
          @click="${() => this.triggerAction(EtoolsTableActionType.View, item)}"
          tabindex="0"
        ></sl-icon-button>
      </div>
    `;
  }

  get paginationHtml() {
    const extraColsNo = this.showChildRows ? (this.showRowActions() ? 2 : 1) : this.showRowActions() ? 1 : 0;
    return html` <tr>
      <td class="pagination" colspan="${this.columns.length + extraColsNo}">
        <etools-pagination .paginator="${this.paginator}"></etools-pagination>
      </td>
    </tr>`;
  }

  showCaption(caption?: string) {
    return !caption;
  }

  // Columns
  getColumnClassList(column: any) {
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

  columnHasSort(sort: string) {
    return sort === EtoolsTableColumnSort.Asc || sort === EtoolsTableColumnSort.Desc;
  }

  getSortIcon(sort: string) {
    return sort === EtoolsTableColumnSort.Asc ? 'arrow-up-short' : 'arrow-down-short';
  }

  getExpandIcon(expanded: boolean) {
    return expanded === true ? 'chevron-down' : 'chevron-right';
  }

  toggleChildRow(ev: any) {
    const nextRow = ev.target.closest('tr').nextElementSibling;
    if (nextRow) {
      nextRow.classList.toggle('display-none');
    }
    toggleAttributeValue(ev.target, 'name', 'chevron-down', 'chevron-right');
  }

  callClickOnSpace(event: any) {
    if (event.key === ' ' && !event.ctrlKey) {
      // Cancel the default action, if needed
      event.preventDefault();
      // Trigger the button element with a click
      event.target.click();
      return false;
    }

    return true;
  }

  getColumnDetails(name: string) {
    const column = this.columns.find((c) => c.name === name);
    if (!column) {
      throw new Error(`[EtoolsTable.getColumnDetails]: column "${name}" not found`);
    }
    return column;
  }

  // Rows
  getRowDataColumnClassList(column: any) {
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

  getItemValue(item: any, column: any, showEdit: boolean, customData: any) {
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

  _getCheckbox(item: any, key: string, showEdit: boolean) {
    return html` <sl-checkbox
      ?checked="${this._getValueByKey(item, key, '', true)}"
      ?readonly="${!showEdit}"
      @sl-change="${(e: any) => this.triggerItemChanged(item, key, e.currentTarget.checked)}"
    >
    </sl-checkbox>`;
  }

  _getValueByKey(item: any, key: string, placeholder: string, ignorePlaceholder = false) {
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

  triggerAction(type: string, item: any) {
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

  toggleAndSortBy(column: any) {
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

  toggleColumnSort(sort: string) {
    return sort === EtoolsTableColumnSort.Asc ? EtoolsTableColumnSort.Desc : EtoolsTableColumnSort.Asc;
  }

  triggerItemChanged(item: any, field: string, filedValue: any) {
    const changedItem = Object.assign({}, item);
    changedItem[field] = filedValue;
    fireEvent(this, 'item-changed', changedItem);
  }
}
window.customElements.define('etools-table', EtoolsTable);
