import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomeComponent } from './pages/home/home.component';
import { SessionsComponent } from './pages/sessions/sessions.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { TestMenuComponent } from './pages/test-menu/test-menu.component';
import { ClickTestComponent } from './pages/click-test/click-test.component';
import { RageClickTestComponent } from './pages/rage-click-test/rage-click-test.component';
import { FormTestComponent } from './pages/form-test/form-test.component';
import { ErrorTestComponent } from './pages/error-test/error-test.component';
import { UrlApiTestComponent } from './pages/url-api-test/url-api-test.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'sessions', component: SessionsComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'test', component: TestMenuComponent },
  { path: 'test/click', component: ClickTestComponent },
  { path: 'test/rage-click', component: RageClickTestComponent },
  { path: 'test/form', component: FormTestComponent },
  { path: 'test/error', component: ErrorTestComponent },
  { path: 'test/url-api', component: UrlApiTestComponent },
  { path: '**', redirectTo: '' }
];
