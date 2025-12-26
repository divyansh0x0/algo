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
      ]
    }
  }
})
