import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { HeaderComponent } from './shared/components/header/header.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { AuthStore } from './store/auth.store';
import { UiStore } from './store/ui.store';
import { ConversionStore } from './store/conversion.store';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  private readonly router = inject(Router);
  readonly authStore = inject(AuthStore);
  readonly uiStore = inject(UiStore);
  readonly conversionStore = inject(ConversionStore);

  showLayout = () => {
    const url = this.router.url;
    return !url.startsWith('/auth');
  };

  ngOnInit(): void {
    // Initialize stores
    this.authStore.initializeAuth();
    this.uiStore.initialize();
    this.conversionStore.initialize();

    // Listen for route changes to update layout visibility
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        // Force change detection for layout updates
      });
  }
}
