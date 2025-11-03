import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface DropdownOption<T = any> {
  value: T;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-dropdown-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dropdown-select.component.html'
})
export class DropdownSelectComponent<T = any> {
  @Input() id: string = `dropdown-${Math.random().toString(36).substr(2, 9)}`;
  @Input() name: string = this.id;
  @Input() label: string = '';
  @Input() placeholder: string = 'Seleccione una opción';
  @Input() hint: string = '';
  @Input() required: boolean = false;
  @Input() set options(value: DropdownOption<T>[]) {
    this.optionsSignal.set(value);
  }
  @Input() set value(val: T | null) {
    this.selectedValue = val;
  }
  @Input() set disabled(val: boolean) {
    this.disabledSignal.set(val);
  }
  @Input() set error(val: string | null) {
    this.errorSignal.set(val);
  }

  @Output() valueChange = new EventEmitter<T | null>();

  protected selectedValue: T | null = null;
  private readonly optionsSignal = signal<DropdownOption<T>[]>([]);
  private readonly disabledSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  protected readonly dropdownOptions = computed(() => this.optionsSignal());
  protected readonly isDisabled = computed(() => this.disabledSignal());
  protected readonly errorMessage = computed(() => this.errorSignal());

  protected readonly selectClass = computed(() => {
    const hasError: boolean = !!this.errorMessage();
    return hasError ? 'border-red-300 focus:ring-red-500' : '';
  });

  protected onValueChange(value: T | null): void {
    this.valueChange.emit(value);
  }
}
