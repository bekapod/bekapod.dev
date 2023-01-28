document.addEventListener('alpine:init', () => {
  Alpine.store('screen', {
    sm: false,
    md: false,
    lg: false,
    xl: false,

    init() {
      this.setupMediaQuery('sm', 640)
      this.setupMediaQuery('md', 768)
      this.setupMediaQuery('lg', 1024)
      this.setupMediaQuery('xl', 1280)
    },

    setupMediaQuery(name, minWidth) {
      const mql = window.matchMedia(`(min-width: ${minWidth}px)`)
      this[name] = mql.matches
      mql.addEventListener('change', ({ matches }) => (this[name] = matches))
    },
  })

  Alpine.store('darkMode', {
    darkModeMediaQuery: (darkModeMediaQuery = window.matchMedia(
      '(prefers-color-scheme: dark)'
    )),

    init() {
      this.update()
      this.darkModeMediaQuery.addEventListener(
        'change',
        this.updateWithoutTransitions
      )
      window.addEventListener('storage', this.updateModeWithoutTransitions)
    },

    disableTransitionsTemporarily() {
      document.documentElement.classList.add('[&_*]:!transition-none')
      window.setTimeout(() => {
        document.documentElement.classList.remove('[&_*]:!transition-none')
      }, 0)
    },

    update() {
      let isSystemDarkMode = this.darkModeMediaQuery.matches
      let isDarkMode =
        window.localStorage.isDarkMode === 'true' ||
        (!('isDarkMode' in window.localStorage) && isSystemDarkMode)

      if (isDarkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }

      if (isDarkMode === isSystemDarkMode) {
        delete window.localStorage.isDarkMode
      }
    },

    updateWithoutTransitions() {
      this.disableTransitionsTemporarily()
      this.updateMode()
    },

    toggle() {
      console.log('toggling')
      this.disableTransitionsTemporarily()

      const isSystemDarkMode = this.darkModeMediaQuery.matches
      const isDarkMode = document.documentElement.classList.toggle('dark')

      if (isDarkMode === isSystemDarkMode) {
        delete window.localStorage.isDarkMode
      } else {
        window.localStorage.isDarkMode = isDarkMode
      }
    },
  })
})
