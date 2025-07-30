import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ElementRef, ViewChild, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalConfig, ModalButton, ModalPopupComponent } from '../modal-popup/modal-popup.component';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  addMonths, 
  subMonths, 
  isSameMonth, 
  isSameDay, 
  isToday, 
  isAfter, 
  isBefore,
  parseISO,
  isValid
} from 'date-fns';

export interface DatePickerConfig {
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  showTime?: boolean;
  format?: string;
  placeholder?: string;
  clearable?: boolean;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
}

@Component({
  selector: 'app-date-picker-popup',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalPopupComponent],
  templateUrl: './date-picker-popup.component.html',
  styleUrls: ['./date-picker-popup.component.scss']
})
export class DatePickerPopupComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  
  @Input() value: Date | string | null = null;
  @Input() config: DatePickerConfig = {};
  @Input() disabled = false;
  @Input() required = false;
  @Input() label = '';
  @Input() error = '';
  
  @Output() valueChange = new EventEmitter<Date | null>();
  @Output() dateSelected = new EventEmitter<Date | null>();
  
  @ViewChild('dateInput', { static: false }) dateInput!: ElementRef<HTMLInputElement>;
  @ViewChild('popup', { static: false }) popup!: ElementRef<HTMLDivElement>;

  // Component state
  isOpen = false;
  currentMonth = new Date();
  selectedDate: Date | null = null;
  inputValue = '';
  timeValue = '00:00';
  
  // Calendar data
  calendarDays: Date[] = [];
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Modal configuration
  modalConfig: ModalConfig = {};
  displayDate = '';
  dateInputError = '';
  
  // Default config
  private defaultConfig: DatePickerConfig = {
    format: 'yyyy-MM-dd',
    placeholder: 'Select date',
    clearable: true,
    position: 'bottom-left',
    showTime: false
  };

  private clickListener?: (event: Event) => void;
  private resizeListener?: () => void;
  private scrollListener?: () => void;
  private isInteracting = false;

  ngOnInit(): void {
    // Merge config with defaults
    this.config = { ...this.defaultConfig, ...this.config };
    
    // Setup modal configuration
    this.setupModalConfig();
    
    // Initialize selected date
    this.initializeDate();
    
    // Generate calendar
    this.generateCalendar();
    this.setupClickOutsideListener();
    
    // Setup window listeners for responsive behavior
    this.setupWindowListeners();
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (this.clickListener) {
        document.removeEventListener('click', this.clickListener);
      }
      if (this.resizeListener) {
        window.removeEventListener('resize', this.resizeListener);
      }
    }
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener, true);
    }
  }

  /**
   * Initialize date from input value
   */
  private initializeDate(): void {
    if (this.value) {
      if (typeof this.value === 'string') {
        const parsed = parseISO(this.value);
        if (isValid(parsed)) {
          this.selectedDate = parsed;
          this.currentMonth = parsed;
        }
      } else if (this.value instanceof Date && isValid(this.value)) {
        this.selectedDate = this.value;
        this.currentMonth = this.value;
      }
    }
    
    this.updateInputValue();
    this.updateTimeValue();
  }

  /**
   * Generate calendar days for current month
   */
  private generateCalendar(): void {
    const monthStart = startOfMonth(this.currentMonth);
    const monthEnd = endOfMonth(this.currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    
    this.calendarDays = [];
    let day = calendarStart;
    
    while (day <= calendarEnd) {
      this.calendarDays.push(new Date(day));
      day = addDays(day, 1);
    }
  }

  /**
   * Setup comprehensive event handling system
   */
  private setupClickOutsideListener(): void {
    this.clickListener = (event: Event) => {
      if (!this.isOpen) return;
      
      // Don't interfere if we're in the middle of an interaction
      if (this.isInteracting) {
        return;
      }
      
      const target = event.target as HTMLElement;
      const popup = this.popup?.nativeElement;
      const input = this.dateInput?.nativeElement;
      
      // Check if click is inside date picker components
      const isInsidePopup = popup && popup.contains(target);
      const isInsideInput = input && input.contains(target);
      
      if (isInsidePopup || isInsideInput) {
        // Allow the event to proceed normally for date picker interactions
        return;
      }
      
      // Close popup if clicking outside
      this.closePopup();
    };
    
    // Use simple event listener without capture to avoid conflicts
    document.addEventListener('click', this.clickListener);
  }

  /**
   * Setup minimal window listeners
   */
  private setupWindowListeners(): void {
    // Only handle resize, not scroll to prevent flickering
    let resizeTimeout: any;
    this.resizeListener = () => {
      if (!this.isOpen || this.isInteracting) return;
      
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (this.isOpen && this.popup && this.dateInput && !this.isInteracting) {
          this.positionPopup();
        }
      }, 300);
    };

    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('resize', this.resizeListener);
    }
    // Don't add scroll listener to prevent conflicts
  }

  /**
   * Toggle popup visibility
   */
  togglePopup(): void {
    if (this.disabled) return;
    
    if (this.isOpen) {
      this.closePopup();
    } else {
      this.openPopup();
    }
  }

  /**
   * Open popup
   */
  openPopup(): void {
    this.isOpen = true;
    this.updateDisplayDate();
    this.generateCalendar();
  }

  /**
   * Close popup
   */
  closePopup(): void {
    this.isOpen = false;
  }

  /**
   * Navigate to previous month
   */
  previousMonth(): void {
    this.currentMonth = subMonths(this.currentMonth, 1);
    this.generateCalendar();
  }

  /**
   * Navigate to next month
   */
  nextMonth(): void {
    this.currentMonth = addMonths(this.currentMonth, 1);
    this.generateCalendar();
  }

  /**
   * Select a date
   */
  selectDate(date: Date): void {
    if (this.isDateDisabled(date)) return;
    
    // If time is enabled, preserve the time part
    if (this.config.showTime && this.selectedDate) {
      const [hours, minutes] = this.timeValue.split(':').map(Number);
      date.setHours(hours, minutes, 0, 0);
    }
    
    this.selectedDate = date;
    this.updateDisplayDate();
    
    // Update time value if time is enabled
    if (this.config.showTime) {
      this.timeValue = format(date, 'HH:mm');
    }
    
    // Don't auto-close - let user manually save or cancel
    // The popup should only close when Save, Cancel, or Close button is clicked
  }

  /**
   * Handle time change
   */
  onTimeChange(): void {
    if (this.selectedDate && this.config.showTime) {
      const [hours, minutes] = this.timeValue.split(':').map(Number);
      const newDate = new Date(this.selectedDate);
      newDate.setHours(hours, minutes, 0, 0);
      
      this.selectedDate = newDate;
      this.updateInputValue();
      this.emitChange();
    }
  }

  /**
   * Handle manual input change
   */
  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    
    if (!value) {
      this.clearDate();
      return;
    }
    
    // Try to parse the input value
    try {
      const parsed = parseISO(value);
      if (isValid(parsed) && !this.isDateDisabled(parsed)) {
        this.selectedDate = parsed;
        this.currentMonth = parsed;
        this.generateCalendar();
        this.updateTimeValue();
        this.emitChange();
      }
    } catch (error) {
      // Invalid date format, keep the input but don't update selected date
    }
  }

  /**
   * Clear selected date
   */
  clearDate(): void {
    this.selectedDate = null;
    this.displayDate = '';
    this.inputValue = '';
    this.timeValue = '00:00';
    this.value = null;
    this.emitChange();
    this.onChange(null);
    this.onTouched();
    this.generateCalendar();
  }

  /**
   * Go to today
   */
  goToToday(): void {
    const today = new Date();
    if (!this.isDateDisabled(today)) {
      this.selectDate(today);
      this.currentMonth = today;
      this.generateCalendar();
    }
  }

  /**
   * Update input display value
   */
  private updateInputValue(): void {
    if (this.selectedDate) {
      const formatString = this.config.showTime ? 
        `${this.config.format} HH:mm` : 
        this.config.format!;
      this.inputValue = format(this.selectedDate, formatString);
    } else {
      this.inputValue = '';
    }
  }

  /**
   * Update time value
   */
  private updateTimeValue(): void {
    if (this.selectedDate && this.config.showTime) {
      this.timeValue = format(this.selectedDate, 'HH:mm');
    }
  }

  /**
   * Emit change event
   */
  private emitChange(): void {
    this.valueChange.emit(this.selectedDate);
    this.dateSelected.emit(this.selectedDate);
  }

  /**
   * Form control change callback
   */
  private onChange = (value: Date | null) => {};

  /**
   * Form control touched callback
   */
  private onTouched = () => {};

  /**
   * Check if date is disabled
   */
  isDateDisabled(date: Date): boolean {
    // Check min date
    if (this.config.minDate && isBefore(date, this.config.minDate)) {
      return true;
    }
    
    // Check max date
    if (this.config.maxDate && isAfter(date, this.config.maxDate)) {
      return true;
    }
    
    // Check disabled dates
    if (this.config.disabledDates) {
      return this.config.disabledDates.some(disabledDate => 
        isSameDay(date, disabledDate)
      );
    }
    
    return false;
  }

  /**
   * Check if date is selected
   */
  isDateSelected(date: Date): boolean {
    return this.selectedDate ? isSameDay(date, this.selectedDate) : false;
  }

  /**
   * Check if date is today
   */
  isDateToday(date: Date): boolean {
    return isToday(date);
  }

  /**
   * Check if date is in current month
   */
  isDateInCurrentMonth(date: Date): boolean {
    return isSameMonth(date, this.currentMonth);
  }

  /**
   * Get current month name
   */
  getCurrentMonthName(): string {
    return format(this.currentMonth, 'MMMM yyyy');
  }

  /**
   * Get current date
   */
  getCurrentDate(): Date {
    return new Date();
  }

  /**
   * Get popup position classes
   */
  getPopupPositionClass(): string {
    switch (this.config.position) {
      case 'bottom-right':
        return 'position-bottom-right';
      case 'top-left':
        return 'position-top-left';
      case 'top-right':
        return 'position-top-right';
      default:
        return 'position-bottom-left';
    }
  }

  /**
   * Get input classes
   */
  getInputClasses(): string {
    let classes = 'form-control date-picker-input';
    
    if (this.error) {
      classes += ' is-invalid';
    }
    
    if (this.disabled) {
      classes += ' disabled';
    }
    
    return classes;
  }

  /**
   * Position popup using fixed positioning with proper viewport calculations
   */
  private positionPopup(): void {
    if (!this.popup || !this.dateInput) return;

    const inputElement = this.dateInput.nativeElement;
    const popupElement = this.popup.nativeElement;
    
    // Get input position relative to viewport
    const inputRect = inputElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // Reset any previous positioning
    popupElement.style.top = '';
    popupElement.style.left = '';
    popupElement.style.right = '';
    popupElement.style.bottom = '';
    
    // Get popup dimensions after reset
    const popupRect = popupElement.getBoundingClientRect();
    
    let top: number;
    let left: number;
    
    // Vertical positioning
    const spaceBelow = viewportHeight - inputRect.bottom;
    const spaceAbove = inputRect.top;
    
    if (spaceBelow >= popupRect.height + 8 || spaceBelow >= spaceAbove) {
      // Position below input
      top = inputRect.bottom + 8;
    } else {
      // Position above input
      top = inputRect.top - popupRect.height - 8;
    }
    
    // Horizontal positioning
    const spaceRight = viewportWidth - inputRect.left;
    const spaceLeft = inputRect.right;
    
    if (spaceRight >= popupRect.width) {
      // Align to left edge of input
      left = inputRect.left;
    } else if (spaceLeft >= popupRect.width) {
      // Align to right edge of input
      left = inputRect.right - popupRect.width;
    } else {
      // Center in viewport if doesn't fit either way
      left = (viewportWidth - popupRect.width) / 2;
    }
    
    // Ensure popup stays within viewport bounds
    top = Math.max(8, Math.min(top, viewportHeight - popupRect.height - 8));
    left = Math.max(8, Math.min(left, viewportWidth - popupRect.width - 8));
    
    // Apply positioning
    popupElement.style.top = `${top}px`;
    popupElement.style.left = `${left}px`;
  }

  /**
   * Setup modal configuration
   */
  private setupModalConfig(): void {
    const buttons: ModalButton[] = [
      {
        label: 'Clear',
        action: 'clear',
        variant: 'outline-secondary',
        icon: 'bi-x-circle',
        disableWhenNoData: true
      },
      {
        label: 'Cancel',
        action: 'cancel',
        variant: 'secondary'
      },
      {
        label: this.config.showTime ? 'Save Date & Time' : 'Save Date',
        action: 'save',
        variant: 'primary',
        icon: 'bi-check-circle',
        disableWhenNoData: true
      }
    ];

    this.modalConfig = {
      title: this.config.showTime ? 'Select Date & Time' : 'Select Date',
      showCancelIcon: true,
      size: 'sm', // Changed from 'md' to 'sm' for medium size popup
      centered: true,
      backdrop: false, // Don't close on backdrop click
      buttons: buttons,
      responsive: true
    };
  }

  /**
   * Handle modal button clicks
   */
  onModalButtonClick(event: { action: string; data?: any }): void {
    switch (event.action) {
      case 'clear':
        this.clearDate();
        break;
      case 'cancel':
        this.cancelSelection();
        break;
      case 'save':
        this.saveSelection();
        break;
    }
  }

  /**
   * Handle date input change from modal
   */
  onDateInputChange(event: any): void {
    const value = event.target.value;
    this.dateInputError = '';
    
    if (!value.trim()) {
      this.selectedDate = null;
      this.displayDate = '';
      return;
    }

    try {
      // Try to parse the date
      const parsedDate = parseISO(value);
      if (isValid(parsedDate)) {
        this.selectedDate = parsedDate;
        this.displayDate = this.formatDate(parsedDate);
        this.generateCalendar();
      } else {
        this.dateInputError = 'Invalid date format';
      }
    } catch (error) {
      this.dateInputError = 'Invalid date format';
    }
  }

  /**
   * Cancel selection and close modal
   */
  private cancelSelection(): void {
    // Reset to original value
    if (this.value) {
      this.selectedDate = new Date(this.value);
      this.displayDate = this.formatDate(this.selectedDate);
    } else {
      this.selectedDate = null;
      this.displayDate = '';
    }
    this.closePopup();
  }

  /**
   * Save selection and close modal
   */
  private saveSelection(): void {
    if (this.selectedDate) {
      this.value = this.selectedDate;
      this.inputValue = this.formatDate(this.selectedDate);
      this.updateInputValue();
      this.emitChange();
      this.onChange(this.selectedDate);
      this.onTouched();
    }
    this.closePopup();
  }

  /**
   * Update display date when date is selected
   */
  private updateDisplayDate(): void {
    if (this.selectedDate) {
      this.displayDate = this.formatDate(this.selectedDate);
    } else {
      this.displayDate = '';
    }
  }

  /**
   * Format date for display
   */
  private formatDate(date: Date): string {
    if (!date) return '';
    return format(date, this.config.format || 'yyyy-MM-dd');
  }
}