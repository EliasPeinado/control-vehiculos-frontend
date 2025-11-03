import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeColor = 'green' | 'yellow' | 'red' | 'orange' | 'blue' | 'gray';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge.component.html'
})
export class BadgeComponent {
  @Input() set color(value: BadgeColor) {
    this.colorSignal.set(value);
  }
  
  private readonly colorSignal = signal<BadgeColor>('gray');

  protected readonly badgeClasses = computed(() => {
    const color: BadgeColor = this.colorSignal();
    const baseClasses: string = 'badge';
    const colorClasses: Record<BadgeColor, string> = {
      green: 'badge-green',
      yellow: 'badge-yellow',
      red: 'badge-red',
      orange: 'badge-orange',
      blue: 'badge-blue',
      gray: 'badge-gray'
    };
    
    return `${baseClasses} ${colorClasses[color]}`;
  });
}
