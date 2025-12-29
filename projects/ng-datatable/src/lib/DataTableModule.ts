import { NgModule } from '@angular/core';

import { DataTable } from './DataTable';
import { DefaultSorter } from './DefaultSorter';
import { Paginator } from './Paginator';
import { BootstrapPaginator } from './BootstrapPaginator';

/**
 * Optional module which exports all components
 * @deprecated Should be replaced with component imports (DataTable, DefaultSorter, Paginator, BootstrapPaginator)
 */
@NgModule({
  imports: [DataTable, DefaultSorter, Paginator, BootstrapPaginator],
  exports: [DataTable, DefaultSorter, Paginator, BootstrapPaginator],
})
export class DataTableModule {}
