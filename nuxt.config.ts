// https://nuxt.com/docs/api/configuration/nuxt-config
// nuxt.config.ts
import fs from 'fs'
import path from 'path'

const cssDir = path.resolve('app/assets/css')
const cssFiles = fs.readdirSync(cssDir)
    .filter(f => f.endsWith('.css'))
    .map(f => `~/assets/css/${f}`)

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: false,
  nitro:{
    preset: 'static',
  },

  devtools: { enabled: true },
  css: cssFiles,
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/ui',
    '@nuxt/test-utils',
  ],
  vite: {
    plugins: []
  },
  app:{
    baseURL: '/algo/',
    head:{
      title: 'Algorithm Visualizer',
      htmlAttrs: {
        lang: 'en',
      },
      link:[
        {rel: 'icon', href: '/favicon.ico'},
        {rel:"preconnect", href:"https://fonts.googleapis.com"},
        {rel:"preconnect", href:"https://fonts.gstatic.com", crossorigin:""},
        {rel:"stylesheet", href:"https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Noto+Sans:ital,wght@0,100..900;1,100..900&display=swap"}
      ]
    }
  }
})
