# Webbender

> A powerful bookmarklet to **bend** the web to your will

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-16+-brightgreen)

Webbender is a feature-rich bookmarklet for you to *bend* the web to your will, because the web needs people. Made by power users for everyone. Edit text, remove elements, change fonts, apply themes, and more—all without leaving your browser.

## ✨ Quick Features

- 📝 **Edit Text** - Enable design mode to edit any text on any page
- 🗑️ **Remove Elements** - Click to delete unwanted page elements
- 🎨 **Font Override** - Apply custom or system fonts to any website
- 🌈 **Color Themes** - Dark, Light, Sepia, or create custom themes
- 💬 **Dialog Helpers** - Test alert, confirm, and prompt boxes
- 💾 **Persistent Settings** - Your preferences are saved locally
- 🔄 **Auto-Update** - Built-in update checker with notifications

## 🚀 Quick Install

### Option 1: Auto-Updating (Recommended)

1. Right-click your bookmarks bar → **Add Page** or **New Bookmark**
2. Name: `Webbender`
3. URL/Address - **paste this:**

```javascript
javascript:(function()%7B%2F**%0A%20*%20Webbender%20-%20A%20powerful%20bookmarklet%20to%20bend%20the%20web%20to%20your%20will%0A%20*%20%40author%20ilim-cell%0A%20*%20%40version%201.0.2%0A%20*%2F%0A%0A(function%20()%20%7B%0A%20%20const%20ID%20%3D%20'webbender-ui'%3B%0A%20%20const%20STORAGE_KEY%20%3D%20'webbender-settings'%3B%0A%0A%20%20%2F%2F%20Remove%20existing%20instance%0A%20%20const%20existing%20%3D%20document.getElementById(ID)%3B%0A%20%20if%20(existing)%20%7B%0A%20%20%20%20existing.remove()%3B%0A%20%20%20%20return%3B%0A%20%20%7D%0A%0A%20%20%2F%2F%20Settings%20management%0A%20%20const%20settings%20%3D%20%7B%0A%20%20%20%20editMode%3A%20false%2C%0A%20%20%20%20removeMode%3A%20false%2C%0A%20%20%20%20customFont%3A%20''%2C%0A%20%20%20%20theme%3A%20'default'%2C%0A%20%20%7D%3B%0A%0A%20%20%2F%2F%20Load%20saved%20settings%0A%20%20try%20%7B%0A%20%20%20%20const%20saved%20%3D%20localStorage.getItem(STORAGE_KEY)%3B%0A%20%20%20%20if%20(saved)%20%7B%0A%20%20%20%20%20%20Object.assign(settings%2C%20JSON.parse(saved))%3B%0A%20%20%20%20%7D%0A%20%20%7D%20catch%20(e)%20%7B%0A%20%20%20%20console.warn('Failed%20to%20load%20webbender%20settings%3A'%2C%20e)%3B%0A%20%20%7D%0A%0A%20%20%2F%2F%20Save%20settings%20to%20localStorage%0A%20%20function%20saveSettings()%20%7B%0A%20%20%20%20try%20%7B%0A%20%20%20%20%20%20localStorage.setItem(STORAGE_KEY%2C%20JSON.stringify(settings))%3B%0A%20%20%20%20%7D%20catch%20(e)%20%7B%0A%20%20%20%20%20%20console.warn('Failed%20to%20save%20webbender%20settings%3A'%2C%20e)%3B%0A%20%20%20%20%7D%0A%20%20%7D%0A%0A%20%20%2F%2F%20Create%20main%20container%0A%20%20const%20container%20%3D%20document.createElement('div')%3B%0A%20%20container.id%20%3D%20ID%3B%0A%20%20Object.assign(container.style%2C%20%7B%0A%20%20%20%20position%3A%20'fixed'%2C%0A%20%20%20%20top%3A%20'20px'%2C%0A%20%20%20%20right%3A%20'20px'%2C%0A%20%20%20%20width%3A%20'300px'%2C%0A%20%20%20%20backgroundColor%3A%20'%2318181b'%2C%0A%20%20%20%20color%3A%20'%23f4f4f5'%2C%0A%20%20%20%20padding%3A%20'16px'%2C%0A%20%20%20%20borderRadius%3A%20'12px'%2C%0A%20%20%20%20boxShadow%3A%20'0%2010px%2025px%20-5px%20rgba(0%2C%200%2C%200%2C%200.5)'%2C%0A%20%20%20%20zIndex%3A%20'2147483647'%2C%0A%20%20%20%20fontFamily%3A%20'-apple-system%2C%20BlinkMacSystemFont%2C%20Segoe%20UI%2C%20Roboto%2C%20sans-serif'%2C%0A%20%20%20%20fontSize%3A%20'13px'%2C%0A%20%20%20%20userSelect%3A%20'none'%2C%0A%20%20%20%20boxSizing%3A%20'border-box'%2C%0A%20%20%20%20border%3A%20'1px%20solid%20%2327272a'%2C%0A%20%20%20%20display%3A%20'flex'%2C%0A%20%20%20%20flexDirection%3A%20'column'%2C%0A%20%20%20%20gap%3A%20'14px'%2C%0A%20%20%7D)%3B%0A%0A%20%20%2F%2F%20Header%0A%20%20const%20header%20%3D%20document.createElement('div')%3B%0A%20%20Object.assign(header.style%2C%20%7B%0A%20%20%20%20display%3A%20'flex'%2C%0A%20%20%20%20justifyContent%3A%20'space-between'%2C%0A%20%20%20%20alignItems%3A%20'center'%2C%0A%20%20%20%20borderBottom%3A%20'1px%20solid%20%2327272a'%2C%0A%20%20%20%20paddingBottom%3A%20'8px'%2C%0A%20%20%7D)%3B%0A%0A%20%20const%20title%20%3D%20document.createElement('span')%3B%0A%20%20title.textContent%20%3D%20'Webbender'%3B%0A%20%20Object.assign(title.style%2C%20%7B%0A%20%20%20%20fontWeight%3A%20'700'%2C%0A%20%20%20%20fontSize%3A%20'14px'%2C%0A%20%20%7D)%3B%0A%0A%20%20const%20closeBtn%20%3D%20document.createElement('button')%3B%0A%20%20closeBtn.textContent%20%3D%20'%E2%9C%95'%3B%0A%20%20Object.assign(closeBtn.style%2C%20%7B%0A%20%20%20%20cursor%3A%20'pointer'%2C%0A%20%20%20%20color%3A%20'%2371717a'%2C%0A%20%20%20%20fontWeight%3A%20'bold'%2C%0A%20%20%20%20background%3A%20'none'%2C%0A%20%20%20%20border%3A%20'none'%2C%0A%20%20%20%20fontSize%3A%20'16px'%2C%0A%20%20%20%20padding%3A%20'0%204px'%2C%0A%20%20%20%20transition%3A%20'color%200.2s'%2C%0A%20%20%7D)%3B%0A%20%20closeBtn.onmouseover%20%3D%20()%20%3D%3E%20%7B%0A%20%20%20%20closeBtn.style.color%20%3D%20'%23f4f4f5'%3B%0A%20%20%7D%3B%0A%20%20closeBtn.onmouseout%20%3D%20()%20%3D%3E%20%7B%0A%20%20%20%20closeBtn.style.color%20%3D%20'%2371717a'%3B%0A%20%20%7D%3B%0A%20%20closeBtn.onclick%20%3D%20()%20%3D%3E%20%7B%0A%20%20%20%20if%20(window._webbenderRemoveMode)%20%7B%0A%20%20%20%20%20%20window._webbenderToggleRemove(false)%3B%0A%20%20%20%20%7D%0A%20%20%20%20container.remove()%3B%0A%20%20%7D%3B%0A%0A%20%20header.appendChild(title)%3B%0A%20%20header.appendChild(closeBtn)%3B%0A%0A%20%20%2F%2F%20Utility%20function%20to%20get%20or%20create%20style%20element%0A%20%20function%20getStyleElement(id)%20%7B%0A%20%20%20%20let%20el%20%3D%20document.getElementById(id)%3B%0A%20%20%20%20if%20(!el)%20%7B%0A%20%20%20%20%20%20el%20%3D%20document.createElement('style')%3B%0A%20%20%20%20%20%20el.id%20%3D%20id%3B%0A%20%20%20%20%20%20document.head.appendChild(el)%3B%0A%20%20%20%20%7D%0A%20%20%20%20return%20el%3B%0A%20%20%7D%0A%0A%20%20%2F%2F%20Edit%20Mode%20Section%0A%20%20const%20editSection%20%3D%20document.createElement('div')%3B%0A%20%20Object.assign(editSection.style%2C%20%7B%0A%20%20%20%20display%3A%20'flex'%2C%0A%20%20%20%20justifyContent%3A%20'space-between'%2C%0A%20%20%20%20alignItems%3A%20'center'%2C%0A%20%20%7D)%3B%0A%0A%20%20const%20editLabel%20%3D%20document.createElement('label')%3B%0A%20%20editLabel.textContent%20%3D%20'Edit%20Text%20(Design%20Mode)'%3B%0A%20%20Object.assign(editLabel.style%2C%20%7B%0A%20%20%20%20cursor%3A%20'pointer'%2C%0A%20%20%20%20display%3A%20'flex'%2C%0A%20%20%20%20alignItems%3A%20'center'%2C%0A%20%20%20%20gap%3A%20'8px'%2C%0A%20%20%20%20flex%3A%20'1'%2C%0A%20%20%7D)%3B%0A%0A%20%20const%20editToggle%20%3D%20document.createElement('input')%3B%0A%20%20editToggle.type%20%3D%20'checkbox'%3B%0A%20%20editToggle.checked%20%3D%20document.designMode%20%3D%3D%3D%20'on'%3B%0A%20%20Object.assign(editToggle.style%2C%20%7B%0A%20%20%20%20cursor%3A%20'pointer'%2C%0A%20%20%20%20width%3A%20'16px'%2C%0A%20%20%20%20height%3A%20'16px'%2C%0A%20%20%7D)%3B%0A%0A%20%20function%20setEditMode(enabled)%20%7B%0A%20%20%20%20document.designMode%20%3D%20enabled%20%3F%20'on'%20%3A%20'off'%3B%0A%20%20%20%20document.body.contentEditable%20%3D%20enabled%20%3F%20'true'%20%3A%20'false'%3B%0A%20%20%20%20editToggle.checked%20%3D%20enabled%3B%0A%20%20%20%20settings.editMode%20%3D%20enabled%3B%0A%20%20%20%20saveSettings()%3B%0A%20%20%7D%0A%0A%20%20editToggle.onchange%20%3D%20(e)%20%3D%3E%20setEditMode(e.target.checked)%3B%0A%20%20editLabel.appendChild(editToggle)%3B%0A%20%20editSection.appendChild(editLabel)%3B%0A%0A%20%20%2F%2F%20Remove%20Mode%20Section%0A%20%20const%20removeSection%20%3D%20document.createElement('div')%3B%0A%20%20Object.assign(removeSection.style%2C%20%7B%0A%20%20%20%20display%3A%20'flex'%2C%0A%20%20%20%20justifyContent%3A%20'space-between'%2C%0A%20%20%20%20alignItems%3A%20'center'%2C%0A%20%20%7D)%3B%0A%0A%20%20const%20removeLabel%20%3D%20document.createElement('label')%3B%0A%20%20removeLabel.textContent%20%3D%20'Remove%20Elements'%3B%0A%20%20Object.assign(removeLabel.style%2C%20%7B%0A%20%20%20%20cursor%3A%20'pointer'%2C%0A%20%20%20%20display%3A%20'flex'%2C%0A%20%20%20%20alignItems%3A%20'center'%2C%0A%20%20%20%20gap%3A%20'8px'%2C%0A%20%20%20%20flex%3A%20'1'%2C%0A%20%20%7D)%3B%0A%0A%20%20const%20removeToggle%20%3D%20document.createElement('input')%3B%0A%20%20removeToggle.type%20%3D%20'checkbox'%3B%0A%20%20Object.assign(removeToggle.style%2C%20%7B%0A%20%20%20%20cursor%3A%20'pointer'%2C%0A%20%20%20%20width%3A%20'16px'%2C%0A%20%20%20%20height%3A%20'16px'%2C%0A%20%20%7D)%3B%0A%0A%20%20window._webbenderRemoveMode%20%3D%20false%3B%0A%0A%20%20const%20hoverHandler%20%3D%20(e)%20%3D%3E%20%7B%0A%20%20%20%20if%20(e.target%20%3D%3D%3D%20container%20%7C%7C%20container.contains(e.target))%20return%3B%0A%20%20%20%20e.target.style.outline%20%3D%20'2px%20solid%20%23ef4444'%3B%0A%20%20%7D%3B%0A%0A%20%20const%20leaveHandler%20%3D%20(e)%20%3D%3E%20%7B%0A%20%20%20%20if%20(e.target%20%3D%3D%3D%20container%20%7C%7C%20container.contains(e.target))%20return%3B%0A%20%20%20%20e.target.style.outline%20%3D%20''%3B%0A%20%20%7D%3B%0A%0A%20%20const%20clickHandler%20%3D%20(e)%20%3D%3E%20%7B%0A%20%20%20%20if%20(%0A%20%20%20%20%20%20e.target%20%3D%3D%3D%20container%20%7C%7C%0A%20%20%20%20%20%20container.contains(e.target)%20%7C%7C%0A%20%20%20%20%20%20e.target.tagName%20%3D%3D%3D%20'HTML'%20%7C%7C%0A%20%20%20%20%20%20e.target.tagName%20%3D%3D%3D%20'BODY'%0A%20%20%20%20)%0A%20%20%20%20%20%20return%3B%0A%20%20%20%20e.preventDefault()%3B%0A%20%20%20%20e.stopPropagation()%3B%0A%20%20%20%20e.target.remove()%3B%0A%20%20%7D%3B%0A%0A%20%20window._webbenderToggleRemove%20%3D%20function%20(enabled)%20%7B%0A%20%20%20%20window._webbenderRemoveMode%20%3D%20enabled%3B%0A%20%20%20%20removeToggle.checked%20%3D%20enabled%3B%0A%20%20%20%20settings.removeMode%20%3D%20enabled%3B%0A%20%20%20%20saveSettings()%3B%0A%0A%20%20%20%20if%20(enabled)%20%7B%0A%20%20%20%20%20%20document.addEventListener('mouseover'%2C%20hoverHandler)%3B%0A%20%20%20%20%20%20document.addEventListener('mouseout'%2C%20leaveHandler)%3B%0A%20%20%20%20%20%20document.addEventListener('click'%2C%20clickHandler%2C%20true)%3B%0A%20%20%20%20%7D%20else%20%7B%0A%20%20%20%20%20%20document.removeEventListener('mouseover'%2C%20hoverHandler)%3B%0A%20%20%20%20%20%20document.removeEventListener('mouseout'%2C%20leaveHandler)%3B%0A%20%20%20%20%20%20document.removeEventListener('click'%2C%20clickHandler%2C%20true)%3B%0A%20%20%20%20%7D%0A%20%20%7D%3B%0A%0A%20%20removeToggle.onchange%20%3D%20(e)%20%3D%3E%20window._webbenderToggleRemove(e.target.checked)%3B%0A%20%20removeLabel.appendChild(removeToggle)%3B%0A%20%20removeSection.appendChild(removeLabel)%3B%0A%0A%20%20%2F%2F%20Typography%20Section%0A%20%20const%20fontSection%20%3D%20document.createElement('div')%3B%0A%20%20Object.assign(fontSection.style%2C%20%7B%0A%20%20%20%20display%3A%20'flex'%2C%0A%20%20%20%20flexDirection%3A%20'column'%2C%0A%20%20%20%20gap%3A%20'6px'%2C%0A%20%20%7D)%3B%0A%0A%20%20const%20fontLabel%20%3D%20document.createElement('span')%3B%0A%20%20fontLabel.textContent%20%3D%20'Typography'%3B%0A%20%20Object.assign(fontLabel.style%2C%20%7B%0A%20%20%20%20color%3A%20'%23a1a1aa'%2C%0A%20%20%20%20fontSize%3A%20'11px'%2C%0A%20%20%20%20fontWeight%3A%20'600'%2C%0A%20%20%20%20textTransform%3A%20'uppercase'%2C%0A%20%20%7D)%3B%0A%0A%20%20const%20fontSelect%20%3D%20document.createElement('select')%3B%0A%20%20Object.assign(fontSelect.style%2C%20%7B%0A%20%20%20%20background%3A%20'%2327272a'%2C%0A%20%20%20%20color%3A%20'%23f4f4f5'%2C%0A%20%20%20%20border%3A%20'1px%20solid%20%233f3f46'%2C%0A%20%20%20%20borderRadius%3A%20'6px'%2C%0A%20%20%20%20padding%3A%20'6px'%2C%0A%20%20%20%20fontSize%3A%20'13px'%2C%0A%20%20%20%20cursor%3A%20'pointer'%2C%0A%20%20%7D)%3B%0A%0A%20%20const%20fonts%20%3D%20%5B%0A%20%20%20%20%5B'Default'%2C%20''%5D%2C%0A%20%20%20%20%5B'Sans-Serif'%2C%20'-apple-system%2C%20BlinkMacSystemFont%2C%20Segoe%20UI%2C%20Roboto%2C%20sans-serif'%5D%2C%0A%20%20%20%20%5B'Serif'%2C%20'Georgia%2C%20Times%20New%20Roman%2C%20serif'%5D%2C%0A%20%20%20%20%5B'Monospace'%2C%20'Courier%20New%2C%20monospace'%5D%2C%0A%20%20%20%20%5B'Comic%20Sans'%2C%20'Comic%20Sans%20MS%2C%20Arial%2C%20sans-serif'%5D%2C%0A%20%20%5D%3B%0A%0A%20%20fonts.forEach((%5Bname%2C%20value%5D)%20%3D%3E%20%7B%0A%20%20%20%20const%20option%20%3D%20document.createElement('option')%3B%0A%20%20%20%20option.value%20%3D%20value%3B%0A%20%20%20%20option.textContent%20%3D%20name%3B%0A%20%20%20%20fontSelect.appendChild(option)%3B%0A%20%20%7D)%3B%0A%0A%20%20const%20customFontInput%20%3D%20document.createElement('input')%3B%0A%20%20customFontInput.type%20%3D%20'text'%3B%0A%20%20customFontInput.placeholder%20%3D%20'Custom%20font...'%3B%0A%20%20Object.assign(customFontInput.style%2C%20%7B%0A%20%20%20%20background%3A%20'%2327272a'%2C%0A%20%20%20%20color%3A%20'%23f4f4f5'%2C%0A%20%20%20%20border%3A%20'1px%20solid%20%233f3f46'%2C%0A%20%20%20%20borderRadius%3A%20'6px'%2C%0A%20%20%20%20padding%3A%20'6px'%2C%0A%20%20%20%20fontSize%3A%20'12px'%2C%0A%20%20%7D)%3B%0A%0A%20%20function%20applyFont(fontFamily)%20%7B%0A%20%20%20%20const%20styleEl%20%3D%20getStyleElement('webbender-font-style')%3B%0A%20%20%20%20if%20(!fontFamily)%20%7B%0A%20%20%20%20%20%20styleEl.innerHTML%20%3D%20''%3B%0A%20%20%20%20%20%20return%3B%0A%20%20%20%20%7D%0A%20%20%20%20styleEl.innerHTML%20%3D%20%60*%20%7B%20font-family%3A%20%22%24%7BfontFamily%7D%22%20!important%3B%20%7D%60%3B%0A%20%20%7D%0A%0A%20%20fontSelect.onchange%20%3D%20(e)%20%3D%3E%20%7B%0A%20%20%20%20customFontInput.value%20%3D%20''%3B%0A%20%20%20%20applyFont(e.target.value)%3B%0A%20%20%20%20settings.customFont%20%3D%20e.target.value%3B%0A%20%20%20%20saveSettings()%3B%0A%20%20%7D%3B%0A%0A%20%20customFontInput.oninput%20%3D%20(e)%20%3D%3E%20%7B%0A%20%20%20%20fontSelect.value%20%3D%20''%3B%0A%20%20%20%20applyFont(e.target.value)%3B%0A%20%20%20%20settings.customFont%20%3D%20e.target.value%3B%0A%20%20%20%20saveSettings()%3B%0A%20%20%7D%3B%0A%0A%20%20fontSection.appendChild(fontLabel)%3B%0A%20%20fontSection.appendChild(fontSelect)%3B%0A%20%20fontSection.appendChild(customFontInput)%3B%0A%0A%20%20%2F%2F%20Theme%20Section%0A%20%20const%20themeSection%20%3D%20document.createElement('div')%3B%0A%20%20Object.assign(themeSection.style%2C%20%7B%0A%20%20%20%20display%3A%20'flex'%2C%0A%20%20%20%20flexDirection%3A%20'column'%2C%0A%20%20%20%20gap%3A%20'6px'%2C%0A%20%20%7D)%3B%0A%0A%20%20const%20themeLabel%20%3D%20document.createElement('span')%3B%0A%20%20themeLabel.textContent%20%3D%20'Color%20Theme'%3B%0A%20%20Object.assign(themeLabel.style%2C%20%7B%0A%20%20%20%20color%3A%20'%23a1a1aa'%2C%0A%20%20%20%20fontSize%3A%20'11px'%2C%0A%20%20%20%20fontWeight%3A%20'600'%2C%0A%20%20%20%20textTransform%3A%20'uppercase'%2C%0A%20%20%7D)%3B%0A%0A%20%20const%20themeRow%20%3D%20document.createElement('div')%3B%0A%20%20Object.assign(themeRow.style%2C%20%7B%0A%20%20%20%20display%3A%20'grid'%2C%0A%20%20%20%20gridTemplateColumns%3A%20'repeat(2%2C%201fr)'%2C%0A%20%20%20%20gap%3A%20'6px'%2C%0A%20%20%7D)%3B%0A%0A%20%20const%20themes%20%3D%20%5B%0A%20%20%20%20%7B%20name%3A%20'Default'%2C%20bg%3A%20''%2C%20fg%3A%20''%20%7D%2C%0A%20%20%20%20%7B%20name%3A%20'Dark'%2C%20bg%3A%20'%23121212'%2C%20fg%3A%20'%23e4e4e7'%20%7D%2C%0A%20%20%20%20%7B%20name%3A%20'Light'%2C%20bg%3A%20'%23ffffff'%2C%20fg%3A%20'%2318181b'%20%7D%2C%0A%20%20%20%20%7B%20name%3A%20'Sepia'%2C%20bg%3A%20'%23f4ecd8'%2C%20fg%3A%20'%23433422'%20%7D%2C%0A%20%20%5D%3B%0A%0A%20%20themes.forEach((theme)%20%3D%3E%20%7B%0A%20%20%20%20const%20btn%20%3D%20document.createElement('button')%3B%0A%20%20%20%20btn.textContent%20%3D%20theme.name%3B%0A%20%20%20%20Object.assign(btn.style%2C%20%7B%0A%20%20%20%20%20%20background%3A%20'%2327272a'%2C%0A%20%20%20%20%20%20color%3A%20'%23f4f4f5'%2C%0A%20%20%20%20%20%20border%3A%20'1px%20solid%20%233f3f46'%2C%0A%20%20%20%20%20%20borderRadius%3A%20'6px'%2C%0A%20%20%20%20%20%20padding%3A%20'6px'%2C%0A%20%20%20%20%20%20fontSize%3A%20'11px'%2C%0A%20%20%20%20%20%20cursor%3A%20'pointer'%2C%0A%20%20%20%20%20%20transition%3A%20'all%200.2s'%2C%0A%20%20%20%20%7D)%3B%0A%0A%20%20%20%20btn.onmouseover%20%3D%20()%20%3D%3E%20%7B%0A%20%20%20%20%20%20btn.style.background%20%3D%20'%233f3f46'%3B%0A%20%20%20%20%7D%3B%0A%0A%20%20%20%20btn.onmouseout%20%3D%20()%20%3D%3E%20%7B%0A%20%20%20%20%20%20btn.style.background%20%3D%20'%2327272a'%3B%0A%20%20%20%20%7D%3B%0A%0A%20%20%20%20btn.onclick%20%3D%20()%20%3D%3E%20%7B%0A%20%20%20%20%20%20const%20styleEl%20%3D%20getStyleElement('webbender-theme-style')%3B%0A%20%20%20%20%20%20if%20(!theme.bg)%20%7B%0A%20%20%20%20%20%20%20%20styleEl.innerHTML%20%3D%20''%3B%0A%20%20%20%20%20%20%20%20settings.theme%20%3D%20'default'%3B%0A%20%20%20%20%20%20%7D%20else%20%7B%0A%20%20%20%20%20%20%20%20styleEl.innerHTML%20%3D%20%60*%20%7B%20background-color%3A%20%24%7Btheme.bg%7D%20!important%3B%20color%3A%20%24%7Btheme.fg%7D%20!important%3B%20border-color%3A%20rgba(128%2C%20128%2C%20128%2C%200.2)%20!important%3B%20%7D%60%3B%0A%20%20%20%20%20%20%20%20settings.theme%20%3D%20theme.name.toLowerCase()%3B%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20saveSettings()%3B%0A%20%20%20%20%7D%3B%0A%0A%20%20%20%20themeRow.appendChild(btn)%3B%0A%20%20%7D)%3B%0A%0A%20%20themeSection.appendChild(themeLabel)%3B%0A%20%20themeSection.appendChild(themeRow)%3B%0A%0A%20%20%2F%2F%20Dialog%20Helpers%20Section%0A%20%20const%20dialogSection%20%3D%20document.createElement('div')%3B%0A%20%20Object.assign(dialogSection.style%2C%20%7B%0A%20%20%20%20display%3A%20'flex'%2C%0A%20%20%20%20flexDirection%3A%20'column'%2C%0A%20%20%20%20gap%3A%20'6px'%2C%0A%20%20%7D)%3B%0A%0A%20%20const%20dialogLabel%20%3D%20document.createElement('span')%3B%0A%20%20dialogLabel.textContent%20%3D%20'Dialogs'%3B%0A%20%20Object.assign(dialogLabel.style%2C%20%7B%0A%20%20%20%20color%3A%20'%23a1a1aa'%2C%0A%20%20%20%20fontSize%3A%20'11px'%2C%0A%20%20%20%20fontWeight%3A%20'600'%2C%0A%20%20%20%20textTransform%3A%20'uppercase'%2C%0A%20%20%7D)%3B%0A%0A%20%20const%20dialogRow%20%3D%20document.createElement('div')%3B%0A%20%20Object.assign(dialogRow.style%2C%20%7B%0A%20%20%20%20display%3A%20'grid'%2C%0A%20%20%20%20gridTemplateColumns%3A%20'repeat(3%2C%201fr)'%2C%0A%20%20%20%20gap%3A%20'6px'%2C%0A%20%20%7D)%3B%0A%0A%20%20const%20buttonStyle%20%3D%20%7B%0A%20%20%20%20background%3A%20'%2327272a'%2C%0A%20%20%20%20color%3A%20'%23f4f4f5'%2C%0A%20%20%20%20border%3A%20'1px%20solid%20%233f3f46'%2C%0A%20%20%20%20borderRadius%3A%20'6px'%2C%0A%20%20%20%20padding%3A%20'6px'%2C%0A%20%20%20%20fontSize%3A%20'11px'%2C%0A%20%20%20%20cursor%3A%20'pointer'%2C%0A%20%20%20%20transition%3A%20'all%200.2s'%2C%0A%20%20%7D%3B%0A%0A%20%20const%20alertBtn%20%3D%20document.createElement('button')%3B%0A%20%20alertBtn.textContent%20%3D%20'Alert'%3B%0A%20%20Object.assign(alertBtn.style%2C%20buttonStyle)%3B%0A%20%20alertBtn.onmouseover%20%3D%20()%20%3D%3E%20%7B%0A%20%20%20%20alertBtn.style.background%20%3D%20'%233f3f46'%3B%0A%20%20%7D%3B%0A%20%20alertBtn.onmouseout%20%3D%20()%20%3D%3E%20%7B%0A%20%20%20%20alertBtn.style.background%20%3D%20'%2327272a'%3B%0A%20%20%7D%3B%0A%20%20alertBtn.onclick%20%3D%20()%20%3D%3E%20%7B%0A%20%20%20%20const%20msg%20%3D%20prompt('Alert%20message%3A'%2C%20'This%20is%20a%20test%20alert.')%3B%0A%20%20%20%20if%20(msg%20!%3D%3D%20null)%20alert(msg)%3B%0A%20%20%7D%3B%0A%0A%20%20const%20confirmBtn%20%3D%20document.createElement('button')%3B%0A%20%20confirmBtn.textContent%20%3D%20'Confirm'%3B%0A%20%20Object.assign(confirmBtn.style%2C%20buttonStyle)%3B%0A%20%20confirmBtn.onmouseover%20%3D%20()%20%3D%3E%20%7B%0A%20%20%20%20confirmBtn.style.background%20%3D%20'%233f3f46'%3B%0A%20%20%7D%3B%0A%20%20confirmBtn.onmouseout%20%3D%20()%20%3D%3E%20%7B%0A%20%20%20%20confirmBtn.style.background%20%3D%20'%2327272a'%3B%0A%20%20%7D%3B%0A%20%20confirmBtn.onclick%20%3D%20()%20%3D%3E%20%7B%0A%20%20%20%20const%20msg%20%3D%20prompt('Confirm%20message%3A'%2C%20'Are%20you%20sure%3F')%3B%0A%20%20%20%20if%20(msg%20!%3D%3D%20null)%20confirm(msg)%3B%0A%20%20%7D%3B%0A%0A%20%20const%20promptBtn%20%3D%20document.createElement('button')%3B%0A%20%20promptBtn.textContent%20%3D%20'Prompt'%3B%0A%20%20Object.assign(promptBtn.style%2C%20buttonStyle)%3B%0A%20%20promptBtn.onmouseover%20%3D%20()%20%3D%3E%20%7B%0A%20%20%20%20promptBtn.style.background%20%3D%20'%233f3f46'%3B%0A%20%20%7D%3B%0A%20%20promptBtn.onmouseout%20%3D%20()%20%3D%3E%20%7B%0A%20%20%20%20promptBtn.style.background%20%3D%20'%2327272a'%3B%0A%20%20%7D%3B%0A%20%20promptBtn.onclick%20%3D%20()%20%3D%3E%20%7B%0A%20%20%20%20const%20question%20%3D%20prompt('Prompt%20question%3A'%2C%20'Your%20question%3F')%3B%0A%20%20%20%20if%20(question%20!%3D%3D%20null)%20%7B%0A%20%20%20%20%20%20const%20answer%20%3D%20prompt(question%2C%20'')%3B%0A%20%20%20%20%7D%0A%20%20%7D%3B%0A%0A%20%20dialogRow.appendChild(alertBtn)%3B%0A%20%20dialogRow.appendChild(confirmBtn)%3B%0A%20%20dialogRow.appendChild(promptBtn)%3B%0A%20%20dialogSection.appendChild(dialogLabel)%3B%0A%20%20dialogSection.appendChild(dialogRow)%3B%0A%0A%20%20%2F%2F%20Action%20Buttons%0A%20%20const%20actionRow%20%3D%20document.createElement('div')%3B%0A%20%20Object.assign(actionRow.style%2C%20%7B%0A%20%20%20%20display%3A%20'grid'%2C%0A%20%20%20%20gridTemplateColumns%3A%20'repeat(2%2C%201fr)'%2C%0A%20%20%20%20gap%3A%20'6px'%2C%0A%20%20%20%20marginTop%3A%20'6px'%2C%0A%20%20%7D)%3B%0A%0A%20%20const%20resetBtn%20%3D%20document.createElement('button')%3B%0A%20%20resetBtn.textContent%20%3D%20'Reset'%3B%0A%20%20Object.assign(resetBtn.style%2C%20%7B%0A%20%20%20%20background%3A%20'%23dc2626'%2C%0A%20%20%20%20color%3A%20'%23fff'%2C%0A%20%20%20%20border%3A%20'none'%2C%0A%20%20%20%20borderRadius%3A%20'6px'%2C%0A%20%20%20%20padding%3A%20'8px'%2C%0A%20%20%20%20fontSize%3A%20'11px'%2C%0A%20%20%20%20fontWeight%3A%20'bold'%2C%0A%20%20%20%20cursor%3A%20'pointer'%2C%0A%20%20%20%20transition%3A%20'all%200.2s'%2C%0A%20%20%7D)%3B%0A%20%20resetBtn.onmouseover%20%3D%20()%20%3D%3E%20%7B%0A%20%20%20%20resetBtn.style.background%20%3D%20'%23991b1b'%3B%0A%20%20%7D%3B%0A%20%20resetBtn.onmouseout%20%3D%20()%20%3D%3E%20%7B%0A%20%20%20%20resetBtn.style.background%20%3D%20'%23dc2626'%3B%0A%20%20%7D%3B%0A%20%20resetBtn.onclick%20%3D%20()%20%3D%3E%20%7B%0A%20%20%20%20setEditMode(false)%3B%0A%20%20%20%20window._webbenderToggleRemove(false)%3B%0A%20%20%20%20const%20fontStyle%20%3D%20document.getElementById('webbender-font-style')%3B%0A%20%20%20%20if%20(fontStyle)%20fontStyle.innerHTML%20%3D%20''%3B%0A%20%20%20%20const%20themeStyle%20%3D%20document.getElementById('webbender-theme-style')%3B%0A%20%20%20%20if%20(themeStyle)%20themeStyle.innerHTML%20%3D%20''%3B%0A%20%20%20%20fontSelect.value%20%3D%20''%3B%0A%20%20%20%20customFontInput.value%20%3D%20''%3B%0A%20%20%20%20settings.editMode%20%3D%20false%3B%0A%20%20%20%20settings.removeMode%20%3D%20false%3B%0A%20%20%20%20settings.customFont%20%3D%20''%3B%0A%20%20%20%20settings.theme%20%3D%20'default'%3B%0A%20%20%20%20saveSettings()%3B%0A%20%20%7D%3B%0A%0A%20%20const%20updateBtn%20%3D%20document.createElement('button')%3B%0A%20%20updateBtn.textContent%20%3D%20'Check%20Updates'%3B%0A%20%20Object.assign(updateBtn.style%2C%20%7B%0A%20%20%20%20background%3A%20'%232563eb'%2C%0A%20%20%20%20color%3A%20'%23fff'%2C%0A%20%20%20%20border%3A%20'none'%2C%0A%20%20%20%20borderRadius%3A%20'6px'%2C%0A%20%20%20%20padding%3A%20'8px'%2C%0A%20%20%20%20fontSize%3A%20'11px'%2C%0A%20%20%20%20fontWeight%3A%20'bold'%2C%0A%20%20%20%20cursor%3A%20'pointer'%2C%0A%20%20%20%20transition%3A%20'all%200.2s'%2C%0A%20%20%7D)%3B%0A%20%20updateBtn.onmouseover%20%3D%20()%20%3D%3E%20%7B%0A%20%20%20%20updateBtn.style.background%20%3D%20'%231d4ed8'%3B%0A%20%20%7D%3B%0A%20%20updateBtn.onmouseout%20%3D%20()%20%3D%3E%20%7B%0A%20%20%20%20updateBtn.style.background%20%3D%20'%232563eb'%3B%0A%20%20%7D%3B%0A%20%20updateBtn.onclick%20%3D%20()%20%3D%3E%20%7B%0A%20%20%20%20window.open('https%3A%2F%2Fgithub.com%2Filim-cell%2Fwebbender%2Freleases'%2C%20'_blank')%3B%0A%20%20%7D%3B%0A%0A%20%20actionRow.appendChild(resetBtn)%3B%0A%20%20actionRow.appendChild(updateBtn)%3B%0A%0A%20%20%2F%2F%20Restore%20settings%0A%20%20if%20(settings.theme%20%26%26%20settings.theme%20!%3D%3D%20'default')%20%7B%0A%20%20%20%20const%20themeObj%20%3D%20themes.find((t)%20%3D%3E%20t.name.toLowerCase()%20%3D%3D%3D%20settings.theme)%3B%0A%20%20%20%20if%20(themeObj%20%26%26%20themeObj.bg)%20%7B%0A%20%20%20%20%20%20const%20styleEl%20%3D%20getStyleElement('webbender-theme-style')%3B%0A%20%20%20%20%20%20styleEl.innerHTML%20%3D%20%60*%20%7B%20background-color%3A%20%24%7BthemeObj.bg%7D%20!important%3B%20color%3A%20%24%7BthemeObj.fg%7D%20!important%3B%20border-color%3A%20rgba(128%2C%20128%2C%20128%2C%200.2)%20!important%3B%20%7D%60%3B%0A%20%20%20%20%7D%0A%20%20%7D%0A%20%20if%20(settings.editMode)%20setEditMode(true)%3B%0A%20%20if%20(settings.removeMode)%20window._webbenderToggleRemove(true)%3B%0A%20%20if%20(settings.customFont)%20%7B%0A%20%20%20%20customFontInput.value%20%3D%20settings.customFont%3B%0A%20%20%20%20applyFont(settings.customFont)%3B%0A%20%20%7D%0A%0A%20%20%2F%2F%20Assemble%20UI%0A%20%20container.appendChild(header)%3B%0A%20%20container.appendChild(editSection)%3B%0A%20%20container.appendChild(removeSection)%3B%0A%20%20container.appendChild(fontSection)%3B%0A%20%20container.appendChild(themeSection)%3B%0A%20%20container.appendChild(dialogSection)%3B%0A%20%20container.appendChild(actionRow)%3B%0A%0A%20%20document.body.appendChild(container)%3B%0A%7D)()%3B%7D)()%3B
```

### Option 2: Manual Installation

See [Installation Guide](./DEVELOPMENT.md#installation) for detailed instructions.

### Option 3: Installer Page (Drag-and-Drop)

Open the hosted installer page and drag the button to your bookmarks bar:

- https://webbender.web.app
- https://webbender.firebaseapp.com

## 📖 Usage

Click the bookmarklet to open the Webbender panel and:

- **Toggle Edit Mode** - Make webpage content editable
- **Toggle Remove Mode** - Click elements to remove them
- **Select Fonts** - Choose from 5 presets or type custom font names
- **Apply Themes** - Switch color schemes instantly
- **Test Dialogs** - Experiment with alert/confirm/prompt boxes
- **Check Updates** - See if newer versions are available
- **Reset** - Restore all settings to defaults

## 🛠️ Development

### Setup

```bash
npm install
npm run build
```

### Commands

```bash
npm run build           # Minify and generate bookmarklet
npm run format          # Format code with Prettier
npm run format:check    # Check formatting
npm run watch          # Auto-rebuild on changes
```

### Project Structure

```
src/
├── webbender.js       # Main bookmarklet (raw, formatted)
└── auto-update.js     # Auto-update service

dist/
├── webbender.js       # Minified bookmarklet
├── webbender.min.js   # CDN version
└── version.json       # Version info
```

## 🔄 How Updates Work

1. **Source of Truth**: `src/webbender.js` is maintained as clean, readable code
2. **Automated Building**: `build.js` minifies and generates bookmarklet versions
3. **CI/CD Pipeline**: GitHub Actions automatically deploys on new releases
4. **Auto-Update**: The loader bookmarklet fetches latest from jsDelivr CDN
5. **Notifications**: Users see an update prompt if a newer version exists

## ⚠️ Important

> Changes made with this bookmarklet **will NOT persist** after page reload. Save important edits with **Ctrl+S** before refreshing.

## 🔧 Customization

Want to modify Webbender?

1. Edit `src/webbender.js`
2. Run `npm run format && npm run build`
3. Test in your browser
4. Share your improvements via pull request!

## 🌐 Browser Support

| Chrome | Firefox | Safari | Edge |
|--------|---------|--------|------|
| 90+    | 88+     | 14+    | 90+  |

## 📝 Code Quality

This project uses:
- **Prettier** for consistent formatting
- **GitHub Actions** for automated testing and deployment
- **Semantic Versioning** for releases

Firebase Hosting CI/CD is configured via:
- `.github/workflows/firebase-hosting-merge.yml`
- `.github/workflows/firebase-hosting-pull-request.yml`

Repository secret required for Firebase deploy:
- `FIREBASE_SERVICE_ACCOUNT_WEBBENDER_PRO`

## 📋 Additional Resources

- [Development Guide](./DEVELOPMENT.md) - Extend and customize Webbender
- [Release Checklist](./RELEASE_CHECKLIST.md) - For maintainers
- [GitHub Releases](https://github.com/ilim-cell/webbender/releases) - Version history

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Run `npm run format` before committing
4. Submit a pull request

---

Made with ❤️ by ilim-cell | [GitHub](https://github.com/ilim-cell/webbender)

