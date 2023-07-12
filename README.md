### Usage

```TypeScript
import { compareUsing, prepareMatcher, searchUsing } from "order.ts";

const match = prepareMatcher("natural");

// Sorting
const byRelevanceTo = compareUsing(match);
["ab", "bc", "cd", "de"].sort(byRelevanceTo("c"));
// -> ['cd', 'bc', 'ab', 'de']

// Finding matches
const search = searchUsing(match, String);
search("c", ["ab", "bc", "cd", "de"]);
// -> ['cd', 'bc']
```
