import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cp, mkdtemp, mkdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const root = fileURLToPath(new URL('../', import.meta.url));

async function createFixture(t) {
  const directory = await mkdtemp(join(tmpdir(), 'zhijian-designs-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await mkdir(join(directory, 'scripts'));
  await cp(join(root, 'scripts/new-design.mjs'), join(directory, 'scripts/new-design.mjs'));
  await cp(join(root, 'templates'), join(directory, 'templates'), { recursive: true });
  return {
    directory,
    run: (id) =>
      spawnSync(process.execPath, [join(directory, 'scripts/new-design.mjs'), id], {
        cwd: tmpdir(),
        encoding: 'utf8',
      }),
  };
}

test('creates a complete design independent of the current working directory', async (t) => {
  const { directory, run } = await createFixture(t);
  const result = run('my-blog-v2');
  assert.equal(result.status, 0, result.stderr);
  const metadata = await readFile(join(directory, 'src/content/designs/my-blog-v2.md'), 'utf8');
  assert.match(metadata, /version: v2/);
  assert.match(metadata, /preview: designs\/my-blog-v2\/index.html/);
  for (const file of ['index.html', 'styles.css', 'assets/cover.svg']) {
    const content = await readFile(join(directory, 'public/designs/my-blog-v2', file), 'utf8');
    assert.ok(content.length > 0);
    assert.ok(!content.includes('__DESIGN_ID__'));
  }
});

test('refuses to overwrite archived metadata or design files', async (t) => {
  const { directory, run } = await createFixture(t);
  assert.equal(run('my-blog-v1').status, 0);
  const paths = ['src/content/designs/my-blog-v1.md', 'public/designs/my-blog-v1/index.html'];
  const originals = await Promise.all(paths.map((path) => readFile(join(directory, path), 'utf8')));
  assert.equal(run('my-blog-v1').status, 1);
  const actual = await Promise.all(paths.map((path) => readFile(join(directory, path), 'utf8')));
  assert.deepEqual(actual, originals);
});

test('rejects traversal, invalid names and missing version numbers', async (t) => {
  const { run } = await createFixture(t);
  for (const id of ['../outside-v1', 'UPPER-v1', 'no-version', 'blog-v0', 'blog/v1', '-blog-v1']) {
    assert.equal(run(id).status, 1, id);
  }
});
