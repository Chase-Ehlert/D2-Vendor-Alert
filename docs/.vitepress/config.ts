import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "D2 Vendor Alert",
  description: "A Discord bot integrated with Destiny 2's API",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' }
    ],

    sidebar: [
      {
        text: 'Navigate',
        items: [
          { text: 'Installation', link: '/installation' },
          { text: 'Software Architecture', link: '/software-architecture' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Chase-Ehlert/D2-Vendor-Alert' }
    ]
  },
  base: "/D2-Vendor-Alert/"
})
