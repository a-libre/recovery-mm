# Testing Guide

This guide helps you verify all features of the Recovery Reflections page are working correctly.

## Quick Test Checklist

### ✅ Visual & Theme
- [ ] Page loads with beautiful typography
- [ ] Text is readable (18-20px, good line height)
- [ ] Content max-width is ~700px
- [ ] Light theme displays correctly
- [ ] Click "Light/Dark" button → Theme switches
- [ ] Dark theme colors are correct (dark bg, light text)
- [ ] Theme persists after page reload

### ✅ Focus Mode
- [ ] Click "Focus mode" button
- [ ] Chapter navigation hides
- [ ] Click again → navigation reappears
- [ ] Focus mode persists after page reload

### ✅ Navigation
- [ ] Chapter navigation shows all 10 chapters
- [ ] Click any chapter link → smooth scroll to chapter
- [ ] Mobile: navigation wraps nicely
- [ ] Desktop: navigation displays in grid

### ✅ Text Selection & Resonant Lines
- [ ] Select any text (10+ characters) in insight or sparks
- [ ] Tooltip appears with "Save as Resonant" button
- [ ] Click tooltip button
- [ ] Toast notification shows "Saved as resonant line"
- [ ] Click "View Resonant Lines" in footer
- [ ] Modal opens showing saved line
- [ ] Line shows correct chapter title and timestamp
- [ ] Click "Delete" on a line → line removed
- [ ] Close modal with X button or click outside
- [ ] Resonant lines persist after page reload
- [ ] Resonant count in footer updates correctly

### ✅ Notes System
- [ ] Click "Jot 3 Sentences" button
- [ ] Notes area expands with textarea
- [ ] Character counter shows 0/500
- [ ] Type less than 140 characters → try to save
- [ ] Toast shows "Please write at least 140 characters"
- [ ] Type 140-500 characters
- [ ] Character counter turns accent color
- [ ] Click "Save Note"
- [ ] Note appears below with timestamp
- [ ] Click "Copy" on note → copied to clipboard
- [ ] Toast confirms copy
- [ ] Click "Delete" on note → note removed
- [ ] Notes persist after page reload
- [ ] Hide notes area → button text changes to "Jot 3 Sentences"

### ✅ AI Reflection (with server)
- [ ] Click "Generate AI Reflection" button
- [ ] Button disables, shows loading spinner
- [ ] AI prompts container shows "Generating..."
- [ ] 2-4 questions appear after loading
- [ ] Supportive notes appear below questions
- [ ] Hover over question → highlights
- [ ] Click question → notes area opens
- [ ] Question text inserted into textarea
- [ ] Focus moves to textarea
- [ ] Toast confirms "Prompt inserted into notes"

### ✅ AI Reflection (without server / offline)
- [ ] Open page without server running
- [ ] Click "Generate AI Reflection"
- [ ] Fallback questions display (3 pre-written questions)
- [ ] Supportive note says "AI is currently unavailable"
- [ ] Questions are clickable and insertable

### ✅ Export Data
- [ ] Click "Export JSON" in footer
- [ ] JSON file downloads
- [ ] Open file → verify structure:
  - `profile` object present
  - `resonantLines` array with saved lines
  - `notes` array with saved notes
  - `theme` setting
  - `focusMode` setting
- [ ] Verify all saved data is in export

### ✅ Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Focus rings visible and styled
- [ ] Press `Cmd/Ctrl + D` → theme toggles
- [ ] Press `Cmd/Ctrl + F` → focus mode toggles
- [ ] Press `Cmd/Ctrl + E` → data exports
- [ ] Open resonant modal, press `Escape` → modal closes
- [ ] Tab into modal content
- [ ] Tab to close button, press Enter → modal closes

### ✅ Accessibility
- [ ] Run axe DevTools or Lighthouse accessibility scan
- [ ] Score should be 95+ or no major violations
- [ ] Verify semantic HTML structure
- [ ] All images/icons have alt text (if any added)
- [ ] All buttons have accessible names
- [ ] Color contrast passes WCAG AA (4.5:1 for text)
- [ ] Reduced motion respected (test with OS setting)

### ✅ Mobile Responsiveness
- [ ] Open DevTools responsive mode
- [ ] Test at 375px width (iPhone SE)
- [ ] Test at 390px width (iPhone 12/13)
- [ ] Test at 768px width (tablet)
- [ ] Text remains readable
- [ ] Buttons are at least 44x44px (tap targets)
- [ ] Navigation wraps appropriately
- [ ] No horizontal scrolling
- [ ] All features work with touch

### ✅ Data Persistence
- [ ] Save resonant lines
- [ ] Save notes
- [ ] Generate AI prompts
- [ ] Toggle theme
- [ ] Enable focus mode
- [ ] Refresh page (Cmd+R)
- [ ] All data persists correctly
- [ ] Clear localStorage in console: `localStorage.removeItem('mm_recovery_page_v1')`
- [ ] Refresh → all data cleared, default state loads

### ✅ Performance
- [ ] Open DevTools Network tab
- [ ] Hard refresh (Cmd+Shift+R)
- [ ] Page loads in < 2 seconds
- [ ] Total size < 200KB (without AI calls)
- [ ] No console errors
- [ ] No console warnings (except missing AI endpoint)
- [ ] Run Lighthouse performance test
- [ ] Score should be 90+

## Browser Testing

Test in at least 3 browsers:

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Android

## AI Server Testing

### Node.js Server
```bash
# Install dependencies
npm install

# Start server (mock mode)
node example-server.js

# With OpenAI
# 1. Create .env: OPENAI_API_KEY=sk-...
# 2. node example-server.js

# Visit http://localhost:8000
# Test AI generation with real API
```

### Python Server
```bash
# Install dependencies
pip install -r requirements.txt

# Start server (mock mode)
python example-server.py

# With OpenAI
# 1. Create .env: OPENAI_API_KEY=sk-...
# 2. python example-server.py

# Visit http://localhost:8000
# Test AI generation with real API
```

## Common Issues & Solutions

### Issue: Fonts not loading
**Solution**: Ensure internet connection for Google Fonts. Or download fonts locally.

### Issue: AI endpoint fails
**Solution**: Check server is running. Verify CORS is enabled. Check browser console for errors.

### Issue: Data not persisting
**Solution**: Check browser allows localStorage. Private/incognito mode may block it.

### Issue: Selection tooltip not appearing
**Solution**: Must select at least 10 characters. Works on elements with `data-selectable="true"`.

### Issue: Character count not updating
**Solution**: Check console for JS errors. Verify `notes-input` and `char-count` elements exist.

### Issue: Theme not switching
**Solution**: Check `data-theme` attribute on `<html>`. Verify CSS custom properties are defined.

## Manual localStorage Inspection

Open browser console and run:

```javascript
// View all data
JSON.parse(localStorage.getItem('mm_recovery_page_v1'))

// Clear all data
localStorage.removeItem('mm_recovery_page_v1')

// Set specific theme
let data = JSON.parse(localStorage.getItem('mm_recovery_page_v1'))
data.theme = 'dark'
localStorage.setItem('mm_recovery_page_v1', JSON.stringify(data))
location.reload()
```

## Automated Testing (Future)

For automated testing, consider:
- Playwright or Cypress for E2E tests
- Jest for JavaScript unit tests
- Pa11y for accessibility testing
- Lighthouse CI for performance monitoring

---

## Success Criteria

All features pass ✅ checklist above, and:
- Page is beautiful and readable
- Typography is elegant
- Interactions feel smooth
- Data persists correctly
- AI integration works (with server)
- Fallback works (without server)
- Accessible to all users
- Fast and performant
- Mobile-friendly

**Date tested**: _______________  
**Tested by**: _______________  
**Browser/Device**: _______________  
**Pass/Fail**: _______________  
**Notes**: _______________
