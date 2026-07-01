---
name: typescript-type-perf
description: Optimize TypeScript type-checking performance — reduce editor lag, language-service slowness, and `tsc` instantiation counts in libraries with heavy generics. Use this skill whenever the user mentions TypeScript being slow in their editor, type-checking taking too long, `tsc --extendedDiagnostics`, `Instantiations`, `--generateTrace`, type performance, language service lag, hovering is slow, "TS server is slow", heavy/complex generics dragging the editor, or when building/maintaining a library with feature maps, `UnionToIntersection`, conditional-intersection type aliases, or many generic parameters. Also use proactively when a user has a large generic-heavy TypeScript codebase and wants to keep type-checking fast. Do not use for runtime performance, bundle size, or non-TypeScript slowness.
metadata:
  tags: typescript, performance, generics, type-checking, compiler, library-authoring
---

## When to use

- The user reports TypeScript editor lag, slow hover/completions, or a slow TS language server.
- A library with heavy generics (feature maps, conditional types, `UnionToIntersection`, many type parameters) is type-checking slowly.
- The user wants to measure and reduce `Instantiations` from `tsc --extendedDiagnostics`.
- The user is building a plugin/feature system assembled from generics and wants it fast by construction.

This skill is about **compiler work**, not runtime speed or bundle size. If the complaint is about app loading or execution, use a different skill.

## Core mental model

Editor lag is the TypeScript language service doing the same work `tsc` does, on demand, in the file you're editing. So optimize the metric the compiler itself tracks: **`Instantiations`** — the number of times a generic type is stamped out with concrete arguments. Unlike wall-clock check time, this number is **deterministic**, so it's a stable target to optimize and regression-test against. Fewer instantiations reliably means less work for the compiler nearly everyone runs today (`tsc`).

The four levers below account for almost all real-world wins. Apply them in order of leverage.

## How to measure

Before changing anything, establish a baseline. Don't optimize blind.

1. **Count instantiations** in the package or file you care about:

   ```bash
   tsc --noEmit --extendedDiagnostics <entry> | grep -i instantiations
   ```

   Run it before and after each change. Keep a log.

2. **Find where the work is** with a trace:

   ```bash
   tsc --generateTrace <out-dir> <entry>
   # open trace <out-dir> in chrome://tracing, or the edge/edge-dev viewer
   ```

   The trace shows the single biggest type-creation sites. 70–80% of cost is often concentrated in a handful of types — find those, not every type.

3. **Add inference-guard tests.** Type performance refactors can silently break the public API (an inference that used to work no longer does). Add compile-time assertion tests that pin the inferences users rely on, so a "faster" change can't quietly ship a regression.

One nuance: these tactics target `tsc` (the compiler everyone runs today). The upcoming Go-based `tsgo` (TypeScript 7) checks types in parallel across workers that can duplicate shared work, so total instantiation count may map less directly to wall-clock time there. The tactics still help; just re-measure on the compiler your users actually run.

## The four levers

### 1. Replace hand-written conditional unions with an indexed feature map

**Smell:** A type built from many `'featureX' extends keyof TFeatures ? X : never` branches fed into a union / `UnionToIntersection`. Each branch is its own conditional type, evaluated for every `(TFeatures, TData)` pair, and because the block is anonymous, none of the work is shareable or cacheable.

**Avoid:**

```ts
// N conditional branches, re-expanded everywhere, never cached
export type Table<TFeatures, TData> = Table_Core<TFeatures, TData> &
  UnionToIntersection<
    | ('columnFilteringFeature' extends keyof TFeatures ? Table_ColumnFiltering : never)
    | ('rowSortingFeature' extends keyof TFeatures ? Table_RowSorting<TFeatures, TData> : never)
    // ...one per feature
  >
```

**Prefer:** Move the feature→type mapping into a plain named **interface** (members resolve lazily, costs almost nothing to instantiate) and select with a single indexed access:

```ts
export interface Table_FeatureMap<TFeatures extends TableFeatures, TData extends RowData> {
  columnFilteringFeature: Table_ColumnFiltering
  rowSortingFeature: Table_RowSorting<TFeatures, TData>
  // ...one per feature
}

export type Table<TFeatures extends TableFeatures, TData extends RowData> =
  Table_Core<TFeatures, TData> &
  ExtractFeatureMapTypes<TFeatures, Table_FeatureMap<TFeatures, TData>>

// One shared helper replaces N hand-written conditionals per type family
export type ExtractFeatureMapTypes<TFeatures, TFeatureMap extends object> =
  UnionToIntersectionOrEmpty<TFeatureMap[Extract<keyof TFeatures, keyof TFeatureMap>]>
```

Why it wins: indexing the interface with the registered keys replaces N conditional instantiations with one. Because the map is a real named type, plugins can declaration-merge their own entries into it — the plugin system falls out for free. Apply the same pattern across every type family that selects features (options, state, column, row, cell, header) instead of giving each its own hand-written block.

### 2. Don't make the compiler compute an intersection you can write out by hand

`UnionToIntersection` is expensive by nature: it distributes the union into a function type per member and exploits contravariance to fold them into an intersection. A function type gets created per member every time it runs, and it doesn't cache when the union's identity varies with `TData`.

For the **public** types where the selected members genuinely depend on `TFeatures`, that cost is unavoidable. But for **internal "broad" types** where all stock features are known ahead of time, write the intersection out literally:

```ts
// Stock features are known — write the intersection by hand, no UnionToIntersection
export type TableOptions_All<TFeatures extends TableFeatures, TData extends RowData> =
  TableOptions_Core<TFeatures, TData> &
  Partial<
    TableOptions_ColumnFiltering<TFeatures, TData> &
    TableOptions_ColumnGrouping &
    /* ...the other eleven stock option interfaces... */
    TableOptions_PluginFeatureMapTypes<TFeatures, TData>
  >
```

Keep `UnionToIntersection` only for the genuinely dynamic case — **plugin keys declaration-merged in by user code** — and guard it so the expensive path never runs when no plugins are merged:

```ts
type TableOptions_PluginFeatureMapTypes<TFeatures, TData> =
  [Exclude<keyof TableOptions_FeatureMap<TFeatures, TData>, StockKeys>] extends [never]
    ? unknown              // no plugins → cheap
    : UnionToIntersection</* plugin entries only */>
```

### 3. Prefer interfaces over conditional-intersection aliases for hot internal types

**Smell:** An internal type used at hundreds of generic call sites is defined as a conditional-intersection alias (e.g. the public conditional type plus a few internal fields). Every internal call re-expands the feature conditional. Profiling shows the function types that `UnionToIntersection` distributes as the single biggest type-creation site in the program.

**Fix:** Redefine the internal type as an **interface** that extends only the core interfaces and redeclares its internal slots in their "broad" (all-features-present) forms. No feature-map conditional, statically known members, a stable identity the compiler can relate without re-expanding the feature union each time.

```ts
export interface Table_Internal<TFeatures extends TableFeatures, TData extends RowData = any>
  extends
    Omit<Table_Table<TFeatures, TData>, '_rowModels' | '_rowModelFns' | 'options' | 'initialState' | 'store'>,
    Table_Columns<TFeatures, TData>,
    Table_Rows<TFeatures, TData>,
    Table_RowModels<TFeatures, TData>,
    Table_Headers<TFeatures, TData> {
  // internal slots redeclared in their broad all-features variants
  options: TableOptions_All<TFeatures, TData> & { /* state, atoms */ }
  initialState: TableState_All
  _rowModels: CachedRowModel_All<TFeatures, TData>
}
```

Internal code rarely needs the feature-conditional view — it already operates on broad types. The public type stays untouched, so user-facing inference doesn't change.

### 4. Annotate invariant type parameters with `in out` (highest leverage per character)

When TypeScript relates `SomeInterface<A>` to `SomeInterface<B>`, it wants to skip the member-by-member comparison and just compare `A` to `B`. To do that it needs the **variance** of each type parameter, which it normally derives by probing the structure. **But when a type parameter flows into conditional types — which `TFeatures` does everywhere — that variance measurement comes back marked unreliable, and the compiler falls back to comparing the full structure.** That fallback, repeated across many generic call sites, is a huge source of cost.

Annotating the parameter `in out` (invariant) tells the compiler the variance directly, so it relates instantiations by their type arguments with **no probing and no structural fallback**:

```ts
export interface Table_Core<
  in out TFeatures extends TableFeatures,
  in out TData extends RowData,
> { /* ... */ }
```

Important properties to understand (not just cargo-cult):

- This is **not a cache** and changes no behavior when the parameter is already invariant in practice. It's a shortcut for the compiler's relation step.
- The compiler validates variance annotations, but it lets you declare a parameter *more* restrictive than its structure requires, and invariant is the most restrictive. So `in out` always passes that check — **safe** in the sense that it can only remove assignments the compiler would otherwise have allowed, never introduce an unsound one.
- The cost shows up when you annotate a parameter that your code relied on being co/contravariant. Annotating a genuinely covariant output-position parameter `in out` will reject a widening your build needs — **a failing build is the check the annotation itself doesn't do**. So: only annotate parameters that are invariant in practice, and treat a broken build as the signal to back that one out. Measure, don't assume.

Annotate the hot internal interface's parameters first (biggest single win), then annotate the rest of the library's generic interfaces. Two keywords per parameter, win everywhere.

## One more lever: explicit type arguments at construction sites

After the core types are fast, the profiler often points at **type inference** in adapter/wrapper code. A construction call that spreads into an anonymous object forces the compiler to infer the generic parameters back out of the object's shape — far more involved than a plain comparison:

```ts
// Avoid: anonymous object → expensive inference of TFeatures, TData
const table = constructTable({
  ...tableOptions,
  features: { coreReactivityFeature: reactivity(), ...tableOptions.features },
})

// Prefer: tell the compiler the parameters, leaving only an assignability check
const table = constructTable<TFeatures, TData>({
  ...tableOptions,
  features: { coreReactivityFeature: reactivity(), ...tableOptions.features },
})
```

Audit any construction helper that takes an options object: if the type arguments are already in scope, pass them explicitly. A five-minute audit, often worth ~15% of a package's check.

## Pitfalls and limits (measured, not assumed)

- **Named types are cache points only when their arguments repeat.** Wrapping a conditional that still varies per call site in another named layer *adds* instantiations — it doesn't create sharing. The hand-written intersection in lever 2 wins because it removed the computation, not because it renamed it. If you try "split this into a static half so it caches better" and instantiations go up, revert. Keep the numbers in the log.
- **`UnionToIntersection` is correct but costly.** Keep it where membership is genuinely dynamic (declaration-merged plugin keys), eliminate it where membership is statically known.
- **Annotating `in out` on a non-invariant parameter breaks builds.** That's the feature working as designed — back out that parameter only, keep the rest.
- **Don't optimize for a compiler your users don't run.** Re-measure on `tsc` (today's reality); treat `tsgo` numbers as secondary until it ships.

## Workflow

When applying this skill:

1. **Baseline** — record `Instantiations` for the target package/file with `tsc --extendedDiagnostics`.
2. **Trace** — `tsc --generateTrace` to find the top type-creation sites. Don't guess; let the trace point.
3. **Diagnose which lever** — conditional-union smell → lever 1; broad internal type running `UnionToIntersection` over known members → lever 2; hot internal alias → lever 3; variance-unreliable params flowing into conditionals → lever 4; adapter inference → explicit type args.
4. **Change one lever at a time**, re-measuring instantiations after each. Keep a log of before/after.
5. **Run inference-guard tests** after every change so a faster type can't silently break public inference.
6. **Report** the delta in instantiations (and check-time if you also track it), and note which lever accounted for the win.

## Quick reference — the rules in four lines

1. Measure `Instantiations`; `--generateTrace` tells you where to look.
2. Named types are cache points only when their arguments repeat — don't rename per-call-site computation.
3. Interfaces beat conditional-intersection aliases for hot internal types, but only if the compiler can relate them by their type arguments — which requires:
4. Annotate invariant type parameters `in out`. When generics touch conditional types, variance measurement goes unreliable and you silently pay structural fallbacks. This is the highest leverage-per-character change.
