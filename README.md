# Kampus Unggul

Kampus Unggul is a responsive e-learning interface prototype built with HTML, CSS, and vanilla JavaScript. It demonstrates common learning-platform flows such as course discovery, a student dashboard, an academic calendar, discussion categories, downloadable resources, and a short quiz.

**Live demo:** https://chlayverts.github.io/zaza/

## Features

- Responsive multi-page interface
- Course catalog with search and level filters
- Demo login flow and student dashboard
- Calendar navigation and quiz interactions
- Form validation and accessible interaction patterns

## Technology

- HTML5
- CSS3
- Vanilla JavaScript

No build step or package installation is required.

## Run locally

Clone the repository and serve the project directory with any static HTTP server. For example:

```bash
git clone https://github.com/chlayverts/zaza.git
cd zaza
python -m http.server 8000
```

Open http://localhost:8000.

## Demo account

The login flow uses hard-coded demo credentials in the client-side JavaScript:

- Username: `student`
- Password: `kampus123`

This is a frontend demonstration only. Authentication and session data are handled in the browser, so this project must not be used to protect real accounts or personal data. Forms and course actions are also demonstrations unless connected to a backend.

## Project structure

```text
.
├── index.html       # Landing page
├── dashboard.html   # Student dashboard
├── courses.html     # Course catalog
├── calendar.html    # Academic calendar
├── forum.html       # Discussion categories
├── downloads.html   # Learning resources
├── profile.html     # Student profile
├── quiz.html        # Interactive quiz
├── styles.css       # Shared styling
└── script.js        # Shared interactions
```

## Project status

This is a portfolio prototype. A production version would need server-side authentication, persistent data, real form and enrollment endpoints, and a deployment configuration for its optional PWA assets.

## Author

**Chlayverts** · [GitHub profile](https://github.com/chlayverts)
