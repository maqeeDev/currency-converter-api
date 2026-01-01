import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-error-alert',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './error-alert.component.html',
  styleUrl: './error-alert.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorAlertComponent {
  @Input() message = 'An error occurred';
  @Input() title: string | null = null;
  @Input() dismissible = true;
  @Input() retryable = false;

  @Output() onDismiss = new EventEmitter<void>();
  @Output() onRetry = new EventEmitter<void>();
}
