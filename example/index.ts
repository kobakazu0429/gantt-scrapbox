import { ulid } from "ulid";
import { tree, INDENT_REGEX, type Root, type Node } from "../src";

type NodeWithID = Omit<Node, "subtree"> & {
  id: string;
  parentId: string;
  subtree: NodeWithID[];
};

const fetchPage = async () => {
  const res = await fetch(
    "https://scrapbox.io/api/pages/kobakazu0429/GanttTest/text"
  );
  return res.text();
};

const START_BLOCK = `[g-start.icon]`;
const END_BLOCK = `[g-end.icon]`;

const builder = (root: Root) => {
  const FRONT = `gantt
dateFormat  YYYY-MM-DD
`;

  const result = [FRONT];

  const AddID = (node: NodeWithID, parentId: string): NodeWithID => {
    const id = ulid();
    node.id = id;
    node.parentId = parentId;
    node.subtree.forEach((n) => AddID(n, id));
    return node;
  };

  const walkWithConvertMermaid = (node: NodeWithID): string => {
    const [title, property] = node.value.split(":");
    const after = node.depth > 1 ? `after ${node.parentId} ,` : "";
    return [
      `${title}: ${node.id}, ${after} ${property}`,
      node.subtree.map((n) => walkWithConvertMermaid(n)),
    ]
      .flat(Infinity)
      .join("\n");
  };

  for (const $section of root.subtree) {
    const sectionId = ulid();
    // @ts-expect-error
    const section = AddID($section, sectionId);

    result.push();
    result.push(`section ${section.value}`);
    result.push(...section.subtree.map((n) => walkWithConvertMermaid(n)));
  }

  return result.join("\n");
};

const main = async () => {
  const raw = await fetchPage();
  console.log({ raw });

  const ganttText = (() => {
    const lines = raw.split("\n");
    return lines
      .slice(
        lines.findIndex((v) => v.includes(START_BLOCK)) + 1,
        lines.findIndex((v) => v.includes(END_BLOCK))
      )
      .join("\n");
  })();
  console.log({ ganttText });

  const actual = ganttText
    .split("\n")
    .reduce((prev, current) => {
      if (current === "") return prev;

      if ((current.match(INDENT_REGEX)?.[0].length ?? 0) === 0) {
        prev.push([current]);
        return prev;
      } else {
        prev.at(-1)?.push(current);
        return prev;
      }
    }, [] as string[][])
    .map((v) => tree(v.join("\n")))
    .reduce(
      (prev, current) => {
        prev.subtree.push(...current.subtree);
        return prev;
      },
      { root: true, subtree: [] }
    );

  console.log(JSON.stringify({ actual }, null, 2));

  const result = builder(actual);
  console.log(result);
};

main().catch(console.error);
