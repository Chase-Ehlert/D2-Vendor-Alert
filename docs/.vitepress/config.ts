import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "D2 Vendor Alert",
  description: "A Discord bot integrated with Destiny 2's API",
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' }
    ],

    sidebar: [
      {
        text: 'Navigate',
        items: [
          { text: 'Installation', link: '/installation' },
          {
             text: 'Software Architecture',
             items: [
              { text: 'Project Context', link: '/software-architecture/context' },
              { text: 'D2 Vendor Alert', link: '/software-architecture/d2-vendor-alert' },
              { text: 'Discord Notifier', link: '/software-architecture/discord-notifier' }
            ]
          }
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Chase-Ehlert/D2-Vendor-Alert' }
    ]
  },
  base: "/D2-Vendor-Alert/"
})
