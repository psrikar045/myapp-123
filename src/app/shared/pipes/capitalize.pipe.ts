import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalize',
  standalone: true
})
export class CapitalizePipe implements PipeTransform {
  transform(value: string, type: 'first' | 'words' | 'all' = 'first'): string {
    if (!value) return '';
    
    switch (type) {
      case 'first':
        return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
      
      case 'words':
        return value.replace(/\b\w/g, char => char.toUpperCase());
      
      case 'all':
        return value.toUpperCase();
      
      default:
        return value;
    }
  }
}