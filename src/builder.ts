import { ulid } from "ulid";
import { type Root, type Node } from "../src";

export type NodeWithID = Omit<Node, "subtree"> & {
  id: string;
  parentId: string;
  subtree: NodeWithID[];
};

export const START_BLOCK = `[g-start.icon]`;
export const END_BLOCK = `[g-end.icon]`;

export const FRONT = `gantt
dateFormat  YYYY-MM-DD
`;

export const builder = (root: Root): string => {
  const $root = structuredClone(root);
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

  for (const $section of $root.subtree) {
    const sectionId = ulid();
    // @ts-expect-error
    const section = AddID($section, sectionId);

    result.push();
    result.push(`section ${section.value}`);
    result.push(...section.subtree.map((n) => walkWithConvertMermaid(n)));
  }

  return result.join("\n");
};

type Options = {
  startBlock: string;
  endBlock: string;
};

export const extract = (
  raw: string,
  options: Partial<Options> = {}
): string => {
  const lines = raw.split("\n");
  const gantt = lines
    .slice(
      lines.findIndex((v) => v.includes(options.startBlock ?? START_BLOCK)) + 1,
      lines.findIndex((v) => v.includes(options.endBlock ?? END_BLOCK))
    )
    .join("\n");
  return gantt;
};
