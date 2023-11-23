import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES
    ? '/isbn-bulksearch/' // レポジトリ名を設定
    : './'
})
