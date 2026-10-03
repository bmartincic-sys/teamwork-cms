#!/usr/bin/env python3
"""
prune.py - remove CSS the site cannot use, without changing what it renders.

Two passes over src/assets/css/style.css, both conservative:

  unused   Drop selectors whose required classes appear nowhere: not in the built
           site (HTML, inline scripts, JS, JSON) and not in the templates or data
           files, so a class behind a template condition that is off today still
           counts as used. A class inside :not(), :is(), :has() and friends never
           makes a selector dead. Classes a script builds by concatenation
           ("tone-" + n) keep their whole prefix. A rule goes when every selector
           in its list is dead; unused @keyframes go with it.

  shadowed Drop a declaration when a later rule with the identical selector list,
           in the identical @media context, sets the same property with the same
           importance. That later declaration always wins for exactly the same
           elements, so the earlier one can never apply. Values using color-mix()
           are left alone (an older browser would fall back to the earlier one).

Edits are made on the original text by position, so everything that is kept keeps
its exact formatting and comments. Run after `npm run build`:

    python3 tools/css/prune.py            # report only
    python3 tools/css/prune.py --write    # rewrite style.css
"""
import glob
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CSS = os.path.join(ROOT, "src", "assets", "css", "style.css")
SITE = os.path.join(ROOT, "_site")


# ---------------------------------------------------------------- parsing
def parse(text):
    """Return a flat list of nodes with positions:
    {kind: 'rule'|'at'|'comment', start, end, prelude, pstart, pend, bstart, bend, ctx}
    ctx is the tuple of enclosing at-rule preludes."""
    nodes = []
    i, n = 0, len(text)

    def skip_ws(i):
        while i < n and text[i].isspace():
            i += 1
        return i

    def walk(i, end, ctx):
        while True:
            i = skip_ws(i)
            if i >= end:
                return i
            if text.startswith("/*", i):
                j = text.index("*/", i) + 2
                nodes.append({"kind": "comment", "start": i, "end": j, "ctx": ctx})
                i = j
                continue
            if text[i] == "}":
                return i
            # prelude up to { or ; (at-rules like @import) honoring strings/parens
            j, depth, q = i, 0, None
            while j < end:
                c = text[j]
                if q:
                    if c == "\\":
                        j += 2
                        continue
                    if c == q:
                        q = None
                elif c in "\"'":
                    q = c
                elif c == "(":
                    depth += 1
                elif c == ")":
                    depth -= 1
                elif depth == 0 and c in "{;":
                    break
                elif text.startswith("/*", j):
                    j = text.index("*/", j) + 2
                    continue
                j += 1
            prelude = text[i:j].strip()
            if text[j] == ";":
                nodes.append({"kind": "stmt", "start": i, "end": j + 1, "ctx": ctx})
                i = j + 1
                continue
            bstart = j + 1
            if prelude.startswith("@") and re.match(r"@(media|supports|layer|container|document)\b", prelude):
                k = walk(bstart, end, ctx + (re.sub(r"\s+", " ", prelude),))
                assert text[k] == "}", ("unbalanced", k)
                nodes.append({"kind": "at", "start": i, "end": k + 1, "prelude": prelude, "ctx": ctx,
                              "bstart": bstart, "bend": k})
                i = k + 1
                continue
            # a block of declarations (style rule, @font-face, @property) or @keyframes
            k, depth, q = bstart, 1, None
            while k < end:
                c = text[k]
                if q:
                    if c == "\\":
                        k += 2
                        continue
                    if c == q:
                        q = None
                elif c in "\"'":
                    q = c
                elif text.startswith("/*", k):
                    k = text.index("*/", k) + 2
                    continue
                elif c == "{":
                    depth += 1
                elif c == "}":
                    depth -= 1
                    if depth == 0:
                        break
                k += 1
            kind = "keyframes" if prelude.startswith("@keyframes") or prelude.startswith("@-webkit-keyframes") else (
                "atblock" if prelude.startswith("@") else "rule")
            nodes.append({"kind": kind, "start": i, "end": k + 1, "prelude": prelude, "pstart": i, "pend": j,
                          "bstart": bstart, "bend": k, "ctx": ctx})
            i = k + 1

    walk(0, n, ())
    nodes.sort(key=lambda x: x["start"])
    return nodes


def split_top(s, sep=","):
    out, depth, cur, q = [], 0, "", None
    for c in s:
        if q:
            cur += c
            if c == q:
                q = None
            continue
        if c in "\"'":
            q = c
        elif c in "([":
            depth += 1
        elif c in ")]":
            depth -= 1
        if c == sep and depth == 0:
            out.append(cur)
            cur = ""
        else:
            cur += c
    out.append(cur)
    return out


def declarations(text, bstart, bend):
    """[(prop, value, important, start, end)] for a declaration block, positions absolute."""
    body = text[bstart:bend]
    out, i, n = [], 0, len(body)
    while i < n:
        while i < n and (body[i].isspace() or body[i] == ";"):
            i += 1
        if i >= n:
            break
        if body.startswith("/*", i):
            i = body.index("*/", i) + 2
            continue
        j, depth, q = i, 0, None
        while j < n:
            c = body[j]
            if q:
                if c == "\\":
                    j += 2
                    continue
                if c == q:
                    q = None
            elif c in "\"'":
                q = c
            elif c == "(":
                depth += 1
            elif c == ")":
                depth -= 1
            elif c == ";" and depth == 0:
                break
            j += 1
        decl = body[i:j]
        if ":" in decl:
            prop, val = decl.split(":", 1)
            imp = bool(re.search(r"!\s*important\s*$", val))
            out.append((prop.strip().lower(), val.strip(), imp, bstart + i, bstart + min(j + 1, n)))
        i = j + 1
    return out


# ---------------------------------------------------------------- usage
def corpus():
    files = []
    for pat in ("**/*.html", "**/*.js", "**/*.json", "**/*.xml", "**/*.txt"):
        files += glob.glob(os.path.join(SITE, pat), recursive=True)
    for pat in ("**/*.njk", "**/*.js", "**/*.json", "**/*.md", "**/*.html", "**/*.txt"):
        files += glob.glob(os.path.join(ROOT, "src", pat), recursive=True)
    files += glob.glob(os.path.join(ROOT, "eleventy.config.js"))
    seen, chunks = set(), []
    for f in files:
        if f in seen or f.endswith(".css"):
            continue
        seen.add(f)
        try:
            chunks.append(open(f, encoding="utf8", errors="ignore").read())
        except IsADirectoryError:
            pass
    return "\n".join(chunks)


def built_prefixes(text):
    """Class-name prefixes that scripts or templates complete at run or build time."""
    pre = set(re.findall(r"""["'`]([A-Za-z][\w-]*-)["'`]\s*\+""", text))
    pre |= set(re.findall(r"""([A-Za-z][\w-]*-)\$\{""", text))
    pre |= set(re.findall(r"""([A-Za-z][\w-]*-)\{\{""", text))
    pre |= set(re.findall(r"""([A-Za-z][\w-]*-)\{%""", text))
    return pre


def required_classes(selector):
    """Classes a selector positively requires: outside any functional pseudo-class."""
    flat, depth = "", 0
    for c in selector:
        if c == "(":
            depth += 1
        elif c == ")":
            depth -= 1
        elif depth == 0:
            flat += c
    flat = re.sub(r"\[[^\]]*\]", "", flat)
    return set(re.findall(r"\.(-?[A-Za-z_][\w-]*)", flat))


# A later value an older browser might reject; then the earlier one would still apply.
FRAGILE = re.compile(r"color-mix\(|light-dark\(|oklch\(|\blab\(|-webkit-|-moz-|\b\d*[sld]vh\b|\b\d*[sld]vw\b")


# ---------------------------------------------------------------- passes
def main():
    write = "--write" in sys.argv
    text = open(CSS, encoding="utf8").read()
    nodes = parse(text)
    words = corpus()
    tokens = set(re.findall(r"[A-Za-z_][\w-]*", words))
    prefixes = built_prefixes(words)

    def used(cls):
        return cls in tokens or any(cls.startswith(p) for p in prefixes)

    edits = []  # (start, end, replacement)
    removed_rules = trimmed_lists = 0
    dead_classes = set()

    rules = [x for x in nodes if x["kind"] == "rule"]
    broken = 0
    for r in rules:
        # comment text left outside a comment (its opener was lost) turns the next rule's
        # prelude into an invalid selector; browsers drop that whole block, so it goes
        if "*/" in re.sub(r"/\*.*?\*/", "", r["prelude"], flags=re.S):
            r["dead"] = True
            broken += 1
            continue
    for r in rules:
        if r.get("dead"):
            continue
        sels = split_top(re.sub(r"/\*.*?\*/", "", r["prelude"], flags=re.S))
        keep = []
        for s in sels:
            req = required_classes(s)
            dead = [c for c in req if not used(c)]
            if dead:
                dead_classes.update(dead)
            else:
                keep.append(s)
        if not keep:
            r["dead"] = True
            removed_rules += 1
        elif len(keep) < len(sels) and "/*" not in r["prelude"]:
            # a list with comments inside it is left whole rather than cut mid-comment
            r["prelude_new"] = ",".join(keep).strip()
            trimmed_lists += 1

    # keyframes no surviving rule refers to
    live_text = "".join(text[r["bstart"]:r["bend"]] for r in nodes
                        if r["kind"] in ("rule", "atblock") and not r.get("dead"))
    dead_kf = 0
    for k in [x for x in nodes if x["kind"] == "keyframes"]:
        name = k["prelude"].split()[-1]
        if not re.search(r"(?<![\w-])" + re.escape(name) + r"(?![\w-])", live_text):
            k["dead"] = True
            dead_kf += 1

    # shadowed declarations: same selector list + same context, later rule wins
    def norm_sel(s):
        return ",".join(re.sub(r"\s+", " ", x.strip()) for x in split_top(s))

    groups = {}
    for r in rules:
        if r.get("dead"):
            continue
        key = (r["ctx"], norm_sel(r.get("prelude_new", r["prelude"])))
        groups.setdefault(key, []).append(r)
    shadowed = 0
    for key, rs in groups.items():
        if len(rs) < 2:
            continue
        later = {}
        for r in reversed(rs):
            decls = declarations(text, r["bstart"], r["bend"])
            drop = []
            for prop, val, imp, s, e in decls:
                if (prop, imp) in later and not FRAGILE.search(later[(prop, imp)]):
                    drop.append((s, e))
            # record this rule's declarations as "later" for earlier rules; within one
            # rule a repeated property is a fallback pair, so only the last one counts
            for prop, val, imp, s, e in decls:
                later.setdefault((prop, imp), val)
            if drop:
                r.setdefault("drop", []).extend(drop)
                shadowed += len(drop)
                if len(drop) == len(decls):
                    r["dead"] = True

    # comments: a comment goes when everything it introduces (up to the next comment
    # or the end of its block) has gone
    for idx, c in enumerate(nodes):
        if c["kind"] != "comment":
            continue
        follow = []
        for x in nodes[idx + 1:]:
            if x["start"] < c["end"]:
                continue
            if len(x["ctx"]) > len(c["ctx"]):
                continue            # inside an at-rule already counted
            if x["kind"] == "comment" or x["ctx"] != c["ctx"]:
                break
            follow.append(x)
        if follow and all(x.get("dead") for x in follow):
            c["dead"] = True

    # @media blocks whose contents are all gone
    for a in [x for x in nodes if x["kind"] == "at"]:
        inner = [x for x in nodes if a["bstart"] <= x["start"] and x["end"] <= a["bend"]]
        if inner and all(x.get("dead") for x in inner if x["kind"] != "comment"):
            a["dead"] = True

    # build edits, outermost dead node wins
    dead_spans = sorted((x["start"], x["end"]) for x in nodes if x.get("dead"))
    merged = []
    for s, e in dead_spans:
        if merged and s < merged[-1][1]:
            continue
        merged.append((s, e))

    def inside_dead(pos):
        return any(s <= pos < e for s, e in merged)

    for s, e in merged:
        # take the line's indentation and trailing newline with it, so no stray
        # whitespace is left in front of whatever follows
        ls = text.rfind("\n", 0, s) + 1
        if not text[ls:s].strip():
            s = ls
        while e < len(text) and text[e] in " \t":
            e += 1
        if e < len(text) and text[e] == "\n":
            e += 1
        edits.append((s, e, ""))
    for r in rules:
        if inside_dead(r["start"]):
            continue
        if "prelude_new" in r:
            edits.append((r["pstart"], r["pend"], r["prelude_new"] + " "))
        for s, e in r.get("drop", []):
            # a declaration on its own line takes the line; mid-line, one space after it
            ls = text.rfind("\n", 0, s) + 1
            le = text.find("\n", e)
            le = len(text) if le == -1 else le
            if not text[ls:s].strip() and not text[e:le].strip():
                edits.append((ls, le + 1, ""))
            else:
                while e < len(text) and text[e] == " ":
                    e += 1
                edits.append((s, e, ""))

    edits.sort()
    out, pos = [], 0
    for s, e, rep in edits:
        if s < pos:
            continue
        out.append(text[pos:s])
        out.append(rep)
        pos = e
    out.append(text[pos:])
    new = "".join(out)
    new = re.sub(r"(?m)^[ \t]+$", "", new)
    new = re.sub(r"\n{3,}", "\n\n", new)
    # the result must still parse: balanced blocks and closed comments
    bare = re.sub(r"/\*.*?\*/", "", new, flags=re.S)
    assert "/*" not in bare and "*/" not in bare, "stray comment marker"
    assert bare.count("{") == bare.count("}"), "unbalanced braces"
    parse(new)

    print(f"classes never used: {len(dead_classes)}")
    print(f"rules removed: {removed_rules} unused, {sum(1 for r in rules if r.get('dead')) - removed_rules} fully shadowed")
    print(f"selector lists trimmed: {trimmed_lists}")
    print(f"blocks browsers already discard (broken prelude): {broken}")
    print(f"shadowed declarations removed: {shadowed}")
    print(f"unused @keyframes removed: {dead_kf}")
    print(f"size: {len(text)//1024} KB -> {len(new)//1024} KB, lines {text.count(chr(10))} -> {new.count(chr(10))}")
    if write:
        open(CSS, "w", encoding="utf8").write(new)
        print("written", CSS)


if __name__ == "__main__":
    main()
