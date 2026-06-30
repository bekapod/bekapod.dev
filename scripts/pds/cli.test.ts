import { describe, expect, it, vi } from 'vitest';
import matter from 'gray-matter';
import { fireBuildHook, parsePublishArgs, publishRecord, type WriteFileImpl } from './cli.ts';
import type { Pds } from './client.ts';

function fakePds(overrides: Partial<Pds> = {}): Pds {
  return {
    did: 'did:plc:test',
    listRecords: async () => [],
    createRecord: async () => ({ uri: 'at://did:plc:test/c/new123', rkey: 'new123' }),
    putRecord: async () => ({ uri: 'at://did:plc:test/c/existing' }),
    uploadBlob: async () => {
      throw new Error('not used');
    },
    ...overrides,
  };
}

const DOC = 'site.standard.document' as const;

describe('parsePublishArgs', () => {
  it('parses the positional path with flags defaulting to false', () => {
    expect(parsePublishArgs(['posts/hello'], 'usage')).toEqual({
      path: 'posts/hello',
      dryRun: false,
      noBuild: false,
    });
  });

  it('parses the --dry-run and --no-build flags', () => {
    expect(parsePublishArgs(['posts/hello', '--dry-run', '--no-build'], 'usage')).toEqual({
      path: 'posts/hello',
      dryRun: true,
      noBuild: true,
    });
  });

  it('throws the usage string when no path is given', () => {
    expect(() => parsePublishArgs([], 'Usage: pds:publish <dir>')).toThrow(
      'Usage: pds:publish <dir>',
    );
  });
});

describe('publishRecord', () => {
  it('updates in place via putRecord when the frontmatter has an rkey', async () => {
    const putRecord = vi.fn(async () => ({ uri: 'at://did:plc:test/c/existing' }));
    const createRecord = vi.fn();
    const writeFileImpl = vi.fn<WriteFileImpl>(async () => {});

    const uri = await publishRecord({
      pds: fakePds({ putRecord, createRecord }),
      collection: DOC,
      record: { $type: DOC, title: 'X' },
      rkey: 'existing',
      frontmatter: { title: 'X', rkey: 'existing' },
      sourceFile: 'posts/x/index.md',
      sourceContent: '# Body',
      writeFileImpl,
    });

    expect(uri).toBe('at://did:plc:test/c/existing');
    expect(putRecord).toHaveBeenCalledWith(DOC, 'existing', { $type: DOC, title: 'X' });
    expect(createRecord).not.toHaveBeenCalled();
    expect(writeFileImpl).not.toHaveBeenCalled();
  });

  it('creates a record and writes the generated rkey back into the source file', async () => {
    const writeFileImpl = vi.fn<WriteFileImpl>(async () => {});

    const uri = await publishRecord({
      pds: fakePds(),
      collection: DOC,
      record: { $type: DOC, title: 'X' },
      rkey: undefined,
      frontmatter: { title: 'X' },
      sourceFile: 'posts/x/index.md',
      sourceContent: '# Body',
      writeFileImpl,
    });

    expect(uri).toBe('at://did:plc:test/c/new123');
    expect(writeFileImpl).toHaveBeenCalledTimes(1);
    const [path, data] = writeFileImpl.mock.calls[0];
    expect(path).toBe('posts/x/index.md');
    expect(matter(data).data.rkey).toBe('new123');
    expect(matter(data).content.trim()).toBe('# Body');
  });

  it('rethrows (does not swallow) when the rkey write-back fails after creation', async () => {
    const writeFileImpl = vi.fn<WriteFileImpl>(async () => {
      throw new Error('disk full');
    });
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(
      publishRecord({
        pds: fakePds(),
        collection: DOC,
        record: { $type: DOC },
        rkey: undefined,
        frontmatter: { title: 'X' },
        sourceFile: 'posts/x/index.md',
        sourceContent: '# Body',
        writeFileImpl,
      }),
    ).rejects.toThrow('disk full');

    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('new123'));
    errorSpy.mockRestore();
  });
});

describe('fireBuildHook', () => {
  it('POSTs the hook and returns the response status when configured', async () => {
    const fetchImpl = vi.fn(async () => ({ status: 200 }) as Response);
    const env = { service: 's', identifier: 'i', password: 'p', buildHook: 'https://hook.test' };

    expect(await fireBuildHook(env, fetchImpl)).toBe(200);
    expect(fetchImpl).toHaveBeenCalledWith('https://hook.test', { method: 'POST' });
  });

  it('does nothing and returns null when no hook is configured', async () => {
    const fetchImpl = vi.fn();
    const env = { service: 's', identifier: 'i', password: 'p' };

    expect(await fireBuildHook(env, fetchImpl)).toBeNull();
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
