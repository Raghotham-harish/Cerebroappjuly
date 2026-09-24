import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const figmaAssetMock = {
  name: 'figma-asset-mock',
  resolveId(id: string) { if (id.startsWith('figma:asset/')) return '\0' + id; },
  load(id: string) { if (id.startsWith('\0figma:asset/')) return 'export default ""'; }
}

export default defineConfig({ plugins:[react(),tailwindcss(),figmaAssetMock], resolve:{alias:{'@':path.resolve(__dirname,'./src')}}, assetsInclude:['**/*.svg','**/*.csv'] })
