import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'soles', standalone: true })
export class SolesPipe implements PipeTransform {
  transform(valor: number | null | undefined): string {
    return valor ? 'S/ ' + Number(valor).toFixed(2) : '—';
  }
}
