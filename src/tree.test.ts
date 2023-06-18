import { describe, it, expect } from "vitest";
import { tree } from "./tree";

describe("tree", () => {
  it("root", () => {
    const expected = {
      root: true,
      subtree: [],
    };
    expect(tree("")).toStrictEqual(expected);
    expect(tree(" ")).toStrictEqual(expected);
    expect(tree("  ")).toStrictEqual(expected);
  });

  it("basic", () => {
    const src = `title 1
  indent 1-a
    indent 2-a
`;

    expect(tree(src)).toStrictEqual({
      root: true,
      subtree: [
        {
          value: "title 1",
          depth: 0,
          subtree: [
            {
              value: "indent 1-a",
              depth: 1,
              subtree: [
                {
                  value: "indent 2-a",
                  depth: 2,
                  subtree: [],
                },
              ],
            },
          ],
        },
      ],
    });
  });

  it.skip("advanced", () => {
    const src = `title 1
    indent 1-a
      indent 2-a
    indent 1-b
      indent 2-b
        indent 3-a

  title 2
    indent 1-c
  `;
    const actual = tree(src);
    console.log(JSON.stringify(actual, null, 2));

    expect(actual).toStrictEqual({
      root: true,
      subtree: [
        {
          value: "title 1",
          depth: 0,
          subtree: [
            {
              value: "indent 1-a",
              depth: 1,
              subtree: [
                {
                  value: "indent 2-a",
                  depth: 2,
                  subtree: [],
                },
              ],
            },
            {
              value: "indent 1-b",
              depth: 1,
              subtree: [
                {
                  value: "indent 2-b",
                  depth: 2,
                  subtree: [
                    {
                      value: "indent 3-a",
                      depth: 3,
                      subtree: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          value: "title 2",
          depth: 0,
          subtree: [
            {
              value: "indent 1-c",
              depth: 1,
              subtree: [],
            },
          ],
        },
      ],
    });
  });
});
