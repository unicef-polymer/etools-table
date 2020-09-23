# \<etools-table\>

LitElement based data table UI
## Usage
```html
        <etools-table .columns="${this.listColumns}"
                      .items="${this.listData}"
                      .paginator="${this.paginator}"
                      @paginator-change="${this.paginatorChange}"
                      @sort-change="${this.sortChange}">
        </etools-table>

        @property({type: Array})
        listColumns: EtoolsTableColumn[] = [
          {
            label: 'Reference No.',
            name: 'reference_number',
            link_tmpl: `${ROOT_PATH}items/:id/details`,
            type: EtoolsTableColumnType.Link
          },
          {
            label: 'Created Date',
            name: 'created_date',
            type: EtoolsTableColumnType.Date,
            sort: EtoolsTableColumnSort.Desc
          },
          {
            label: 'Partner Org',
            name: 'partner_name',
            type: EtoolsTableColumnType.Text,
            sort: EtoolsTableColumnSort.Asc
          },
          {
            label: 'Status',
            name: 'status',
            type: EtoolsTableColumnType.Text,
            capitalize: true
          },
          {
            label: 'Assessor',
            name: 'assessor',
            type: EtoolsTableColumnType.Text
          },
          {
            label: 'Priority',
            name: 'high_priority',
            type: EtoolsTableColumnType.Custom,
            customMethod: (item: any) => {return item.high_priority ? 'High' : '';}
          }
        ];

        paginatorChange(e: CustomEvent) {
          const newPaginator = {...e.detail};
          this.paginator = newPaginator;
          this.updateUrlListQueryParams();
        }

        sortChange(e: CustomEvent) {
          this.sort = getSortFields(e.detail);
          this.updateUrlListQueryParams();
        }
```
## EtoolsTable

   Custom property      | Description
   ---------------------|-------------------
   `caption` | table caption
   `dateFormat` | date format to be used for columns of type EtoolsTableColumnType.Date, by default is 'D MMM YYYY'
   `actionsLabel` | if `showEdit` or `showDelete` is true at the end of the table it is added and extra column for actions, this property will set the column caption
   `showEdit` | display edit icon in the last column, on click will fire event `edit-item`
   `showDelete` | display delete icon in the last column, on click will fire event `delete-item`
   `showCopy` | display copy icon in the last column, on click will fire event `copy-item`
   `columns` | array of `EtoolsTableColumn`, see below the properties
   `items` | array of objects to be used for populating the table
   `paginator` | of type `EtoolsPaginator`, not required, will fire event `paginator-change`
   `getChildRowTemplate` | of type Function, if specified, will be called for each row with data item as param and the result will be displayed below normal row
   `customData` | a convenient way to pass data from the page to the Column `customMethod`, this object will be the third param after data item and column key
   `extraCSS` | property of type LitElement `css` for adding custom styles

## EtoolsTableColumn

   Custom property      | Description
   ---------------------|-------------------
  `label`| column header label
  `name` | property name from item object
  `type` | of type `EtoolsTableColumnType` (`Text`, `Date`, `Link`, `Number`, `Checkbox`, `Custom`)
  `sort` | of type `EtoolsTableColumnSort` (`Asc`, `Desc`)
  `link_tmpl` | used only for `EtoolsTableColumnType.Link` to specify url template (route with a single param), ex: `${ROOT_PATH}assessments/:id/details`, id will be replaced with item object id property
  `isExternalLink` | used by columns of Link type to specify if url is external,
  `capitalize`  | first letter uppercase
  `placeholder` | placeholder to be used in case of missing data
  `customMethod` | bind custom method which will return cell output for more flexibility

## EtoolsPaginator

   Custom property      | Description
   ---------------------|-------------------
   `page` | current page
   `page_size` |  number of records on the page
   `total_pages` |  number of available pages
   `count` |  number of total records
   `visible_range` |  range of displayed records
   
## Styling
Custom property | Description | Default
----------------|-------------|----------
`--expand-cell-color` | expand cell arrow color | `--primary-color`


## Install
TODO: create npm package
```bash
$ npm i --save @unicef-polymer/etools-table
```
