import { Inter, Lora } from 'next/font/google'

// UI全体で使うサンス体
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

// AI(先生役)の発言だけに使うセリフ体。
// 「先生が語りかけている」トーンを出すための意図的な使い分け。
export const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
})
