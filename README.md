# AppTheta Ecom

React 19 + Vite conversion of the original static HTML/CSS/JS e-commerce template — same design, fully responsive, rebuilt as a single-page application with React Router.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL in your browser.

## Build

```bash
npm run build
npm run preview
```

## Stack

- React 19 + React Router 7
- Original Bootstrap 5.3.3 + custom CSS (`public/assets/css/style.css`) and vendor JS (Bootstrap bundle, Swiper) loaded as-is for pixel-identical styling
- Cart, quick view, and wishlist state managed via React context (`src/context`)
