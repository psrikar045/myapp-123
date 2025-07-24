import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
  standalone: true
})
export class FilterPipe implements PipeTransform {
  transform<T>(items: T[], searchText: string, property?: keyof T): T[] {
    if (!items || !searchText) {
      return items;
    }
    
    searchText = searchText.toLowerCase();
    
    return items.filter(item => {
      if (property) {
        const value = item[property];
        return String(value).toLowerCase().includes(searchText);
      } else {
        return JSON.stringify(item).toLowerCase().includes(searchText);
      }
    });
  }
}