# Besorah Yeshua International Ministry Website

A modern, responsive website for Besorah Yeshua International Ministry, dedicated to spreading the Gospel across Ethiopia.

## 🎨 Brand Colors

- **Primary Blue**: `#205782`
- **Secondary Orange**: `#f2842f`
- Supporting colors for gradients and accents

## 📁 Project Structure

```
besorah-yeshua/
├── index.html           # Homepage
├── about.html           # About Us page
├── events.html          # Events listing
├── partnership.html     # Partnership opportunities
├── contact.html         # Contact form
├── donate.html          # Donation page
├── styles/
│   └── style.css       # Main stylesheet
├── scripts/
│   └── main.js         # JavaScript functionality
└── _redirects          # Netlify configuration
```

## 🚀 Features

- **Responsive Design**: Mobile-first approach, works on all devices
- **Modern UI**: Clean, professional design with smooth animations
- **Event Management**: Dynamic event filtering and display
- **Partnership Portal**: Multiple partnership opportunities
- **Donation Integration**: PayPal integration ready
- **Contact Forms**: User-friendly contact forms
- **SEO Optimized**: Proper meta tags and semantic HTML

## 📋 Pages Overview

### Home (index.html)
- Hero section with call-to-action
- Ministry statistics
- Mission cards
- Event and partnership CTAs
- Scripture section

### About (about.html)
- Ministry story
- Mission, Vision, Values
- Impact statistics
- Ministry zones coverage

### Events (events.html)
- Event filtering system
- Event cards with details
- Registration CTAs
- Event statistics

### Partnership (partnership.html)
- Partnership types
- Benefits overview
- Testimonials
- Application process

### Contact (contact.html)
- Contact information
- Contact form
- Ministry zones
- Social media links

### Donate (donate.html)
- Impact examples
- Multiple giving options
- PayPal integration
- Alternative giving methods

## 🛠️ Setup Instructions

### For Netlify Deployment

1. **Create a GitHub Repository**
   - Create a new repository on GitHub
   - Upload all project files maintaining the folder structure

2. **Connect to Netlify**
   - Log in to [Netlify](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Choose GitHub and select your repository
   - Configure build settings:
     - Build command: (leave empty)
     - Publish directory: `/`
   - Click "Deploy site"

3. **Configure PayPal** (Optional)
   - Get your PayPal Client ID from [PayPal Developer](https://developer.paypal.com/)
   - In `donate.html`, replace `YOUR_CLIENT_ID` with your actual Client ID:
     ```html
     <script src="https://www.paypal.com/sdk/js?client-id=YOUR_ACTUAL_CLIENT_ID&currency=USD"></script>
     ```

4. **Custom Domain** (Optional)
   - In Netlify dashboard, go to "Domain settings"
   - Add your custom domain
   - Configure DNS records as instructed

### Local Development

1. **Clone or download the project files**

2. **Organize files in this structure:**
   ```
   your-project-folder/
   ├── index.html
   ├── about.html
   ├── events.html
   ├── partnership.html
   ├── contact.html
   ├── donate.html
   ├── styles/
   │   └── style.css
   └── scripts/
       └── main.js
   ```

3. **Open with a local server**
   - Use VS Code Live Server extension, or
   - Use Python: `python -m http.server 8000`, or
   - Simply open `index.html` in your browser

## 🔧 Customization

### Update Contact Information

Edit the contact details in the footer and contact page:
- Email: `info@besorahyeshua.org`
- Phone: `+251 XXX XXX XXX`
- Location: Oromia, Ethiopia

### Update Social Media Links

In all HTML files, find the social links section and update the `href` attributes:
```html
<a href="YOUR_FACEBOOK_URL"><i class="fab fa-facebook-f"></i></a>
<a href="YOUR_INSTAGRAM_URL"><i class="fab fa-instagram"></i></a>
<a href="YOUR_YOUTUBE_URL"><i class="fab fa-youtube"></i></a>
<a href="YOUR_TWITTER_URL"><i class="fab fa-twitter"></i></a>
```

### Update Events

Edit the events in `events.html`, following the existing card structure.

### Modify Colors

Edit CSS variables in `styles/style.css`:
```css
:root {
    --primary-color: #205782;
    --secondary-color: #f2842f;
    /* Update other colors as needed */
}
```

## 📧 Form Submission

The contact form currently shows a success message. To connect it to a backend:

### Option 1: FormSpree
1. Sign up at [FormSpree](https://formspree.io/)
2. Create a form and get your endpoint
3. Update the form in `contact.html`:
   ```html
   <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
   ```

### Option 2: Netlify Forms
1. Add `netlify` attribute to the form:
   ```html
   <form name="contact" method="POST" data-netlify="true">
   ```
2. Submissions will appear in your Netlify dashboard

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## 📱 Responsive Breakpoints

- Desktop: 1200px+
- Tablet: 768px - 1199px
- Mobile: < 768px

## ⚡ Performance

- Optimized CSS
- Minimal JavaScript
- CDN-hosted libraries (Font Awesome)
- Fast loading times

## 🔒 Security

- No sensitive data stored in frontend
- HTTPS ready (via Netlify)
- Secure payment processing (PayPal)

## 📄 License

This project is created for Besorah Yeshua International Ministry.

## 🤝 Support

For technical support or questions:
- Email: info@besorahyeshua.org
- Create an issue in the GitHub repository

## 🎯 Future Enhancements

Potential features to add:
- Blog section
- Image gallery
- Video testimonials
- Newsletter signup
- Multi-language support
- Member portal
- Event calendar integration

## 📝 Notes

- Replace placeholder phone numbers with actual contact information
- Add real images to replace placeholder icons
- Set up actual email integration for forms
- Configure PayPal with production credentials before going live
- Test all forms and donation flows before launch
- Set up Google Analytics for tracking (optional)

---

**Developed with ❤️ for Besorah Yeshua International Ministry**