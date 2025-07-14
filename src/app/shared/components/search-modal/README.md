# 🎭 SearchModal Component System

A professional, reusable modal system with **dual animation modes** for long-running processes (3-5 minutes).

## 🚀 Features

### **Animation Modes**
- **🎯 Default Mode**: Smooth progress bar with single status messages
- **📋 Card-based Mode**: Professional step-by-step progress cards with status tracking
- **✨ Minimalist Mode**: Clean circular progress with subtle pulse animations

### **Theme Support**
- 🌞 **Light Mode**: Clean, modern white theme
- 🌙 **Dark Mode**: Professional dark theme
- 🔄 **Runtime Toggle**: Switch themes during operation

### **Smart Progress Tracking**
- ⏱️ **3-5 minute timing**: Optimized for long API calls
- 📊 **Real-time updates**: Live progress percentage and status
- 🎯 **Step tracking**: Visual status for each process phase

## 📱 Usage

### **Basic Implementation**

```typescript
import { SearchModalService, SearchModalComponent } from '../shared';

@Component({
  imports: [SearchModalComponent],
  template: '<app-search-modal></app-search-modal>'
})
export class YourComponent {
  private searchModalService = inject(SearchModalService);

  startProcess() {
    // Default animation
    this.searchModalService.showModal({
      url: 'https://example.com',
      animationType: 'default'
    });

    // Card-based animation  
    this.searchModalService.showModal({
      url: 'https://example.com',
      animationType: 'card-based'
    });

    // Minimalist animation
    this.searchModalService.showModal({
      url: 'https://example.com',
      animationType: 'minimalist'
    });
  }
}
```

### **Progress Updates**

```typescript
// Update progress during your API call
this.searchModalService.updateProgress('Analyzing website...', 25);
this.searchModalService.updateProgress('Extracting brand data...', 50);
this.searchModalService.updateProgress('Processing results...', 75);
this.searchModalService.updateProgress('Finalizing...', 100);

// Hide when complete
this.searchModalService.hideModal();
```

### **Theme Control**

```typescript
// Toggle theme
this.searchModalService.toggleTheme();

// Set specific theme
this.searchModalService.setTheme(true); // Dark mode
this.searchModalService.setTheme(false); // Light mode
```

## 🎨 Animation Modes

### **Default Mode**
- Single progress bar
- Smooth animations
- Simple status messages
- Perfect for basic processes

### **Card-based Mode**
- 4 progress step cards
- Individual card status tracking
- Professional appearance
- Builds user trust
- Ideal for complex processes

### **Minimalist Mode**
- Circular progress indicator
- Subtle pulse animations
- Clean, distraction-free design
- Perfect for users who prefer simplicity
- Elegant and modern aesthetic

## 🎛️ Configuration Options

```typescript
interface SearchModalConfig {
  url: string;                    // Required: The URL being processed
  title?: string;                 // Modal title
  description?: string;           // Process description
  estimatedTime?: string;         // Time estimation text
  isDarkMode?: boolean;           // Theme preference
  animationType?: 'default' | 'card-based' | 'minimalist'; // Animation mode
}
```

## 🔄 Progress Steps (Card Mode)

1. **🔍 URL Analysis & Validation**
2. **🌐 Website Scanning & Data Extraction**  
3. **🏢 Brand Intelligence & Recognition**
4. **📊 Final Processing & Report Generation**

## 🎭 Visual States

### **Card States**
- **⏳ Pending**: Gray, waiting state
- **🔄 In Progress**: Blue, animated, glowing
- **✅ Complete**: Green, success state

### **Animations**
- ✨ Fade in/out overlay
- 🎬 Slide in/out modal
- 💫 Card pulse animations
- 🌟 Border glow effects
- 🎯 Staggered card entrance

## 📱 Responsive Design

- **Mobile optimized**: Smaller cards and text on mobile
- **Touch friendly**: Large touch targets
- **Performance optimized**: Smooth 60fps animations

## 🔧 Technical Details

- **Framework**: Angular 17+ with standalone components
- **Animations**: Angular Animations API + CSS3
- **State Management**: RxJS BehaviorSubject
- **Theme System**: CSS custom properties
- **Performance**: Optimized for long-running processes

## 🎯 Use Cases

- ✅ API calls that take 3-5 minutes
- ✅ File upload/processing
- ✅ Data analysis workflows
- ✅ Website scanning processes
- ✅ Brand intelligence extraction
- ✅ Any long-running background task

## 🛡️ Best Practices

1. **Always show estimated time** for transparency
2. **Update progress regularly** (every 10-30 seconds)
3. **Use card mode for complex processes** (4+ steps)
4. **Provide meaningful step descriptions**
5. **Allow theme switching** for user preference
6. **Handle errors gracefully** with modal dismissal

## 🎨 Customization

The modal system is fully customizable through CSS custom properties and configuration options. Both themes are professionally designed and ready for production use.

---

**Built with ❤️ for professional Angular applications**