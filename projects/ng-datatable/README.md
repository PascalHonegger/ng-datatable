# Table component with sorting and pagination for Angular

It is a forked version of [ng-datatable](https://github.com/cmglez10/ng-datatable) updated to Angular 21, Signals and Zoneless.

[![npm version](https://badge.fury.io/js/%40pascalhonegger%2Fng-datatable.svg)](https://badge.fury.io/js/%40pascalhonegger%2Fng-datatable)

## Installation

```
npm i @pascalhonegger/ng-datatable --save
```

## Usage example

AppComponent.html

```typescript
imports: [
    DataTable,
    DefaultSorter,
    BootstrapPaginator,
  ],
```

```html
<table class="table table-striped" [mfData]="data" #mf="mfDataTable" [mfRowsOnPage]="5">
  <thead>
    <tr>
      <th style="width: 20%">
        <mfDefaultSorter by="name">Name</mfDefaultSorter>
      </th>
      <th style="width: 50%">
        <mfDefaultSorter by="email">Email</mfDefaultSorter>
      </th>
      <th style="width: 10%">
        <mfDefaultSorter by="age">Age</mfDefaultSorter>
      </th>
      <th style="width: 20%">
        <mfDefaultSorter by="city">City</mfDefaultSorter>
      </th>
    </tr>
  </thead>
  <tbody>
    @for (item of mf.data(); track item) {
    <tr>
      <td>{{item.name}}</td>
      <td>{{item.email}}</td>
      <td class="text-right">{{item.age}}</td>
      <td>{{item.city | uppercase}}</td>
    </tr>
    }
  </tbody>
  <tfoot>
    <tr>
      <td colspan="4">
        <mfBootstrapPaginator [rowsOnPageSet]="[5,10,25]" />
      </td>
    </tr>
  </tfoot>
</table>
```

## API

### `mfData` directive

- selector: `table[mfData]`
- exportAs: `mfDataTable`
- inputs
  - `mfData: T[]` - Array of data to display in table (**required**)
  - `mfRowsOnPage: number` - Number of rows should be displayed on page (default: `1000`)
  - `mfActivePage: number` - Page number (default: `1`)
  - `mfSortBy: SortBy<T>` - Sort by parameter
  - `mfSortOrder: SortOrder` - Sort order parameter (either `asc` or `desc`, default: `asc`)
- outputs
  - `mfRowsOnPageChange: number`
  - `mfActivePageChange: number`
  - `mfSortByChange: SortBy<T>`
  - `mfSortOrderChange: SortOrder`

### `mfDefaultSorter` component

- selector: `mfDefaultSorter`
- inputs
  - `by: SortBy<T>` - Specify how to sort data (**required**, argument for lodash function [\_.sortBy ](https://lodash.com/docs#sortBy))

### `mfBootstrapPaginator` component

Displays buttons for changing current page and number of displayed rows using bootstrap template (css for bootstrap 5 is required). If array length is smaller than current displayed rows on page then it doesn't show button for changing page. If array length is smaller than min value rowsOnPage then it doesn't show any buttons.

- selector: `mfBootstrapPaginator`
- inputs
  - `rowsOnPageSet: number[]` - specify values for buttons to change number of diplayed rows, e.g. [5, 10, 15] (**required**)
  - `mfTable: DataTable` - explicitly specify reference data table, by default the parent `mfData` is injected
