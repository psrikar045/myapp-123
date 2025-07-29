import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highlight',
  standalone: true
})
export class HighlightPipe implements PipeTransform {
  transform(text: string, search: string, className: string = 'highlight'): string {
    if (!text || !search) return text;
    
    const regex = new RegExp(`(${search})`, 'gi');
    return text.replace(regex, `<span class="${className}">$1</span>`);
  }
}