// 画廊的展厅主题。色值只在这里出现一份，styles/gallery.css 按 data-theme 取值。
export interface GalleryTheme {
  id: string;
  label: string;
  /** 主题按钮上的小色块，取自墙面与画框。 */
  swatch: [string, string];
}

export const galleryThemes: GalleryTheme[] = [
  { id: 'ink', label: '墨夜', swatch: ['#241f18', '#b4462f'] },
  { id: 'paper', label: '宣纸', swatch: ['#f4eee0', '#8f3b2d'] },
  { id: 'celadon', label: '青瓷', swatch: ['#16241f', '#6f8c7f'] },
  { id: 'cube', label: '白盒', swatch: ['#f2f1ee', '#1c1c1c'] },
];

export const defaultTheme = 'ink';
