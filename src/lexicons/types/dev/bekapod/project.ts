import type {} from '@atcute/lexicons';
import * as v from '@atcute/lexicons/validations';
import type {} from '@atcute/lexicons/ambient';

const _mainSchema = /*#__PURE__*/ v.record(
  /*#__PURE__*/ v.tidString(),
  /*#__PURE__*/ v.object({
    $type: /*#__PURE__*/ v.literal('dev.bekapod.project'),
    /**
     * When the work was finished, if it is.
     */
    completedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
    /**
     * One-line summary shown on the tile.
     * @maxLength 3000
     * @maxGraphemes 300
     */
    description: /*#__PURE__*/ v.optional(
      /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
        /*#__PURE__*/ v.stringLength(0, 3000),
        /*#__PURE__*/ v.stringGraphemes(0, 300),
      ]),
    ),
    /**
     * Single cover image.
     * @accept image/*
     * @maxSize 1000000
     */
    image: /*#__PURE__*/ v.optional(
      /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.blob(), [
        /*#__PURE__*/ v.blobSize(1000000),
        /*#__PURE__*/ v.blobAccept(['image/*']),
      ]),
    ),
    /**
     * URL to the canonical home of the work (e.g. GitHub or Ravelry).
     */
    link: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.genericUriString()),
    /**
     * When the work itself began — first commit, cast-on, or planting.
     */
    startedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
    /**
     * Lifecycle state.
     */
    status: /*#__PURE__*/ v.optional(
      /*#__PURE__*/ v.literalEnum(['active', 'archived', 'completed']),
    ),
    /**
     * Freeform tags, e.g. tech stack.
     * @maxLength 10
     */
    tags: /*#__PURE__*/ v.optional(
      /*#__PURE__*/ v.constrain(
        /*#__PURE__*/ v.array(
          /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
            /*#__PURE__*/ v.stringLength(0, 640),
            /*#__PURE__*/ v.stringGraphemes(0, 64),
          ]),
        ),
        [/*#__PURE__*/ v.arrayLength(0, 10)],
      ),
    ),
    /**
     * Short display name for the tile.
     * @maxLength 800
     * @maxGraphemes 80
     */
    title: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
      /*#__PURE__*/ v.stringLength(0, 800),
      /*#__PURE__*/ v.stringGraphemes(0, 80),
    ]),
    /**
     * Discriminates the section: `software` renders under Projects, `knit` and `grow` under Making.
     */
    type: /*#__PURE__*/ v.literalEnum(['grow', 'knit', 'software']),
  }),
);

type main$schematype = typeof _mainSchema;

export interface mainSchema extends main$schematype {}

export const mainSchema = _mainSchema as mainSchema;

export interface Main extends v.InferInput<typeof mainSchema> {}

declare module '@atcute/lexicons/ambient' {
  interface Records {
    'dev.bekapod.project': mainSchema;
  }
}
