const themeToggle = document.querySelector('#theme-toggle');
themeToggle.addEventListener('click', () => {
  const dark = document.documentElement.dataset.theme !== 'dark';
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  themeToggle.setAttribute('aria-pressed', String(dark));
  themeToggle.setAttribute('aria-label', dark ? '切换到浅色主题' : '切换到深色主题');
});

const articles = [
  [
    '给界面留一点呼吸的空间',
    '设计一个页面时，我们总想再多放一点：一个按钮、一条提示、一个新的功能入口。但有时，最好的修改是拿走一点。',
    '让标题和正文之间多一点距离，让一组信息拥有自己的边界。留白不需要证明自己的用处，它只是让阅读变得轻松。',
    '当我们不再急于填满每一个角落，界面才有机会说出它真正想表达的东西。',
  ],
  [
    '午后的光，和一本没读完的书',
    '今天把桌面收拾了一下，留下茶杯和一本还没有读完的书。窗外有风，树的影子在纸上轻轻晃动。',
    '不一定要从书里获得什么。有时一句话就足够陪伴一个下午，有时只是翻页的声音，也让人觉得安定。',
    '这样的片刻值得被记录。过了很久再翻看，仍能记起当时光的颜色。',
  ],
  [
    '把喜欢的东西，做成自己的样子',
    '开始做一个小项目，常常只是因为一句“要是能这样就好了”。没有宏大的计划，只有一点想亲手实现的好奇心。',
    '先把最小的一步做好。一个页面、一段交互、一种恰到好处的颜色。做着做着，它就慢慢有了自己的性格。',
    '把这些版本留下来，也是在记录自己如何学习、如何选择，以及如何一点点找到自己的表达。',
  ],
];
const dialog = document.querySelector('#article-dialog');
document.querySelectorAll('[data-article]').forEach((button) =>
  button.addEventListener('click', () => {
    const [title, ...paragraphs] = articles[Number(button.dataset.article)];
    document.querySelector('#article-title').textContent = title;
    document.querySelector('#article-body').replaceChildren(
      ...paragraphs.map((text) => {
        const p = document.createElement('p');
        p.textContent = text;
        return p;
      }),
    );
    dialog.showModal();
  }),
);
document.querySelector('#close-article').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) {
    const bounds = dialog.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    )
      dialog.close();
  }
});
