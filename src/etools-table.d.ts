import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import '@shoelace-style/shoelace/dist/components/checkbox/checkbox.js';
import { LitElement } from 'lit-element';
import './pagination/etools-pagination';
import { EtoolsPaginator } from './pagination/etools-pagination';
export declare type EtoolsTableColumn = {
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
export declare type EtoolsTableChildRow = {
    rowHTML?: any;
    showExpanded?: boolean;
};
export declare enum EtoolsTableColumnType {
    Text = "Text",
    Date = "Date",
    Link = "Link",
    Number = "Number",
    Checkbox = "Checkbox",
    Custom = "Custom"
}
export declare enum EtoolsTableColumnSort {
    Asc = "asc",
    Desc = "desc"
}
export declare enum EtoolsTableActionType {
    Edit = "Edit",
    Delete = "Delete",
    Copy = "Copy",
    View = "View"
}
export declare class EtoolsTable extends LitElement {
    static get styles(): import("lit-element").CSSResult[];
    dateFormat: string;
    showEdit: boolean;
    showDelete: boolean;
    showCopy: boolean;
    showView: boolean;
    caption: string;
    actionsLabel: string;
    columns: any[];
    items: any[];
    paginator: EtoolsPaginator | undefined;
    defaultPlaceholder: string;
    getChildRowTemplateMethod: Function | undefined;
    setRowActionsVisibility: Function | undefined;
    customData: any;
    showChildRows: boolean;
    extraCSS: any;
    singleSort: boolean;
    render(): import("lit-element").TemplateResult;
    getColumnHtml(column: any): import("lit-element").TemplateResult;
    getColumnHtmlWithSort(column: any): import("lit-element").TemplateResult;
    getLinkTmpl(pathTmpl: string, item: any, key: string, isExternalLink: boolean): import("lit-element").TemplateResult;
    getRowDataHtml(item: any, showEdit: boolean, customData: any): import("lit-element").TemplateResult;
    getChildRowTemplate(item: any): any;
    getRowActionsTmpl(item: any): import("lit-element").TemplateResult;
    get paginationHtml(): import("lit-element").TemplateResult;
    showCaption(caption?: string): boolean;
    getColumnClassList(column: any): string;
    columnHasSort(sort: string): boolean;
    getSortIcon(sort: string): "arrow-up-short" | "arrow-down-short";
    getExpandIcon(expanded: boolean): "chevron-right" | "chevron-down";
    toggleChildRow(ev: any): void;
    callClickOnSpace(event: any): boolean;
    getColumnDetails(name: string): any;
    getRowDataColumnClassList(column: any): any;
    getColumnsKeys(): any[];
    getItemValue(item: any, column: any, showEdit: boolean, customData: any): any;
    _getCheckbox(item: any, key: string, showEdit: boolean): import("lit-element").TemplateResult;
    _getValueByKey(item: any, key: string, placeholder: string, ignorePlaceholder?: boolean): any;
    showRowActions(): boolean | Function;
    triggerAction(type: string, item: any): void;
    toggleAndSortBy(column: any): void;
    toggleColumnSort(sort: string): EtoolsTableColumnSort;
    triggerItemChanged(item: any, field: string, filedValue: any): void;
}
