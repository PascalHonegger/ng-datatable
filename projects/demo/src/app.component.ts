import { Component } from "@angular/core";
import { httpResource } from "@angular/common/http";
import {
  BootstrapPaginator,
  DataTable,
  DefaultSorter,
  SortBy,
  SortOrder,
} from "ng-datatable";
import { FormsModule } from "@angular/forms";
import { DataFilterPipe } from "./data-filter.pipe";
import { UpperCasePipe } from "@angular/common";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  imports: [
    FormsModule,
    DataFilterPipe,
    UpperCasePipe,
    DataTable,
    DefaultSorter,
    BootstrapPaginator,
  ],
})
export class AppComponent {
  filterQuery = "";
  rowsOnPage = 10;
  sortBy: SortBy = "email";
  sortOrder: SortOrder = "asc";

  data = httpResource<any[]>(() => "/data.json", {
    defaultValue: [],
  });

  toInt(num: string) {
    return +num;
  }

  sortByWordLength = (a: any) => {
    return a.city.length;
  };

  remove(item: any) {
    const index = this.data.value()?.indexOf(item);
    if (index && index > -1) {
      this.data.value()?.splice(index, 1);
    }
  }
}
