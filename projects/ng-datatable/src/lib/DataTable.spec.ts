import { beforeEach, describe, expect, it } from 'vitest';
import { Component, signal } from '@angular/core';
import { DataTable, PageEvent, SortBy, SortEvent, SortOrder } from './DataTable';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

@Component({
  template: `<table
    [mfData]="inputData()"
    [(mfSortBy)]="sortBy"
    [(mfSortOrder)]="sortOrder"
    [(mfRowsOnPage)]="rowsOnPage"
    [(mfActivePage)]="activePage"
  ></table>`,
  imports: [DataTable],
})
class TestComponent<T = any> {
  readonly inputData = signal<readonly T[] | null | undefined>(null);
  readonly sortBy = signal<SortBy<T>>('');
  readonly sortOrder = signal<SortOrder>('asc');
  readonly rowsOnPage = signal(1000);
  readonly activePage = signal(1);
}

describe('DataTable directive tests', () => {
  let fixture: ComponentFixture<TestComponent<any>>;
  let datatable: DataTable;
  let testComponent: TestComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataTable],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    testComponent = fixture.componentInstance;
    datatable = fixture.debugElement.query(By.directive(DataTable)).injector.get(DataTable);

    testComponent.inputData.set([
      { id: 3, name: 'banana' },
      { id: 1, name: 'Duck' },
      { id: 2, name: 'ącki' },
      { id: 5, name: 'Ðrone' },
      { id: 4, name: 'Ananas' },
    ]);
    fixture.detectChanges();
  });

  describe('initializing', () => {
    it('data should be empty array if inputData is undefined or null', () => {
      testComponent.inputData.set(null);
      fixture.detectChanges();
      expect(datatable.data()).toEqual([]);
    });

    it('data should be equal to inputData', () => {
      const newInputData = [...datatable.inputData()];
      testComponent.inputData.set(newInputData);
      fixture.detectChanges();
      expect(datatable.data()).toEqual(datatable.inputData());
    });

    it('data should be 2 first items', () => {
      testComponent.rowsOnPage.set(2);
      fixture.detectChanges();
      expect(datatable.data()).toEqual([
        { id: 3, name: 'banana' },
        { id: 1, name: 'Duck' },
      ]);
    });

    it('data should be 3. and 4. items', () => {
      testComponent.rowsOnPage.set(2);
      testComponent.activePage.set(2);
      fixture.detectChanges();
      expect(datatable.data()).toEqual([
        { id: 2, name: 'ącki' },
        { id: 5, name: 'Ðrone' },
      ]);
    });
  });

  describe('pagination', () => {
    beforeEach(() => {
      testComponent.rowsOnPage.set(2);
      fixture.detectChanges();
    });

    it('should return current page settings', () => {
      expect(datatable.getPage()).toEqual({ activePage: 1, rowsOnPage: 2, dataLength: 5 });
    });

    it('data should be 3. and 4. items when page change', () => {
      datatable.setPage(2, 2);

      expect(datatable.data()).toEqual([
        { id: 2, name: 'ącki' },
        { id: 5, name: 'Ðrone' },
      ]);
    });

    it('data should be three first items when page change', () => {
      datatable.setPage(1, 3);

      expect(datatable.data()).toEqual([
        { id: 3, name: 'banana' },
        { id: 1, name: 'Duck' },
        { id: 2, name: 'ącki' },
      ]);
    });

    it('data should be two last items when page change', () => {
      datatable.setPage(2, 3);
      datatable.setPage(2, 3);

      expect(datatable.data()).toEqual([
        { id: 5, name: 'Ðrone' },
        { id: 4, name: 'Ananas' },
      ]);
    });

    it('should change rowsOnPage when mfRowsOnPage changed', () => {
      testComponent.rowsOnPage.set(2);
      fixture.detectChanges();
      expect(datatable.data()).toEqual([
        { id: 3, name: 'banana' },
        { id: 1, name: 'Duck' },
      ]);

      datatable.onPageChange.subscribe((pageOptions: PageEvent) => {
        expect(pageOptions.rowsOnPage).toEqual(3);
      });

      testComponent.rowsOnPage.set(3);
      fixture.detectChanges();
      expect(datatable.data()).toEqual([
        { id: 3, name: 'banana' },
        { id: 1, name: 'Duck' },
        { id: 2, name: 'ącki' },
      ]);
    });

    it('should emit a dataLength of 0 when inputData is null or undefined', () => {
      datatable.onPageChange.subscribe((pageOptions: PageEvent) => {
        expect(pageOptions.dataLength).toEqual(0);
      });
      testComponent.inputData.set(null);
      datatable.setPage(2, 3);
    });
  });

  describe('sorting', () => {
    it('id should return current sort setting', () => {
      datatable.setSort('id', 'desc');
      expect(datatable.getSort()).toEqual({ sortBy: 'id', sortOrder: 'desc' });
    });

    it('should sort data after sorting input value changed', () => {
      testComponent.sortBy.set('id');
      testComponent.sortOrder.set('asc');
      fixture.detectChanges();
      expect(datatable.data()).toEqual([
        { id: 1, name: 'Duck' },
        { id: 2, name: 'ącki' },
        { id: 3, name: 'banana' },
        { id: 4, name: 'Ananas' },
        { id: 5, name: 'Ðrone' },
      ]);
    });

    it('should fire onSortChange event after sorting input value changed', () => {
      datatable.onSortChange.subscribe((event: SortEvent) => {
        expect(event.sortBy).toEqual('id');
        expect(event.sortOrder).toEqual('desc');
      });
      testComponent.sortBy.set('id');
      testComponent.sortOrder.set('desc');
      fixture.detectChanges();
    });

    it("should set sortOrder to 'asc' if not provided", () => {
      datatable.onSortChange.subscribe((event: SortEvent) => {
        expect(event.sortBy).toEqual('id');
        expect(event.sortOrder).toEqual('asc');
      });

      testComponent.sortBy.set('id');
      fixture.detectChanges();

      expect(datatable.sortOrder()).toEqual('asc');
    });

    it("should set sortOrder to 'asc' if provided something else than 'asc' or 'desc'", () => {
      datatable.onSortChange.subscribe((event: SortEvent) => {
        expect(event.sortBy).toEqual('id');
        expect(event.sortOrder).toEqual('asc');
      });
      testComponent.sortBy.set('id');
      testComponent.sortOrder.set('bulb' as 'asc');
      fixture.detectChanges();
      expect(datatable.sortOrder()).toEqual('bulb'); // Event and logic is 'asc' for invalid values
      expect(datatable.data()).toEqual([
        { id: 1, name: 'Duck' },
        { id: 2, name: 'ącki' },
        { id: 3, name: 'banana' },
        { id: 4, name: 'Ananas' },
        { id: 5, name: 'Ðrone' },
      ]);
    });

    it("should set sortOrder to 'asc' if setSort is given something else than 'asc' or 'desc'", () => {
      datatable.setSort('id', 'bulb' as 'asc');
      expect(datatable.getSort()).toEqual({ sortBy: 'id', sortOrder: 'asc' });
      expect(datatable.sortOrder()).toEqual('asc');
      expect(datatable.data()).toEqual([
        { id: 1, name: 'Duck' },
        { id: 2, name: 'ącki' },
        { id: 3, name: 'banana' },
        { id: 4, name: 'Ananas' },
        { id: 5, name: 'Ðrone' },
      ]);
    });

    it("shouldn't change order when only order provided", () => {
      datatable.onSortChange.subscribe(() => {
        throw new Error("OnSortChange shouldn't been fired");
      });
      testComponent.sortOrder.set('desc');
      fixture.detectChanges();
      expect(datatable.data()).toEqual(datatable.inputData());
    });

    it("shouldn't refresh data when set page with same settings", () => {
      datatable.setSort('name', 'asc');
      const data = datatable.data();
      datatable.setSort('name', 'asc');
      expect(datatable.data()).toBe(data);
    });

    it('should sort data ascending by name', () => {
      datatable.setSort('name', 'asc');

      expect(datatable.data()).toEqual([
        { id: 4, name: 'Ananas' },
        { id: 3, name: 'banana' },
        { id: 1, name: 'Duck' },
        { id: 5, name: 'Ðrone' },
        { id: 2, name: 'ącki' },
      ]);
    });

    it('should sort data descending by id', () => {
      datatable.setSort('id', 'desc');

      expect(datatable.data()).toEqual([
        { id: 5, name: 'Ðrone' },
        { id: 4, name: 'Ananas' },
        { id: 3, name: 'banana' },
        { id: 2, name: 'ącki' },
        { id: 1, name: 'Duck' },
      ]);
    });

    it('should sort data by two values', () => {
      const newData = [
        { name: 'Claire', age: 9 },
        { name: 'Anna', age: 34 },
        { name: 'Claire', age: 16 },
        { name: 'Anna', age: 12 },
        { name: 'Claire', age: 7 },
        { name: 'Anna', age: 12 },
      ];
      testComponent.inputData.set(newData);
      fixture.detectChanges();
      datatable.setSort(['name', 'age'], 'asc');

      expect(datatable.data()).toEqual([
        { name: 'Anna', age: 12 },
        { name: 'Anna', age: 12 },
        { name: 'Anna', age: 34 },
        { name: 'Claire', age: 7 },
        { name: 'Claire', age: 9 },
        { name: 'Claire', age: 16 },
      ]);
    });

    it('should sort data by child property value', () => {
      const newData = [
        { name: 'Claire', city: { zip: '51111' } },
        { name: 'Anna' },
        { name: 'Claire', city: { zip: '41111' } },
        { name: 'Donald', city: 2 },
        { name: 'Claire', city: { zip: '11111' } },
        { name: 'Anna', city: { zip: '21111' } },
      ];
      testComponent.inputData.set(newData);
      fixture.detectChanges();
      datatable.setSort('city.zip', 'asc');

      expect(datatable.data()).toEqual([
        { name: 'Anna' },
        { name: 'Donald', city: 2 },
        { name: 'Claire', city: { zip: '11111' } },
        { name: 'Anna', city: { zip: '21111' } },
        { name: 'Claire', city: { zip: '41111' } },
        { name: 'Claire', city: { zip: '51111' } },
      ]);
    });
  });

  describe('data change', () => {
    it('should refresh data when inputData change', () => {
      const newData = [
        { id: 5, name: 'Ðrone' },
        { id: 4, name: 'Ananas' },
      ];
      testComponent.inputData.set(newData);
      fixture.detectChanges();

      expect(datatable.data()).toEqual([
        { id: 5, name: 'Ðrone' },
        { id: 4, name: 'Ananas' },
      ]);
    });

    it('should refresh data when rows removed from inputData', () => {
      expect(datatable.data()).toEqual(datatable.inputData());
      testComponent.inputData.set(datatable.inputData().slice(0, -1));
      fixture.detectChanges();

      expect(datatable.data()).toEqual(datatable.inputData());
    });

    it('should refresh data when rows added to inputData', () => {
      expect(datatable.data()).toEqual(datatable.inputData());
      testComponent.inputData.set(datatable.inputData().concat({ id: 6, name: 'Furby' }));
      fixture.detectChanges();

      expect(datatable.data()).toEqual(datatable.inputData());
    });

    it('should fire onPageChange event after inputData change', () => {
      datatable.setPage(2, 2);

      datatable.onPageChange.subscribe((opt: PageEvent) => {
        expect(opt.activePage).toEqual(1);
        expect(opt.dataLength).toEqual(2);
        expect(opt.rowsOnPage).toEqual(2);
      });
      const newData = [
        { id: 5, name: 'Ðrone' },
        { id: 4, name: 'Ananas' },
      ];
      testComponent.inputData.set(newData);
      fixture.detectChanges();
    });

    it('should fire onPageChange event after rows added', () => {
      datatable.setPage(2, 2);

      datatable.onPageChange.subscribe((opt: PageEvent) => {
        expect(opt.activePage).toEqual(2);
        expect(opt.dataLength).toEqual(6);
        expect(opt.rowsOnPage).toEqual(2);
      });
      testComponent.inputData.set(datatable.inputData().concat({ id: 6, name: 'Furby' }));
      fixture.detectChanges();
    });

    it('should fire onPageChange event after rows removed', () => {
      datatable.setPage(2, 2);

      datatable.onPageChange.subscribe((opt: PageEvent) => {
        expect(opt.activePage).toEqual(1);
        expect(opt.dataLength).toEqual(2);
        expect(opt.rowsOnPage).toEqual(2);
      });
      testComponent.inputData.set(datatable.inputData().slice(0, -3));
      fixture.detectChanges();
    });

    it('should change page when no data on current page after changed inputData', () => {
      datatable.setPage(2, 2);

      const newData = [
        { id: 5, name: 'Ðrone' },
        { id: 4, name: 'Ananas' },
      ];
      testComponent.inputData.set(newData);
      fixture.detectChanges();

      expect(datatable.data()).toEqual(newData);
    });

    it('should change page when no data on current page after rows removed', () => {
      datatable.setPage(2, 2);

      expect(datatable.data()).toEqual([
        { id: 2, name: 'ącki' },
        { id: 5, name: 'Ðrone' },
      ]);

      testComponent.inputData.set(datatable.inputData().slice(0, -3));
      fixture.detectChanges();

      expect(datatable.data()).toEqual([
        { id: 3, name: 'banana' },
        { id: 1, name: 'Duck' },
      ]);
    });

    it("shouldn't change page when can display data after data changed", () => {
      datatable.setPage(2, 1);

      const newData = [
        { id: 5, name: 'Ðrone' },
        { id: 1, name: 'Duck' },
        { id: 4, name: 'Ananas' },
      ];
      testComponent.inputData.set(newData);
      fixture.detectChanges();

      expect(datatable.data()).toEqual([{ id: 1, name: 'Duck' }]);
    });

    it("shouldn't change page when can display data after rows removed", () => {
      datatable.setPage(2, 1);

      expect(datatable.data()).toEqual([{ id: 1, name: 'Duck' }]);

      testComponent.inputData.set(datatable.inputData().slice(0, -1));
      fixture.detectChanges();

      expect(datatable.data()).toEqual([{ id: 1, name: 'Duck' }]);
    });

    it("shouldn't change page when can display data after rows added", () => {
      datatable.setPage(2, 1);

      expect(datatable.data()).toEqual([{ id: 1, name: 'Duck' }]);

      testComponent.inputData.set(datatable.inputData().concat({ id: 6, name: 'Furby' }));
      fixture.detectChanges();

      expect(datatable.data()).toEqual([{ id: 1, name: 'Duck' }]);
    });

    it("shouldn't change page to 0 when data is empty", () => {
      datatable.setPage(2, 1);

      testComponent.inputData.set([]);
      fixture.detectChanges();

      expect(datatable.activePage()).toEqual(1);
    });

    it("shouldn't change page to 0 when data is empty after removed rows", () => {
      datatable.setPage(2, 1);

      testComponent.inputData.set(datatable.inputData().slice(0, -5));
      fixture.detectChanges();

      expect(datatable.inputData()).toHaveLength(0);
      expect(datatable.activePage()).toEqual(1);
    });
  });
});
