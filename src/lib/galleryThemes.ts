// 外观选项的预览色，styles/gallery.css 按 data-theme 应用页面配色。
export interface GalleryTheme {
  id: string;
  label: string;
  /** 外观菜单中的背景与强调色。 */
  swatch: [string, string];
}

export const galleryThemes: GalleryTheme[] = [
  { id: 'ink', label: '墨夜', swatch: ['#10120f', '#d1b18a'] },
  { id: 'paper', label: '宣纸', swatch: ['#e8e4da', '#8c5037'] },
  { id: 'celadon', label: '青瓷', swatch: ['#0c1d19', '#b9d6a7'] },
  { id: 'cube', label: '白盒', swatch: ['#e5e7e7', '#405b49'] },
];

export const defaultTheme = 'ink';
