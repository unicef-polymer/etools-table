import {customElement, LitElement, html, property, TemplateResult} from 'lit-element/lit-element.js';

export enum EtoolsTableColumnType {
  Text,
  Date,
  Link,
  Number,
  Checkbox,
  Custom
}

export enum EtoolsTableColumnSort {
  Asc = 'asc',
  Desc = 'desc'
}

export interface EtoolsTableColumn {
  label: string; // column header label
  name: string; // property name from item object
  type: EtoolsTableColumnType;
  sort?: EtoolsTableColumnSort;
  /**
   * used only for EtoolsTableColumnType.Link to specify url template (route with a single param)
   * ex: `${ROOT_PATH}assessments/:id/details`
   *    - id will be replaced with item object id property
   */
  link_tmpl?: string;
  isExternalLink?: boolean;
  capitalize?: boolean;
  placeholder?: string;
  customMethod?: Function;
}

export enum EtoolsTableActionType {
  Edit,
  Delete,
  Copy
}

/**
 * `etools-table`
 */
declare class EtoolsTable extends LitElement {
  dateFormat: string | null | undefined;
  showEdit: boolean | null | undefined;
  showDelete: boolean | null | undefined;
  showCopy: boolean | null | undefined;
  caption: string | null | undefined;
  actionsLabel: string | null | undefined;
  columns: any[] | null | undefined;
  items: any[] | null | undefined;
  paginator: object | null | undefined;
  defaultPlaceholder: string | null | undefined;

  getColumnHtml(column: EtoolsTableColumn): TemplateResult;
  getColumnHtmlWithSort(column: EtoolsTableColumn): TemplateResult;
  getLinkTmpl(pathTmpl: string | undefined, item: any, key: string, isExternalLink?: boolean): TemplateResult;
  getRowDataHtml(item: any, showEdit: boolean): TemplateResult;
  getRowActionsTmpl(item: any): TemplateResult;
  get paginationHtml(): TemplateResult;
  showCaption(caption: string): boolean;
  getColumnClassList(column: EtoolsTableColumn): string;
  columnHasSort(sort: EtoolsTableColumnSort | undefined): boolean;
  getSortIcon(sort: EtoolsTableColumnSort): string;
  getColumnDetails(name: string): EtoolsTableColumn;
  getRowDataColumnClassList(key: string): string;
  getColumnsKeys(): string[];
  getItemValue(item: any, key: string, showEdit: boolean): any;
  _getCheckbox(item: any, key: string, showEdit: boolean): TemplateResult;
  _getValueByKey(item: any, key: string, placeholder?: string, ignorePlaceholder: boolean = false): any;
  showRowActions(): boolean;
  triggerAction(type: EtoolsTableActionType, item: any): void;
  toggleAndSortBy(column: EtoolsTableColumn): void;
  toggleColumnSort(sort: EtoolsTableColumnSort): EtoolsTableColumnSort;
  triggerItemChanged(item: any, field: string, filedValue: any): void;
}

declare global {

  interface HTMLElementTagNameMap {
    "etools-table": EtoolsTable;
  }
}
