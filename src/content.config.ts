import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const localPath = z
  .string()
  .regex(
    /^designs\/[a-z0-9-]+\/[a-zA-Z0-9/_-]+\.(html|svg|png|jpe?g|webp)$/,
    '请使用 designs/<id>/ 下的相对文件路径',
  );

const designs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/designs' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(['博客', '网站', '工具']),
    tags: z.array(z.string()),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    version: z.string(),
    cover: localPath,
    preview: localPath,
    colors: z.array(z.string().regex(/^#[0-9a-fA-F]{6}$/)).min(1),
    source: z.url({ protocol: /^https?$/ }).optional(),
    commit: z.string().optional(),
  }),
});

export const collections = { designs };
