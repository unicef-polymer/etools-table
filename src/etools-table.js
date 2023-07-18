var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import '@shoelace-style/shoelace/dist/components/checkbox/checkbox.js';
import { LitElement, html, css, property } from 'lit-element';
import { ifDefined } from 'lit-html/directives/if-defined';
import { etoolsTableStyles } from './styles/table-styles';
import { etoolsTableResponsiveStyles } from './styles/table-responsive-styles';
import { gridLayoutStylesLit } from './styles/grid-layout-styles';
import { fireEvent, toggleAttributeValue } from './utils/utils';
import { prettyDate } from './utils/date-utility';
import './pagination/etools-pagination';
import get from 'lodash-es/get';
export var EtoolsTableColumnType;
(function (EtoolsTableColumnType) {
    EtoolsTableColumnType["Text"] = "Text";
    EtoolsTableColumnType["Date"] = "Date";
    EtoolsTableColumnType["Link"] = "Link";
    EtoolsTableColumnType["Number"] = "Number";
    EtoolsTableColumnType["Checkbox"] = "Checkbox";
    EtoolsTableColumnType["Custom"] = "Custom";
})(EtoolsTableColumnType || (EtoolsTableColumnType = {}));
export var EtoolsTableColumnSort;
(function (EtoolsTableColumnSort) {
    EtoolsTableColumnSort["Asc"] = "asc";
    EtoolsTableColumnSort["Desc"] = "desc";
})(EtoolsTableColumnSort || (EtoolsTableColumnSort = {}));
export var EtoolsTableActionType;
(function (EtoolsTableActionType) {
    EtoolsTableActionType["Edit"] = "Edit";
    EtoolsTableActionType["Delete"] = "Delete";
    EtoolsTableActionType["Copy"] = "Copy";
    EtoolsTableActionType["View"] = "View";
})(EtoolsTableActionType || (EtoolsTableActionType = {}));
export class EtoolsTable extends LitElement {
    constructor() {
        super(...arguments);
        this.dateFormat = 'D MMM YYYY';
        this.showEdit = false;
        this.showDelete = false;
        this.showCopy = false;
        this.showView = false;
        this.caption = '';
        this.actionsLabel = 'Actions';
        this.columns = [];
        this.items = [];
        this.defaultPlaceholder = '—';
        this.getChildRowTemplateMethod = undefined;
        this.setRowActionsVisibility = undefined;
        this.customData = {};
        this.showChildRows = false;
        this.extraCSS = css ``;
        this.singleSort = false;
    }
    static get styles() {
        return [etoolsTableResponsiveStyles, etoolsTableStyles, gridLayoutStylesLit];
    }
    render() {
        this.showChildRows = !!this.getChildRowTemplateMethod;
        return html `
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
            ${this.showChildRows ? html `<th class="expand-cell"></th>` : ''}
            ${this.columns.map((column) => this.getColumnHtml(column))} ${this.showRowActions() ? html `<th></th>` : ''}
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
            return html ` <th class="${this.getColumnClassList(column)}">${column.label}</th> `;
        }
        else {
            return this.getColumnHtmlWithSort(column);
        }
    }
    getColumnHtmlWithSort(column) {
        return html `
      <th class="${this.getColumnClassList(column)}" @tap="${() => this.toggleAndSortBy(column)}">
        ${column.label}
        ${this.columnHasSort(column.sort) ? html `<sl-icon name="${this.getSortIcon(column.sort)}"> </sl-icon>` : ''}
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
            ? html `<a class="" @click="${() => (window.location.href = aHref)}" href="#">${item[key]}</a>`
            : html `<a class="" href="${aHref}">${item[key]}</a>`;
    }
    getRowDataHtml(item, showEdit, customData) {
        let childRow;
        if (this.showChildRows) {
            childRow = this.getChildRowTemplate(item);
        }
        const rowClass = this.showRowActions() ? 'row-editable' : 'row-non-editable';
        return html `
      <tr class="${rowClass}" comment-element=${ifDefined(item.commentElement ? item.commentElement : undefined)}>
        ${this.showChildRows
            ? html `<td class="expand-cell">
              <sl-icon
                @keydown="${this.callClickOnSpace}"
                expanded="${childRow.showExpanded}"
                @click="${this.toggleChildRow}"
                name="${this.getExpandIcon(childRow.showExpanded)}"
                tabindex="0"
              ></sl-icon>
            </td>`
            : ''}
        ${this.columns.map((col) => html `<td data-label="${col.label}" class="${this.getRowDataColumnClassList(col)}">
            ${this.getItemValue(item, col, showEdit, customData)}
          </td>`)}
        ${this.showRowActions()
            ? html `<td data-label="${this.actionsLabel}" class="row-actions">&nbsp;${this.getRowActionsTmpl(item)}</td>`
            : ''}
      </tr>
      ${childRow !== undefined ? childRow.rowHTML : ''}
    `;
    }
    getChildRowTemplate(item) {
        let childRow;
        try {
            childRow = (this.getChildRowTemplateMethod && this.getChildRowTemplateMethod(item)) || {};
        }
        catch (err) {
            console.log(err);
            childRow = {};
        }
        childRow.rowHTML = html `
      <tr class="child-row${childRow.showExpanded ? '' : ' display-none'}">
        ${childRow.rowHTML}
      </tr>
    `;
        return childRow;
    }
    getRowActionsTmpl(item) {
        const rowActionsVisibility = this.setRowActionsVisibility ? this.setRowActionsVisibility(item) : {};
        const { showEdit = this.showEdit, showDelete = this.showDelete, showCopy = this.showCopy, showView = this.showView } = rowActionsVisibility;
        return html `
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
        return html ` <tr>
      <td class="pagination" colspan="${this.columns.length + extraColsNo}">
        <etools-pagination .paginator="${this.paginator}"></etools-pagination>
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
        return sort === EtoolsTableColumnSort.Asc ? 'arrow-up-short' : 'arrow-down-short';
    }
    getExpandIcon(expanded) {
        return expanded === true ? 'chevron-down' : 'chevron-right';
    }
    toggleChildRow(ev) {
        const nextRow = ev.target.closest('tr').nextElementSibling;
        if (nextRow) {
            nextRow.classList.toggle('display-none');
        }
        toggleAttributeValue(ev.target, 'name', 'chevron-down', 'chevron-right');
    }
    callClickOnSpace(event) {
        if (event.key === ' ' && !event.ctrlKey) {
            // Cancel the default action, if needed
            event.preventDefault();
            // Trigger the button element with a click
            event.target.click();
            return false;
        }
        return true;
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
        return html ` <sl-checkbox
      ?checked="${this._getValueByKey(item, key, '', true)}"
      ?readonly="${!showEdit}"
      @sl-change="${(e) => this.triggerItemChanged(item, key, e.currentTarget.checked)}"
    >
    </sl-checkbox>`;
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
__decorate([
    property({ type: String })
], EtoolsTable.prototype, "dateFormat", void 0);
__decorate([
    property({ type: Boolean, reflect: true, attribute: 'show-edit' })
], EtoolsTable.prototype, "showEdit", void 0);
__decorate([
    property({ type: Boolean, reflect: true, attribute: 'show-delete' })
], EtoolsTable.prototype, "showDelete", void 0);
__decorate([
    property({ type: Boolean, reflect: true, attribute: 'show-copy' })
], EtoolsTable.prototype, "showCopy", void 0);
__decorate([
    property({ type: Boolean, reflect: true, attribute: 'show-view' })
], EtoolsTable.prototype, "showView", void 0);
__decorate([
    property({ type: String })
], EtoolsTable.prototype, "caption", void 0);
__decorate([
    property({ type: String })
], EtoolsTable.prototype, "actionsLabel", void 0);
__decorate([
    property({ type: Array })
], EtoolsTable.prototype, "columns", void 0);
__decorate([
    property({ type: Array })
], EtoolsTable.prototype, "items", void 0);
__decorate([
    property({ type: Object })
], EtoolsTable.prototype, "paginator", void 0);
__decorate([
    property({ type: String })
], EtoolsTable.prototype, "defaultPlaceholder", void 0);
__decorate([
    property({ type: Function })
], EtoolsTable.prototype, "getChildRowTemplateMethod", void 0);
__decorate([
    property({ type: Function })
], EtoolsTable.prototype, "setRowActionsVisibility", void 0);
__decorate([
    property({ type: Object })
], EtoolsTable.prototype, "customData", void 0);
__decorate([
    property({ type: Boolean })
], EtoolsTable.prototype, "showChildRows", void 0);
__decorate([
    property({ type: Object })
], EtoolsTable.prototype, "extraCSS", void 0);
__decorate([
    property({ type: Boolean })
], EtoolsTable.prototype, "singleSort", void 0);
window.customElements.define('etools-table', EtoolsTable);
