# Coding Study Guide for This Web App

This project is a great way to learn the three main parts of web development:

- HTML: creates the structure
- CSS: changes the look
- JavaScript: makes things interactive

## 1. What the sidebar button does

The button in [index.html](index.html) is the trigger that opens and closes the sidebar.

### HTML part
The button is written like this:

```html
<button id="sidebar-toggle">☰</button>
```

This means:
- `button` creates a clickable button
- `id="sidebar-toggle"` gives it a name so JavaScript can find it
- `☰` is the icon inside the button

## 2. How the button looks

The style for the button is in [style.css](style.css).

### CSS part
Example:

```css
#sidebar-toggle {
    width: 64px;
    height: 48px;
    border-radius: 12px;
    background: #2b2f38;
}
```

This means:
- `width` changes how wide the button is
- `height` changes how tall it is
- `border-radius` changes the corners
- `background` changes the color

## 3. How the button works

The behavior is in [script.js](script.js).

```js
const toggle = document.getElementById("sidebar-toggle");
const nav = document.querySelector("nav");

toggle.addEventListener("click", function() {
    nav.classList.toggle("closed");
});
```

### What this means
- `document.getElementById("sidebar-toggle")` finds the button
- `document.querySelector("nav")` finds the sidebar
- `addEventListener("click", ...)` says: when the button is clicked, run the code
- `classList.toggle("closed")` adds or removes the `closed` class

## 4. Beginner practice questions

1. What does HTML do in this project?
2. What does CSS do in this project?
3. What does JavaScript do in this project?
4. Which file contains the button HTML?
5. Which file contains the button styling?
6. Which file contains the button click logic?
7. What property changes the button size?
8. What property changes the corners of the button?
9. What does `id="sidebar-toggle"` do?
10. What does the `click` event do?

## 5. Small coding tasks

Try these one by one:

1. Change the button color to blue.
2. Make the button bigger.
3. Move the button to the right side of the page.
4. Change the button from rounded corners to square corners.
5. Change the button text from `☰` to `Menu`.

## 6. Easy learning tip

When you learn coding, remember this pattern:

- HTML = structure
- CSS = appearance
- JavaScript = behavior

If you want, the next step can be a lesson on:
- how links work in HTML
- how classes and IDs are different
- how to make your own button from scratch
