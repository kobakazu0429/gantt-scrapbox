export const INDENT_REGEX = /^(?:( )+|\t+)/g;
export const NOTSPACE_REGEX = /\S/g;

export type Node = {
  value: string;
  depth: number;
  subtree: Node[];
};

export type Root = {
  root: true;
  subtree: Node[];
};

export const tree = (src: string): Root => {
  const lines = src.split("\n");

  const subtree: Node[] = [];
  let depth = 0;

  const tree: Root = {
    root: true,
    subtree,
  };

  let branch = subtree;
  let lastBranch: Node[];

  const first = lines[0].match(INDENT_REGEX)?.[0].length ?? 0;

  let indent = first;
  let prev: number;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line === "" || !NOTSPACE_REGEX.test(line)) {
      continue;
    }

    prev = indent;

    indent = line.match(INDENT_REGEX)?.[0].length ?? 0;

    const isNewSection = indent === 0 && indent < prev;
    if (isNewSection) {
      indent = prev;
    }

    if (indent === prev /* same depth */) {
      let value = line.replace(INDENT_REGEX, "");

      branch.push({
        value,
        depth,
        subtree: [],
      });
    } else if (prev > indent /* shallow depth */) {
      branch = lastBranch!;
      --i;
      --depth;
    } else if (prev < indent /* deep depth */) {
      lastBranch = branch;
      branch = [];

      lastBranch[lastBranch.length - 1].subtree = branch;

      --i;
      ++depth;
    }
  }

  return tree;
};
