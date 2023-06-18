import { tree, extract, builder, type Node } from "../src";

const fetchPage = async () => {
  const res = await fetch(
    "https://scrapbox.io/api/pages/kobakazu0429/GanttTest/text"
  );
  return res.text();
};

const main = async () => {
  const raw = await fetchPage();
  console.log({ raw });

  const ganttText = extract(raw);
  console.log({ ganttText });

  const actual = tree(ganttText);
  console.log(JSON.stringify({ actual }, null, 2));

  const result = builder(actual);
  console.log(result);
};

main().catch(console.error);
