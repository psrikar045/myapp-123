# Shared Module Documentation

This document provides examples of how to use the common utilities, pipes, directives, and components available in the shared module.

## Table of Contents
- [Components](#components)
- [Directives](#directives)
- [Pipes](#pipes)
- [Services](#services)
- [Utilities](#utilities)
- [Form Utilities](#form-utilities)

## Components

### DataTableComponent
A reusable data table component with sorting, pagination, and selection features.

```typescript
// In your component
export class MyComponent {
  data = [
    { id: 1, name: 'John Doe', email: 'john@example.com', active: true },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', active: false }
  ];

  columns: TableColumn[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'active', label: 'Status', type: 'boolean' },
    { key: 'actions', label: 'Actions', type: 'actions' }
  ];

  rowActions: TableAction[] = [
    {
      label: 'Edit',
      icon: 'edit',
      color: 'primary',
      handler: (row) => this.editUser(row)
    },
    {
      label: 'Delete',
      icon: 'delete',
      color: 'warn',
      handler: (row) => this.deleteUser(row)
    }
  ];
}
```

```html
<app-data-table
  [data]="data"
  [columns]="columns"
  [rowActions]="rowActions"
  [selectable]="true"
  [showPagination]="true"
  (rowClick)="onRowClick($event)"
  (selectionChange)="onSelectionChange($event)">
</app-data-table>
```

### ConfirmationDialogComponent
Use with DialogService for confirmation dialogs.

```typescript
constructor(private dialogService: DialogService) {}

deleteItem() {
  this.dialogService.confirmDelete('this user').subscribe(confirmed => {
    if (confirmed) {
      // Perform delete operation
    }
  });
}
```

### LoadingSpinnerComponent
```html
<app-loading-spinner 
  [show]="isLoading" 
  message="Loading data...">
</app-loading-spinner>
```

## Directives

### AutoFocusDirective
```html
<input type="text" appAutoFocus placeholder="This input will be focused">
```

### ClickOutsideDirective
```html
<div appClickOutside (clickOutside)="closeDropdown()">
  <div class="dropdown-content">
    <!-- Dropdown content -->
  </div>
</div>
```

### DebounceClickDirective
```html
<button appDebounceClick 
        [debounceTime]="500" 
        (debounceClick)="handleClick()">
  Click me (debounced)
</button>
```

### TooltipDirective
```html
<button appTooltip="This is a helpful tooltip" 
        placement="top">
  Hover me
</button>
```

### InfiniteScrollDirective
```html
<div appInfiniteScroll 
     [threshold]="100" 
     (scrolled)="loadMoreData()" 
     class="scrollable-container">
  <!-- Scrollable content -->
</div>
```

### LazyLoadDirective
```html
<img appLazyLoad 
     src="placeholder.jpg" 
     data-src="actual-image.jpg" 
     alt="Lazy loaded image">
```

## Pipes

### TruncatePipe
```html
<p>{{ longText | truncate:50:'...' }}</p>
```

### CapitalizePipe
```html
<p>{{ 'hello world' | capitalize }}</p> <!-- Hello World -->
```

### TimeAgoPipe
```html
<span>{{ createdDate | timeAgo }}</span> <!-- 2 hours ago -->
```

### FileSizePipe
```html
<span>{{ fileSize | fileSize }}</span> <!-- 1.5 MB -->
```

### HighlightPipe
```html
<p [innerHTML]="text | highlight:searchTerm"></p>
```

### FilterPipe
```html
<div *ngFor="let item of items | filter:searchTerm:'name'">
  {{ item.name }}
</div>
```

### SafeHtmlPipe
```html
<div [innerHTML]="htmlContent | safeHtml"></div>
```

## Services

### DialogService
```typescript
constructor(private dialogService: DialogService) {}

// Confirmation dialog
confirmAction() {
  this.dialogService.confirm({
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    confirmText: 'Yes',
    cancelText: 'No',
    type: 'warning'
  }).subscribe(result => {
    if (result) {
      // User confirmed
    }
  });
}

// Quick methods
showSuccess() {
  this.dialogService.success('Success!', 'Operation completed successfully');
}

showError() {
  this.dialogService.error('Error!', 'Something went wrong');
}
```

### ErrorHandlerService
```typescript
constructor(private errorHandler: ErrorHandlerService) {}

// Handle HTTP errors
this.http.get('/api/data').pipe(
  catchError(error => this.errorHandler.handleHttpError(error))
).subscribe();

// Handle application errors
try {
  // Some operation
} catch (error) {
  this.errorHandler.handleError(error, 'MyComponent.someMethod');
}

// Show notifications
this.errorHandler.showSuccess('Data saved successfully');
this.errorHandler.showWarning('Please review your input');
```

### PhoneService
```typescript
constructor(private phoneService: PhoneService) {}

// Get country codes
countryCodes = this.phoneService.getCountryCodes();

// Format phone number
formatPhone(phone: string, countryCode: string) {
  return this.phoneService.formatPhoneNumber(phone, countryCode);
}

// Validate phone
isValid = this.phoneService.isValidPhoneNumber('+1234567890');
```

## Utilities

### StringUtils
```typescript
import { StringUtils } from '@shared/utils/common-functions';

// Check if string is empty
if (StringUtils.isEmpty(userInput)) {
  // Handle empty input
}

// Capitalize string
const capitalized = StringUtils.capitalize('hello world'); // Hello world

// Generate slug
const slug = StringUtils.slugify('Hello World!'); // hello-world

// Truncate text
const truncated = StringUtils.truncate(longText, 100, '...');
```

### ArrayUtils
```typescript
import { ArrayUtils } from '@shared/utils/common-functions';

// Remove duplicates
const unique = ArrayUtils.unique([1, 2, 2, 3, 3, 4]); // [1, 2, 3, 4]

// Group by property
const grouped = ArrayUtils.groupBy(users, 'department');

// Sort by property
const sorted = ArrayUtils.sortBy(users, 'name', 'asc');

// Chunk array
const chunks = ArrayUtils.chunk([1, 2, 3, 4, 5, 6], 2); // [[1, 2], [3, 4], [5, 6]]
```

### ObjectUtils
```typescript
import { ObjectUtils } from '@shared/utils/common-functions';

// Deep clone
const cloned = ObjectUtils.deepClone(originalObject);

// Pick properties
const picked = ObjectUtils.pick(user, ['name', 'email']);

// Omit properties
const omitted = ObjectUtils.omit(user, ['password', 'secret']);
```

### DateUtils
```typescript
import { DateUtils } from '@shared/utils/common-functions';

// Format date
const formatted = DateUtils.formatDate(new Date(), 'yyyy-MM-dd HH:mm');

// Check if today
const isToday = DateUtils.isToday(someDate);

// Calculate days between
const days = DateUtils.daysBetween(startDate, endDate);
```

### ValidationUtils
```typescript
import { ValidationUtils } from '@shared/utils/common-functions';

// Validate email
const isValidEmail = ValidationUtils.isEmail('user@example.com');

// Validate strong password
const isStrongPassword = ValidationUtils.isStrongPassword('MyP@ssw0rd');

// Validate credit card
const isValidCard = ValidationUtils.isCreditCard('4111111111111111');
```

### BrowserUtils
```typescript
import { BrowserUtils } from '@shared/utils/common-functions';

// Check device type
if (BrowserUtils.isMobile()) {
  // Mobile-specific logic
}

// Copy to clipboard
BrowserUtils.copyToClipboard('Text to copy').then(() => {
  console.log('Copied successfully');
});

// Download file
BrowserUtils.downloadFile(blob, 'filename.pdf');
```

### StorageUtils
```typescript
import { StorageUtils } from '@shared/utils/common-functions';

// Store data
StorageUtils.setItem('user-preferences', { theme: 'dark', language: 'en' });

// Retrieve data
const preferences = StorageUtils.getItem('user-preferences', { theme: 'light' });

// Remove data
StorageUtils.removeItem('temporary-data');
```

## Form Utilities

### FormUtils
```typescript
import { FormUtils } from '@shared/utils/form-utils';

// Mark all fields as touched
FormUtils.markFormGroupTouched(this.myForm);

// Get validation errors
const errors = FormUtils.getFormValidationErrors(this.myForm);

// Check if field has error
const hasError = FormUtils.hasError(this.myForm, 'email', 'required');

// Get error message
const errorMessage = FormUtils.getErrorMessage(this.myForm, 'email');
```

### CustomValidators
```typescript
import { CustomValidators } from '@shared/utils/form-utils';

// In your form builder
this.form = this.fb.group({
  email: ['', [Validators.required, CustomValidators.email]],
  password: ['', [Validators.required, CustomValidators.strongPassword]],
  confirmPassword: ['', [Validators.required, CustomValidators.passwordMatch('password', 'confirmPassword')]],
  phone: ['', [CustomValidators.phone]],
  website: ['', [CustomValidators.url]],
  age: ['', [CustomValidators.minAge(18)]],
  creditCard: ['', [CustomValidators.creditCard]]
});
```

## Constants

### ValidationMessages
```typescript
import { VALIDATION_MESSAGES, getValidationMessage } from '@shared/constants/validation-messages';

// Use predefined messages
const requiredMessage = VALIDATION_MESSAGES.REQUIRED;

// Use dynamic messages
const minLengthMessage = getValidationMessage('MIN_LENGTH', 8);
```

### API Endpoints
```typescript
import { API_ENDPOINTS } from '@shared/constants/api-endpoints';

// Use predefined endpoints
this.http.get(API_ENDPOINTS.USERS.LIST);
this.http.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
```

This shared module provides a comprehensive set of utilities to accelerate development and maintain consistency across the application.