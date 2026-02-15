import coreWebVitals from 'eslint-config-next/core-web-vitals'

const eslintConfig = [
  ...coreWebVitals,
  {
    ignores: ['src/app/.well-known/**'],
  },
]

export default eslintConfig
